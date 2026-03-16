import React from 'react'
import { Calendar, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatCurrency, calculatePercentage, getMonthName } from '@/lib/utils'

interface GrantProgressCardProps {
  grantAmount: number
  spentAmount: number
  repaidAmount: number
  month: number
  year: number
}

export default function GrantProgressCard({
  grantAmount,
  spentAmount,
  repaidAmount,
  month,
  year,
}: GrantProgressCardProps) {
  const spentPercent = calculatePercentage(spentAmount, grantAmount)
  const remaining = Math.max(0, grantAmount - spentAmount)
  const repaidPercent = calculatePercentage(repaidAmount, spentAmount)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Grant Cycle</CardTitle>
          <div className="flex items-center gap-1.5 text-text-secondary">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{getMonthName(month)} {year}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Grant amount */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm text-text-secondary">Monthly Grant</span>
              <span className="text-sm font-semibold text-text-primary">{formatCurrency(grantAmount)}</span>
            </div>
            <div className="flex justify-between text-xs text-text-secondary mb-1">
              <span>Spent: {formatCurrency(spentAmount)}</span>
              <span>Remaining: {formatCurrency(remaining)}</span>
            </div>
            <Progress
              value={spentPercent}
              indicatorClassName={
                spentPercent > 80 ? 'bg-danger' : spentPercent > 60 ? 'bg-warning' : 'bg-primary'
              }
            />
            <p className="text-xs text-text-secondary mt-1">{spentPercent}% of grant used</p>
          </div>

          {/* Repayment progress */}
          {spentAmount > 0 && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm text-text-secondary">Repayment Progress</span>
                <span className="text-sm font-semibold text-success">{repaidPercent}%</span>
              </div>
              <Progress
                value={repaidPercent}
                indicatorClassName="bg-success"
              />
              <div className="flex justify-between text-xs text-text-secondary mt-1">
                <span>Repaid: {formatCurrency(repaidAmount)}</span>
                <span>Owed: {formatCurrency(Math.max(0, spentAmount - repaidAmount))}</span>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-primary-light rounded-lg p-3 flex items-center gap-3">
            <TrendingDown className="h-4 w-4 text-primary flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-primary">
                {remaining > 0
                  ? `${formatCurrency(remaining)} available this month`
                  : 'Grant fully utilized this month'}
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                Credit repaid from next grant payment
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
