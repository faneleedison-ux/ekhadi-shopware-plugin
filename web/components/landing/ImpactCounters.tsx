'use client'

import { useEffect, useRef, useState } from 'react'
import { Users, CreditCard, UsersRound } from 'lucide-react'

interface ImpactCountersProps {
  familiesHelped: number
  totalCreditIssued: number   // in Rands
  activeGroups: number
}

function useCountUp(target: number, duration = 1800, triggered = false) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!triggered || target === 0) return
    let startTime: number | null = null

    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

    const tick = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      setValue(Math.round(easeOut(progress) * target))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [target, duration, triggered])

  return value
}

function Counter({
  target,
  prefix = '',
  suffix = '',
  label,
  sublabel,
  icon: Icon,
  triggered,
}: {
  target: number
  prefix?: string
  suffix?: string
  label: string
  sublabel?: string
  icon: React.ElementType
  triggered: boolean
}) {
  const value = useCountUp(target, 1800, triggered)

  const display =
    prefix +
    (target >= 1000
      ? value.toLocaleString('en-ZA')
      : value.toString()) +
    suffix

  return (
    <div className="bg-white rounded-2xl border border-border p-6 flex flex-col items-center text-center shadow-sm">
      <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center mb-3">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <p className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
        {display}
      </p>
      <p className="text-sm font-semibold text-text-primary mt-1">{label}</p>
      {sublabel && (
        <p className="text-xs text-text-secondary mt-0.5">{sublabel}</p>
      )}
    </div>
  )
}

export default function ImpactCounters({
  familiesHelped,
  totalCreditIssued,
  activeGroups,
}: ImpactCountersProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [triggered, setTriggered] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="grid sm:grid-cols-3 gap-4">
      <Counter
        target={familiesHelped}
        suffix="+"
        label="Families Helped"
        sublabel="registered grant recipients"
        icon={Users}
        triggered={triggered}
      />
      <Counter
        target={totalCreditIssued}
        prefix="R"
        label="Credit Distributed"
        sublabel="in essential-goods credit"
        icon={CreditCard}
        triggered={triggered}
      />
      <Counter
        target={activeGroups}
        label="Active Stokvel Groups"
        sublabel="across South Africa"
        icon={UsersRound}
        triggered={triggered}
      />
    </div>
  )
}
