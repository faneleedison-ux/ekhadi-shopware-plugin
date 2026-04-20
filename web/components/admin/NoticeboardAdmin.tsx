'use client'

import { useState } from 'react'
import { Pin, Plus, Trash2, Bell, CheckCircle, Globe, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Notice { id: string; title: string; content: string; pinned: boolean; areaId: string | null; createdAt: string; author: { name: string } }
interface Area { id: string; name: string }

export default function NoticeboardAdmin({ notices: initial, areas }: { notices: Notice[]; areas: Area[] }) {
  const [notices, setNotices] = useState(initial)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [pinned, setPinned] = useState(false)
  const [areaId, setAreaId] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function create() {
    if (!title || !content) return
    setLoading(true)
    const res = await fetch('/api/noticeboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, pinned, areaId: areaId || null }),
    })
    if (res.ok) {
      const n = await res.json()
      setNotices([{ ...n, author: { name: 'You' } }, ...notices])
      setTitle(''); setContent(''); setPinned(false); setAreaId('')
    }
    setLoading(false)
  }

  async function remove(id: string) {
    setDeleting(id)
    await fetch('/api/noticeboard', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setNotices(notices.filter(n => n.id !== id))
    setDeleting(null)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Community Noticeboard</h1>
        <p className="text-text-secondary mt-1">Post announcements visible to members and shops</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" /> New Notice
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Notice title..."
            className="w-full text-sm bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary" />
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Notice content..."
            rows={3} className="w-full text-sm bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary resize-none" />
          <div className="flex items-center gap-3 flex-wrap">
            <select value={areaId} onChange={e => setAreaId(e.target.value)}
              className="text-sm bg-background border border-border rounded-xl px-3 py-2 outline-none focus:border-primary">
              <option value="">🌍 All Areas</option>
              {areas.map(a => <option key={a.id} value={a.id}>📍 {a.name}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-text-primary cursor-pointer">
              <input type="checkbox" checked={pinned} onChange={e => setPinned(e.target.checked)} className="rounded" />
              <Pin className="h-3.5 w-3.5 text-primary" /> Pin to top
            </label>
          </div>
          <button onClick={create} disabled={loading || !title || !content}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #1877F2, #0f4fa8)' }}>
            {loading ? 'Posting...' : 'Post Notice'}
          </button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {notices.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No notices posted yet</p>
          </div>
        ) : notices.map(n => (
          <div key={n.id} className={`rounded-2xl border p-4 ${n.pinned ? 'bg-primary/5 border-primary/20' : 'bg-white border-border'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {n.pinned && <span className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full"><Pin className="h-2.5 w-2.5" /> PINNED</span>}
                  <span className="flex items-center gap-1 text-[10px] text-text-secondary">
                    {n.areaId ? <><MapPin className="h-2.5 w-2.5" /> Area specific</> : <><Globe className="h-2.5 w-2.5" /> All areas</>}
                  </span>
                </div>
                <p className="text-sm font-bold text-text-primary">{n.title}</p>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">{n.content}</p>
                <p className="text-[10px] text-text-secondary mt-2">By {n.author.name} · {new Date(n.createdAt).toLocaleDateString('en-ZA')}</p>
              </div>
              <button onClick={() => remove(n.id)} disabled={deleting === n.id}
                className="text-danger hover:bg-danger/10 rounded-lg p-1.5 transition-colors flex-shrink-0">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}