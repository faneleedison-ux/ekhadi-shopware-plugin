'use client'

import { Wifi, ShieldCheck, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

type Props = {
  cardHolder: string
  cardNumber: string
  expiry: string
  cvv: string
  tierLabel: string
}

export default function MemberVirtualCard({ cardHolder, cardNumber, expiry, cvv, tierLabel }: Props) {
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

        {/* Gold chip */}
        <div className="w-10 h-7 rounded-md"
          style={{ background: 'linear-gradient(135deg, #d4a017, #f5d060, #b8860b)', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
          <div className="w-full h-full rounded-md border border-yellow-200/30 grid grid-cols-3 gap-px p-1 opacity-60">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-yellow-900/40 rounded-sm" />
            ))}
          </div>
        </div>

        {/* Card number */}
        <p className="font-mono text-xl tracking-[0.22em] text-white sm:text-2xl"
          style={{ textShadow: '0 0 20px rgba(255,255,255,0.2)' }}>
          {cardNumber}
        </p>

        {/* Details row */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: 'Cardholder', value: cardHolder },
            { label: 'Expires', value: expiry },
            { label: 'CVV', value: cvv },
          ].map((f) => (
            <div key={f.label} className="rounded-lg p-2"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <p className="text-[9px] uppercase tracking-wide text-slate-400">{f.label}</p>
              <p className="mt-0.5 font-bold text-white truncate text-sm">{f.value}</p>
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