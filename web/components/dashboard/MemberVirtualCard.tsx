import { Wifi, ShieldCheck } from 'lucide-react'

type Props = {
  cardHolder: string
  cardNumber: string
  expiry: string
  cvv: string
  tierLabel: string
}

export default function MemberVirtualCard({ cardHolder, cardNumber, expiry, cvv, tierLabel }: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-5 text-white shadow-lg">
      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-cyan-400/20 blur-2xl" />
      <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-emerald-400/20 blur-2xl" />

      <div className="relative z-10 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-300">e-Khadi virtual</p>
            <p className="mt-1 text-xs font-semibold text-emerald-300">{tierLabel}</p>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 p-2">
            <Wifi className="h-4 w-4 rotate-90" />
          </div>
        </div>

        <p className="font-mono text-xl tracking-[0.22em] text-white sm:text-2xl">{cardNumber}</p>

        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="rounded-lg border border-white/15 bg-white/5 p-2">
            <p className="text-[10px] uppercase text-slate-300">Cardholder</p>
            <p className="mt-1 truncate font-semibold text-white">{cardHolder}</p>
          </div>
          <div className="rounded-lg border border-white/15 bg-white/5 p-2">
            <p className="text-[10px] uppercase text-slate-300">Expiry</p>
            <p className="mt-1 font-semibold text-white">{expiry}</p>
          </div>
          <div className="rounded-lg border border-white/15 bg-white/5 p-2">
            <p className="text-[10px] uppercase text-slate-300">CVV</p>
            <p className="mt-1 font-semibold text-white">{cvv}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-200">
          <ShieldCheck className="h-4 w-4 text-emerald-300" />
          <span>For online purchases at approved community shops.</span>
        </div>
      </div>
    </div>
  )
}