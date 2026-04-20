import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  // Find members with 5+ transactions in 1 hour
  const rapidUsers = await prisma.storeCreditHistory.groupBy({
    by: ['userId'],
    where: { type: 'DEBIT', createdAt: { gte: oneHourAgo } },
    _count: { id: true },
    having: { id: { _count: { gte: 5 } } },
  })

  // Find members spending > R300 in 24h
  const highVelocity = await prisma.storeCreditHistory.groupBy({
    by: ['userId'],
    where: { type: 'DEBIT', createdAt: { gte: oneDayAgo } },
    _sum: { amount: true },
    having: { amount: { _sum: { gte: 300 } } },
  })

  const alerts: { userId: string; type: string; description: string }[] = []

  for (const u of rapidUsers) {
    const exists = await prisma.fraudAlert.findFirst({
      where: { userId: u.userId, type: 'RAPID_PURCHASES', resolved: false, createdAt: { gte: oneHourAgo } },
    })
    if (!exists) {
      alerts.push({
        userId: u.userId,
        type: 'RAPID_PURCHASES',
        description: `${u._count.id} purchases in the last hour`,
      })
    }
  }

  for (const u of highVelocity) {
    const exists = await prisma.fraudAlert.findFirst({
      where: { userId: u.userId, type: 'HIGH_VELOCITY', resolved: false, createdAt: { gte: oneDayAgo } },
    })
    if (!exists) {
      alerts.push({
        userId: u.userId,
        type: 'HIGH_VELOCITY',
        description: `R${Number(u._sum.amount).toFixed(0)} spent in 24 hours`,
      })
    }
  }

  if (alerts.length > 0) {
    await prisma.fraudAlert.createMany({ data: alerts })
  }

  return NextResponse.json({ checked: true, newAlerts: alerts.length })
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const alerts = await prisma.fraudAlert.findMany({
    where: { resolved: false },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { user: { select: { name: true, email: true } } },
  })
  return NextResponse.json(alerts)
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  await prisma.fraudAlert.update({ where: { id }, data: { resolved: true } })
  return NextResponse.json({ success: true })
}