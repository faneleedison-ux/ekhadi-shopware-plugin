import { ShoppingCart, Pill, Package, Zap, Baby, RefreshCcw } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface BudgetBucket {
  category: string
  label: string
  allocated: number
  spent: number
  color: string
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
  FOOD:         { label: 'Food',         color: 'bg-[#3F7B4F]',  hex: '#3F7B4F', icon: <ShoppingCart className="h-3.5 w-3.5" />, defaultPct: 0.45 },
  MEDICINE:     { label: 'Medicine',     color: 'bg-[#4A5C8A]',  hex: '#4A5C8A', icon: <Pill className="h-3.5 w-3.5" />,         defaultPct: 0.20 },
  TOILETRIES:   { label: 'Toiletries',   color: 'bg-[#7B4F9B]',  hex: '#7B4F9B', icon: <Package className="h-3.5 w-3.5" />,      defaultPct: 0.15 },
  ELECTRICITY:  { label: 'Electricity',  color: 'bg-[#A07030]',  hex: '#A07030', icon: <Zap className="h-3.5 w-3.5" />,          defaultPct: 0.12 },
  BABY_PRODUCTS:{ label: 'Baby Products',color: 'bg-[#B05070]',  hex: '#B05070', icon: <Baby className="h-3.5 w-3.5" />,         defaultPct: 0.08 },
}

const CATEGORY_ORDER = ['FOOD', 'MEDICINE', 'TOILETRIES', 'ELECTRICITY', 'BABY_PRODUCTS']

function barColour(spent: number, allocated: number): string {
  const pct = allocated > 0 ? spent / allocated : 0
  if (pct >= 0.9) return '#E11D2A'
  if (pct >= 0.75) return '#A07030'
  return '#3F7B4F'
}

export default function SmartBudgetPlanner({
  grantAmount,
  outstandingDebt,
  currentBalance,
  buckets,
}: SmartBudgetPlannerProps) {
  const available = Math.max(grantAmount - outstandingDebt, 0)
  const repaymentPct = grantAmount > 0 ? (outstandingDebt / grantAmount) * 100 : 0

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
    return { category: cat, label: meta.label, allocated: suggestedAmount, spent, color: meta.color, hex: meta.hex, icon: meta.icon }
  })

  const isInDebt = outstandingDebt > 0
  const isHealthy = outstandingDebt === 0 && currentBalance > grantAmount * 0.5

  return (
    <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-[#C9BCA0] flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#E11D2A]/10 flex items-center justify-center flex-shrink-0">
          <RefreshCcw className="h-4 w-4 text-[#E11D2A]" />
        </div>
        <div>
          <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552]">Finances</p>
          <p className="font-[var(--serif)] italic text-lg text-[#14130E] leading-tight">Smart Budget Planner</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Status summary */}
        <div className={`rounded-xl p-4 space-y-1 border ${
          isHealthy
            ? 'bg-[#3F7B4F]/8 border-[#3F7B4F]/25'
            : isInDebt
            ? 'bg-[#A07030]/8 border-[#A07030]/25'
            : 'bg-[#F2E9D6] border-[#C9BCA0]'
        }`}>
          <p className="font-[var(--sans-dawn)] text-sm text-[#14130E] leading-relaxed">
            Your next grant is{' '}
            <span className="font-bold">{formatCurrency(grantAmount)}</span>.
            {isInDebt ? (
              <>
                {' '}You owe{' '}
                <span className="font-bold text-[#A07030]">{formatCurrency(outstandingDebt)}</span>.
                {' '}Available:{' '}
                <span className="font-bold text-[#3F7B4F]">{formatCurrency(available)}</span>.
              </>
            ) : (
              <>
                {' '}No outstanding debt —{' '}
                <span className="font-bold text-[#3F7B4F]">{formatCurrency(available)}</span>{' '}
                available.
              </>
            )}
          </p>
          {isHealthy && (
            <p className="font-[var(--mono)] text-[10px] tracking-wide text-[#3F7B4F]">Finances healthy this cycle.</p>
          )}
        </div>

        {/* Allocation bar */}
        <div>
          <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552] mb-2">Grant Allocation</p>
          <div className="flex h-5 rounded-lg overflow-hidden gap-px">
            {repaymentPct > 0 && (
              <div
                className="bg-[#A07030] flex items-center justify-center"
                style={{ width: `${repaymentPct}%` }}
                title={`Repayment: ${formatCurrency(outstandingDebt)}`}
              >
                {repaymentPct > 12 && (
                  <span className="font-[var(--mono)] text-[8px] font-bold text-white">Repay</span>
                )}
              </div>
            )}
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
                    <span className="font-[var(--mono)] text-[8px] font-bold text-white">{b.label.split(' ')[0]}</span>
                  )}
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-between mt-1">
            {repaymentPct > 0 && (
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#A07030] flex-shrink-0" />
                <span className="font-[var(--mono)] text-[9px] text-[#6B6552]">Repayment</span>
              </div>
            )}
            <span className="font-[var(--mono)] text-[9px] text-[#A89971] ml-auto">{formatCurrency(grantAmount)} total</span>
          </div>
        </div>

        {/* Category breakdown */}
        <div>
          <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552] mb-3">Essentials Breakdown</p>
          <div className="space-y-3">
            {budgetBuckets.map((b) => {
              const spentPct = b.allocated > 0 ? Math.min(100, (b.spent / b.allocated) * 100) : 0
              const fillColour = barColour(b.spent, b.allocated)
              return (
                <div key={b.category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg ${b.color} flex items-center justify-center text-white flex-shrink-0`}>
                        {b.icon}
                      </div>
                      <span className="font-[var(--sans-dawn)] text-sm text-[#14130E]">{b.label}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-[var(--mono)] text-[11px] font-semibold text-[#14130E]">
                        {formatCurrency(b.allocated)}
                      </span>
                      {b.spent > 0 && (
                        <span className="font-[var(--mono)] text-[10px] text-[#6B6552]"> · {formatCurrency(b.spent)} spent</span>
                      )}
                    </div>
                  </div>
                  {b.spent > 0 && (
                    <div className="h-1.5 bg-[#C9BCA0]/40 rounded-full overflow-hidden ml-8">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${spentPct}%`, backgroundColor: fillColour }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <p className="font-[var(--mono)] text-[9px] tracking-wide text-[#A89971] border-t border-[#C9BCA0] pt-3">
          Suggestions based on your grant amount and group allocation history. Repayment deducted automatically on grant day.
        </p>
      </div>
    </div>
  )
}
