'use client'

import type { ActivityItem } from './ActivityFeedTicker'

const DEMO_ITEMS: ActivityItem[] = [
  { name: 'Nomsa T.',  area: 'Umlazi',           amount: 500, minutesAgo: 2  },
  { name: 'Sipho M.',  area: 'Soweto',            amount: 300, minutesAgo: 5  },
  { name: 'Fatima D.', area: 'Khayelitsha',       amount: 750, minutesAgo: 8  },
  { name: 'Thandi K.', area: 'Alexandra',         amount: 400, minutesAgo: 11 },
  { name: 'Lerato S.', area: 'Mamelodi',          amount: 620, minutesAgo: 15 },
  { name: 'Anele M.',  area: 'Mdantsane',         amount: 250, minutesAgo: 19 },
  { name: 'Bongi P.',  area: 'Tembisa',           amount: 880, minutesAgo: 23 },
  { name: 'Zanele R.', area: "Mitchell's Plain",  amount: 510, minutesAgo: 27 },
]

export default function DawnWire({ items }: { items?: ActivityItem[] }) {
  const src = (items && items.length > 0 ? items : DEMO_ITEMS)
  const doubled = [...src, ...src]

  return (
    <div className="horizon">
      <div className="horizon-inner">
        <div className="wire-label">
          <span className="ldot" />
          Wire · Last Hour
        </div>
        <div className="wire-track">
          <div className="wire-rail">
            {doubled.map((it, i) => (
              <div className="wire-item" key={i}>
                <span className="ck">✓</span>
                <b>{it.name}</b>
                <span className="place">from {it.area} received</span>
                <span className="amt">R{it.amount}</span>
                <span className="bullet">·</span>
                <span className="when">{it.minutesAgo} min ago</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}