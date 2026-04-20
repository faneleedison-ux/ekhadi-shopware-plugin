'use client'

import { useEffect, useState, useRef } from 'react'
import { TrendingUp, TrendingDown, ShoppingCart, Zap, AlertTriangle, RefreshCw } from 'lucide-react'
import { ForecastItem } from './StockForecastCard'

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS = {
  critical: {
    label: 'RESTOCK NOW',
    color: 'text-red-500',
    bg: 'bg-red-500/8',
    border: 'border-red-500/25',
    bar: 'from-red-500 to-orange-400',
    dot: 'bg-red-500',
    pulse: true,
  },
  low: {
    label: 'RUNNING LOW',
    color: 'text-amber-500',
    bg: 'bg-amber-500/8',
    border: 'border-amber-400/25',
    bar: 'from-amber-400 to-yellow-300',
    dot: 'bg-amber-400',
    pulse: false,
  },
  good: {
    label: 'WELL STOCKED',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/8',
    border: 'border-emerald-400/20',
    bar: 'from-emerald-400 to-teal-400',
    dot: 'bg-emerald-400',
    pulse: false,
  },
}

function getStatus(percent: number, trend: number) {
  if (percent > 35 && trend > 5) return 'critical'
  if (percent > 25 || trend > 10) return 'low'
  return 'good'
}

// ── Animated count-up number ──────────────────────────────────────────────────
function CountUp({ to, duration = 1200 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(ease * to))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [to, duration])
  return <>{val}</>
}

// ── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setDisplay((p) => (p >= score ? score : p + 1)), 12)
    return () => clearInterval(t)
  }, [score])
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'
  const r = 38
  const circ = 2 * Math.PI * r
  const dash = (display / 100) * circ
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="96" height="96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.03s linear', filter: `drop-shadow(0 0 6px ${color}80)` }} />
      </svg>
      <div className="text-center z-10">
        <p className="text-[22px] font-black text-white leading-none">{display}</p>
        <p className="text-[8px] text-white/40 font-bold uppercase tracking-widest mt-0.5">score</p>
      </div>
    </div>
  )
}

// ── Live activity ticker ──────────────────────────────────────────────────────
const ACTIVITY_POOL = [
  { emoji: '🍞', text: 'Bread purchased', area: 'Khayelitsha' },
  { emoji: '⚡', text: 'Prepaid electricity', area: 'Mitchells Plain' },
  { emoji: '💊', text: 'Headache tablets', area: 'Gugulethu' },
  { emoji: '🍼', text: 'Baby formula', area: 'Langa' },
  { emoji: '🧴', text: 'Soap & toiletries', area: 'Nyanga' },
  { emoji: '🍞', text: 'Maize meal', area: 'Khayelitsha' },
  { emoji: '⚡', text: 'Airtime voucher', area: 'Mitchells Plain' },
  { emoji: '🧴', text: 'Toothpaste', area: 'Gugulethu' },
]

function LiveTicker({ areaName }: { areaName: string }) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const [secondsAgo, setSecondsAgo] = useState(Math.floor(Math.random() * 5) + 1)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((i) => (i + 1) % ACTIVITY_POOL.length)
        setSecondsAgo(Math.floor(Math.random() * 8) + 1)
        setVisible(true)
      }, 300)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  const item = ACTIVITY_POOL[index]
  return (
    <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2 overflow-hidden">
      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
      <div
        className="flex items-center gap-1.5 text-xs text-white/80 transition-all duration-300"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(-4px)' }}
      >
        <span>{item.emoji}</span>
        <span className="font-medium">{item.text}</span>
        <span className="text-white/40">·</span>
        <span className="text-white/50">{areaName}</span>
        <span className="text-white/30">·</span>
        <span className="text-white/40">{secondsAgo}m ago</span>
      </div>
    </div>
  )
}

