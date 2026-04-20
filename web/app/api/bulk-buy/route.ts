import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'MEMBER') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const membership = await prisma.groupMember.findFirst({ where: { userId: session.user.id } })
  if (!membership) return NextResponse.json([])

  const requests = await prisma.bulkBuyRequest.findMany({
    where: { groupId: membership.groupId, status: 'OPEN', expiresAt: { gte: new Date() } },
    orderBy: { createdAt: 'desc' },
    include: {
      creator: { select: { name: true } },
      participants: { include: { user: { select: { name: true } } } },
    },
  })

  return NextResponse.json(requests)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'MEMBER') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, description, category, unitPrice, targetQty } = await req.json()
  if (!title || !category || !unitPrice || !targetQty) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const membership = await prisma.groupMember.findFirst({ where: { userId: session.user.id } })
  if (!membership) return NextResponse.json({ error: 'Not in a group' }, { status: 400 })

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  const request = await prisma.bulkBuyRequest.create({
    data: {
      title, description: description || '', category, unitPrice, targetQty,
      creatorId: session.user.id, groupId: membership.groupId, expiresAt,
    },
  })

  return NextResponse.json(request, { status: 201 })
}