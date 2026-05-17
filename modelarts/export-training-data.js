#!/usr/bin/env node
/**
 * Exports training data from the e-Khadi PostgreSQL database to OBS.
 * Run from web/ directory so @prisma/client and @aws-sdk/client-s3 are found.
 *
 *   cd web && DATABASE_URL="..." HW_AK="..." HW_SK="..." node ../modelarts/export-training-data.js
 *
 * Writes: obs://ekhadi-files/modelarts/training-data/YYYY-MM.csv
 *      + obs://ekhadi-files/modelarts/training-data/latest.csv  (overwritten each run)
 */
'use strict'

const { PrismaClient } = require('@prisma/client')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')

const HW_AK      = process.env.HW_AK || process.env.OBS_ACCESS_KEY
const HW_SK      = process.env.HW_SK || process.env.OBS_SECRET_KEY
const OBS_ENDPOINT = process.env.OBS_ENDPOINT || 'https://obs.af-south-1.myhuaweicloud.com'
const OBS_BUCKET = process.env.OBS_BUCKET || 'ekhadi-files'

if (!process.env.DATABASE_URL) { console.error('DATABASE_URL required'); process.exit(1) }
if (!HW_AK || !HW_SK)         { console.error('HW_AK and HW_SK required'); process.exit(1) }

const prisma = new PrismaClient()

async function exportData() {
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

  const members = await prisma.user.findMany({
    where: { role: 'MEMBER' },
    select: { id: true },
  })

  const memberIds = members.map(m => m.id)

  if (memberIds.length === 0) {
    console.log('No members found — no training data to export')
    process.exit(0)
  }

  const [profiles, paidCounts, approvedCounts, pendingDebt, cycles] = await Promise.all([
    prisma.customerProfile.findMany({ where: { userId: { in: memberIds } }, select: { userId: true, creditScore: true } }),
    prisma.repaymentSchedule.groupBy({ by: ['userId'], where: { userId: { in: memberIds }, status: 'PAID' }, _count: { id: true } }),
    prisma.creditRequest.groupBy({ by: ['requesterId'], where: { requesterId: { in: memberIds }, status: 'APPROVED' }, _count: { id: true } }),
    prisma.repaymentSchedule.groupBy({ by: ['userId'], where: { userId: { in: memberIds }, status: 'PENDING' }, _sum: { amount: true } }),
    prisma.grantCycle.groupBy({ by: ['userId'], where: { userId: { in: memberIds }, status: 'COMPLETED' }, _count: { id: true } }),
  ])

  const creditScoreMap  = new Map(profiles.map(p => [p.userId, p.creditScore]))
  const paidMap         = new Map(paidCounts.map(r => [r.userId, r._count.id]))
  const approvedMap     = new Map(approvedCounts.map(r => [r.requesterId, r._count.id]))
  const debtMap         = new Map(pendingDebt.map(r => [r.userId, Number(r._sum.amount ?? 0)]))
  const cycleMap        = new Map(cycles.map(r => [r.userId, r._count.id]))

  const lastRequests = await prisma.creditRequest.findMany({
    where: { requesterId: { in: memberIds } },
    orderBy: { createdAt: 'desc' },
    distinct: ['requesterId'],
    select: { requesterId: true, amount: true },
  })
  const lastAmountMap = new Map(lastRequests.map(r => [r.requesterId, Number(r.amount)]))

  const rows = memberIds
    .filter(id => (approvedMap.get(id) ?? 0) > 0)  // only members with credit history
    .map(id => {
      const approved = approvedMap.get(id) ?? 0
      const paid     = paidMap.get(id) ?? 0
      return {
        repayment_ratio:     approved > 0 ? (paid / approved) : 0,
        outstanding_debt:    debtMap.get(id) ?? 0,
        requests_this_month: 0,
        completed_cycles:    cycleMap.get(id) ?? 0,
        credit_score:        creditScoreMap.get(id) ?? 50,
        request_amount:      lastAmountMap.get(id) ?? 0,
        repaid_on_time:      paid >= approved ? 1 : 0,
      }
    })

  if (rows.length === 0) {
    console.log('No members with credit history — cannot build training dataset yet')
    process.exit(0)
  }

  const headers = Object.keys(rows[0])
  const csv = [headers.join(','), ...rows.map(r => headers.map(h => r[h]).join(','))].join('\n')

  const date = new Date().toISOString().slice(0, 7)
  const s3 = new S3Client({
    region: 'af-south-1',
    endpoint: OBS_ENDPOINT,
    credentials: { accessKeyId: HW_AK, secretAccessKey: HW_SK },
    forcePathStyle: false,
  })

  for (const key of [`modelarts/training-data/${date}.csv`, 'modelarts/training-data/latest.csv']) {
    await s3.send(new PutObjectCommand({ Bucket: OBS_BUCKET, Key: key, Body: csv, ContentType: 'text/csv' }))
  }

  console.log(`Exported ${rows.length} members → obs://${OBS_BUCKET}/modelarts/training-data/${date}.csv`)
  console.log(`Also written to obs://${OBS_BUCKET}/modelarts/training-data/latest.csv`)
  console.log(`Positive (repaid): ${rows.filter(r => r.repaid_on_time === 1).length} / ${rows.length}`)
  console.log(`Negative (not repaid): ${rows.filter(r => r.repaid_on_time === 0).length} / ${rows.length}`)

  await prisma.$disconnect()
}

exportData().catch(async e => { console.error(e); await prisma.$disconnect(); process.exit(1) })