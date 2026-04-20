import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'SHOP') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const shop = await prisma.shop.findUnique({ where: { userId: session.user.id } })
  if (!shop) return NextResponse.json([])

  const orders = await prisma.restockOrder.findMany({
    where: { shopId: shop.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
  return NextResponse.json(orders)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'SHOP') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { items, notes } = await req.json()
  if (!items || !Array.isArray(items) || items.length === 0) return NextResponse.json({ error: 'No items' }, { status: 400 })

  const shop = await prisma.shop.findUnique({ where: { userId: session.user.id } })
  if (!shop) return NextResponse.json({ error: 'Shop not found' }, { status: 404 })

  const order = await prisma.restockOrder.create({
    data: { shopId: shop.id, items, notes: notes || null },
  })
  return NextResponse.json(order, { status: 201 })
}