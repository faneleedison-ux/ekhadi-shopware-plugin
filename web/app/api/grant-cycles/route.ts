import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.role === 'ADMIN'
    ? new URL(req.url).searchParams.get('userId') || session.user.id
    : session.user.id

  const grantCycles = await prisma.grantCycle.findMany({
    where: { userId },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  })

  return NextResponse.json(grantCycles)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { userId, month, year, grantAmount } = body

  if (!userId || !month || !year || !grantAmount) {
    return NextResponse.json(
      { error: 'userId, month, year, and grantAmount are required' },
      { status: 400 }
    )
  }

  const grantCycle = await prisma.grantCycle.upsert({
    where: {
      userId_month_year: { userId, month, year },
    },
    create: {
      userId,
      month,
      year,
      grantAmount,
      spentAmount: 0,
      repaidAmount: 0,
      status: 'ACTIVE',
    },
    update: {
      grantAmount,
    },
  })

  return NextResponse.json(grantCycle, { status: 201 })
}
