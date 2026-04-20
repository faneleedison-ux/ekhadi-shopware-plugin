'use client'

import { useState, useEffect } from 'react'
import { QrCode, RefreshCw, Copy, CheckCircle, Loader2 } from 'lucide-react'
import QRCode from 'react-qr-code'

export default function QRWallet({ memberName }: { memberName: string }) {
  const [token, setToken] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)

  async function generateToken() {
    setLoading(true)
    try {
      const res = await fetch('/api/qr/generate', { method: 'POST' })
      const data = await res.json()
      setToken(data.token)
      setExpiresAt(new Date(data.expiresAt))
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    generateToken()
  }, [])

  useEffect(() => {
    if (!expiresAt) return
    const t = setInterval(() => {
      const s = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000))
      setSecondsLeft(s)
      if (s === 0) generateToken()
    }, 1000)
    return () => clearInterval(t)
  }, [expiresAt])

  function copyToken() {
    if (token) {
      navigator.clipboard.writeText(token)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shortCode = token ? token.slice(-8).toUpperCase() : '--------'
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const urgency = secondsLeft < 60

  return (
    <div className="rounded-2xl border border-border bg-white p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-text-primary flex items-center gap-1.5">
            <QrCode className="h-4 w-4 text-primary" /> Payment QR Code
          </p>
          <p className="text-xs text-text-secondary mt-0.5">Show this to the shop to pay with store credit</p>
        </div>
        <button
          onClick={generateToken}
          disabled={loading}
          className="text-primary hover:bg-primary/8 rounded-lg p-1.5 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex flex-col items-center gap-3">
        {loading ? (
          <div className="w-40 h-40 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : token ? (
          <div className="p-3 bg-white rounded-xl border-2 border-primary/20 shadow-sm">
            <QRCode value={token} size={140} />
          </div>
        ) : null}

        {/* Short code display */}
        <div className="w-full">
          <p className="text-[9px] text-center text-text-secondary font-semibold uppercase tracking-widest mb-1.5">
            Or type this code at the shop
          </p>
          <div className="flex items-center gap-2 bg-background rounded-xl px-4 py-2.5 border border-border">
            <p className="flex-1 font-mono text-xl font-black text-text-primary tracking-[0.3em] text-center">
              {shortCode}
            </p>
            <button onClick={copyToken} className="text-primary flex-shrink-0">
              {copied ? <CheckCircle className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-1.5 text-xs font-semibold ${urgency ? 'text-danger' : 'text-text-secondary'}`}>
          <span className={`w-2 h-2 rounded-full ${urgency ? 'bg-danger animate-pulse' : 'bg-success'}`} />
          Expires in {minutes}:{String(seconds).padStart(2, '0')}
        </div>

        <p className="text-[11px] text-text-secondary text-center px-4">
          Valid for <strong>{memberName.split(' ')[0]}</strong> only. The shop will enter the amount after scanning.
        </p>
      </div>
    </div>
  )
}