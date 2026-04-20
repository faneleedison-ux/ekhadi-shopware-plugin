'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Zap, ShoppingCart, Star } from 'lucide-react'
import { ForecastItem } from './StockForecastCard'

const STATUS = {
  critical: { label: 'CRITICAL', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/40', bar: 'from-red-500 to-orange-500', pulse: true },
  low:      { label: 'LOW',      color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/40', bar: 'from-orange-400 to-yellow-400', pulse: false },
  good:     { label: 'STOCKED',  color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30', bar: 'from-green-400 to-emerald-500', pulse: false },
}

function getStatus(percent: number, trend: number) {
  if (percent > 35 && trend > 5) return 'critical'
  if (percent > 25 || trend > 10) return 'low'
  return 'good'
}

function ScoreRing({ score }: { score: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setDisplay((p) => p >= score ? score : p + 2), 20)
    return () => clearInterval(t)
  }, [score])
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444'
  const r = 36
  const circ = 2 * Math.PI * r
  const dash = (display / 100) * circ
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="96" height="96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.05s linear' }} />
      </svg>
      <div className="text-center">
        <p className="text-2xl font-black text-white">{display}</p>
        <p className="text-[9px] text-white/50 font-semibold uppercase tracking-wide">score</p>
      </div>
    </div>
  )
}

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
  const score = Math.max(10, 100 - criticalCount * 25 - items.filter((i) => getStatus(i.percent, i.trend) === 'low').length * 10)
  const now = new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Hero banner */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1877F2 0%, #0f4fa8 50%, #1a1a3e 100%)' }}>
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-400/20 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  LIVE
                </span>
                <span className="text-[10px] text-white/40">Updated {now}</span>
              </div>
              <h2 className="text-xl font-black text-white">Hey {firstName}! 👋</h2>
              <p className="text-sm text-white/70 mt-0.5">
                {criticalCount > 0
                  ? `⚠️ ${criticalCount} item${criticalCount > 1 ? 's' : ''} need restocking NOW`
                  : '✅ Your shop looks well stocked today'}
              </p>
              <p className="text-xs text-white/40 mt-1">{shopName} · {areaName} · {totalTransactions} purchases analysed</p>
            </div>
            <ScoreRing score={score} />
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { label: 'Categories', value: items.length, icon: '📦' },
              { label: 'High Demand', value: items.filter((i) => i.trend > 5).length, icon: '🔥' },
              { label: 'Stock Score', value: `${score}%`, icon: '⭐' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-lg">{s.icon}</p>
                <p className="text-base font-black text-white">{s.value}</p>
                <p className="text-[10px] text-white/50">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stock items */}
      <div className="space-y-3">
        {items.map((item) => {
          const status = STATUS[getStatus(item.percent, item.trend)]
          return (
            <div key={item.category}
              className={`rounded-2xl border p-4 ${status.bg} ${status.border} transition-all`}
              style={getStatus(item.percent, item.trend) === 'critical' ? { boxShadow: '0 0 0 1px rgba(239,68,68,0.3)' } : {}}>

              {/* Header row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{item.emoji}</span>
                  <div>
                    <p className="text-sm font-bold text-text-primary">{item.category}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${status.bg} ${status.color} border ${status.border}`}>
                        {status.label}
                      </span>
                      {item.trend > 5 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-green-600 font-bold">
                          <TrendingUp className="h-3 w-3" />+{item.trend}% demand
                        </span>
                      )}
                      {item.trend < -5 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-blue-500 font-bold">
                          <TrendingDown className="h-3 w-3" />{item.trend}% demand
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-text-primary">{item.percent}%</p>
                  <p className="text-[10px] text-text-secondary">of sales</p>
                </div>
              </div>

              {/* Demand vs stock bar */}
              <div className="mb-3">
                <div className="flex justify-between text-[10px] text-text-secondary mb-1">
                  <span>Customer Demand</span>
                  <span>{item.count} purchases/month</span>
                </div>
                <div className="h-3 bg-black/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${status.bar} transition-all duration-1000`}
                    style={{ width: `${Math.min(item.percent * 1.5, 100)}%` }} />
                </div>
              </div>

              {/* Action items */}
              <div className="space-y-1">
                {item.suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 bg-white/50 rounded-lg px-3 py-1.5">
                    <ShoppingCart className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-text-primary font-medium">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 text-text-secondary">
          <Zap className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Not enough data yet</p>
          <p className="text-sm mt-1">Forecasts appear after 10+ transactions in your area</p>
        </div>
      )}
    </div>
  )
}