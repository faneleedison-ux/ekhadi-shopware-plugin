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
    if (pct > 0.75) return '#E11D2A'
    if (pct > 0.5) return 'rgba(225,29,42,0.6)'
    if (pct > 0.25) return '#A07030'
    return '#C9BCA0'
  }

  return (
    <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-[#C9BCA0] flex items-center justify-between">
        <div>
          <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552]">Activity</p>
          <p className="font-[var(--serif)] italic text-lg text-[#14130E] leading-tight">Sales by Hour</p>
        </div>
        <div className="text-right">
          <p className="font-[var(--serif)] italic text-base text-[#E11D2A]">{label(peakHour)}</p>
          <p className="font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#6B6552]">peak hour</p>
        </div>
      </div>

      <div className="p-4 space-y-3">
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
                    backgroundColor: h === peakHour ? '#E11D2A' : getColor(val),
                    transitionDelay: `${h * 20}ms`,
                  }}
                />
              </div>
            )
          })}
        </div>

        {/* Hour labels */}
        <div className="flex justify-between font-[var(--mono)] text-[9px] text-[#A89971] px-0.5">
          {[0, 6, 12, 18, 23].map(h => <span key={h}>{label(h)}</span>)}
        </div>

        <div className="flex items-center gap-4 font-[var(--mono)] text-[9px] tracking-wide text-[#6B6552]">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#E11D2A] inline-block" /> Peak</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#A07030] inline-block" /> Moderate</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#C9BCA0] inline-block" /> Low</span>
        </div>

        {max > 0 && (
          <div className="p-3 rounded-xl bg-[#F2E9D6] border border-[#C9BCA0]">
            <p className="font-[var(--mono)] text-[10px] text-[#6B6552] tracking-wide">
              <span className="text-[#E11D2A] font-bold">Tip · </span>
              Busiest time is {label(peakHour)}. Stock shelves before then.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}