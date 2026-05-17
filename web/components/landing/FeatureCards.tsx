'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Shield, Zap, Globe } from 'lucide-react'

const BLUE     = '#1877F2'
const BLUE_DIM = 'rgba(24,119,242,0.15)'
const WHITE40  = 'rgba(255,255,255,0.4)'
const SY       = `var(--font-outfit), sans-serif`

const features = [
  { title: 'Community-Powered', text: 'Based on stokvel trust, not bank collateral.', icon: Shield },
  { title: 'Fair Pricing',      text: 'R50–R1 000 credit. Flat 2% service fee. No surprises.', icon: Zap },
  { title: 'Local Impact',      text: 'Spend at approved spaza shops in your area only.', icon: Globe },
]

function FeatureCard({ title, text, icon: Icon }: typeof features[number]) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // GSAP-specific property — not valid as a CSS React prop
    gsap.set(cardRef.current, { transformPerspective: 700 })
  }, [])

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current
    if (!el) return
    const { left, top, width, height } = el.getBoundingClientRect()
    const nx = (e.clientX - left) / width  - 0.5  // -0.5..0.5
    const ny = (e.clientY - top)  / height - 0.5  // -0.5..0.5
    gsap.to(el, {
      rotateX: -ny * 14,
      rotateY:  nx * 14,
      scale: 1.03,
      y: -6,
      boxShadow: '0 24px 64px rgba(24,119,242,0.25)',
      duration: 0.35,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  const onLeave = () => {
    const el = cardRef.current
    if (!el) return
    gsap.to(el, {
      rotateX: 0, rotateY: 0, scale: 1, y: 0,
      boxShadow: '0 0 0 rgba(24,119,242,0)',
      duration: 0.55,
      ease: 'elastic.out(1, 0.5)',
    })
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(24,119,242,0.16)',
        borderRadius: 24,
        padding: '32px',
        backdropFilter: 'blur(12px)',
        cursor: 'default',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        height: '100%',
      }}
    >
      <div style={{
        width: 50, height: 50,
        background: BLUE_DIM,
        border: '1px solid rgba(24,119,242,0.25)',
        borderRadius: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 22,
        boxShadow: '0 0 20px rgba(24,119,242,0.12)',
      }}>
        <Icon size={21} style={{ color: BLUE }} />
      </div>
      <h3 style={{ fontFamily: SY, color: '#fff', fontWeight: 700, fontSize: 19, marginBottom: 10 }}>{title}</h3>
      <p style={{ color: WHITE40, fontSize: 14, lineHeight: 1.75, margin: 0 }}>{text}</p>
    </div>
  )
}

export default function FeatureCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {features.map((f) => (
        <FeatureCard key={f.title} {...f} />
      ))}
    </div>
  )
}
