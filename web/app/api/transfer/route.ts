import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'MEMBER') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { receiverEmail, amount, note } = await req.json()
  if (!receiverEmail || !amount || amount < 10) return NextResponse.json({ error: 'Minimum transfer is R10' }, { status: 400 })
  if (amount > 100) return NextResponse.json({ error: 'Maximum transfer is R100 per day' }, { status: 400 })

  const [sender, receiver] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, include: { storeCredit: true } }),
    prisma.user.findUnique({ where: { email: receiverEmail }, include: { storeCredit: true } }),
  ])

  if (!receiver || receiver.role !== 'MEMBER') return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
  if (!sender?.storeCredit || Number(sender.storeCredit.balance) < amount) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
  }

  await prisma.$transaction([
    prisma.storeCredit.update({ where: { userId: session.user.id }, data: { balance: { decrement: amount } } }),
    prisma.storeCredit.upsert({
      where: { userId: receiver.id },
      update: { balance: { increment: amount } },
      create: { userId: receiver.id, balance: amount },
    }),
    prisma.storeCreditHistory.create({
      data: { userId: session.user.id, amount, type: 'DEBIT', description: `Transfer to ${receiver.name}${note ? `: ${note}` : ''}` },
    }),
    prisma.storeCreditHistory.create({
      data: { userId: receiver.id, amount, type: 'CREDIT', description: `Transfer from ${sender.name}${note ? `: ${note}` : ''}` },
    }),
    prisma.creditTransfer.create({
      data: { senderId: session.user.id, receiverId: receiver.id, amount, note },
    }),
  ])

  return NextResponse.json({ success: true, receiverName: receiver.name })
}