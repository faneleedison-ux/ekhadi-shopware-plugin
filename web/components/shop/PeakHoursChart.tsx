'use client'

import { useState } from 'react'

interface PeakHoursChartProps {
  /** 24 values, index = hour 0–23 */
  hourCounts: number[]
}

function formatHour(h: number): string {
  if (h === 0) return '12am'
  if (h < 12) return `${h}am`
  if (h === 12) return '12pm'
  return `${h - 12}pm`
}

const X_AXIS_LABELS = new Set([0, 6, 12, 18, 23])

export default function PeakHoursChart({ hourCounts }: PeakHoursChartProps) {
  const [hoveredHour, setHoveredHour] = useState<number | null>(null)

  const maxCount = Math.max(...hourCounts, 1)
  const totalTx = hourCounts.reduce((s, c) => s + c, 0)
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts))
  const peakCount = hourCounts[peakHour]

  // Quiet hours: any hour with zero in a 3-hour window around it
  const isActive = (h: number) => hourCounts[h] > 0

  if (totalTx === 0) {
    return (
      <div className="flex items-center justify-center h-28 text-sm text-text-secondary">
        No transaction data yet — chart will populate as members transact.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Tooltip row */}
      <div className="h-6 flex items-center">
        {hoveredHour !== null ? (
          <p className="text-xs text-text-secondary">
            <span className="font-semibold text-text-primary">{formatHour(hoveredHour)}</span>
            {' — '}
            <span className="font-semibold text-primary">{hourCounts[hoveredHour]}</span>
            {' transaction'}
            {hourCounts[hoveredHour] !== 1 ? 's' : ''}
          </p>
        ) : (
          <p className="text-xs text-text-secondary">Hover a bar for details</p>
        )}
      </div>

      {/* Bars */}
      <div className="flex items-end gap-px h-20">
        {hourCounts.map((count, hour) => {
          const heightPct = count > 0 ? Math.max((count / maxCount) * 100, 6) : 0
          const isPeak = hour === peakHour && peakCount > 0
          const isHovered = hoveredHour === hour
          const barColor = isPeak
            ? 'bg-primary'
            : isHovered
            ? 'bg-primary/70'
            : isActive(hour)
            ? 'bg-primary/30'
            : 'bg-gray-100'

          return (
            <div
              key={hour}
              className="flex-1 flex flex-col justify-end cursor-default"
              onMouseEnter={() => setHoveredHour(hour)}
              onMouseLeave={() => setHoveredHour(null)}
            >
              <div
                className={`w-full rounded-t-sm transition-all duration-150 ${barColor}`}
                style={{ height: `${heightPct}%` }}
              />
            </div>
          )
        })}
      </div>

      {/* X-axis labels */}
      <div className="flex">
        {hourCounts.map((_, hour) => (
          <div key={hour} className="flex-1 text-center">
            {X_AXIS_LABELS.has(hour) && (
              <span className="text-[10px] text-text-secondary">{formatHour(hour)}</span>
            )}
          </div>
        ))}
      </div>

      {/* Peak annotation */}
      {peakCount > 0 && (
        <div className="flex items-center gap-4 pt-1 text-xs text-text-secondary border-t border-border">
          <span>
            Peak: <span className="font-semibold text-primary">{formatHour(peakHour)}</span>
            {' '}({peakCount} tx)
          </span>
          <span>Total: <span className="font-semibold text-text-primary">{totalTx}</span></span>
        </div>
      )}
    </div>
  )
}
