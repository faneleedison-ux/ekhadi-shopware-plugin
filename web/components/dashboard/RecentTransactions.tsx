import React from 'react'
import { ArrowUpRight, ArrowDownLeft, ShoppingCart, Zap, Pill, Baby, Package } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Transaction {
  id: string
  amount: number
  type: 'CREDIT' | 'DEBIT'
  description: string
  createdAt: string | Date
  category?: string
}

interface RecentTransactionsProps {
  transactions: Transaction[]
  title?: string
  showEmpty?: boolean
}

const categoryIcons: Record<string, React.ReactNode> = {
  FOOD: <ShoppingCart className="h-3.5 w-3.5" />,
  ELECTRICITY: <Zap className="h-3.5 w-3.5" />,
  MEDICINE: <Pill className="h-3.5 w-3.5" />,
  BABY_PRODUCTS: <Baby className="h-3.5 w-3.5" />,
  TOILETRIES: <Package className="h-3.5 w-3.5" />,
}

export default function RecentTransactions({
  transactions,
  title = 'Recent Transactions',
  showEmpty = true,
}: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {transactions.length === 0 && showEmpty ? (
          <div className="text-center py-10 px-6">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <ArrowUpRight className="h-5 w-5 text-text-secondary" />
            </div>
            <p className="text-sm font-medium text-text-secondary">No transactions yet</p>
            <p className="text-xs text-text-secondary mt-1">Your transaction history will appear here</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {transactions.map((tx) => (
              <li key={tx.id} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50/50 transition-colors">
                <div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0',
                    tx.type === 'CREDIT' ? 'bg-success/10' : 'bg-danger/10'
                  )}
                >
                  {tx.type === 'CREDIT' ? (
                    <ArrowDownLeft className="h-4 w-4 text-success" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-danger" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{tx.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-text-secondary">{formatDate(tx.createdAt)}</span>
                    {tx.category && (
                      <span className="flex items-center gap-1 text-xs text-text-secondary">
                        {categoryIcons[tx.category]}
                        {tx.category.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={cn(
                    'text-sm font-semibold flex-shrink-0',
                    tx.type === 'CREDIT' ? 'text-success' : 'text-danger'
                  )}
                >
                  {tx.type === 'CREDIT' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
