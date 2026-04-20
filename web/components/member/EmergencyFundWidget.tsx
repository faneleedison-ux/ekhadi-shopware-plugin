import { Shield, Lock, TrendingUp } from 'lucide-react'

interface Props {
  amount: number
  monthlyGrant: number
}

export default function EmergencyFundWidget({ amount, monthlyGrant }: Props) {
  const target = monthlyGrant * 3 // 3-month emergency fund goal
  const progress = Math.min(100, Math.round((amount / target) * 100))
  const remaining = Math.max(0, target - amount)

  return (
    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Shield className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary">Emergency Fund</p>
            <p className="text-[10px] text-emerald-600 font-semibold">2% auto-saved per purchase</p>
          </div>
        </div>
        <Lock className="h-4 w-4 text-emerald-400" />
      </div>

      <div>
        <div className="flex justify-between items-end mb-1.5">
          <p className="text-2xl font-black text-emerald-700">R{Number(amount).toFixed(2)}</p>
          <p className="text-xs text-text-secondary">Goal: R{target.toFixed(0)}</p>
        </div>
        <div className="h-2.5 bg-emerald-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-text-secondary mt-1">
          <span>{progress}% of 3-month goal</span>
          <span>R{remaining.toFixed(0)} to go</span>
        </div>
      </div>

      <div className="flex items-start gap-2 bg-white/60 rounded-xl px-3 py-2">
        <TrendingUp className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-text-secondary leading-snug">
          Locked for 3 months. Builds automatically — 2% of every purchase goes here. Withdrawable in emergencies.
        </p>
      </div>
    </div>
  )
}