import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'SHOP') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { token, amount, description } = await req.json()
  if (!token || !amount || amount <= 0) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const qr = await prisma.qRPaymentToken.findUnique({
    where: { token },
    include: { user: { include: { storeCredit: true } } },
  })

  if (!qr || qr.used) return NextResponse.json({ error: 'Invalid or expired QR code' }, { status: 400 })
  if (new Date() > qr.expiresAt) return NextResponse.json({ error: 'QR code has expired' }, { status: 400 })
  if (!qr.user.storeCredit || Number(qr.user.storeCredit.balance) < amount) {
    return NextResponse.json({ error: 'Insufficient credit balance' }, { status: 400 })
  }

  const desc = description || 'QR Payment'
  const creditAmount = amount * 0.02

  await prisma.$transaction([
    prisma.storeCredit.update({
      where: { userId: qr.userId },
      data: { balance: { decrement: amount } },
    }),
    prisma.storeCreditHistory.create({
      data: { userId: qr.userId, amount, type: 'DEBIT', description: desc },
    }),
    prisma.qRPaymentToken.update({ where: { id: qr.id }, data: { used: true } }),
    // 2% emergency fund contribution
    prisma.customerProfile.update({
      where: { userId: qr.userId },
      data: { emergencyFund: { increment: creditAmount } },
    }),
    // Loyalty: 1 point per R10
    prisma.customerProfile.update({
      where: { userId: qr.userId },
      data: { loyaltyPoints: { increment: Math.floor(amount / 10) } },
    }),
    prisma.loyaltyTransaction.create({
      data: { userId: qr.userId, points: Math.floor(amount / 10), description: `Earned for: ${desc}` },
    }),
  ])

  return NextResponse.json({ success: true, memberName: qr.user.name })
}