import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const areaId = searchParams.get('areaId')

  const notices = await prisma.noticeboard.findMany({
    where: areaId ? { OR: [{ areaId }, { areaId: null }] } : { areaId: null },
    orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    take: 20,
    include: { author: { select: { name: true } } },
  })

  return NextResponse.json(notices)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, content, pinned, areaId } = await req.json()
  if (!title || !content) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const notice = await prisma.noticeboard.create({
    data: { title, content, pinned: pinned ?? false, areaId: areaId || null, authorId: session.user.id },
  })

  return NextResponse.json(notice, { status: 201 })
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  await prisma.noticeboard.delete({ where: { id } })
  return NextResponse.json({ success: true })
}