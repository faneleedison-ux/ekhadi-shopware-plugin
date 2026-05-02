'use client'

import { useEffect, useState } from 'react'

interface Props {
  hourlyData: number[]  // 24 values, one per hour
}

export default function SalesHeatmap({ hourlyData }: Props) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => { setTimeout(() => setAnimated(true), 200) }, [])

  const max = Math.max(...hourlyData, 1)
  const peakHour = hourlyData.indexOf(max)
  const hours = Array.from({ length: 24 }, (_, i) => i)

  function label(h: number) {
    if (h === 0) return '12am'
    if (h === 12) return '12pm'
    return h < 12 ? `${h}am` : `${h - 12}pm`
  }

  function getColor(val: number) {
    const pct = val / max
    if (pct > 0.75) return '#1877F2'
    if (pct > 0.5) return '#60a5fa'
    if (pct > 0.25) return '#bfdbfe'
    return '#e5e7eb'
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-text-primary">Sales by Hour</p>
          <p className="text-xs text-text-secondary">When your area shops most</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-primary">{label(peakHour)}</p>
          <p className="text-[10px] text-text-secondary">peak hour</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-0.5 h-20">
        {hours.map((h) => {
          const val = hourlyData[h]
          const pct = (val / max) * 100
          return (
            <div key={h} className="flex-1 flex flex-col items-center gap-0.5" title={`${label(h)}: ${val} sales`}>
              <div
                className="w-full rounded-t-sm transition-all duration-700"
                style={{
                  height: animated ? `${Math.max(pct, 4)}%` : '4%',
                  backgroundColor: h === peakHour ? '#1877F2' : getColor(val),
                  transitionDelay: `${h * 20}ms`,
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Hour labels - show every 6 hours */}
      <div className="flex justify-between text-[9px] text-text-secondary px-0.5">
        {[0, 6, 12, 18, 23].map(h => <span key={h}>{label(h)}</span>)}
      </div>

      <div className="flex items-center gap-4 text-[10px] text-text-secondary">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-primary inline-block" /> Peak</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-200 inline-block" /> Moderate</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-gray-200 inline-block" /> Low</span>
      </div>

      {max > 0 && (
        <div className="mt-1 p-2.5 rounded-xl bg-primary-light flex items-center gap-2">
          <span className="text-base">💡</span>
          <p className="text-xs text-primary">
            <span className="font-semibold">Tip:</span> Your busiest time is {label(peakHour)}. Make sure shelves are stocked beforehand.
          </p>
        </div>
      )}
    </div>
  )
}