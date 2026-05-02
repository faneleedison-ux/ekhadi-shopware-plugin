import { Award, ChevronRight } from 'lucide-react'

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
    description: 'Made your first credit purchase',
    unlocked: (p: Props) => p.approvedRequestsCount >= 1,
    color: '#3b82f6',
    bg: '#eff6ff',
  },
  {
    id: 'on-time-x3',
    label: 'On Time ×3',
    emoji: '⏰',
    description: '3 on-time repayments',
    unlocked: (p: Props) => p.paidRepaymentsCount >= 3,
    color: '#22c55e',
    bg: '#f0fdf4',
  },
  {
    id: 'on-time-x10',
    label: 'Fire Streak',
    emoji: '🔥',
    description: '10 on-time repayments',
    unlocked: (p: Props) => p.paidRepaymentsCount >= 10,
    color: '#f97316',
    bg: '#fff7ed',
  },
  {
    id: 'cycle-complete',
    label: 'Cycle Done',
    emoji: '🔄',
    description: 'Completed a full grant cycle',
    unlocked: (p: Props) => p.completedCyclesCount >= 1,
    color: '#a855f7',
    bg: '#faf5ff',
  },
  {
    id: 'trusted',
    label: 'Trusted',
    emoji: '🏆',
    description: '5 completed grant cycles',
    unlocked: (p: Props) => p.completedCyclesCount >= 5,
    color: '#f59e0b',
    bg: '#fffbeb',
  },
]

function getNextProgress(nextBadge: typeof BADGES[0], props: Props) {
  if (!nextBadge) return { pct: 100, label: '' }
  if (nextBadge.id === 'first-purchase')
    return { pct: props.approvedRequestsCount > 0 ? 100 : 0, label: `${props.approvedRequestsCount}/1 credit request` }
  if (nextBadge.id === 'on-time-x3')
    return { pct: Math.min(100, (props.paidRepaymentsCount / 3) * 100), label: `${props.paidRepaymentsCount}/3 repayments` }
  if (nextBadge.id === 'on-time-x10')
    return { pct: Math.min(100, (props.paidRepaymentsCount / 10) * 100), label: `${props.paidRepaymentsCount}/10 repayments` }
  if (nextBadge.id === 'cycle-complete')
    return { pct: props.completedCyclesCount > 0 ? 100 : 0, label: `${props.completedCyclesCount}/1 cycles` }
  return { pct: Math.min(100, (props.completedCyclesCount / 5) * 100), label: `${props.completedCyclesCount}/5 cycles` }
}

export default function StreakBadges({ paidRepaymentsCount, approvedRequestsCount, completedCyclesCount }: Props) {
  const props = { paidRepaymentsCount, approvedRequestsCount, completedCyclesCount }
  const unlockedCount = BADGES.filter((b) => b.unlocked(props)).length
  const nextBadge = BADGES.find((b) => !b.unlocked(props))
  const { pct: nextPct, label: nextLabel } = nextBadge ? getNextProgress(nextBadge, props) : { pct: 100, label: '' }

  return (
    <div className="rounded-2xl border border-border bg-white overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-amber-500" />
          <p className="text-sm font-bold text-text-primary">Your Journey</p>
        </div>
        <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
          {unlockedCount}/{BADGES.length} earned
        </span>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="grid grid-cols-5 gap-2">
          {BADGES.map((badge) => {
            const isUnlocked = badge.unlocked(props)
            return (
              <div
                key={badge.id}
                title={`${badge.label}: ${badge.description}`}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all cursor-default"
                style={isUnlocked ? {
                  backgroundColor: badge.bg,
                  borderColor: badge.color + '40',
                  boxShadow: `0 0 12px ${badge.color}20`,
                } : {
                  backgroundColor: '#f9fafb',
                  borderColor: '#e5e7eb',
                  opacity: 0.45,
                  filter: 'grayscale(1)',
                }}
              >
                <span className="text-2xl leading-none">{badge.emoji}</span>
                <p className="text-[10px] font-bold text-center leading-tight"
                  style={{ color: isUnlocked ? badge.color : '#9ca3af' }}>
                  {badge.label}
                </p>
              </div>
            )
          })}
        </div>

        {nextBadge ? (
          <div className="p-3 rounded-xl bg-background">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg leading-none" style={{ filter: 'grayscale(0.6)', opacity: 0.7 }}>{nextBadge.emoji}</span>
                <div>
                  <p className="text-xs font-semibold text-text-primary">Next: {nextBadge.label}</p>
                  <p className="text-[10px] text-text-secondary">{nextLabel}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-text-secondary flex-shrink-0" />
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${nextPct}%`, backgroundColor: nextBadge.color }}
              />
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
            <p className="text-sm font-bold text-amber-700">🏆 All badges earned! You are a Trusted Member.</p>
          </div>
        )}
      </div>
    </div>
  )
}