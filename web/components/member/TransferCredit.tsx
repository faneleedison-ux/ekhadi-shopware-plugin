'use client'

import { useState } from 'react'
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function TransferCredit({ currentBalance }: { currentBalance: number }) {
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  async function handleTransfer() {
    if (!email || !amount) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverEmail: email, amount: Number(amount), note }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult({ success: true, message: `R${amount} sent to ${data.receiverName}!` })
        setEmail(''); setAmount(''); setNote('')
      } else {
        setResult({ success: false, message: data.error })
      }
    } catch {
      setResult({ success: false, message: 'Transfer failed. Try again.' })
    }
    setLoading(false)
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-4 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
          <Send className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold text-text-primary">Send Credit</p>
          <p className="text-[10px] text-text-secondary">Transfer store credit to another member (max R100)</p>
        </div>
      </div>

      <div className="space-y-2.5">
        <div>
          <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide">Recipient email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="member@email.com"
            type="email"
            className="mt-1 w-full text-sm bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide">Amount (R10–R100)</label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="50"
            type="number"
            min="10"
            max="100"
            className="mt-1 w-full text-sm bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide">Note (optional)</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. For groceries"
            className="mt-1 w-full text-sm bg-background border border-border rounded-xl px-3 py-2.5 outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {result && (
        <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium ${
          result.success ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
        }`}>
          {result.success ? <CheckCircle className="h-4 w-4 flex-shrink-0" /> : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
          {result.message}
        </div>
      )}

      <button
        onClick={handleTransfer}
        disabled={!email || !amount || loading || Number(amount) > currentBalance}
        className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
        style={{ background: 'linear-gradient(135deg, #1877F2, #0f4fa8)' }}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Send Credit
      </button>
    </div>
  )
}