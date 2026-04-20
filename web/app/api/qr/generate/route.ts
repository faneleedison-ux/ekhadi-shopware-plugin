import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'MEMBER') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Expire any old tokens
  await prisma.qRPaymentToken.updateMany({
    where: { userId: session.user.id, used: false },
    data: { used: true },
  })

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 min
  const token = await prisma.qRPaymentToken.create({
    data: { userId: session.user.id, expiresAt },
  })

  return NextResponse.json({ token: token.token, expiresAt: token.expiresAt })
}