import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const group = await prisma.group.findUnique({
    where: { id: params.id },
    include: {
      area: true,
      members: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
      wallet: {
        include: { buckets: true },
      },
      rotationCycles: {
        include: { recipient: { select: { id: true, name: true } } },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      },
    },
  })

  if (!group) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 })
  }

  return NextResponse.json(group)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  const group = await prisma.group.update({
    where: { id: params.id },
    data: {
      name: body.name,
      maxMembers: body.maxMembers,
      rotationDay: body.rotationDay,
      description: body.description,
    },
  })

  return NextResponse.json(group)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.group.delete({ where: { id: params.id } })

  return NextResponse.json({ success: true })
}
