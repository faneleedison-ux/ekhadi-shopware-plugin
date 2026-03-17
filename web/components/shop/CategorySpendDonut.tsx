'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'

export interface CategorySlice {
  category: string   // raw enum key e.g. "BABY_PRODUCTS"
  label: string      // display label e.g. "Baby Products"
  amount: number
  color: string      // Tailwind bg class AND hex for conic-gradient
  hex: string
}

interface CategorySpendDonutProps {
  slices: CategorySlice[]
}

export default function CategorySpendDonut({ slices }: CategorySpendDonutProps) {
  const [hovered, setHovered] = useState<string | null>(null)

  const total = slices.reduce((s, c) => s + c.amount, 0)
  const activeSlices = slices.filter((s) => s.amount > 0)

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-28 text-sm text-text-secondary">
        No category spending recorded yet in this area.
      </div>
    )
  }

  // Build conic-gradient stops
  let cumulative = 0
  const stops = activeSlices.map((slice) => {
    const pct = (slice.amount / total) * 100
    const start = cumulative
    const end = cumulative + pct
    cumulative = end
    return `${slice.hex} ${start.toFixed(1)}% ${end.toFixed(1)}%`
  })
  const gradient = `conic-gradient(from -90deg, ${stops.join(', ')})`

  const hoveredSlice = hovered ? activeSlices.find((s) => s.category === hovered) : null

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* Donut */}
      <div className="relative flex-shrink-0" style={{ width: 120, height: 120 }}>
        {/* Outer donut ring */}
        <div
          className="w-full h-full rounded-full"
          style={{ background: gradient }}
        />
        {/* Inner hole — white circle to create donut effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="bg-white rounded-full flex flex-col items-center justify-center"
            style={{ width: 68, height: 68 }}
          >
            {hoveredSlice ? (
              <>
                <p className="text-xs font-bold text-text-primary leading-tight text-center px-1">
                  {Math.round((hoveredSlice.amount / total) * 100)}%
                </p>
                <p className="text-[9px] text-text-secondary text-center leading-tight px-1">
                  {hoveredSlice.label}
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-bold text-text-primary">{activeSlices.length}</p>
                <p className="text-[9px] text-text-secondary">categories</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2 w-full">
        {slices.map((slice) => {
          const pct = total > 0 ? Math.round((slice.amount / total) * 100) : 0
          const isHovered = hovered === slice.category
          return (
            <div
              key={slice.category}
              className={`flex items-center gap-2 rounded-lg px-2 py-1 transition-colors cursor-default ${
                isHovered ? 'bg-background' : ''
              } ${slice.amount === 0 ? 'opacity-40' : ''}`}
              onMouseEnter={() => slice.amount > 0 && setHovered(slice.category)}
              onMouseLeave={() => setHovered(null)}
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: slice.hex }}
              />
              <span className="text-xs text-text-primary flex-1">{slice.label}</span>
              <span className="text-xs font-semibold text-text-primary">{formatCurrency(slice.amount)}</span>
              <span className="text-xs text-text-secondary w-8 text-right">{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
