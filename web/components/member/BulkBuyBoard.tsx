'use client'

import { useState } from 'react'
import { ShoppingCart, Users, Plus, Calendar, CheckCircle, Package } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Participant { id: string; quantity: number; user: { name: string } }
interface Request {
  id: string; title: string; description: string; category: string;
  unitPrice: number; targetQty: number; status: string; expiresAt: string;
  creator: { name: string }; participants: Participant[]
}

const CAT_EMOJI: Record<string, string> = {
  food: '🍞', electricity: '⚡', medicine: '💊', toiletries: '🧴', baby: '🍼',
}

export default function BulkBuyBoard({ requests: initial, currentUserId }: { requests: Request[]; currentUserId: string }) {
  const [requests, setRequests] = useState(initial)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('food')
  const [unitPrice, setUnitPrice] = useState('')
  const [targetQty, setTargetQty] = useState('')
  const [loading, setLoading] = useState(false)
  const [joining, setJoining] = useState<string | null>(null)

  async function create() {
    setLoading(true)
    const res = await fetch('/api/bulk-buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, category, unitPrice: Number(unitPrice), targetQty: Number(targetQty) }),
    })
    if (res.ok) {
      window.location.reload()
    }
    setLoading(false)
  }

  async function join(id: string) {
    setJoining(id)
    await fetch(`/api/bulk-buy/${id}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 1 }),
    })
    window.location.reload()
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Bulk Buy</h1>
          <p className="text-text-secondary mt-1">Pool with your group to buy at wholesale prices</p>
        </div>
        <button
          onClick={() => setCreating(!creating)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-xl"
          style={{ background: 'linear-gradient(135deg, #1877F2, #0f4fa8)' }}
        >
          <Plus className="h-4 w-4" /> New Request
        </button>
      </div>

      {creating && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Create Bulk Buy Request</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. 10kg rice bags"
              className="w-full text-sm bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary" />
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)"
              className="w-full text-sm bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary" />
            <div className="grid grid-cols-3 gap-2">
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="text-sm bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary">
                {Object.entries(CAT_EMOJI).map(([v, e]) => <option key={v} value={v}>{e} {v}</option>)}
              </select>
              <input value={unitPrice} onChange={e => setUnitPrice(e.target.value)} placeholder="R per unit" type="number"
                className="text-sm bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary" />
              <input value={targetQty} onChange={e => setTargetQty(e.target.value)} placeholder="Target qty" type="number"
                className="text-sm bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary" />
            </div>
            <button onClick={create} disabled={loading || !title || !unitPrice || !targetQty}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #1877F2, #0f4fa8)' }}>
              {loading ? 'Creating...' : 'Create Request'}
            </button>
          </CardContent>
        </Card>
      )}

      {requests.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-primary/8 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-primary opacity-40" />
          </div>
          <p className="font-bold text-text-primary">No active bulk buys</p>
          <p className="text-sm text-text-secondary mt-1">Start one to pool resources with your group</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => {
            const totalJoined = r.participants.reduce((s, p) => s + p.quantity, 0)
            const pct = Math.min(100, Math.round((totalJoined / r.targetQty) * 100))
            const hasJoined = r.participants.some(p => p.user.name !== r.creator.name)
            const daysLeft = Math.ceil((new Date(r.expiresAt).getTime() - Date.now()) / 86400000)
            return (
              <div key={r.id} className="rounded-2xl border border-border bg-white p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                      {CAT_EMOJI[r.category] ?? '📦'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary">{r.title}</p>
                      <p className="text-xs text-text-secondary">by {r.creator.name} · R{r.unitPrice}/unit</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-full flex items-center gap-1 flex-shrink-0">
                    <Calendar className="h-2.5 w-2.5" /> {daysLeft}d left
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-text-secondary mb-1">
                    <span className="flex items-center gap-1"><Users className="h-2.5 w-2.5" /> {totalJoined}/{r.targetQty} units pledged</span>
                    <span>{pct}% funded</span>
                  </div>
                  <div className="h-2.5 bg-background rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-700"
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {r.participants.slice(0, 3).map((p, i) => (
                    <span key={i} className="text-[10px] bg-background border border-border rounded-full px-2 py-0.5">
                      {p.user.name.split(' ')[0]}
                    </span>
                  ))}
                  {r.participants.length > 3 && (
                    <span className="text-[10px] text-text-secondary">+{r.participants.length - 3} more</span>
                  )}
                </div>

                {pct < 100 && (
                  <button
                    onClick={() => join(r.id)}
                    disabled={joining === r.id}
                    className="w-full py-2 rounded-xl text-sm font-bold text-primary bg-primary/8 border border-primary/20 hover:bg-primary/15 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {joining === r.id ? 'Joining...' : 'Join this bulk buy'}
                  </button>
                )}
                {pct >= 100 && (
                  <div className="flex items-center gap-2 text-sm text-success font-bold justify-center">
                    <CheckCircle className="h-4 w-4" /> Fully funded! Admin will arrange delivery.
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}