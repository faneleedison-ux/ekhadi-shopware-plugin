'use client'

import { useEffect, useState } from 'react'
import { Calendar, TrendingUp } from 'lucide-react'

function getSASSAPayDate(): Date {
  // SASSA pays on or around the 1st of each month
  const now = new Date()
  const nextMonth = now.getDate() <= 3 ? now : new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1)
}

export default function GrantCountdown({ grantAmount }: { grantAmount: number }) {
  const [daysLeft, setDaysLeft] = useState(0)
  const [hoursLeft, setHoursLeft] = useState(0)

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const payDate = getSASSAPayDate()
      const diff = payDate.getTime() - now.getTime()
      setDaysLeft(Math.floor(diff / (1000 * 60 * 60 * 24)))
      setHoursLeft(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)))
    }
    update()
    const t = setInterval(update, 60000)
    return () => clearInterval(t)
  }, [])

  const isImminent = daysLeft <= 2
  const payDate = getSASSAPayDate()
  const dateLabel = payDate.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-4"
      style={{
        background: isImminent
          ? 'linear-gradient(135deg, #059669, #047857)'
          : 'linear-gradient(135deg, #1877F2, #0f4fa8)',
        boxShadow: isImminent ? '0 4px 16px rgba(5,150,105,0.3)' : '0 4px 16px rgba(24,119,242,0.3)',
      }}
    >
      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
        <Calendar className="h-6 w-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-white/60 font-semibold uppercase tracking-wide">
          {isImminent ? '🎉 Grant Day Soon!' : 'Next SASSA Grant'}
        </p>
        <p className="text-lg font-black text-white mt-0.5">
          {daysLeft === 0 ? `Today! ${hoursLeft}h away` : `${daysLeft} days away`}
        </p>
        <p className="text-[11px] text-white/60 mt-0.5">{dateLabel}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-[10px] text-white/60">Expected</p>
        <p className="text-base font-black text-white">R{grantAmount}</p>
        <div className="flex items-center gap-0.5 justify-end mt-0.5">
          <TrendingUp className="h-3 w-3 text-green-300" />
          <p className="text-[10px] text-green-300">plan ahead</p>
        </div>
      </div>
    </div>
  )
}