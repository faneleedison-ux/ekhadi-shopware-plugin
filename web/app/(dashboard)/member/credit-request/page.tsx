'use client'

import React, { useState, useEffect } from 'react'
import { CreditCard, Info, CheckCircle, Clock, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
        body: JSON.stringify({
          amount: amountNum,
          reason,
          groupId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to submit request')
        return
      }

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

  const statusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="h-4 w-4 text-success" />
      case 'REJECTED': return <XCircle className="h-4 w-4 text-danger" />
      default: return <Clock className="h-4 w-4 text-warning" />
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Request Credit</h1>
        <p className="text-text-secondary mt-1">Request credit against your SASSA grant</p>
      </div>

      {/* Request form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            New Credit Request
          </CardTitle>
          <CardDescription>
            Request between R50 and R300. A 2% flat service fee applies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm text-success">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              Request submitted successfully! An admin will review it shortly.
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-danger">
              {error}
            </div>
          )}
          {!groupId && !loadingHistory && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
              You are not yet assigned to a stokvel group. Please contact an admin.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Amount (ZAR)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary font-medium text-sm">R</span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  min={50}
                  max={300}
                  step={10}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7"
                  required
                />
              </div>
              <p className="text-xs text-text-secondary">Minimum R50 · Maximum R300</p>
            </div>

            {/* Quick amount buttons */}
            <div className="flex gap-2 flex-wrap">
              {[50, 100, 150, 200, 250, 300].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(String(preset))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    amount === String(preset)
                      ? 'bg-primary border-primary text-white'
                      : 'bg-white border-border text-text-secondary hover:border-primary hover:text-primary'
                  }`}
                >
                  R{preset}
                </button>
              ))}
            </div>

            {/* Fee breakdown */}
            {amountNum >= 50 && amountNum <= 300 && (
              <div className="bg-primary-light rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">Summary</p>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Credit amount</span>
                  <span className="font-semibold">{formatCurrency(amountNum)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Service fee (2%)</span>
                  <span className="font-semibold">{formatCurrency(serviceFee)}</span>
                </div>
                <div className="h-px bg-primary/20" />
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-text-primary">Total repayment</span>
                  <span className="font-bold text-primary">{formatCurrency(totalRepayment)}</span>
                </div>
                <p className="text-xs text-text-secondary">Repaid from your next grant payment</p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Reason for credit</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent>
                  {CREDIT_REASONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-start gap-2 p-3 bg-background rounded-lg">
              <Info className="h-4 w-4 text-text-secondary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-text-secondary leading-relaxed">
                Your credit request will be reviewed by an admin. Once approved, you can use it at registered spaza shops in your area for essential goods only.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
              disabled={!groupId || amountNum < 50 || amountNum > 300 || !reason}
            >
              Submit Request
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Request history */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Request History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loadingHistory ? (
            <div className="text-center py-8 text-text-secondary text-sm">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-10">
              <CreditCard className="h-10 w-10 text-text-secondary mx-auto mb-3" />
              <p className="text-sm font-medium text-text-secondary">No requests yet</p>
              <p className="text-xs text-text-secondary mt-1">Submit your first credit request above</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {requests.map((req) => (
                <li key={req.id} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50/50">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    req.status === 'APPROVED' ? 'bg-success/10' :
                    req.status === 'REJECTED' ? 'bg-danger/10' : 'bg-warning/10'
                  }`}>
                    {statusIcon(req.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{req.reason}</p>
                    <p className="text-xs text-text-secondary">
                      {formatDate(req.createdAt)} · {req.group.name}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-text-primary">{formatCurrency(Number(req.amount))}</p>
                    <Badge
                      variant={
                        req.status === 'APPROVED' ? 'success' :
                        req.status === 'REJECTED' ? 'destructive' : 'warning'
                      }
                      className="text-xs mt-0.5"
                    >
                      {req.status}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
