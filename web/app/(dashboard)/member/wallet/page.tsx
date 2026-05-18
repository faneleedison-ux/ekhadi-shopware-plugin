import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import SmartBudgetPlanner from '@/components/member/SmartBudgetPlanner'
import QRWallet from '@/components/member/QRWallet'
import EmergencyFundWidget from '@/components/member/EmergencyFundWidget'
import LoyaltyWidget from '@/components/member/LoyaltyWidget'
import TransferCredit from '@/components/member/TransferCredit'


export default async function WalletPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'MEMBER') redirect('/login')

  const [user, outstandingDebtAgg] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        storeCredit: true,
        storeCreditHistory: {
          orderBy: { createdAt: 'desc' },
          take: 30,
        },
        customerProfile: { select: { monthlyGrantAmount: true, emergencyFund: true, loyaltyPoints: true } },
        grantCycles: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        groupMemberships: {
          include: {
            group: {
              include: {
                wallet: { include: { buckets: true } },
              },
            },
          },
          take: 1,
        },
      },
    }),
    prisma.repaymentSchedule.aggregate({
      where: { userId: session.user.id, status: 'PENDING' },
      _sum: { amount: true },
    }),
  ])

  if (!user) redirect('/login')

  const balance = Number(user.storeCredit?.balance || 0)
  const transactions = user.storeCreditHistory
  const groupWallet = user.groupMemberships[0]?.group?.wallet
  const buckets = groupWallet?.buckets || []

  const activeGrant = user.grantCycles[0]
  const grantAmount = activeGrant
    ? Number(activeGrant.grantAmount)
    : Number(user.customerProfile?.monthlyGrantAmount || 350)
  const outstandingDebt = Number(outstandingDebtAgg._sum.amount ?? 0)

  const totalDebit = transactions
    .filter((t) => t.type === 'DEBIT')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalCredit = transactions
    .filter((t) => t.type === 'CREDIT')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl px-5 py-4">
        <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552] mb-1">Wallet · e-Khadi</p>
        <h1 className="font-[var(--serif)] italic text-2xl text-[#14130E] leading-tight">My Wallet</h1>
        <div className="flex items-center gap-4 mt-2 flex-wrap">
          <div className="text-center">
            <p className="font-[var(--serif)] italic text-lg text-[#E11D2A]">{formatCurrency(balance)}</p>
            <p className="font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#6B6552]">Balance</p>
          </div>
          <div className="w-px h-8 bg-[#C9BCA0]" />
          <div className="text-center">
            <p className="font-[var(--serif)] italic text-lg text-[#3F7B4F]">{formatCurrency(totalCredit)}</p>
            <p className="font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#6B6552]">Received</p>
          </div>
          <div className="w-px h-8 bg-[#C9BCA0]" />
          <div className="text-center">
            <p className="font-[var(--serif)] italic text-lg text-[#A07030]">{formatCurrency(totalDebit)}</p>
            <p className="font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#6B6552]">Spent</p>
          </div>
        </div>
      </div>

      <QRWallet memberName={user.name} />

      <div className="grid sm:grid-cols-2 gap-4">
        <EmergencyFundWidget
          amount={Number(user.customerProfile?.emergencyFund ?? 0)}
          monthlyGrant={grantAmount}
        />
        <LoyaltyWidget
          points={user.customerProfile?.loyaltyPoints ?? 0}
        />
      </div>

      <TransferCredit currentBalance={balance} />

      <SmartBudgetPlanner
        grantAmount={grantAmount}
        outstandingDebt={outstandingDebt}
        currentBalance={balance}
        buckets={buckets.map((b) => ({
          category: b.category,
          allocatedAmount: Number(b.allocatedAmount),
          spentAmount: Number(b.spentAmount),
        }))}
      />

      {/* Transaction history */}
      <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[#C9BCA0]">
          <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552]">Activity</p>
          <p className="font-[var(--serif)] italic text-lg text-[#14130E] leading-tight">Transaction History</p>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-10">
            <Wallet className="h-10 w-10 text-[#A89971] mx-auto mb-3" />
            <p className="font-[var(--serif)] italic text-lg text-[#14130E]">Nothing here yet.</p>
            <p className="font-[var(--mono)] text-[10px] tracking-wide text-[#A89971] mt-1">Your transaction history will appear here</p>
          </div>
        ) : (
          <ul>
            {transactions.map((tx, i) => (
              <li key={tx.id} className={cn(
                'flex items-center gap-3 px-5 py-3 border-b border-[#C9BCA0] last:border-0 hover:bg-[#E11D2A]/4 transition-colors',
                i % 2 === 0 ? 'bg-[#EBE0C7]' : 'bg-[#F2E9D6]'
              )}>
                <div className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0',
                  tx.type === 'CREDIT' ? 'bg-[#3F7B4F]/10' : 'bg-[#E11D2A]/10'
                )}>
                  {tx.type === 'CREDIT' ? (
                    <ArrowDownLeft className="h-4 w-4 text-[#3F7B4F]" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-[#E11D2A]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-[var(--sans-dawn)] text-sm font-medium text-[#14130E] truncate">{tx.description}</p>
                  <p className="font-[var(--mono)] text-[10px] tracking-wide text-[#6B6552]">{formatDateTime(tx.createdAt)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={cn(
                    'font-[var(--serif)] italic text-base',
                    tx.type === 'CREDIT' ? 'text-[#3F7B4F]' : 'text-[#E11D2A]'
                  )}>
                    {tx.type === 'CREDIT' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                  </p>
                  <span className={`font-[var(--mono)] text-[9px] tracking-widest uppercase rounded px-2 py-0.5 border ${
                    tx.type === 'CREDIT'
                      ? 'text-[#3F7B4F] border-[#3F7B4F]/30 bg-[#3F7B4F]/10'
                      : 'text-[#E11D2A] border-[#E11D2A]/30 bg-[#E11D2A]/10'
                  }`}>{tx.type}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}