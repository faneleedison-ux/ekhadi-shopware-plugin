import { Flame, Award, Shield, Zap } from 'lucide-react'

interface Props {
  paidRepaymentsCount: number
  approvedRequestsCount: number
  completedCyclesCount: number
}

const BADGES = [
  {
    id: 'first-purchase',
    label: 'First Purchase',
    emoji: '🛍️',
    description: 'Made your first purchase',
    unlocked: (p: Props) => p.approvedRequestsCount >= 1,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  {
    id: 'on-time-x3',
    label: 'On Time ×3',
    emoji: '⏰',
    description: '3 on-time repayments',
    unlocked: (p: Props) => p.paidRepaymentsCount >= 3,
    color: 'text-green-500',
    bg: 'bg-green-50',
    border: 'border-green-200',
  },
  {
    id: 'on-time-x10',
    label: 'Streak 🔥',
    emoji: '🔥',
    description: '10 on-time repayments',
    unlocked: (p: Props) => p.paidRepaymentsCount >= 10,
    color: 'text-orange-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
  },
  {
    id: 'cycle-complete',
    label: 'Cycle Done',
    emoji: '🔄',
    description: 'Completed a full grant cycle',
    unlocked: (p: Props) => p.completedCyclesCount >= 1,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  {
    id: 'trusted',
    label: 'Trusted Member',
    emoji: '🏆',
    description: '5 completed cycles',
    unlocked: (p: Props) => p.completedCyclesCount >= 5,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
]

export default function StreakBadges({ paidRepaymentsCount, approvedRequestsCount, completedCyclesCount }: Props) {
  const props = { paidRepaymentsCount, approvedRequestsCount, completedCyclesCount }
  const unlocked = BADGES.filter((b) => b.unlocked(props))
  const locked = BADGES.filter((b) => !b.unlocked(props))

  return (
    <div className="rounded-2xl border border-border bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-text-primary flex items-center gap-1.5">
          <Award className="h-4 w-4 text-amber-500" /> Achievement Badges
        </p>
        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
          {unlocked.length}/{BADGES.length} earned
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {BADGES.map((badge) => {
          const isUnlocked = badge.unlocked(props)
          return (
            <div
              key={badge.id}
              title={`${badge.label}: ${badge.description}`}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                isUnlocked ? `${badge.bg} ${badge.border}` : 'bg-gray-50 border-gray-100 opacity-40'
              }`}
            >
              <span className="text-xl">{badge.emoji}</span>
              <p className={`text-[8px] font-bold text-center leading-tight ${isUnlocked ? badge.color : 'text-text-secondary'}`}>
                {badge.label}
              </p>
            </div>
          )
        })}
      </div>

      {unlocked.length > 0 && (
        <p className="text-[11px] text-success font-semibold flex items-center gap-1">
          <Flame className="h-3 w-3" /> {paidRepaymentsCount} on-time repayments — keep it up!
        </p>
      )}
    </div>
  )
}