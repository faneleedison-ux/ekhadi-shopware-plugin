'use client'

import type { ActivityItem } from './ActivityFeedTicker'

function formatTime(min: number): string {
  if (min < 1)  return 'just now'
  if (min < 60) return `${min} min ago`
  const h = Math.floor(min / 60)
  const m = min % 60
  if (m === 0) return h === 1 ? '1 hr ago' : `${h} hrs ago`
  return h === 1 ? `1 hr ${m} min ago` : `${h} hrs ${m} min ago`
}

const DEMO_ITEMS: ActivityItem[] = [
  { name: 'Nomsa T.',    area: 'Umlazi',           amount: 120,  minutesAgo: 3   },
  { name: 'Sipho M.',    area: 'Soweto',            amount: 300,  minutesAgo: 8   },
  { name: 'Fatima D.',   area: 'Khayelitsha',       amount: 75,   minutesAgo: 14  },
  { name: 'Thandi K.',   area: 'Alexandra',         amount: 450,  minutesAgo: 22  },
  { name: 'Lerato S.',   area: 'Mamelodi',          amount: 50,   minutesAgo: 31  },
  { name: 'Bongani N.', area: 'Tembisa',            amount: 880,  minutesAgo: 38  },
  { name: 'Zanele R.',   area: "Mitchell's Plain",  amount: 200,  minutesAgo: 47  },
  { name: 'Priya S.',    area: 'Lenasia',           amount: 500,  minutesAgo: 55  },
  { name: 'Thabo N.',    area: 'Gugulethu',         amount: 350,  minutesAgo: 72  },
  { name: 'Moses K.',    area: 'Orange Farm',       amount: 150,  minutesAgo: 88  },
  { name: 'Lindiwe B.', area: 'Daveyton',           amount: 250,  minutesAgo: 105 },
  { name: 'Ayesha M.',  area: 'Chatsworth',         amount: 100,  minutesAgo: 122 },
]

export default function DawnWire({ items }: { items?: ActivityItem[] }) {
  const src = (items && items.length > 0 ? items : DEMO_ITEMS)
  const doubled = [...src, ...src]

  return (
    <div className="horizon">
      <div className="horizon-inner">
        <div className="wire-label">
          <span className="ldot" />
          Wire · Live
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
                <span className="when">{formatTime(it.minutesAgo)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
