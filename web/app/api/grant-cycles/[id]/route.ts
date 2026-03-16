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

  const updated = await prisma.grantCycle.update({
    where: { id: params.id },
    data: {
      spentAmount: body.spentAmount !== undefined ? body.spentAmount : undefined,
      repaidAmount: body.repaidAmount !== undefined ? body.repaidAmount : undefined,
      status: body.status || undefined,
    },
  })

  return NextResponse.json(updated)
}
