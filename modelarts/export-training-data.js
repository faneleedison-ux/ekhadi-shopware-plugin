#!/usr/bin/env node
/**
 * Exports training data from the e-Khadi PostgreSQL database to OBS.
 * Run monthly before retraining:
 *   DATABASE_URL="..." HW_AK="..." HW_SK="..." node export-training-data.js
 *
 * Writes: obs://ekhadi-files/modelarts/training-data/YYYY-MM.csv
 */

const { Client } = require('pg')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')

const DB_URL = process.env.DATABASE_URL
const OBS_ENDPOINT = process.env.OBS_ENDPOINT || 'https://obs.af-south-1.myhuaweicloud.com'
const OBS_BUCKET = process.env.OBS_BUCKET || 'ekhadi-files'
const HW_AK = process.env.HW_AK
const HW_SK = process.env.HW_SK

async function exportData() {
  const db = new Client({ connectionString: DB_URL })
  await db.connect()

  const { rows } = await db.query(`
    SELECT
      u.id AS user_id,
      COALESCE(cp.credit_score, 50) AS credit_score,

      -- Repayment ratio
      COALESCE(
        (SELECT COUNT(*) FROM "RepaymentSchedule" r WHERE r."userId" = u.id AND r.status = 'PAID')::float
        / NULLIF((SELECT COUNT(*) FROM "CreditRequest" cr WHERE cr."requesterId" = u.id AND cr.status = 'APPROVED'), 0),
        0
      ) AS repayment_ratio,

      -- Outstanding debt
      COALESCE(
        (SELECT SUM(amount) FROM "RepaymentSchedule" r WHERE r."userId" = u.id AND r.status = 'PENDING'),
        0
      ) AS outstanding_debt,

      -- Requests this month
      (SELECT COUNT(*) FROM "CreditRequest" cr
       WHERE cr."requesterId" = u.id
         AND cr."createdAt" >= date_trunc('month', CURRENT_DATE)
      ) AS requests_this_month,

      -- Completed grant cycles
      (SELECT COUNT(*) FROM "GrantCycle" gc WHERE gc."userId" = u.id AND gc.status = 'COMPLETED') AS completed_cycles,

      -- Most recent request amount (as feature proxy)
      COALESCE(
        (SELECT amount FROM "CreditRequest" cr WHERE cr."requesterId" = u.id ORDER BY cr."createdAt" DESC LIMIT 1),
        0
      ) AS request_amount,

      -- Label: did most recent repayment happen? (1 = paid on time, 0 = overdue/never)
      CASE
        WHEN (SELECT COUNT(*) FROM "RepaymentSchedule" r
              WHERE r."userId" = u.id AND r.status = 'PAID') > 0 THEN 1
        ELSE 0
      END AS repaid_on_time

    FROM "User" u
    LEFT JOIN "CustomerProfile" cp ON cp."userId" = u.id
    WHERE u.role = 'MEMBER'
      AND (SELECT COUNT(*) FROM "CreditRequest" cr WHERE cr."requesterId" = u.id) > 0
  `)

  await db.end()

  if (rows.length === 0) {
    console.log('No training data found — need more members with credit history')
    process.exit(0)
  }

  const headers = Object.keys(rows[0]).filter(k => k !== 'user_id')
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => r[h]).join(',')),
  ].join('\n')

  const date = new Date().toISOString().slice(0, 7)
  const key = `modelarts/training-data/${date}.csv`

  const s3 = new S3Client({
    region: 'af-south-1',
    endpoint: OBS_ENDPOINT,
    credentials: { accessKeyId: HW_AK, secretAccessKey: HW_SK },
    forcePathStyle: false,
  })

  // Upload dated file + overwrite latest.csv (used by training job)
  for (const k of [key, 'modelarts/training-data/latest.csv']) {
    await s3.send(new PutObjectCommand({
      Bucket: OBS_BUCKET,
      Key: k,
      Body: csv,
      ContentType: 'text/csv',
    }))
  }

  console.log(`Exported ${rows.length} members → obs://${OBS_BUCKET}/${key}`)
  console.log(`Also written to obs://${OBS_BUCKET}/modelarts/training-data/latest.csv`)
  console.log(`Positive labels (repaid): ${rows.filter(r => r.repaid_on_time === 1).length}`)
  console.log(`Negative labels (not repaid): ${rows.filter(r => r.repaid_on_time === 0).length}`)
}

exportData().catch(err => { console.error(err); process.exit(1) })