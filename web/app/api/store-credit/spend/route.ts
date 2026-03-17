import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * POST /api/store-credit/spend
 *
 * Called by a SHOP when a MEMBER pays with store credit.
 * Enforces the geographic area restriction: the member's registered area
 * must match the shop's area before any debit is permitted.
 *
 * Body: { memberId: string, amount: number, description: string }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'SHOP') {
    return NextResponse.json({ error: 'Only shops can process store credit payments' }, { status: 403 })
  }

  const body = await req.json()
  const { memberId, amount, description } = body

  if (!memberId || !amount || !description) {
    return NextResponse.json(
      { error: 'memberId, amount, and description are required' },
      { status: 400 }
    )
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 })
  }

  // Load shop and member profiles for area enforcement
  const [shop, memberProfile] = await Promise.all([
    prisma.shop.findUnique({
      where: { userId: session.user.id },
      select: { areaId: true, name: true },
    }),
    prisma.customerProfile.findUnique({
      where: { userId: memberId },
      select: { areaId: true, isActive: true },
    }),
  ])

  if (!shop) {
    return NextResponse.json({ error: 'Shop profile not found' }, { status: 404 })
  }

  if (!memberProfile) {
    return NextResponse.json({ error: 'Member profile not found' }, { status: 404 })
  }

  if (!memberProfile.isActive) {
    return NextResponse.json({ error: 'Member account is not active' }, { status: 403 })
  }

  // Geographic area restriction
  if (shop.areaId !== memberProfile.areaId) {
    return NextResponse.json(
      { error: 'Member is not registered in your area. Store credit can only be spent at shops in the member\'s registered area.' },
      { status: 403 }
    )
  }

  // Process the debit inside a transaction
  try {
    const result = await prisma.$transaction(async (tx) => {
      const credit = await tx.storeCredit.findUnique({
        where: { userId: memberId },
      })

      if (!credit || Number(credit.balance) < amount) {
        throw new Error('Insufficient store credit balance')
      }

      await tx.storeCredit.update({
        where: { userId: memberId },
        data: { balance: { decrement: amount } },
      })

      const history = await tx.storeCreditHistory.create({
        data: {
          userId: memberId,
          amount,
          type: 'DEBIT',
          description: description || `Purchase at ${shop.name}`,
        },
      })

      await tx.notification.create({
        data: {
          userId: memberId,
          title: 'Store Credit Used',
          message: `R${amount.toFixed(2)} deducted from your wallet at ${shop.name}.`,
          type: 'GENERAL',
        },
      })

      return history
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
