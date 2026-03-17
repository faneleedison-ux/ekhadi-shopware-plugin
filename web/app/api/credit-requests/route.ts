import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { computeScoreBreakdown, scoreToLimit } from '@/lib/creditHealthScore'

const VALID_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const
type CreditRequestStatus = typeof VALID_STATUSES[number]

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const myRequests = searchParams.get('my') === 'true'
  const status = searchParams.get('status')

  if (status && !VALID_STATUSES.includes(status as CreditRequestStatus)) {
    return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
  }

  if (session.user.role === 'ADMIN' && !myRequests) {
    const requests = await prisma.creditRequest.findMany({
      where: status ? { status: status as CreditRequestStatus } : undefined,
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

    if (isNaN(numAmount) || numAmount < 50 || numAmount > 300) {
      return NextResponse.json(
        { error: 'Amount must be between R50 and R300' },
        { status: 400 }
      )
    }

    // Enforce the user's score-based credit limit
    const [approvedCount, paidCount, pendingDebt, completedCycles] = await Promise.all([
      prisma.creditRequest.count({
        where: { requesterId: session.user.id, status: 'APPROVED' },
      }),
      prisma.repaymentSchedule.count({
        where: { userId: session.user.id, status: 'PAID' },
      }),
      prisma.repaymentSchedule.aggregate({
        where: { userId: session.user.id, status: 'PENDING' },
        _sum: { amount: true },
      }),
      prisma.grantCycle.count({
        where: { userId: session.user.id, status: 'COMPLETED' },
      }),
    ])

    const breakdown = computeScoreBreakdown({
      approvedRequestsCount: approvedCount,
      paidRepaymentsCount: paidCount,
      outstandingDebt: Number(pendingDebt._sum.amount ?? 0),
      completedCyclesCount: completedCycles,
    })
    const scoreTotal =
      breakdown.repaymentScore +
      breakdown.speedScore +
      breakdown.noDebtScore +
      breakdown.cycleConsistencyScore
    const creditLimit = scoreToLimit(scoreTotal)

    if (numAmount > creditLimit) {
      return NextResponse.json(
        { error: `Your current credit limit is R${creditLimit}. Request an amount within your limit.` },
        { status: 400 }
      )
    }

    // Check member is in the group and area matches
    const [membership, group] = await Promise.all([
      prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId, userId: session.user.id } },
      }),
      prisma.group.findUnique({
        where: { id: groupId },
        select: { areaId: true },
      }),
    ])

    if (!membership) {
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 403 }
      )
    }

    // Enforce geographic area restriction: member's area must match the group's area
    const profile = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
      select: { areaId: true },
    })

    if (profile && group && profile.areaId !== group.areaId) {
      return NextResponse.json(
        { error: 'You can only request credit from groups in your registered area' },
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
