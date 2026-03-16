import React from 'react'
import { CreditCard, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface CreditBalanceCardProps {
  balance: number
  creditLimit?: number
  memberName: string
  sassaId?: string
}

export default function CreditBalanceCard({
  balance,
  creditLimit = 300,
  memberName,
  sassaId,
}: CreditBalanceCardProps) {
  const usagePercent = Math.min(100, Math.round((balance / creditLimit) * 100))

  return (
    <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/70 text-sm font-medium">Available Credit</p>
            <p className="text-white text-sm">{memberName}</p>
          </div>
          <div className="bg-white/20 p-2.5 rounded-xl">
            <CreditCard className="h-5 w-5 text-white" />
          </div>
        </div>

        <div className="mb-4">
          <p className="text-4xl font-bold tracking-tight">{formatCurrency(balance)}</p>
          <p className="text-white/70 text-sm mt-1">of {formatCurrency(creditLimit)} limit</p>
        </div>

        {/* Usage bar */}
        <div className="mb-4">
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-white/60 text-xs">{usagePercent}% used</span>
            <span className="text-white/60 text-xs">2% service fee</span>
          </div>
        </div>

        {sassaId && (
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
            <div className="w-2 h-2 rounded-full bg-success" />
            <span className="text-white/80 text-xs">SASSA ID: {sassaId}</span>
          </div>
        )}
      </div>
    </div>
  )
}
