'use client'

import Link from 'next/link'
import { computeCreditHealth, type CreditHealthInput } from '@/lib/creditHealthScore'
import { formatCurrency } from '@/lib/utils'
import { ShieldCheck, AlertTriangle, TrendingUp, Info, ChevronRight } from 'lucide-react'

interface CreditHealthScoreCardProps extends CreditHealthInput {}

const RING_RADIUS = 52
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

const colorConfig = {
  green: {
    ring: '#22c55e',       // Tailwind green-500
    ringBg: '#dcfce7',
    badge: 'bg-green-100 text-green-800',
    icon: ShieldCheck,
    iconClass: 'text-green-500',
    label: 'Healthy',
  },
  yellow: {
    ring: '#f59e0b',       // Tailwind amber-500
    ringBg: '#fef3c7',
    badge: 'bg-amber-100 text-amber-800',
    icon: TrendingUp,
    iconClass: 'text-amber-500',
    label: 'Building',
  },
  red: {
    ring: '#ef4444',       // Tailwind red-500
    ringBg: '#fee2e2',
    badge: 'bg-red-100 text-red-800',
    icon: AlertTriangle,
    iconClass: 'text-red-500',
    label: 'Needs Attention',
  },
}

function BreakdownRow({
  label,
  score,
  max,
  color,
}: {
  label: string
  score: number
  max: number
  color: string
}) {
  const pct = Math.round((score / max) * 100)
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-text-secondary">
        <span>{label}</span>
        <span className="font-medium text-text-primary">
          {score}/{max}
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

export default function CreditHealthScoreCard(props: CreditHealthScoreCardProps) {
  const result = computeCreditHealth(props)
  const { score, creditLimit, nextLimit, breakdown, color, advice } = result
  const cfg = colorConfig[color]
  const Icon = cfg.icon

  const ctaHref = color === 'yellow' ? '/member/credit-request' : '/member/wallet'
  const ctaText =
    color === 'green'
      ? 'Your credit is healthy — keep repaying on time →'
      : color === 'yellow'
      ? 'Build your history — request credit now →'
      : 'Pay outstanding debt first to improve your score →'

  const strokeOffset = RING_CIRCUMFERENCE * (1 - score / 100)

  return (
    <div className="bg-white rounded-2xl border border-border p-5 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${cfg.iconClass}`} />
          <h2 className="text-base font-bold text-text-primary">Your Credit Health</h2>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.badge}`}>
          {cfg.label}
        </span>
      </div>

      {/* Score ring + limit */}
      <div className="flex items-center gap-6">
        {/* SVG colour ring */}
        <div className="relative flex-shrink-0" style={{ width: 120, height: 120 }}>
          <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
            {/* Track */}
            <circle
              cx="60"
              cy="60"
              r={RING_RADIUS}
              fill="none"
              stroke={cfg.ringBg}
              strokeWidth="10"
            />
            {/* Progress */}
            <circle
              cx="60"
              cy="60"
              r={RING_RADIUS}
              fill="none"
              stroke={cfg.ring}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={strokeOffset}
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          {/* Score text centred over ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-text-primary leading-none">{score}</span>
            <span className="text-xs text-text-secondary mt-0.5">/ 100</span>
          </div>
        </div>

        {/* Limit info */}
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-xs text-text-secondary">Current credit limit</p>
            <p className="text-2xl font-bold text-text-primary">{formatCurrency(creditLimit)}</p>
          </div>
          {nextLimit > 0 && (
            <div className="bg-background rounded-lg px-3 py-2">
              <p className="text-xs text-text-secondary">Next tier</p>
              <p className="text-sm font-semibold text-primary">{formatCurrency(nextLimit)}</p>
            </div>
          )}
          {nextLimit === 0 && (
            <div className="bg-green-50 rounded-lg px-3 py-2">
              <p className="text-xs text-green-700 font-medium">Maximum limit reached 🎉</p>
            </div>
          )}
        </div>
      </div>

      {/* Score breakdown bars */}
      <div className="space-y-2.5">
        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
          Score breakdown
        </p>
        <BreakdownRow
          label="Repayment ratio"
          score={breakdown.repaymentScore}
          max={40}
          color={cfg.ring}
        />
        <BreakdownRow
          label="Repayment speed"
          score={breakdown.speedScore}
          max={20}
          color={cfg.ring}
        />
        <BreakdownRow
          label="No outstanding debt"
          score={breakdown.noDebtScore}
          max={20}
          color={cfg.ring}
        />
        <BreakdownRow
          label="Grant cycle consistency"
          score={breakdown.cycleConsistencyScore}
          max={20}
          color={cfg.ring}
        />
      </div>

      {/* Plain-language advice */}
      {advice.length > 0 && (
        <div className="space-y-2">
          {advice.map((line, i) => (
            <div
              key={i}
              className="flex items-start gap-2 bg-background rounded-lg px-3 py-2.5"
            >
              <Info className="h-3.5 w-3.5 text-text-secondary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-text-secondary leading-relaxed">{line}</p>
            </div>
          ))}
        </div>
      )}

      {/* Contextual CTA */}
      <div className="pt-2 border-t border-border mt-2">
        <Link href={ctaHref}>
          <div className="flex items-center justify-between p-3 rounded-xl transition-all hover:opacity-80 cursor-pointer" style={{ backgroundColor: cfg.ringBg }}>
            <p className="text-xs font-semibold" style={{ color: cfg.ring }}>{ctaText}</p>
            <ChevronRight className="h-4 w-4 flex-shrink-0" style={{ color: cfg.ring }} />
          </div>
        </Link>
      </div>
    </div>
  )
}
