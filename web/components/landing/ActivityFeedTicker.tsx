'use client'

import { useEffect, useState } from 'react'

export interface ActivityItem {
  name: string
  area: string
  amount: number
  minutesAgo: number
}

export default function ActivityFeedTicker({ items }: { items: ActivityItem[] }) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (items.length <= 1) return
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => { setIndex((p) => (p + 1) % items.length); setVisible(true) }, 300)
    }, 4000)
    return () => clearInterval(interval)
  }, [items.length])

  if (items.length === 0) return null

  const item = items[index]
  const timeLabel =
    item.minutesAgo < 1 ? 'just now' :
    item.minutesAgo < 60 ? `${item.minutesAgo} min ago` :
    `${Math.floor(item.minutesAgo / 60)}h ago`

  return (
    <div className="bg-primary/8 border-b border-primary/15 px-4 py-2.5 flex items-center justify-center gap-3">
      <span className="flex items-center gap-1.5 flex-shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
        </span>
        <span className="text-primary text-xs font-bold uppercase tracking-widest">Live</span>
      </span>

      <span className="w-px h-4 bg-border flex-shrink-0" />

      <p className="text-text-secondary text-xs sm:text-sm transition-opacity duration-300" style={{ opacity: visible ? 1 : 0 }}>
        <span className="font-semibold text-text-primary">{item.name}</span>
        {' from '}
        <span className="font-semibold text-text-primary">{item.area}</span>
        {' received '}
        <span className="font-semibold text-primary">R{item.amount.toFixed(0)} credit</span>
        <span className="text-text-secondary"> · {timeLabel}</span>
      </p>
    </div>
  )
}