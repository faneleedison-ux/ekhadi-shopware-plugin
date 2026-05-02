import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
    <div className="space-y-6 animate-fade-in">
      {/* Compact balance header — full card lives on the home dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Wallet</h1>
          <p className="text-text-secondary mt-0.5 text-sm">
            Balance: <span className="font-bold text-text-primary">{formatCurrency(balance)}</span>
            <span className="mx-2 text-border">·</span>
            Received: <span className="font-semibold text-success">{formatCurrency(totalCredit)}</span>
            <span className="mx-2 text-border">·</span>
            Spent: <span className="font-semibold text-danger">{formatCurrency(totalDebit)}</span>
          </p>
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

      {/* Smart Budget Planner */}
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
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <div className="text-center py-10">
              <Wallet className="h-10 w-10 text-text-secondary mx-auto mb-3" />
              <p className="text-sm font-medium text-text-secondary">No transactions yet</p>
              <p className="text-xs text-text-secondary mt-1">Your transaction history will appear here</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {transactions.map((tx) => (
                <li key={tx.id} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50/50">
                  <div className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0',
                    tx.type === 'CREDIT' ? 'bg-success/10' : 'bg-danger/10'
                  )}>
                    {tx.type === 'CREDIT' ? (
                      <ArrowDownLeft className="h-4 w-4 text-success" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-danger" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{tx.description}</p>
                    <p className="text-xs text-text-secondary">{formatDateTime(tx.createdAt)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={cn(
                      'text-sm font-semibold',
                      tx.type === 'CREDIT' ? 'text-success' : 'text-danger'
                    )}>
                      {tx.type === 'CREDIT' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                    </p>
                    <Badge
                      variant={tx.type === 'CREDIT' ? 'success' : 'destructive'}
                      className="text-xs mt-0.5"
                    >
                      {tx.type}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
