'use client'

import { useState } from 'react'
import { Plus, Trash2, Send, CheckCircle, Package, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const STOCK_CATEGORIES = [
  { label: '🍞 Food & Groceries', value: 'food', suggestions: ['Bread (loaves)', 'Maize meal (5kg)', 'Rice (2kg)', 'Cooking oil (2L)', 'Sugar (2kg)'] },
  { label: '⚡ Electricity & Airtime', value: 'electricity', suggestions: ['Prepaid R20 tokens', 'Prepaid R50 tokens', 'MTN airtime', 'Vodacom airtime'] },
  { label: '💊 Medicine', value: 'medicine', suggestions: ['Panado 20s', 'Ibuprofen 24s', 'Rehydrate sachets', 'Cough syrup 200ml'] },
  { label: '🧴 Toiletries', value: 'toiletries', suggestions: ['Soap bars (x6)', 'Toothpaste (100ml)', 'Shampoo 400ml', 'Sanitary pads'] },
  { label: '🍼 Baby Products', value: 'baby', suggestions: ['Nappies size 3 (40pk)', 'Baby formula 400g', 'Vaseline 250ml', 'Baby wipes 80s'] },
]

interface RestockItem { category: string; product: string; quantity: string }
interface Order { id: string; items: RestockItem[]; notes: string | null; status: string; createdAt: string }

export default function RestockForm({ shopName, recentOrders }: { shopName: string; recentOrders: Order[] }) {
  const [items, setItems] = useState<RestockItem[]>([{ category: 'food', product: '', quantity: '' }])
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function addItem() { setItems([...items, { category: 'food', product: '', quantity: '' }]) }
  function removeItem(i: number) { setItems(items.filter((_, idx) => idx !== i)) }
  function updateItem(i: number, field: keyof RestockItem, value: string) {
    setItems(items.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
  }

  async function submit() {
    const valid = items.filter(i => i.product && i.quantity)
    if (valid.length === 0) return
    setLoading(true)
    try {
      const res = await fetch('/api/restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: valid, notes }),
      })
      if (res.ok) {
        setSuccess(true)
        setItems([{ category: 'food', product: '', quantity: '' }])
        setNotes('')
        setTimeout(() => setSuccess(false), 4000)
      }
    } catch {}
    setLoading(false)
  }

  const statusVariant = (s: string) =>
    s === 'FULFILLED' ? 'success' : s === 'ACKNOWLEDGED' ? 'blue' : 'warning'

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Restock Orders</h1>
        <p className="text-text-secondary mt-1">{shopName} · Submit your restocking needs to admin</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" /> New Restock Request
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, i) => {
            const cat = STOCK_CATEGORIES.find(c => c.value === item.category)
            return (
              <div key={i} className="p-3 bg-background rounded-xl border border-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-text-secondary">Item {i + 1}</p>
                  {items.length > 1 && (
                    <button onClick={() => removeItem(i)} className="text-danger hover:bg-danger/10 rounded-lg p-1 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <select
                  value={item.category}
                  onChange={(e) => updateItem(i, 'category', e.target.value)}
                  className="w-full text-sm bg-white border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary"
                >
                  {STOCK_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <input
                      value={item.product}
                      onChange={(e) => updateItem(i, 'product', e.target.value)}
                      placeholder={cat?.suggestions[0] ?? 'Product name'}
                      list={`suggestions-${i}`}
                      className="w-full text-sm bg-white border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary"
                    />
                    <datalist id={`suggestions-${i}`}>
                      {cat?.suggestions.map(s => <option key={s} value={s} />)}
                    </datalist>
                  </div>
                  <input
                    value={item.quantity}
                    onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                    placeholder="Qty"
                    className="w-full text-sm bg-white border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary"
                  />
                </div>
              </div>
            )
          })}

          <button
            onClick={addItem}
            className="flex items-center gap-2 text-sm text-primary font-semibold hover:bg-primary/8 rounded-xl px-3 py-2 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add another item
          </button>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special notes for admin..."
            rows={2}
            className="w-full text-sm bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary transition-colors resize-none"
          />

          {success && (
            <div className="flex items-center gap-2 bg-success/10 text-success rounded-xl px-3 py-2.5 text-sm font-medium">
              <CheckCircle className="h-4 w-4" /> Order submitted! Admin will acknowledge shortly.
            </div>
          )}

          <button
            onClick={submit}
            disabled={loading || items.every(i => !i.product)}
            className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #1877F2, #0f4fa8)' }}
          >
            <Send className="h-4 w-4" />
            {loading ? 'Submitting...' : 'Submit Restock Order'}
          </button>
        </CardContent>
      </Card>

      {recentOrders.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-text-secondary" /> Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {recentOrders.map(order => (
                <li key={order.id} className="px-6 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary">
                        {(order.items as RestockItem[]).map(i => i.product).join(', ')}
                      </p>
                      {order.notes && <p className="text-xs text-text-secondary mt-0.5">{order.notes}</p>}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <Badge variant={statusVariant(order.status) as any}>{order.status}</Badge>
                      <p className="text-[10px] text-text-secondary mt-1">{new Date(order.createdAt).toLocaleDateString('en-ZA')}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}