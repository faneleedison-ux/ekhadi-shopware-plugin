import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { Wallet, ArrowUpRight, ArrowDownLeft, ShoppingCart, Zap, Pill, Baby, Package } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

const bucketColors: Record<string, string> = {
  FOOD: 'bg-green-500',
  MEDICINE: 'bg-blue-500',
  TOILETRIES: 'bg-purple-500',
  ELECTRICITY: 'bg-yellow-500',
  BABY_PRODUCTS: 'bg-pink-500',
}

const bucketIcons: Record<string, React.ReactNode> = {
  FOOD: <ShoppingCart className="h-4 w-4" />,
  ELECTRICITY: <Zap className="h-4 w-4" />,
  MEDICINE: <Pill className="h-4 w-4" />,
  BABY_PRODUCTS: <Baby className="h-4 w-4" />,
  TOILETRIES: <Package className="h-4 w-4" />,
}

export default async function WalletPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'MEMBER') redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      storeCredit: true,
      storeCreditHistory: {
        orderBy: { createdAt: 'desc' },
        take: 30,
      },
      groupMemberships: {
        include: {
          group: {
            include: {
              wallet: {
                include: { buckets: true },
              },
            },
          },
        },
        take: 1,
      },
    },
  })

  if (!user) redirect('/login')

  const balance = Number(user.storeCredit?.balance || 0)
  const transactions = user.storeCreditHistory
  const groupWallet = user.groupMemberships[0]?.group?.wallet
  const buckets = groupWallet?.buckets || []

  const totalDebit = transactions
    .filter((t) => t.type === 'DEBIT')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalCredit = transactions
    .filter((t) => t.type === 'CREDIT')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">My Wallet</h1>
        <p className="text-text-secondary mt-1">Your e-Khadi store credit and transactions</p>
      </div>

      {/* Balance card */}
      <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <p className="text-white/70 text-sm">Store Credit Balance</p>
          <div className="bg-white/20 p-2 rounded-lg">
            <Wallet className="h-4 w-4" />
          </div>
        </div>
        <p className="text-4xl font-bold">{formatCurrency(balance)}</p>
        <div className="flex gap-4 mt-4">
          <div>
            <p className="text-white/60 text-xs">Total Received</p>
            <p className="text-sm font-semibold text-white">{formatCurrency(totalCredit)}</p>
          </div>
          <div className="w-px bg-white/20" />
          <div>
            <p className="text-white/60 text-xs">Total Spent</p>
            <p className="text-sm font-semibold text-white">{formatCurrency(totalDebit)}</p>
          </div>
        </div>
      </div>

      {/* Bucket breakdown */}
      {buckets.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Spending Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {buckets.map((bucket) => {
              const allocated = Number(bucket.allocatedAmount)
              const spent = Number(bucket.spentAmount)
              const percent = allocated > 0 ? Math.min(100, Math.round((spent / allocated) * 100)) : 0
              return (
                <div key={bucket.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={cn('p-1.5 rounded-lg text-white', bucketColors[bucket.category] || 'bg-gray-400')}>
                        {bucketIcons[bucket.category]}
                      </div>
                      <span className="text-sm font-medium text-text-primary">
                        {bucket.category.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold">{formatCurrency(spent)}</span>
                      <span className="text-xs text-text-secondary"> / {formatCurrency(allocated)}</span>
                    </div>
                  </div>
                  <Progress
                    value={percent}
                    indicatorClassName={bucketColors[bucket.category]}
                  />
                  <p className="text-xs text-text-secondary mt-1">{percent}% used</p>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

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
