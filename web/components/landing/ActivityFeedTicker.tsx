'use client'

import { useEffect, useState } from 'react'

export interface ActivityItem {
  name: string
  area: string
  amount: number
  minutesAgo: number
}

const DEMO_ITEMS: ActivityItem[] = [
  { name: 'Nomsa D.',  area: 'Umlazi',      amount: 500, minutesAgo: 2  },
  { name: 'Thabo M.', area: 'Botshabelo',  amount: 350, minutesAgo: 8  },
  { name: 'Lungelo N.',area: 'Mdantsane',   amount: 750, minutesAgo: 15 },
  { name: 'Zanele K.',  area: 'Soweto',      amount: 400, minutesAgo: 21 },
  { name: 'Sipho G.',  area: 'Khayelitsha', amount: 600, minutesAgo: 34 },
]

export default function ActivityFeedTicker({ items }: { items: ActivityItem[] }) {
  const feed = items.length > 0 ? items : DEMO_ITEMS

  const [index,   setIndex]   = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (feed.length <= 1) return
    const id = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex((p) => (p + 1) % feed.length)
        setVisible(true)
      }, 320)
    }, 4000)
    return () => clearInterval(id)
  }, [feed.length])

  const item = feed[index]
  const timeLabel =
    item.minutesAgo < 1  ? 'just now' :
    item.minutesAgo < 60 ? `${item.minutesAgo}m ago` :
    `${Math.floor(item.minutesAgo / 60)}h ago`

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 12, padding: '10px 20px',
      background: 'rgba(24,119,242,0.07)',
      minHeight: 44,
    }}>
      {/* Live badge */}
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <span style={{ position: 'relative', display: 'flex', width: 8, height: 8 }}>
          <span className="animate-ping" style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%', background: '#42B883', opacity: 0.6,
          }} />
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#42B883', display: 'block' }} />
        </span>
        <span style={{ color: '#42B883', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Live
        </span>
      </span>

      <span style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

      {/* Message */}
      <p
        style={{
          fontSize: 13, color: 'rgba(255,255,255,0.5)',
          margin: 0, lineHeight: 1.4,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        <span style={{ fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{item.name}</span>
        {' from '}
        <span style={{ fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{item.area}</span>
        {' received '}
        <span style={{ fontWeight: 700, color: '#60a5fa' }}>R{item.amount.toFixed(0)} credit</span>
        <span style={{ color: 'rgba(255,255,255,0.3)' }}> · {timeLabel}</span>
      </p>
    </div>
  )
}
