'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* ─── Story chapters ─────────────────────────────────────────────────────── */
const CHAPTERS = [
  {
    id: 'ss0',
    num: '01',
    label: 'The Gap',
    accent: '#EF4444',
    icon: '🛒',
    bigNum: '17M',
    bigLabel: 'SASSA Families',
    headline: 'End of month.\nEmpty cupboards.',
    body: "Seventeen million South African families face the same cruel gap — the grant arrives, but the month doesn't end. Food runs short. Dignity takes a hit.",
    stat: { value: '73%', detail: 'run short before the next grant cycle' },
  },
  {
    id: 'ss1',
    num: '02',
    label: 'Ubuntu',
    accent: '#F59E0B',
    icon: '🤝',
    bigNum: '89K',
    bigLabel: 'Active Stokvels',
    headline: 'Your community\nhas your back.',
    body: "Stokvels have pooled community trust for generations. e-Khadi digitises that Ubuntu spirit — turning your neighbours' vouching into instant, accessible credit.",
    stat: { value: 'R1 000', detail: 'maximum credit per member' },
  },
  {
    id: 'ss2',
    num: '03',
    label: 'The Approval',
    accent: '#1877F2',
    icon: '⚡',
    bigNum: '60s',
    bigLabel: 'Approval Time',
    headline: 'Credit in your\nhand in 60 seconds.',
    body: 'No bank branch. No forms. No judgment. Apply on your phone or at the spaza shop. Your stokvel vouches for you. Credit is yours.',
    stat: { value: '2%', detail: 'flat service fee — zero hidden costs' },
  },
  {
    id: 'ss3',
    num: '04',
    label: 'Freedom',
    accent: '#10B981',
    icon: '✅',
    bigNum: 'R923M',
    bigLabel: 'Credit Issued',
    headline: 'Repaid automatically.\nNo stress. Ever.',
    body: "Next SASSA payday, it's settled automatically. No collectors. No shame. Just full cupboards, family dignity, and a community that rises together.",
    stat: { value: '1.8M', detail: 'families empowered nationwide' },
  },
]

