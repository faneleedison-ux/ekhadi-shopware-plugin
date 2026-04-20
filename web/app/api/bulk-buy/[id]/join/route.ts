import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'MEMBER') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { quantity } = await req.json()
  const bulkBuy = await prisma.bulkBuyRequest.findUnique({ where: { id: params.id } })
  if (!bulkBuy || bulkBuy.status !== 'OPEN') return NextResponse.json({ error: 'Not available' }, { status: 400 })

  const existing = await prisma.bulkBuyParticipant.findUnique({
    where: { bulkBuyId_userId: { bulkBuyId: params.id, userId: session.user.id } },
  })
  if (existing) return NextResponse.json({ error: 'Already joined' }, { status: 400 })

  await prisma.bulkBuyParticipant.create({
    data: { bulkBuyId: params.id, userId: session.user.id, quantity: quantity ?? 1 },
  })

  // Check if target quantity reached
  const totalParticipants = await prisma.bulkBuyParticipant.aggregate({
    where: { bulkBuyId: params.id },
    _sum: { quantity: true },
  })
  if ((totalParticipants._sum.quantity ?? 0) >= bulkBuy.targetQty) {
    await prisma.bulkBuyRequest.update({ where: { id: params.id }, data: { status: 'FUNDED' } })
  }

  return NextResponse.json({ success: true })
}