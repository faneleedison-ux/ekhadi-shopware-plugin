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

  const credit = await prisma.storeCredit.findUnique({
    where: { userId },
  })

  const history = await prisma.storeCreditHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json({
    balance: Number(credit?.balance || 0),
    history,
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { userId, amount, type, description } = body

  if (!userId || !amount || !type || !description) {
    return NextResponse.json(
      { error: 'userId, amount, type, and description are required' },
      { status: 400 }
    )
  }

  const result = await prisma.$transaction(async (tx) => {
    const multiplier = type === 'CREDIT' ? 1 : -1

    await tx.storeCredit.upsert({
      where: { userId },
      create: {
        userId,
        balance: type === 'CREDIT' ? amount : 0,
      },
      update: {
        balance: {
          increment: amount * multiplier,
        },
      },
    })

    const history = await tx.storeCreditHistory.create({
      data: {
        userId,
        amount,
        type,
        description,
      },
    })

    return history
  })

  return NextResponse.json(result, { status: 201 })
}
