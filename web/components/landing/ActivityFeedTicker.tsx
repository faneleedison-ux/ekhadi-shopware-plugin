'use client'

import { useEffect, useState } from 'react'

export interface ActivityItem {
  name: string      // already anonymized server-side
  area: string
  amount: number
  minutesAgo: number
}

interface ActivityFeedTickerProps {
  items: ActivityItem[]
}

export default function ActivityFeedTicker({ items }: ActivityFeedTickerProps) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (items.length <= 1) return

    const interval = setInterval(() => {
      // Fade out
      setVisible(false)
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % items.length)
        setVisible(true)
      }, 350)
    }, 4000)

    return () => clearInterval(interval)
  }, [items.length])

  if (items.length === 0) return null

  const item = items[index]
  const timeLabel = item.minutesAgo < 1
    ? 'just now'
    : item.minutesAgo < 60
    ? `${item.minutesAgo} min ago`
    : `${Math.floor(item.minutesAgo / 60)}h ago`

  return (
    <div className="bg-primary/95 border-b border-primary-dark px-4 py-2.5 flex items-center justify-center gap-3">
      {/* Live badge */}
      <span className="flex items-center gap-1.5 flex-shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
        </span>
        <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">Live</span>
      </span>

      <span className="w-px h-4 bg-white/20 flex-shrink-0" />

      {/* Rotating activity text */}
      <p
        className="text-white text-xs sm:text-sm transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <span className="font-semibold">{item.name}</span>
        {' from '}
        <span className="font-semibold">{item.area}</span>
        {' just received '}
        <span className="font-semibold text-green-300">
          R{item.amount.toFixed(0)} credit
        </span>
        <span className="text-white/60"> · {timeLabel}</span>
      </p>
    </div>
  )
}
