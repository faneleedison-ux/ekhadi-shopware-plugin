'use client'

import React, { useState, useEffect } from 'react'
import { CreditCard, Info, CheckCircle, Clock, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatDate, calculateServiceFee, calculateRepayment } from '@/lib/utils'

interface CreditRequest {
  id: string
  amount: string
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  group: { name: string }
}

const CREDIT_REASONS = [
  'Food & groceries',
  'Medicine & healthcare',
  'Baby products',
  'Electricity & utilities',
  'Toiletries & hygiene',
  'School supplies',
  'Emergency household needs',
  'Other essential goods',
]

export default function CreditRequestPage() {
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requests, setRequests] = useState<CreditRequest[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [groupId, setGroupId] = useState<string | null>(null)

  useEffect(() => {
    fetchHistory()
    fetchGroup()
  }, [])

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/credit-requests?my=true')
      if (res.ok) {
        const data = await res.json()
        setRequests(data)
      }
    } finally {
      setLoadingHistory(false)
    }
  }

  const fetchGroup = async () => {
    try {
      const res = await fetch('/api/groups?my=true')
      if (res.ok) {
        const data = await res.json()
        if (data.length > 0) setGroupId(data[0].id)
      }
    } catch {}
  }

  const amountNum = parseFloat(amount) || 0
  const serviceFee = calculateServiceFee(amountNum)
  const totalRepayment = calculateRepayment(amountNum)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!groupId) {
      setError('You are not assigned to a group. Contact an admin.')
      return
    }
    if (amountNum < 50 || amountNum > 300) {
      setError('Amount must be between R50 and R300')
      return
    }
    if (!reason) {
      setError('Please select a reason for the credit request')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/credit-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountNum, reason, groupId }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to submit request'); return }
      setSuccess(true)
      setAmount('')
      setReason('')
      await fetchHistory()
      setTimeout(() => setSuccess(false), 4000)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl">

      {/* Heading */}
      <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl px-5 py-4">
        <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552] mb-1">Credit · e-Khadi</p>
        <h1 className="font-[var(--serif)] italic text-2xl text-[#14130E] leading-tight">Request Credit</h1>
        <p className="font-[var(--mono)] text-[10px] tracking-wide text-[#6B6552] mt-1">Request credit against your SASSA grant for essential goods</p>
      </div>

      {/* Form card */}
      <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[#C9BCA0]">
          <div className="w-8 h-8 bg-[#E11D2A]/10 rounded-xl flex items-center justify-center">
            <CreditCard className="h-4 w-4 text-[#E11D2A]" />
          </div>
          <div>
            <p className="font-[var(--serif)] italic text-base text-[#14130E]">New Credit Request</p>
            <p className="font-[var(--mono)] text-[10px] tracking-wide text-[#6B6552]">Request between R50 and R300 · 2% flat service fee</p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {success && (
            <div className="rounded-xl border border-[#3F7B4F]/30 bg-[#3F7B4F]/10 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#3F7B4F]/20">
                <CheckCircle className="h-5 w-5 text-[#3F7B4F] flex-shrink-0" />
                <p className="font-[var(--mono)] text-xs font-bold text-[#3F7B4F] tracking-wide">Request submitted! Here's what happens next:</p>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { n: 1, label: 'Admin reviews your request', sub: 'Usually within 24 hours' },
                  { n: 2, label: 'Credit added to your wallet', sub: "You'll get a notification when approved" },
                  { n: 3, label: 'Spend at approved spaza shops', sub: 'Show your QR code at checkout' },
                  { n: 4, label: 'Repaid automatically on grant day', sub: 'Deducted from your next SASSA payment' },
                ].map((s) => (
                  <div key={s.n} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#3F7B4F]/20 border border-[#3F7B4F]/30 flex items-center justify-center font-[var(--mono)] text-[10px] font-bold text-[#3F7B4F] flex-shrink-0 mt-0.5">{s.n}</div>
                    <div>
                      <p className="font-[var(--sans-dawn)] text-xs font-semibold text-[#14130E]">{s.label}</p>
                      <p className="font-[var(--mono)] text-[10px] text-[#6B6552]">{s.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl border border-[#E11D2A]/30 bg-[#E11D2A]/10 font-[var(--mono)] text-[11px] text-[#E11D2A]">
              {error}
            </div>
          )}

          {!groupId && !loadingHistory && (
            <div className="p-3 rounded-xl border border-[#A07030]/30 bg-[#A07030]/10 font-[var(--mono)] text-[11px] text-[#A07030]">
              You are not yet assigned to a stokvel group. Please contact an admin.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="amount" className="font-[var(--mono)] text-[11px] tracking-widest uppercase text-[#6B6552]">Amount (ZAR)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-[var(--mono)] text-sm text-[#6B6552]">R</span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  min={50}
                  max={300}
                  step={10}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7 bg-[#F2E9D6] border-[#C9BCA0]"
                  required
                />
              </div>
              <p className="font-[var(--mono)] text-[10px] text-[#A89971]">Minimum R50 · Maximum R300</p>
            </div>

            {/* Quick amount buttons */}
            <div className="flex gap-2 flex-wrap">
              {[50, 100, 150, 200, 250, 300].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(String(preset))}
                  className={`px-3 py-1.5 rounded-lg font-[var(--mono)] text-[11px] tracking-wide border transition-colors ${
                    amount === String(preset)
                      ? 'bg-[#E11D2A] border-[#E11D2A] text-white'
                      : 'bg-[#F2E9D6] border-[#C9BCA0] text-[#6B6552] hover:border-[#E11D2A] hover:text-[#E11D2A]'
                  }`}
                >
                  R{preset}
                </button>
              ))}
            </div>

            {/* Fee breakdown */}
            {amountNum >= 50 && amountNum <= 300 && (
              <div className="bg-[#F2E9D6] border border-[#C9BCA0] rounded-xl p-4 space-y-2">
                <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#E11D2A]">Summary</p>
                <div className="flex justify-between">
                  <span className="font-[var(--mono)] text-[11px] text-[#6B6552]">Credit amount</span>
                  <span className="font-[var(--mono)] text-[11px] font-semibold text-[#14130E]">{formatCurrency(amountNum)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-[var(--mono)] text-[11px] text-[#6B6552]">Service fee (2%)</span>
                  <span className="font-[var(--mono)] text-[11px] font-semibold text-[#14130E]">{formatCurrency(serviceFee)}</span>
                </div>
                <div className="h-px bg-[#C9BCA0]" />
                <div className="flex justify-between">
                  <span className="font-[var(--mono)] text-[11px] font-bold text-[#14130E]">Total repayment</span>
                  <span className="font-[var(--serif)] italic text-base text-[#E11D2A]">{formatCurrency(totalRepayment)}</span>
                </div>
                <p className="font-[var(--mono)] text-[10px] text-[#A89971]">Repaid from your next grant payment</p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="font-[var(--mono)] text-[11px] tracking-widest uppercase text-[#6B6552]">Reason for credit</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="bg-[#F2E9D6] border-[#C9BCA0]">
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent>
                  {CREDIT_REASONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-start gap-2 p-3 bg-[#F2E9D6] border border-[#C9BCA0] rounded-xl">
              <Info className="h-4 w-4 text-[#A89971] flex-shrink-0 mt-0.5" />
              <p className="font-[var(--mono)] text-[10px] text-[#6B6552] leading-relaxed tracking-wide">
                Your credit request will be reviewed by an admin. Once approved, you can use it at registered spaza shops in your area for essential goods only.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#E11D2A] hover:bg-[#A60E1A]"
              size="lg"
              loading={loading}
              disabled={!groupId || amountNum < 50 || amountNum > 300 || !reason}
            >
              Submit Request
            </Button>
          </form>
        </div>
      </div>

      {/* Request history */}
      <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[#C9BCA0]">
          <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552]">Credit</p>
          <p className="font-[var(--serif)] italic text-lg text-[#14130E] leading-tight">Request History</p>
        </div>

        {loadingHistory ? (
          <div className="text-center py-8 font-[var(--mono)] text-[11px] text-[#A89971]">Loading…</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-10">
            <CreditCard className="h-10 w-10 text-[#A89971] mx-auto mb-3" />
            <p className="font-[var(--sans-dawn)] text-sm font-medium text-[#6B6552]">No requests yet</p>
            <p className="font-[var(--mono)] text-[10px] tracking-wide text-[#A89971] mt-1">Submit your first credit request above</p>
          </div>
        ) : (
          <ul>
            {requests.map((req, i) => (
              <li key={req.id} className={`flex items-center justify-between px-5 py-3 border-b border-[#C9BCA0] last:border-0 ${i % 2 === 0 ? 'bg-[#EBE0C7]' : 'bg-[#F2E9D6]'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    req.status === 'APPROVED' ? 'bg-[#3F7B4F]/10' :
                    req.status === 'REJECTED' ? 'bg-[#E11D2A]/10' : 'bg-[#A07030]/10'
                  }`}>
                    {req.status === 'APPROVED' ? <CheckCircle className="h-4 w-4 text-[#3F7B4F]" /> :
                     req.status === 'REJECTED' ? <XCircle className="h-4 w-4 text-[#E11D2A]" /> :
                     <Clock className="h-4 w-4 text-[#A07030]" />}
                  </div>
                  <div>
                    <p className="font-[var(--sans-dawn)] text-sm font-medium text-[#14130E]">{req.reason}</p>
                    <p className="font-[var(--mono)] text-[10px] tracking-wide text-[#6B6552]">{formatDate(req.createdAt)} · {req.group.name}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-[var(--serif)] italic text-base text-[#E11D2A]">{formatCurrency(Number(req.amount))}</p>
                  <span className={`font-[var(--mono)] text-[9px] tracking-widest uppercase rounded px-2 py-0.5 border ${
                    req.status === 'APPROVED' ? 'text-[#3F7B4F] border-[#3F7B4F]/30 bg-[#3F7B4F]/10' :
                    req.status === 'REJECTED' ? 'text-[#E11D2A] border-[#E11D2A]/30 bg-[#E11D2A]/10' :
                    'text-[#A07030] border-[#A07030]/30 bg-[#A07030]/10'
                  }`}>{req.status}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  )
}