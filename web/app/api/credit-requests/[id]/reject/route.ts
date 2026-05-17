import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { publishSMN } from '@/lib/smn'
import { reportMetric } from '@/lib/ces'
import { sendCreditRejected } from '@/lib/whatsapp'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const creditRequest = await prisma.creditRequest.findUnique({
    where: { id: params.id },
  })

  if (!creditRequest) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }

  if (creditRequest.status !== 'PENDING') {
    return NextResponse.json(
      { error: 'This request has already been processed' },
      { status: 400 }
    )
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.creditRequest.update({
      where: { id: params.id },
      data: {
        status: 'REJECTED',
        approvedBy: session.user.id,
      },
    })

    await tx.notification.create({
      data: {
        userId: creditRequest.requesterId,
        title: 'Credit Request Rejected',
        message: `Your credit request of R${Number(creditRequest.amount).toFixed(2)} has been rejected. Please contact your group admin for more information.`,
        type: 'CREDIT_REJECTED',
      },
    })

    return result
  })

  // Notify via SMN + WhatsApp
  const member = await prisma.user.findUnique({ where: { id: creditRequest.requesterId }, select: { name: true, phone: true } })
  publishSMN(
    'e-Khadi: Credit Request Rejected',
    `Dear ${member?.name ?? 'Member'},\n\nYour e-Khadi credit request of R${Number(creditRequest.amount).toFixed(2)} has been REJECTED.\n\nPlease contact your stokvel group admin for more information.\n\ne-Khadi Team`
  )
  sendCreditRejected(member?.phone, member?.name ?? 'Member', Number(creditRequest.amount))
  reportMetric('credit_rejected_count', 1)

  return NextResponse.json(updated)
}
