import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

/**
 * POST /api/repayments/process
 *
 * Processes all PENDING repayment schedules that are due.
 * For each overdue repayment:
 *   1. Checks the member's store credit balance is sufficient.
 *   2. Deducts the repayment amount from store credit.
 *   3. Marks the schedule as PAID.
 *   4. Updates the grant cycle repaidAmount.
 *   5. Marks schedule as OVERDUE if insufficient balance.
 *   6. Sends a notification to the member.
 *
 * Admin-only. Intended to be called on each new grant payment cycle.
 */
export async function POST(req: Request) {
  // Allow FunctionGraph to call this with a shared secret
  const authHeader = req.headers.get('authorization')
  const isServiceCall = authHeader === `Bearer ${process.env.FUNCTIONGRAPH_SECRET}` && process.env.FUNCTIONGRAPH_SECRET

  if (!isServiceCall) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const now = new Date()

  const dueSchedules = await prisma.repaymentSchedule.findMany({
    where: {
      status: 'PENDING',
      dueDate: { lte: now },
    },
  })

  if (dueSchedules.length === 0) {
    return NextResponse.json({ processed: 0, paid: 0, overdue: 0 })
  }

  let paid = 0
  let overdue = 0

  for (const schedule of dueSchedules) {
    const amount = Number(schedule.amount)

    await prisma.$transaction(async (tx) => {
      const credit = await tx.storeCredit.findUnique({
        where: { userId: schedule.userId },
      })

      const balance = Number(credit?.balance ?? 0)

      if (balance >= amount) {
        // Deduct from store credit
        await tx.storeCredit.update({
          where: { userId: schedule.userId },
          data: { balance: { decrement: amount } },
        })

        await tx.storeCreditHistory.create({
          data: {
            userId: schedule.userId,
            amount,
            type: 'DEBIT',
            description: `Automatic repayment (schedule ${schedule.id})`,
          },
        })

        // Mark schedule PAID
        await tx.repaymentSchedule.update({
          where: { id: schedule.id },
          data: { status: 'PAID', paidAt: now },
        })

        // Update current grant cycle repaidAmount
        const currentMonth = now.getMonth() + 1
        const currentYear = now.getFullYear()
        await tx.grantCycle.updateMany({
          where: {
            userId: schedule.userId,
            month: currentMonth,
            year: currentYear,
          },
          data: { repaidAmount: { increment: amount } },
        })

        await tx.notification.create({
          data: {
            userId: schedule.userId,
            title: 'Repayment Processed',
            message: `R${amount.toFixed(2)} has been automatically deducted from your wallet as repayment.`,
            type: 'GENERAL',
          },
        })

        paid++
      } else {
        // Insufficient balance — mark overdue
        await tx.repaymentSchedule.update({
          where: { id: schedule.id },
          data: { status: 'OVERDUE' },
        })

        await tx.notification.create({
          data: {
            userId: schedule.userId,
            title: 'Repayment Overdue',
            message: `Your repayment of R${amount.toFixed(2)} is overdue. Please ensure your wallet has sufficient balance.`,
            type: 'GENERAL',
          },
        })

        overdue++
      }
    })
  }

  return NextResponse.json({
    processed: dueSchedules.length,
    paid,
    overdue,
  })
}
