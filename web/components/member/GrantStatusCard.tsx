'use client'

import { useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { formatCurrency, calculatePercentage, getMonthName } from '@/lib/utils'

interface GrantStatusCardProps {
  grantAmount: number
  spentAmount: number
  repaidAmount: number
  month: number
  year: number
}

function getSASSAPayDate(): Date {
  const now = new Date()
  const nextMonth = now.getDate() <= 3 ? now : new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1)
}

export default function GrantStatusCard({
  grantAmount,
  spentAmount,
  repaidAmount,
  month,
  year,
}: GrantStatusCardProps) {
  const [daysLeft, setDaysLeft] = useState(0)
  const [hoursLeft, setHoursLeft] = useState(0)

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const payDate = getSASSAPayDate()
      const diff = payDate.getTime() - now.getTime()
      setDaysLeft(Math.floor(diff / (1000 * 60 * 60 * 24)))
      setHoursLeft(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)))
    }
    update()
    const t = setInterval(update, 60000)
    return () => clearInterval(t)
  }, [])

  const isImminent = daysLeft <= 2
  const spentPercent = calculatePercentage(spentAmount, grantAmount)
  const remaining = Math.max(0, grantAmount - spentAmount)
  const repaidPercent = calculatePercentage(repaidAmount, spentAmount)
  const owedAmount = Math.max(0, spentAmount - repaidAmount)

  const countdownLabel =
    daysLeft === 0 ? `Today! ${hoursLeft}h away` : `${daysLeft}d to pay day`

  return (
    <div className="bg-white rounded-2xl border border-border p-4 space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-text-primary">
          {getMonthName(month)} {year} Grant Cycle
        </p>
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
            isImminent
              ? 'bg-green-100 text-green-700'
              : 'bg-primary-light text-primary'
          }`}
        >
          {countdownLabel}
        </span>
      </div>

      {/* 3-column stats grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-background rounded-xl p-3 text-center">
          <p className="text-base font-black text-text-primary">{formatCurrency(grantAmount)}</p>
          <p className="text-[10px] text-text-secondary mt-0.5 uppercase tracking-wide">Grant Total</p>
        </div>
        <div className="bg-background rounded-xl p-3 text-center">
          <p className="text-base font-black text-danger">{formatCurrency(spentAmount)}</p>
          <p className="text-[10px] text-text-secondary mt-0.5 uppercase tracking-wide">Used</p>
        </div>
        <div className="bg-background rounded-xl p-3 text-center">
          <p className="text-base font-black text-success">{formatCurrency(remaining)}</p>
          <p className="text-[10px] text-text-secondary mt-0.5 uppercase tracking-wide">Left</p>
        </div>
      </div>

      {/* Spending progress bar */}
      <div>
        <div className="flex justify-between text-xs text-text-secondary mb-1.5">
          <span>Spending</span>
          <span className="font-medium">{spentPercent}% used</span>
        </div>
        <Progress
          value={spentPercent}
          indicatorClassName={
            spentPercent > 80 ? 'bg-danger' : spentPercent > 60 ? 'bg-warning' : 'bg-primary'
          }
        />
      </div>

      {/* Repayment progress bar */}
      {spentAmount > 0 && (
        <div>
          <div className="flex justify-between text-xs text-text-secondary mb-1.5">
            <span>Repayment</span>
            <span className="font-medium text-success">{repaidPercent}% repaid</span>
          </div>
          <Progress value={repaidPercent} indicatorClassName="bg-success" />
        </div>
      )}

      {/* Footer */}
      {spentAmount > 0 && (
        <div className="pt-1 border-t border-border">
          <p className="text-xs text-text-secondary">
            Owed on next pay day:{' '}
            <span className="font-bold text-text-primary">{formatCurrency(owedAmount)}</span>
          </p>
        </div>
      )}
    </div>
  )
}