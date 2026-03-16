import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const myRequests = searchParams.get('my') === 'true'
  const status = searchParams.get('status')

  if (session.user.role === 'ADMIN' && !myRequests) {
    const requests = await prisma.creditRequest.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        requester: { select: { name: true, email: true } },
        group: { select: { name: true } },
        approver: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(requests)
  }

  // Member sees their own requests
  const requests = await prisma.creditRequest.findMany({
    where: { requesterId: session.user.id },
    include: {
      group: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(requests)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'MEMBER') {
    return NextResponse.json({ error: 'Only members can request credit' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { amount, reason, groupId } = body

    if (!amount || !reason || !groupId) {
      return NextResponse.json(
        { error: 'Amount, reason, and group are required' },
        { status: 400 }
      )
    }

    const numAmount = parseFloat(amount)

    if (numAmount < 50 || numAmount > 300) {
      return NextResponse.json(
        { error: 'Amount must be between R50 and R300' },
        { status: 400 }
      )
    }

    // Check member is in the group
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id,
        },
      },
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 403 }
      )
    }

    // Check no pending request exists
    const existingPending = await prisma.creditRequest.findFirst({
      where: {
        requesterId: session.user.id,
        groupId,
        status: 'PENDING',
      },
    })

    if (existingPending) {
      return NextResponse.json(
        { error: 'You already have a pending credit request' },
        { status: 409 }
      )
    }

    const creditRequest = await prisma.creditRequest.create({
      data: {
        requesterId: session.user.id,
        groupId,
        amount: numAmount,
        reason,
        status: 'PENDING',
      },
      include: {
        group: { select: { name: true } },
      },
    })

    return NextResponse.json(creditRequest, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
