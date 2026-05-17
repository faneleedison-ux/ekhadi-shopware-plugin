'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const BLUE     = '#1877F2'
const BLUE_DIM = 'rgba(24,119,242,0.15)'
const SY       = `var(--font-outfit), sans-serif`

export default function PhoneHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const phoneRef     = useRef<HTMLDivElement>(null)
  const chip1Ref     = useRef<HTMLDivElement>(null)
  const chip2Ref     = useRef<HTMLDivElement>(null)
  const chip3Ref     = useRef<HTMLDivElement>(null)
  const idleTl       = useRef<gsap.core.Timeline | null>(null)
  const isHovered    = useRef(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!phoneRef.current) return

      // Give the phone a perspective origin so rotateY/rotateX look 3D
      gsap.set(phoneRef.current, { transformPerspective: 1100 })

      // Idle floating + rotation timeline
      const tl = gsap.timeline({ repeat: -1 })
      tl.to(phoneRef.current, {
        rotateY: 10, rotateX: -5, rotateZ: 2, y: -30, scale: 1.04,
        duration: 2.1, ease: 'power1.inOut',
      })
      .to(phoneRef.current, {
        rotateY: -4, rotateX: 8, rotateZ: -1, y: -14, scale: 1.01,
        duration: 2.6, ease: 'power1.inOut',
      })
      .to(phoneRef.current, {
        rotateY: -24, rotateX: 9, rotateZ: -2, y: 0, scale: 1,
        duration: 2.4, ease: 'power1.inOut',
      })
      idleTl.current = tl

      // Chip bob animations
      if (chip1Ref.current)
        gsap.to(chip1Ref.current, {
          y: -22, x: 6, rotation: 2,
          duration: 1.9, ease: 'power1.inOut', yoyo: true, repeat: -1,
        })
      if (chip2Ref.current)
        gsap.to(chip2Ref.current, {
          y: -18, x: -8, rotation: -2,
          duration: 2.25, delay: 0.5, ease: 'power1.inOut', yoyo: true, repeat: -1,
        })
      if (chip3Ref.current)
        gsap.to(chip3Ref.current, {
          y: -24, x: 10, rotation: 2.5,
          duration: 2.05, delay: 1.0, ease: 'power1.inOut', yoyo: true, repeat: -1,
        })
    }, containerRef)

    // Mouse-tracking parallax tilt
    const onMove = (e: MouseEvent) => {
      if (!containerRef.current || !phoneRef.current || !isHovered.current) return
      const { left, top, width, height } = containerRef.current.getBoundingClientRect()
      const nx = (e.clientX - left - width  / 2) / (width  / 2) // -1..1
      const ny = (e.clientY - top  - height / 2) / (height / 2) // -1..1
      gsap.to(phoneRef.current, {
        rotateY: nx * 20, rotateX: -ny * 14, rotateZ: nx * 1.5,
        duration: 0.5, ease: 'power2.out', overwrite: 'auto',
      })
    }
    const onEnter = () => {
      isHovered.current = true
      idleTl.current?.pause()
    }
    const onLeave = () => {
      isHovered.current = false
      gsap.to(phoneRef.current, {
        rotateY: -24, rotateX: 9, rotateZ: -2, y: 0, scale: 1,
        duration: 0.8, ease: 'power3.out',
        onComplete: () => idleTl.current?.resume(),
      })
    }

    const el = containerRef.current
    el?.addEventListener('mousemove', onMove)
    el?.addEventListener('mouseenter', onEnter)
    el?.addEventListener('mouseleave', onLeave)
    return () => {
      ctx.revert()
      el?.removeEventListener('mousemove', onMove)
      el?.removeEventListener('mouseenter', onEnter)
      el?.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative hidden lg:flex justify-center items-center"
      style={{ minHeight: 480 }}
    >
      {/* Credit score chip */}
      <div
        ref={chip1Ref}
        style={{
          position: 'absolute', top: '2%', right: '2%', zIndex: 10,
          background: 'rgba(24,119,242,0.14)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(24,119,242,0.3)',
          borderRadius: 16, padding: '10px 14px',
        }}
      >
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 3px' }}>Credit Score</p>
        <p style={{ color: '#93c5fd', fontWeight: 800, fontSize: 17, margin: 0, fontFamily: SY }}>⭐ 92 / 100</p>
      </div>

      {/* Next payday chip */}
      <div
        ref={chip2Ref}
        style={{
          position: 'absolute', bottom: '8%', left: '2%', zIndex: 10,
          background: 'rgba(245,158,11,0.1)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 16, padding: '10px 14px',
        }}
      >
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 3px' }}>Next Payday</p>
        <p style={{ color: '#F59E0B', fontWeight: 800, fontSize: 15, margin: 0, fontFamily: SY }}>5 Days</p>
      </div>

      {/* Last repaid chip */}
      <div
        ref={chip3Ref}
        style={{
          position: 'absolute', top: '42%', right: '-2%', zIndex: 10,
          background: 'rgba(66,184,131,0.1)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(66,184,131,0.3)',
          borderRadius: 16, padding: '10px 14px',
        }}
      >
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 3px' }}>Last Repaid</p>
        <p style={{ color: '#42B883', fontWeight: 800, fontSize: 15, margin: 0, fontFamily: SY }}>+R750 ✓</p>
      </div>

      {/* Phone body */}
      <div ref={phoneRef} style={{ position: 'relative' }}>
        {/* Orbit rings — simple CSS spin is fine here */}
        <div style={{
          position: 'absolute', inset: -28, borderRadius: '50%',
          border: '1.5px dashed rgba(24,119,242,0.35)',
          animation: 'spin-slow 10s linear infinite',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', inset: -46, borderRadius: '50%',
          border: '1px solid rgba(24,119,242,0.15)',
          animation: 'spin-slow-reverse 16s linear infinite',
          pointerEvents: 'none',
        }} />

        {/* Glow behind phone */}
        <div style={{
          position: 'absolute', inset: -40,
          background: 'radial-gradient(ellipse, rgba(24,119,242,0.35) 0%, transparent 65%)',
          filter: 'blur(30px)', pointerEvents: 'none',
        }} />

        {/* Phone shell */}
        <div style={{
          width: 260,
          background: '#0D1529',
          borderRadius: 36,
          border: '1.5px solid rgba(24,119,242,0.35)',
          boxShadow: `
            0 0 0 1px rgba(255,255,255,0.05),
            0 40px 100px rgba(0,0,0,0.7),
            0 0 60px rgba(24,119,242,0.18),
            inset 0 0 0 1px rgba(255,255,255,0.03)
          `,
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Notch */}
          <div style={{ height: 24, background: '#070E1F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 60, height: 10, background: '#0D1529', borderRadius: 9999 }} />
          </div>

          <div style={{ padding: '12px 16px 22px' }}>
            {/* Balance card */}
            <div style={{
              background: `linear-gradient(135deg, ${BLUE}, #0f4fa8)`,
              borderRadius: 20, padding: 16, marginBottom: 12,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: -20, right: -20, width: 80, height: 80,
                background: 'rgba(255,255,255,0.07)', borderRadius: '50%',
              }} />
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 4px' }}>Available Credit</p>
              <p style={{ color: '#fff', fontSize: 28, fontWeight: 800, margin: 0, fontFamily: SY }}>R 750.00</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.14)' }}>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 8, margin: 0 }}>MEMBER</p>
                  <p style={{ color: '#fff', fontSize: 11, fontWeight: 600, margin: 0 }}>Nomsa D.</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 8, margin: 0 }}>GROUP</p>
                  <p style={{ color: '#fff', fontSize: 11, fontWeight: 600, margin: 0 }}>Umlazi</p>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 12 }}>
              {['Credit', 'Wallet', 'Group'].map((a) => (
                <div key={a} style={{
                  background: BLUE_DIM,
                  border: '1px solid rgba(24,119,242,0.14)',
                  borderRadius: 10, padding: '8px 4px', textAlign: 'center',
                }}>
                  <p style={{ color: BLUE, fontSize: 12, margin: '0 0 2px' }}>◈</p>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9 }}>{a}</span>
                </div>
              ))}
            </div>

            {/* Transactions */}
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Recent</p>
            {[
              { label: 'Food & Grocery', amount: '-R120', pos: false },
              { label: 'Credit Received', amount: '+R750', pos: true },
              { label: 'Toiletries',      amount: '-R80',  pos: false },
            ].map((tx, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 0',
                borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: tx.pos ? 'rgba(66,184,131,0.15)' : 'rgba(250,56,62,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: 8, fontWeight: 700, color: tx.pos ? '#42B883' : '#FA383E' }}>{tx.pos ? '↓' : '↑'}</span>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, margin: 0 }}>{tx.label}</p>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: tx.pos ? '#42B883' : '#FA383E' }}>{tx.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}