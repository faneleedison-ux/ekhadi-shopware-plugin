import { ShoppingCart, Pill, Package, Zap, Baby, RefreshCcw } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface BudgetBucket {
  category: string
  label: string
  allocated: number
  spent: number
  color: string      // Tailwind bg class
  hex: string
  icon: React.ReactNode
}

interface SmartBudgetPlannerProps {
  grantAmount: number
  outstandingDebt: number
  currentBalance: number
  buckets: { category: string; allocatedAmount: number; spentAmount: number }[]
}

const CATEGORY_META: Record<string, { label: string; color: string; hex: string; icon: React.ReactNode; defaultPct: number }> = {
  FOOD:         { label: 'Food',         color: 'bg-green-500',  hex: '#22c55e', icon: <ShoppingCart className="h-3.5 w-3.5" />, defaultPct: 0.45 },
  MEDICINE:     { label: 'Medicine',     color: 'bg-blue-500',   hex: '#3b82f6', icon: <Pill className="h-3.5 w-3.5" />,         defaultPct: 0.20 },
  TOILETRIES:   { label: 'Toiletries',   color: 'bg-purple-500', hex: '#a855f7', icon: <Package className="h-3.5 w-3.5" />,      defaultPct: 0.15 },
  ELECTRICITY:  { label: 'Electricity',  color: 'bg-yellow-500', hex: '#eab308', icon: <Zap className="h-3.5 w-3.5" />,          defaultPct: 0.12 },
  BABY_PRODUCTS:{ label: 'Baby Products',color: 'bg-pink-500',   hex: '#ec4899', icon: <Baby className="h-3.5 w-3.5" />,         defaultPct: 0.08 },
}

const CATEGORY_ORDER = ['FOOD', 'MEDICINE', 'TOILETRIES', 'ELECTRICITY', 'BABY_PRODUCTS']

export default function SmartBudgetPlanner({
  grantAmount,
  outstandingDebt,
  currentBalance,
  buckets,
}: SmartBudgetPlannerProps) {
  const available = Math.max(grantAmount - outstandingDebt, 0)
  const repaymentPct = grantAmount > 0 ? (outstandingDebt / grantAmount) * 100 : 0
  const availablePct = 100 - repaymentPct

  // Build budget buckets — use actual allocations if available, else default percentages
  const totalAllocated = buckets.reduce((s, b) => s + Number(b.allocatedAmount), 0)
  const useBucketAllocations = totalAllocated > 0

  const budgetBuckets: BudgetBucket[] = CATEGORY_ORDER.map((cat) => {
    const meta = CATEGORY_META[cat]
    const bucket = buckets.find((b) => b.category === cat)
    const allocated = bucket ? Number(bucket.allocatedAmount) : 0
    const spent = bucket ? Number(bucket.spentAmount) : 0

    const suggestedAmount = useBucketAllocations
      ? (allocated / totalAllocated) * available
      : meta.defaultPct * available

    return {
      category: cat,
      label: meta.label,
      allocated: suggestedAmount,
      spent,
      color: meta.color,
      hex: meta.hex,
      icon: meta.icon,
    }
  })

  const isInDebt = outstandingDebt > 0
  const isHealthy = outstandingDebt === 0 && currentBalance > grantAmount * 0.5

  return (
    <div className="bg-white rounded-2xl border border-border p-5 space-y-5">
      {/* Conversational header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
            <RefreshCcw className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-base font-bold text-text-primary">Smart Budget Planner</h2>
        </div>

        <div className={`rounded-xl p-4 space-y-1.5 ${isHealthy ? 'bg-green-50 border border-green-200' : isInDebt ? 'bg-amber-50 border border-amber-200' : 'bg-background'}`}>
          <p className="text-sm text-text-primary leading-relaxed">
            Your next grant is{' '}
            <span className="font-bold text-text-primary">{formatCurrency(grantAmount)}</span>.
            {isInDebt ? (
              <>
                {' '}You owe{' '}
                <span className="font-bold text-warning">{formatCurrency(outstandingDebt)}</span>.
                {' '}Available for essentials:{' '}
                <span className="font-bold text-success">{formatCurrency(available)}</span>.
              </>
            ) : (
              <>
                {' '}No outstanding debt —{' '}
                <span className="font-bold text-success">{formatCurrency(available)}</span>{' '}
                available for essentials.
              </>
            )}
          </p>
          {isHealthy && (
            <p className="text-xs text-green-700 font-medium">Your finances are in great shape this cycle.</p>
          )}
        </div>
      </div>

      {/* Allocation bar */}
      <div>
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
          Grant Allocation
        </p>
        <div className="flex h-6 rounded-lg overflow-hidden gap-px">
          {/* Repayment slot */}
          {repaymentPct > 0 && (
            <div
              className="bg-orange-400 flex items-center justify-center"
              style={{ width: `${repaymentPct}%` }}
              title={`Repayment: ${formatCurrency(outstandingDebt)}`}
            >
              {repaymentPct > 12 && (
                <span className="text-[9px] font-bold text-white">Repay</span>
              )}
            </div>
          )}
          {/* Essential categories */}
          {budgetBuckets.map((b) => {
            const slicePct = grantAmount > 0 ? (b.allocated / grantAmount) * 100 : 0
            if (slicePct < 0.5) return null
            return (
              <div
                key={b.category}
                className={`${b.color} flex items-center justify-center`}
                style={{ width: `${slicePct}%` }}
                title={`${b.label}: ${formatCurrency(b.allocated)}`}
              >
                {slicePct > 10 && (
                  <span className="text-[9px] font-bold text-white">{b.label.split(' ')[0]}</span>
                )}
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-1">
            {repaymentPct > 0 && (
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                <span className="text-[10px] text-text-secondary">Repayment</span>
              </div>
            )}
          </div>
          <span className="text-[10px] text-text-secondary">
            {formatCurrency(grantAmount)} total
          </span>
        </div>
      </div>

      {/* Category breakdown */}
      <div>
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
          Suggested Essentials Breakdown
        </p>
        <div className="space-y-2.5">
          {budgetBuckets.map((b) => {
            const spentPct = b.allocated > 0 ? Math.min(100, (b.spent / b.allocated) * 100) : 0
            return (
              <div key={b.category}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg ${b.color} flex items-center justify-center text-white flex-shrink-0`}>
                      {b.icon}
                    </div>
                    <span className="text-xs font-medium text-text-primary">{b.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-text-primary">
                      {formatCurrency(b.allocated)}
                    </span>
                    {b.spent > 0 && (
                      <span className="text-xs text-text-secondary"> · {formatCurrency(b.spent)} spent</span>
                    )}
                  </div>
                </div>
                {b.spent > 0 && (
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden ml-8">
                    <div
                      className={`h-full rounded-full ${b.color}`}
                      style={{ width: `${spentPct}%` }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer note */}
      <p className="text-xs text-text-secondary border-t border-border pt-3">
        Budget suggestions are based on your grant amount and group allocation history. Repayment is automatically deducted on your next grant pay day.
      </p>
    </div>
  )
}
