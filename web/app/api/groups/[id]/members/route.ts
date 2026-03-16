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

  const members = await prisma.groupMember.findMany({
    where: { groupId: params.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          customerProfile: { select: { creditScore: true, sassaId: true } },
        },
      },
    },
    orderBy: { joinedAt: 'asc' },
  })

  return NextResponse.json(members)
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { userId, role } = body

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
  }

  // Check group capacity
  const group = await prisma.group.findUnique({
    where: { id: params.id },
    include: { _count: { select: { members: true } } },
  })

  if (!group) {
    return NextResponse.json({ error: 'Group not found' }, { status: 404 })
  }

  if (group._count.members >= group.maxMembers) {
    return NextResponse.json({ error: 'Group is at maximum capacity' }, { status: 400 })
  }

  const member = await prisma.groupMember.create({
    data: {
      groupId: params.id,
      userId,
      role: role || 'MEMBER',
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  })

  return NextResponse.json(member, { status: 201 })
}
