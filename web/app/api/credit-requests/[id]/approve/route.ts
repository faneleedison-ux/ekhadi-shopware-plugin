import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { publishSMN } from '@/lib/smn'

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

  const amount = Number(creditRequest.amount)

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Update credit request status
      const updated = await tx.creditRequest.update({
        where: { id: params.id },
        data: {
          status: 'APPROVED',
          approvedBy: session.user.id,
        },
      })

      // Add to member's store credit
      const existingCredit = await tx.storeCredit.findUnique({
        where: { userId: creditRequest.requesterId },
      })

      if (existingCredit) {
        await tx.storeCredit.update({
          where: { userId: creditRequest.requesterId },
          data: {
            balance: {
              increment: amount,
            },
          },
        })
      } else {
        await tx.storeCredit.create({
          data: {
            userId: creditRequest.requesterId,
            balance: amount,
          },
        })
      }

      // Create credit history record
      await tx.storeCreditHistory.create({
        data: {
          userId: creditRequest.requesterId,
          amount,
          type: 'CREDIT',
          description: `Credit approved: ${creditRequest.reason}`,
        },
      })

      // Update grant cycle spent amount
      const now = new Date()
      const currentMonth = now.getMonth() + 1
      const currentYear = now.getFullYear()

      const grantCycle = await tx.grantCycle.findUnique({
        where: {
          userId_month_year: {
            userId: creditRequest.requesterId,
            month: currentMonth,
            year: currentYear,
          },
        },
      })

      if (grantCycle) {
        await tx.grantCycle.update({
          where: { id: grantCycle.id },
          data: {
            spentAmount: {
              increment: amount,
            },
          },
        })
      }

      // Create repayment schedule (amount + 2% fee, rounded to 2 decimal places)
      const repaymentAmount = Math.round(amount * 1.02 * 100) / 100
      const dueDate = new Date(currentYear, currentMonth, 1) // 1st of next month
      await tx.repaymentSchedule.create({
        data: {
          userId: creditRequest.requesterId,
          amount: repaymentAmount,
          dueDate,
          status: 'PENDING',
        },
      })

      // Notify the member
      await tx.notification.create({
        data: {
          userId: creditRequest.requesterId,
          title: 'Credit Request Approved',
          message: `Your credit request of R${amount.toFixed(2)} has been approved. The funds are now available in your wallet.`,
          type: 'CREDIT_APPROVED',
        },
      })

      return updated
    })

    // Notify via Huawei Cloud SMN (fire and forget)
    const member = await prisma.user.findUnique({ where: { id: creditRequest.requesterId }, select: { name: true, email: true } })
    publishSMN(
      'e-Khadi: Credit Request Approved',
      `Dear ${member?.name ?? 'Member'},\n\nYour e-Khadi credit request of R${amount.toFixed(2)} has been APPROVED.\n\nReason: ${creditRequest.reason}\nFunds are now available in your wallet.\n\ne-Khadi Team`
    )

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Approve error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
