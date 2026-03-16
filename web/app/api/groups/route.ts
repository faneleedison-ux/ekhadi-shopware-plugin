import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const myGroups = searchParams.get('my') === 'true'

  if (myGroups) {
    const memberships = await prisma.groupMember.findMany({
      where: { userId: session.user.id },
      include: {
        group: {
          include: {
            area: { select: { name: true } },
            wallet: { select: { balance: true } },
            _count: { select: { members: true } },
          },
        },
      },
    })
    return NextResponse.json(memberships.map((m) => m.group))
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const groups = await prisma.group.findMany({
    include: {
      area: { select: { name: true, province: true } },
      _count: { select: { members: true } },
      wallet: { select: { balance: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(groups)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { name, areaId, maxMembers, rotationDay, description } = body

    if (!name || !areaId) {
      return NextResponse.json(
        { error: 'Name and area are required' },
        { status: 400 }
      )
    }

    const group = await prisma.$transaction(async (tx) => {
      const newGroup = await tx.group.create({
        data: {
          name,
          areaId,
          maxMembers: maxMembers || 10,
          rotationDay: rotationDay || 1,
          description: description || null,
        },
      })

      // Create group wallet
      await tx.groupWallet.create({
        data: {
          groupId: newGroup.id,
          balance: 0,
        },
      })

      return newGroup
    })

    return NextResponse.json(group, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
