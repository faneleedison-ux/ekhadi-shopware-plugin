import { Star, Gift, TrendingUp } from 'lucide-react'

interface Props {
  points: number
  recentPoints?: number
}

const TIERS = [
  { name: 'Bronze', min: 0, max: 199, color: '#cd7f32', bg: 'bg-orange-50' },
  { name: 'Silver', min: 200, max: 499, color: '#9ca3af', bg: 'bg-gray-50' },
  { name: 'Gold', min: 500, max: 999, color: '#f59e0b', bg: 'bg-yellow-50' },
  { name: 'Platinum', min: 1000, max: Infinity, color: '#6366f1', bg: 'bg-indigo-50' },
]

function getTier(points: number) {
  return TIERS.find((t) => points >= t.min && points <= t.max) ?? TIERS[0]
}

export default function LoyaltyWidget({ points, recentPoints = 0 }: Props) {
  const tier = getTier(points)
  const nextTier = TIERS[TIERS.indexOf(tier) + 1]
  const progress = nextTier ? Math.round(((points - tier.min) / (nextTier.min - tier.min)) * 100) : 100
  const creditValue = Math.floor(points / 100) * 10

  return (
    <div className="rounded-2xl border border-border bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${tier.color}20` }}>
            <Star className="h-4 w-4" style={{ color: tier.color }} />
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary">Loyalty Points</p>
            <p className="text-[10px] text-text-secondary font-semibold" style={{ color: tier.color }}>
              {tier.name} Member
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-text-primary">{points.toLocaleString()}</p>
          <p className="text-[10px] text-text-secondary">pts</p>
        </div>
      </div>

      {/* Progress to next tier */}
      {nextTier && (
        <div>
          <div className="flex justify-between text-[10px] text-text-secondary mb-1">
            <span>{tier.name}</span>
            <span>{nextTier.name} at {nextTier.min} pts</span>
          </div>
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${progress}%`, background: tier.color }}
            />
          </div>
        </div>
      )}

      {/* Redeem value */}
      <div className="flex items-center justify-between bg-background rounded-xl px-3 py-2">
        <div className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-primary" />
          <div>
            <p className="text-xs font-semibold text-text-primary">Redeemable credit</p>
            <p className="text-[10px] text-text-secondary">100 pts = R10 store credit</p>
          </div>
        </div>
        <p className="text-sm font-black text-primary">R{creditValue}</p>
      </div>

      {recentPoints > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-success font-semibold">
          <TrendingUp className="h-3 w-3" />+{recentPoints} pts earned this month
        </div>
      )}
    </div>
  )
}