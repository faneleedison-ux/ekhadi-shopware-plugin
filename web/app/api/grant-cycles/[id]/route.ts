import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  const grantCycle = await prisma.grantCycle.findUnique({
    where: { id: params.id },
  })

  if (!grantCycle) {
    return NextResponse.json({ error: 'Grant cycle not found' }, { status: 404 })
  }

  // Only admin or the cycle owner can update
  if (session.user.role !== 'ADMIN' && grantCycle.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Members may only update status; financial fields are admin-only to prevent score gaming
  const isAdmin = session.user.role === 'ADMIN'
  const updated = await prisma.grantCycle.update({
    where: { id: params.id },
    data: {
      ...(isAdmin && body.spentAmount !== undefined ? { spentAmount: body.spentAmount } : {}),
      ...(isAdmin && body.repaidAmount !== undefined ? { repaidAmount: body.repaidAmount } : {}),
      status: body.status || undefined,
    },
  })

  return NextResponse.json(updated)
}
