'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, CreditCard, UsersRound } from 'lucide-react'

interface ImpactCountersProps {
  familiesHelped: number
  totalCreditIssued: number
  activeGroups: number
}

function useCountUp(target: number, duration = 1800, triggered = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!triggered || target === 0) return
    let startTime: number | null = null
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
    const tick = (ts: number) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      setValue(Math.round(easeOut(progress) * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration, triggered])
  return value
}

const cardVariants = {
  hidden:  { opacity: 0, y: 32, scale: 0.95 },
  visible: { opacity: 1, y: 0,  scale: 1    },
}

function Counter({ target, prefix = '', suffix = '', label, sublabel, icon: Icon, triggered, index }: {
  target: number; prefix?: string; suffix?: string
  label: string; sublabel?: string
  icon: React.ElementType; triggered: boolean; index: number
}) {
  const value = useCountUp(target, 1800, triggered)
  const display = prefix + (target >= 1000 ? value.toLocaleString('en-ZA') : value.toString()) + suffix

  return (
    <motion.div
      variants={cardVariants}
      transition={{ duration: 0.65, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, scale: 1.03, boxShadow: '0 20px 60px rgba(24,119,242,0.2)' }}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(24,119,242,0.2)',
        borderRadius: 20,
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        backdropFilter: 'blur(10px)',
        cursor: 'default',
      }}
    >
      <motion.div
        whileHover={{ rotate: [0, -8, 8, 0], scale: 1.15 }}
        transition={{ duration: 0.5 }}
        style={{
          width: 48, height: 48, borderRadius: 14,
          background: 'rgba(24,119,242,0.15)',
          border: '1px solid rgba(24,119,242,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16,
          boxShadow: '0 0 20px rgba(24,119,242,0.12)',
        }}
      >
        <Icon size={22} style={{ color: '#1877F2' }} />
      </motion.div>

      <motion.p
        key={value}
        style={{
          fontSize: 'clamp(2rem, 4vw, 2.6rem)',
          fontWeight: 800,
          color: '#fff',
          letterSpacing: '-0.04em',
          lineHeight: 1,
          margin: 0,
          fontFamily: 'var(--font-outfit), sans-serif',
        }}
      >
        {display}
      </motion.p>
      <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginTop: 10 }}>{label}</p>
      {sublabel && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>{sublabel}</p>}
    </motion.div>
  )
}

const container = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1 } },
}

export default function ImpactCounters({ familiesHelped, totalCreditIssued, activeGroups }: ImpactCountersProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [triggered, setTriggered] = useState(false)

  useEffect(() => {
    const fallback = setTimeout(() => setTriggered(true), 800)
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTriggered(true); clearTimeout(fallback); observer.disconnect() }
    }, { threshold: 0 })
    if (ref.current) observer.observe(ref.current)
    return () => { observer.disconnect(); clearTimeout(fallback) }
  }, [])

  return (
    <motion.div
      ref={ref}
      className="grid sm:grid-cols-3 gap-4"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0 }}
      variants={container}
    >
      <Counter index={0} target={familiesHelped}    suffix="+" label="Families Helped"       sublabel="registered grant recipients"  icon={Users}      triggered={triggered} />
      <Counter index={1} target={totalCreditIssued} prefix="R"  label="Credit Distributed"   sublabel="in essential-goods credit"    icon={CreditCard} triggered={triggered} />
      <Counter index={2} target={activeGroups}              label="Active Stokvel Groups" sublabel="across South Africa"          icon={UsersRound} triggered={triggered} />
    </motion.div>
  )
}