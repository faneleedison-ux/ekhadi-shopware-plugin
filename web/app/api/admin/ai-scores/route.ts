import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { computeRecommendation, type RecommendationInput } from '@/lib/aiRecommendation'

/**
 * GET /api/admin/ai-scores
 * Returns AI recommendation badges for all PENDING credit requests.
 * Admin only.
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

  const pendingRequests = await prisma.creditRequest.findMany({
    where: { status: 'PENDING' },
    select: { id: true, requesterId: true, amount: true },
  })

  if (pendingRequests.length === 0) return NextResponse.json([])

  const requesterIds = pendingRequests
    .map((r) => r.requesterId)
    .filter((id, index, arr) => arr.indexOf(id) === index)

  const [profiles, paidRepayments, approvedRequests, pendingDebt, monthlyRequests] =
    await Promise.all([
      prisma.customerProfile.findMany({
        where: { userId: { in: requesterIds } },
        select: { userId: true, creditScore: true },
      }),
      prisma.repaymentSchedule.groupBy({
        by: ['userId'],
        where: { userId: { in: requesterIds }, status: 'PAID' },
        _count: { id: true },
      }),
      prisma.creditRequest.groupBy({
        by: ['requesterId'],
        where: { requesterId: { in: requesterIds }, status: 'APPROVED' },
        _count: { id: true },
      }),
      prisma.repaymentSchedule.groupBy({
        by: ['userId'],
        where: { userId: { in: requesterIds }, status: 'PENDING' },
        _sum: { amount: true },
      }),
      prisma.creditRequest.groupBy({
        by: ['requesterId'],
        where: { requesterId: { in: requesterIds }, createdAt: { gte: monthStart } },
        _count: { id: true },
      }),
    ])

  const creditScoreMap = new Map(profiles.map((p) => [p.userId, p.creditScore]))
  const paidMap = new Map(paidRepayments.map((r) => [r.userId, r._count.id]))
  const approvedMap = new Map(approvedRequests.map((r) => [r.requesterId, r._count.id]))
  const debtMap = new Map(pendingDebt.map((r) => [r.userId, Number(r._sum.amount ?? 0)]))
  const monthlyMap = new Map(monthlyRequests.map((r) => [r.requesterId, r._count.id]))

  const scores = pendingRequests.map((req) => {
    const input: RecommendationInput = {
      paidRepaymentsCount: paidMap.get(req.requesterId) ?? 0,
      approvedRequestsCount: approvedMap.get(req.requesterId) ?? 0,
      creditScore: creditScoreMap.get(req.requesterId) ?? 50,
      outstandingDebt: debtMap.get(req.requesterId) ?? 0,
      requestsThisMonth: monthlyMap.get(req.requesterId) ?? 0,
      requestAmount: Number(req.amount),
    }
    return { requestId: req.id, ...computeRecommendation(input) }
  })

  return NextResponse.json(scores)
}