const SY = `var(--font-outfit), sans-serif`
const D  = '#060C1E'

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function ScrollStory() {
  const outerRef  = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const dotRefs   = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial scene state — only ch0 visible
      gsap.set('#ss1, #ss2, #ss3', { opacity: 0, y: 80, scale: 0.97 })
      gsap.set('#ss0', { opacity: 1, y: 0, scale: 1 })

      // Dot states
      dotRefs.current.forEach((d, i) => {
        if (d) gsap.set(d, { opacity: i === 0 ? 1 : 0.25, scale: i === 0 ? 1.5 : 1 })
      })

      /*
       * Timeline total ≈ 4.0s.
       * Transitions: ch0→1 at t≈0.9, ch1→2 at t≈1.9, ch2→3 at t≈2.9.
       * Mapped by scrub to 400vh of scroll.
       */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: outerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.8,
        },
      })

      // ── Chapter 0 → 1 ──
      tl.to('#ss0', { opacity: 0, y: -80, scale: 0.96, duration: 0.4 }, 0.8)
        .to('#ss1', { opacity: 1, y: 0, scale: 1, duration: 0.4 }, 0.9)
        .to('#dot-0', { opacity: 0.25, scale: 1, duration: 0.2 }, 0.8)
        .to('#dot-1', { opacity: 1, scale: 1.5, duration: 0.2 }, 0.9)

      // ── Chapter 1 → 2 ──
      tl.to('#ss1', { opacity: 0, y: -80, scale: 0.96, duration: 0.4 }, 1.8)
        .to('#ss2', { opacity: 1, y: 0, scale: 1, duration: 0.4 }, 1.9)
        .to('#dot-1', { opacity: 0.25, scale: 1, duration: 0.2 }, 1.8)
        .to('#dot-2', { opacity: 1, scale: 1.5, duration: 0.2 }, 1.9)

      // ── Chapter 2 → 3 ──
      tl.to('#ss2', { opacity: 0, y: -80, scale: 0.96, duration: 0.4 }, 2.8)
        .to('#ss3', { opacity: 1, y: 0, scale: 1, duration: 0.4 }, 2.9)
        .to('#dot-2', { opacity: 0.25, scale: 1, duration: 0.2 }, 2.8)
        .to('#dot-3', { opacity: 1, scale: 1.5, duration: 0.2 }, 2.9)

      // Hold scene 3
      tl.to({}, { duration: 0.7 }, 3.3)
    }, outerRef)

    return () => ctx.revert()
  }, [])

  return (
    /* Outer — provides 400vh scroll distance */
    <div ref={outerRef} style={{ height: '400vh' }}>
      {/* Sticky frame — stays in viewport */}
      <div
        ref={stickyRef}
        style={{
          position: 'sticky', top: 0,
          height: '100vh', overflow: 'hidden',
          background: D,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {/* ── Progress dots (left edge) ── */}
        <div
          style={{
            position: 'absolute', left: 24, top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex', flexDirection: 'column',
            gap: 12, zIndex: 30,
          }}
        >
          {CHAPTERS.map((ch, i) => (
            <div
              key={i}
              id={`dot-${i}`}
              style={{
                width: 8, height: 8, borderRadius: '50%',
                background: ch.accent,
                transformOrigin: 'center',
              }}
            />
          ))}
        </div>

        {/* ── Chapter label (bottom-right) ── */}
        <div
          style={{
            position: 'absolute', bottom: 28, right: 32, zIndex: 30,
            color: 'rgba(255,255,255,0.15)', fontSize: 11,
            textTransform: 'uppercase', letterSpacing: '0.2em',
            fontFamily: SY, fontWeight: 600,
          }}
        >
          e-Khadi · The Story
        </div>

        {/* ── Scroll hint ── */}
        <div
          style={{
            position: 'absolute', bottom: 28, left: '50%',
            transform: 'translateX(-50%)',
            color: 'rgba(255,255,255,0.16)', fontSize: 10,
            textTransform: 'uppercase', letterSpacing: '0.2em',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          }}
        >
          <span>scroll to continue</span>
          <div style={{ width: 1, height: 26, background: 'rgba(255,255,255,0.12)' }} />
        </div>

        {/* ── Scenes (all stacked, GSAP toggles visibility) ── */}
        {CHAPTERS.map((ch) => (
          <ChapterScene key={ch.id} ch={ch} />
        ))}
      </div>
    </div>
  )
}

/* ─── Individual chapter scene ───────────────────────────────────────────── */
function ChapterScene({ ch }: { ch: typeof CHAPTERS[number] }) {
  return (
    <div
      id={ch.id}
      style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 max(40px, 6vw)',
        willChange: 'transform, opacity',
      }}
    >
      {/* Ambient radial glow */}
      <div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `radial-gradient(ellipse 55% 55% at 50% 50%, ${ch.accent}14 0%, transparent 70%)`,
        }}
      />

      {/* Ghost chapter watermark */}
      <div
        style={{
          position: 'absolute',
          fontFamily: SY, fontWeight: 900,
          fontSize: 'clamp(180px, 30vw, 400px)',
          color: `${ch.accent}07`,
          letterSpacing: '-0.06em',
          lineHeight: 1,
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          userSelect: 'none', pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {ch.num}
      </div>

      {/* Content grid */}
      <div
        className="max-w-6xl mx-auto w-full"
        style={{
          position: 'relative', zIndex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'clamp(32px, 5vw, 72px)',
          alignItems: 'center',
        }}
      >
        {/* ── Left: visual card ── */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: `1px solid ${ch.accent}30`,
              borderRadius: 28,
              padding: 'clamp(32px, 4vw, 48px) clamp(36px, 5vw, 56px)',
              backdropFilter: 'blur(24px)',
              boxShadow: `0 0 80px ${ch.accent}1a, inset 0 0 0 1px ${ch.accent}0c`,
              textAlign: 'center',
              minWidth: 200,
            }}
          >
            <div style={{ fontSize: 'clamp(44px, 6vw, 64px)', lineHeight: 1, marginBottom: 14 }}>
              {ch.icon}
            </div>
            <div
              style={{
                fontFamily: SY, fontWeight: 900,
                fontSize: 'clamp(2.6rem, 5.5vw, 5rem)',
                color: ch.accent,
                letterSpacing: '-0.05em', lineHeight: 1,
                marginBottom: 8,
              }}
            >
              {ch.bigNum}
            </div>
            <div
              style={{
                color: 'rgba(255,255,255,0.3)',
                fontSize: 11, textTransform: 'uppercase',
                letterSpacing: '0.2em', fontWeight: 600,
              }}
            >
              {ch.bigLabel}
            </div>
          </div>
        </div>

        {/* ── Right: text ── */}
        <div>
          {/* Chapter badge */}
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: `${ch.accent}12`,
              border: `1px solid ${ch.accent}28`,
              borderRadius: 9999, padding: '5px 14px',
              marginBottom: 24,
            }}
          >
            <span
              style={{
                width: 6, height: 6, borderRadius: '50%',
                background: ch.accent, display: 'block',
                boxShadow: `0 0 6px ${ch.accent}`,
              }}
            />
            <span
              style={{
                color: ch.accent, fontSize: 10,
                fontWeight: 700, letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              Chapter {ch.num} — {ch.label}
            </span>
          </div>

          {/* Headline */}
          <h2
            style={{
              fontFamily: SY, fontWeight: 800,
              fontSize: 'clamp(2rem, 3.8vw, 3.3rem)',
              color: '#fff', letterSpacing: '-0.04em',
              lineHeight: 1.1, marginBottom: 20,
              whiteSpace: 'pre-line',
            }}
          >
            {ch.headline}
          </h2>

          {/* Body */}
          <p
            style={{
              color: 'rgba(255,255,255,0.48)',
              fontSize: 'clamp(14px, 1.4vw, 16px)',
              lineHeight: 1.85, marginBottom: 30,
              maxWidth: 460,
            }}
          >
            {ch.body}
          </p>

          {/* Stat pill */}
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 14,
              background: `${ch.accent}0e`,
              border: `1px solid ${ch.accent}24`,
              borderRadius: 14, padding: '12px 18px',
            }}
          >
            <div
              style={{
                width: 3, alignSelf: 'stretch',
                background: ch.accent,
                borderRadius: 2, opacity: 0.7,
              }}
            />
            <div>
              <div
                style={{
                  fontFamily: SY, fontWeight: 900,
                  fontSize: 'clamp(18px, 2vw, 24px)',
                  color: ch.accent, lineHeight: 1,
                }}
              >
                {ch.stat.value}
              </div>
              <div
                style={{
                  color: 'rgba(255,255,255,0.38)',
                  fontSize: 12, marginTop: 3,
                }}
              >
                {ch.stat.detail}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}