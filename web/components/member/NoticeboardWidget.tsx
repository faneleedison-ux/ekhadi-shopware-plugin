'use client'

import { useEffect, useState } from 'react'
import { Bell, Pin, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface Notice {
  id: string
  title: string
  content: string
  pinned: boolean
  createdAt: string
  author: { name: string }
}

export default function NoticeboardWidget({ areaId }: { areaId?: string }) {
  const [notices, setNotices] = useState<Notice[]>([])

  useEffect(() => {
    const url = areaId ? `/api/noticeboard?areaId=${areaId}` : '/api/noticeboard'
    fetch(url).then((r) => r.json()).then(setNotices).catch(() => {})
  }, [areaId])

  if (notices.length === 0) return null

  return (
    <div className="rounded-2xl border border-border bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-text-primary flex items-center gap-1.5">
          <Bell className="h-4 w-4 text-primary" /> Community Notices
        </p>
        <Link href="/member/noticeboard" className="text-[11px] text-primary font-semibold flex items-center gap-0.5">
          All <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="space-y-2">
        {notices.slice(0, 3).map((n) => (
          <div key={n.id} className={`rounded-xl px-3 py-2.5 ${n.pinned ? 'bg-primary/5 border border-primary/15' : 'bg-background'}`}>
            <div className="flex items-start gap-2">
              {n.pinned && <Pin className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">{n.title}</p>
                <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-2">{n.content}</p>
                <p className="text-[10px] text-text-secondary mt-1">{n.author.name} · {formatDate(new Date(n.createdAt))}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}