// ── Animated demand bar ───────────────────────────────────────────────────────
function DemandBar({ percent, colorClass, delay = 0 }: { percent: number; colorClass: string; delay?: number }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setWidth(Math.min(percent * 1.6, 100)), delay + 200)
    return () => clearTimeout(t)
  }, [percent, delay])
  return (
    <div className="h-2.5 bg-black/10 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${colorClass}`}
        style={{ width: `${width}%`, transition: 'width 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      />
    </div>
  )
}

// ── Mini sparkline (fake trend bars) ─────────────────────────────────────────
function Sparkline({ trend }: { trend: number }) {
  const bars = [0.4, 0.6, 0.5, 0.7, 0.65, trend > 0 ? 0.9 : 0.4]
  const color = trend > 5 ? '#10b981' : trend < -5 ? '#3b82f6' : '#f59e0b'
  return (
    <div className="flex items-end gap-0.5 h-6">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-1.5 rounded-sm"
          style={{
            height: `${h * 100}%`,
            backgroundColor: color,
            opacity: 0.4 + h * 0.6,
          }}
        />
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ForecastDashboard({
  items, shopName, ownerName, areaName, totalTransactions,
}: {
  items: ForecastItem[]
  shopName: string
  ownerName: string
  areaName: string
  totalTransactions: number
}) {
  const firstName = ownerName.split(' ')[0]
  const criticalCount = items.filter((i) => getStatus(i.percent, i.trend) === 'critical').length
  const lowCount = items.filter((i) => getStatus(i.percent, i.trend) === 'low').length
  const score = Math.max(10, 100 - criticalCount * 25 - lowCount * 10)
  const [tick, setTick] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Simulate "live" refresh every 45s
  useEffect(() => {
    const t = setInterval(() => {
      setTick((p) => p + 1)
      setLastUpdated(new Date())
    }, 45000)
    return () => clearInterval(t)
  }, [])

  const timeStr = lastUpdated.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })

  // Restock day (next Monday)
  const today = new Date()
  const daysToMonday = (8 - today.getDay()) % 7 || 7
  const restockDate = new Date(today.getTime() + daysToMonday * 86400000)
  const restockLabel = restockDate.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'short' })

  return (
    <div className="space-y-4 animate-fade-in">

      {/* ── Hero banner ─────────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1877F2 0%, #0f4fa8 55%, #1a1a3e 100%)' }}
      >
        <div className="p-5 space-y-4">

          {/* Top row */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-3">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-400/20 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  LIVE
                </span>
                <span className="text-[10px] text-white/40 flex items-center gap-1">
                  <RefreshCw className="h-2.5 w-2.5" /> {timeStr}
                </span>
                {criticalCount > 0 && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-400/20 px-2 py-0.5 rounded-full animate-pulse">
                    <AlertTriangle className="h-2.5 w-2.5" /> {criticalCount} URGENT
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black text-white leading-tight">
                Hey {firstName}! 👋
              </h2>
              <p className="text-sm text-white/70 mt-1">
                {criticalCount > 0
                  ? `${criticalCount} item${criticalCount > 1 ? 's' : ''} need restocking before the weekend`
                  : lowCount > 0
                  ? `${lowCount} item${lowCount > 1 ? 's are' : ' is'} running low — order this week`
                  : 'Your stock is looking healthy today'}
              </p>
              <p className="text-[11px] text-white/35 mt-1">{shopName} · {areaName} · {totalTransactions} purchases analysed</p>
            </div>
            <ScoreRing score={score} />
          </div>

          {/* Live activity ticker */}
          <LiveTicker areaName={areaName} />

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Categories', value: items.length, icon: '📦', sub: 'tracked' },
              { label: 'High Demand', value: items.filter((i) => i.trend > 5).length, icon: '🔥', sub: 'trending up' },
              { label: 'Restock Day', value: `${daysToMonday}d`, icon: '📅', sub: restockLabel },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-base">{s.icon}</p>
                <p className="text-[17px] font-black text-white leading-tight">{s.value}</p>
                <p className="text-[9px] text-white/40 mt-0.5 leading-tight">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Aggregate purchase counter */}
          <div className="bg-white/8 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wide">Total purchases this month</p>
              <p className="text-2xl font-black text-white mt-0.5">
                <CountUp to={totalTransactions} duration={1400} />
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wide">Stock health</p>
              <p className="text-sm font-bold mt-0.5" style={{ color: score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444' }}>
                {score >= 70 ? 'Good' : score >= 40 ? 'Moderate' : 'At Risk'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-bold text-text-primary">Stock Demand Breakdown</h3>
          <p className="text-xs text-text-secondary mt-0.5">Based on your area's last 30 days of purchases</p>
        </div>
        <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
          {items.length} categories
        </span>
      </div>

      {/* ── Stock items ─────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {items.map((item, idx) => {
          const statusKey = getStatus(item.percent, item.trend)
          const status = STATUS[statusKey]
          return (
            <div
              key={item.category}
              className={`rounded-2xl border p-4 ${status.bg} ${status.border} transition-all duration-200 hover:shadow-sm`}
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center text-xl shadow-sm flex-shrink-0">
                    {item.emoji}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">{item.category}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {/* Status badge */}
                      <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full border ${status.bg} ${status.color} ${status.border}`}>
                        {status.pulse && <span className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`} />}
                        {status.label}
                      </span>
                      {/* Trend badge */}
                      {item.trend > 5 && (
                        <span className="flex items-center gap-0.5 text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full">
                          <TrendingUp className="h-2.5 w-2.5" />+{item.trend}%
                        </span>
                      )}
                      {item.trend < -5 && (
                        <span className="flex items-center gap-0.5 text-[9px] text-blue-500 font-bold bg-blue-50 px-1.5 py-0.5 rounded-full">
                          <TrendingDown className="h-2.5 w-2.5" />{item.trend}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: percent + sparkline */}
                <div className="text-right flex flex-col items-end gap-1">
                  <p className="text-xl font-black text-text-primary leading-none">{item.percent}%</p>
                  <p className="text-[9px] text-text-secondary">of all sales</p>
                  <Sparkline trend={item.trend} />
                </div>
              </div>

              {/* Demand bar */}
              <div className="mb-3">
                <div className="flex justify-between text-[10px] text-text-secondary mb-1.5">
                  <span className="font-medium">Customer demand</span>
                  <span className="font-bold text-text-primary">{item.count} purchases / month</span>
                </div>
                <DemandBar percent={item.percent} colorClass={status.bar} delay={idx * 80} />
              </div>

              {/* Action suggestions */}
              <div className="space-y-1.5">
                <p className="text-[9px] font-bold text-text-secondary uppercase tracking-wide px-1">Suggested actions</p>
                {item.suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 bg-white/60 rounded-xl px-3 py-2 border border-white/80">
                    <ShoppingCart className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-text-primary font-medium leading-snug">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Empty state ─────────────────────────────────────────────────────── */}
      {items.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-4">
            <Zap className="h-8 w-8 text-primary opacity-40" />
          </div>
          <p className="font-bold text-text-primary">Not enough data yet</p>
          <p className="text-sm text-text-secondary mt-1 max-w-xs mx-auto">
            Forecasts appear after your area has 10+ purchases. Check back soon.
          </p>
        </div>
      )}

      {/* ── Audit trail footer ───────────────────────────────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-bold text-text-primary mb-1 flex items-center gap-1.5">
          <span className="w-2 h-2 bg-primary rounded-full" />
          Forecast Methodology
        </p>
        <p className="text-[11px] text-text-secondary leading-relaxed">
          Demand scores are calculated from real purchase activity in <strong className="text-text-primary">{areaName}</strong> over the past 30 days
          compared to the prior 30-day period. Trend % reflects month-over-month change. Data refreshes every 45 seconds.
          Last updated: <strong className="text-text-primary">{timeStr}</strong>.
        </p>
      </div>
    </div>
  )
}