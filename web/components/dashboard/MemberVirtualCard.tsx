'use client'

import { Wifi, ShieldCheck, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'

type Props = {
  cardHolder: string
  cardNumber: string
  expiry: string
  cvv: string
  tierLabel: string
  balance: number
  creditLimit?: number
}

export default function MemberVirtualCard({ cardHolder, cardNumber, expiry, cvv, tierLabel, balance, creditLimit = 300 }: Props) {
  const usagePct = Math.min(100, Math.round((balance / creditLimit) * 100))
  const [shine, setShine] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShine(true), 600)
    const interval = setInterval(() => {
      setShine(true)
      setTimeout(() => setShine(false), 800)
    }, 5000)
    return () => { clearTimeout(t); clearInterval(interval) }
  }, [])

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 text-white select-none"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a6e 45%, #0f2552 100%)',
        boxShadow: '0 8px 32px rgba(24, 119, 242, 0.35), 0 2px 8px rgba(0,0,0,0.4)',
      }}
    >
      {/* Animated shine sweep */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)',
          transform: shine ? 'translateX(100%)' : 'translateX(-100%)',
        }}
      />

      {/* Glow orbs */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-30 blur-2xl"
        style={{ background: 'radial-gradient(circle, #38bdf8, transparent)' }} />
      <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full opacity-20 blur-2xl"
        style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }} />

      {/* Chip pattern */}
      <div className="absolute top-0 right-0 w-48 h-48 opacity-5">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="1" />
          <circle cx="100" cy="100" r="60" fill="none" stroke="white" strokeWidth="1" />
          <circle cx="100" cy="100" r="40" fill="none" stroke="white" strokeWidth="1" />
        </svg>
      </div>

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm"
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                boxShadow: '0 0 14px rgba(255,255,255,0.2)',
              }}
            >
              eK
            </div>
            <div>
              <p className="text-sm font-bold text-white">e-Khadi</p>
              <p className="text-[9px] uppercase tracking-[0.25em] text-slate-300">Virtual Card</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded-full flex items-center gap-1"
              style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', color: '#6ee7b7' }}
            >
              <Sparkles className="h-2.5 w-2.5" />
              {tierLabel}
            </span>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <Wifi className="h-4 w-4 rotate-90 text-white/80" />
            </div>
          </div>
        </div>

        {/* Balance — the main number */}
        <div>
          <p className="text-white/60 text-xs uppercase tracking-wider">Available Credit</p>
          <p className="text-4xl font-black text-white mt-0.5 tracking-tight"
            style={{ textShadow: '0 0 24px rgba(255,255,255,0.25)' }}>
            {formatCurrency(balance)}
          </p>
          <p className="text-white/40 text-xs mt-0.5">of {formatCurrency(creditLimit)} limit</p>
        </div>

        {/* Usage bar */}
        <div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${usagePct}%`,
                background: usagePct > 80 ? '#ef4444' : usagePct > 60 ? '#f59e0b' : '#34d399',
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-white/40 text-[10px]">{usagePct}% used</span>
            <span className="text-white/40 text-[10px]">2% service fee</span>
          </div>
        </div>

        {/* Details row */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {[
            { label: 'Cardholder', value: cardHolder },
            { label: 'Expires', value: expiry },
            { label: 'Card', value: `•••• ${cardNumber.replace(/\s/g, '').slice(-4)}` },
          ].map((f) => (
            <div key={f.label} className="rounded-lg p-2"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <p className="text-[9px] uppercase tracking-wide text-slate-400">{f.label}</p>
              <p className="mt-0.5 font-bold text-white truncate text-xs">{f.value}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(110,231,183,0.8)' }}>
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Approved community shops only · Store credit spending</span>
        </div>
      </div>
    </div>
  )
}