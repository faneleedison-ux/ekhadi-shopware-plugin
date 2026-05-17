'use client'

import { useEffect, useState } from 'react'

const steps = [
  { title: 'Join',    text: 'Sign up and join a local stokvel group.' },
  { title: 'Request', text: 'Apply for essential-goods credit instantly.' },
  { title: 'Repay',   text: 'Automatic deduction on your next SASSA cycle.' },
]

const BLUE        = '#1877F2'
const BLUE_DIM    = 'rgba(24,119,242,0.14)'
const BLUE_BORDER = 'rgba(24,119,242,0.4)'
const WHITE40     = 'rgba(255,255,255,0.4)'

export default function HowItWorksSteps() {
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)   // 0–100 within current step

  const STEP_MS = 2400   // ms each step stays lit

  useEffect(() => {
    let start = performance.now()
    let raf: number

    const tick = (now: number) => {
      const elapsed = now - start
      const pct = Math.min((elapsed / STEP_MS) * 100, 100)
      setProgress(pct)

      if (elapsed >= STEP_MS) {
        start = now
        setActive((a) => (a + 1) % steps.length)
        setProgress(0)
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div style={{ position: 'relative' }}>
      {/* ── Connecting track ── */}
      <div
        className="hidden sm:block"
        style={{
          position: 'absolute',
          top: 32,
          left: 'calc(16.7% + 32px)',
          right: 'calc(16.7% + 32px)',
          height: 2,
          background: 'rgba(24,119,242,0.18)',
          zIndex: 0,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        {/* Traveling light dot */}
        <div
          style={{
            position: 'absolute',
            top: -3,
            height: 8,
            width: 40,
            borderRadius: 4,
            background: 'linear-gradient(90deg, transparent, #1877F2, #93c5fd, transparent)',
            filter: 'blur(2px)',
            transition: 'left 0.05s linear',
            left: (() => {
              const totalWidth = 100   // percent
              if (active === 0) return `${progress * 0.5}%`
              if (active === 1) return `${50 + progress * 0.5}%`
              return active === 2 && progress < 95 ? `${100 + progress * 0.3}%` : '-10%'
            })(),
          }}
        />

        {/* Filled track behind the light */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: (() => {
              if (active === 0) return `${progress * 0.5}%`
              if (active === 1) return `${50 + progress * 0.5}%`
              return '100%'
            })(),
            background: `linear-gradient(90deg, ${BLUE}, rgba(24,119,242,0.4))`,
            transition: 'width 0.08s linear',
            borderRadius: 2,
          }}
        />
      </div>

      {/* ── Steps ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-0">
        {steps.map((s, i) => {
          const isActive = i === active
          const isPast   = (() => {
            if (active === 0) return false
            if (active === 1) return i === 0
            return i < 2
          })()

          return (
            <div
              key={s.title}
              style={{ textAlign: 'center', padding: '0 24px', position: 'relative', zIndex: 1 }}
            >
              {/* Number circle */}
              <div
                style={{
                  width: 64,
                  height: 64,
                  margin: '0 auto 28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  background: isActive
                    ? `linear-gradient(135deg, ${BLUE}, #0f4fa8)`
                    : isPast
                    ? 'rgba(24,119,242,0.3)'
                    : BLUE_DIM,
                  border: `2px solid ${isActive ? BLUE : BLUE_BORDER}`,
                  transition: 'background 0.5s, box-shadow 0.5s, border-color 0.5s',
                  boxShadow: isActive
                    ? `0 0 0 6px rgba(24,119,242,0.15), 0 0 40px rgba(24,119,242,0.6), 0 0 80px rgba(24,119,242,0.25)`
                    : isPast
                    ? '0 0 16px rgba(24,119,242,0.3)'
                    : 'none',
                }}
              >
                {/* Pulse ring — only on active */}
                {isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: -10,
                      borderRadius: '50%',
                      border: '2px solid rgba(24,119,242,0.35)',
                      animation: 'glow-pulse 1.2s ease-in-out infinite',
                    }}
                  />
                )}

                {isPast ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <polyline points="20 6 9 17 4 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span
                    style={{
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: 22,
                      fontFamily: 'var(--font-outfit), sans-serif',
                      lineHeight: 1,
                    }}
                  >
                    {i + 1}
                  </span>
                )}
              </div>

              {/* Label */}
              <h3
                style={{
                  fontFamily: 'var(--font-outfit), sans-serif',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                  fontWeight: 700,
                  fontSize: 21,
                  marginBottom: 10,
                  transition: 'color 0.4s',
                }}
              >
                {s.title}
              </h3>
              <p
                style={{
                  color: isActive ? 'rgba(255,255,255,0.65)' : WHITE40,
                  fontSize: 14,
                  lineHeight: 1.75,
                  margin: 0,
                  transition: 'color 0.4s',
                }}
              >
                {s.text}
              </p>

              {/* Step progress bar (under active step) */}
              {isActive && (
                <div
                  style={{
                    height: 3,
                    background: 'rgba(24,119,242,0.2)',
                    borderRadius: 2,
                    marginTop: 20,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${progress}%`,
                      background: `linear-gradient(90deg, ${BLUE}, #93c5fd)`,
                      transition: 'width 0.08s linear',
                      borderRadius: 2,
                    }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}