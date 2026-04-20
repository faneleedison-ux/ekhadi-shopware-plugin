import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'MEMBER') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { imageUrl } = await req.json()
  if (!imageUrl) return NextResponse.json({ error: 'Missing image URL' }, { status: 400 })

  const verification = await prisma.iDVerification.create({
    data: { userId: session.user.id, imageUrl },
  })
  await prisma.customerProfile.update({
    where: { userId: session.user.id },
    data: { idImageUrl: imageUrl },
  })

  return NextResponse.json(verification, { status: 201 })
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const verifications = await prisma.iDVerification.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, email: true } } },
  })
  return NextResponse.json(verifications)
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, userId, approved } = await req.json()
  await prisma.$transaction([
    prisma.iDVerification.update({ where: { id }, data: { status: approved ? 'APPROVED' : 'REJECTED', reviewedBy: session.user.id } }),
    ...(approved ? [prisma.customerProfile.update({ where: { userId }, data: { idVerified: true } })] : []),
  ])
  return NextResponse.json({ success: true })
}