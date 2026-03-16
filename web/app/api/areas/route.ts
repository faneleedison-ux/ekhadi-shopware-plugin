import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const areas = await prisma.area.findMany({
    include: {
      _count: { select: { shops: true, customerProfiles: true, groups: true } },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(areas)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, province, coordinates } = body

  if (!name || !province) {
    return NextResponse.json(
      { error: 'Name and province are required' },
      { status: 400 }
    )
  }

  const area = await prisma.area.create({
    data: {
      name,
      province,
      coordinates: coordinates || null,
    },
  })

  return NextResponse.json(area, { status: 201 })
}
