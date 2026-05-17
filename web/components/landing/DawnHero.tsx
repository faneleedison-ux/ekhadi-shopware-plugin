'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import DawnPhoneHero from './DawnPhoneHero'
import DawnWire from './DawnWire'
import type { ActivityItem } from './ActivityFeedTicker'

export default function DawnHero({ items }: { items?: ActivityItem[] }) {
  const [revealed, setRevealed] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const reveal = () => {
    setRevealed(true)
    const v = videoRef.current
    if (v) { try { v.loop = true; v.currentTime = 0; v.play() } catch { /* ignore */ } }
  }

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    let timer: ReturnType<typeof setTimeout>
    const arm = () => {
      const d = isFinite(v.duration) && v.duration > 0 ? v.duration : 14
      clearTimeout(timer)
      timer = setTimeout(() => setRevealed(r => { if (!r) reveal(); return true }), Math.ceil(d * 1000) + 400)
    }
    if (v.readyState >= 1) arm()
    else v.addEventListener('loadedmetadata', arm, { once: true })
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className={'hero ' + (revealed ? 'is-revealed' : 'is-waiting')}>
      {/* Wire ticker pinned to top of video */}
      <DawnWire items={items} />

      <div className="hero-video-wrap">
        <video ref={videoRef} src="/hero-bg.mp4" autoPlay muted playsInline onEnded={reveal} />
        <div className="hero-dim" />
        <div className="hero-stars" />
        <div className="hero-grad" />
      </div>

      <div className="hero-wait-mark" aria-hidden="true">
        <span className="dot" />
        <span>Township rooftops · Dawn · Recorded in South Africa</span>
      </div>

      {revealed && <DawnPhoneHero />}

      <div className="hero-inner">
        <div className="hero-rule-top rise d0">
          <span>The Almanac</span>
          <span style={{ opacity: .4 }}>·</span>
          <span>South Africa</span>
          <span style={{ opacity: .4 }}>·</span>
          <span>Community Credit</span>
        </div>

        <h1 className="hero-headline">
          <span className="stack rise d1">Credit that works</span>
          <span className="stack rise d2">
            for{' '}
            <span className="you-wrap">
              <span className="you">you.</span>
              <svg className="underline-svg" viewBox="0 0 600 30" preserveAspectRatio="none">
                <path d="M 6 22 C 90 10, 230 4, 360 12 S 540 24, 594 16" />
              </svg>
            </span>
          </span>
        </h1>

        <p className="hero-sub rise d3">
          Fair micro-loans for South African households —<br />
          powered by community trust, not bank collateral.
        </p>

        <div className="hero-ctas rise d4">
          <Link href="/register">
            <button className="btn-dawn">
              <span>Register as Member</span>
              <span className="arr" />
            </button>
          </Link>
          <Link href="/register?role=SHOP">
            <button className="btn-outline-night">Register Your Shop</button>
          </Link>
        </div>

        <div className="hero-trust rise d5">
          <span>2% Flat Fee</span>
          <span>R1 000 Max Credit</span>
          <span>SASSA-Aligned</span>
        </div>
      </div>
    </section>
  )
}