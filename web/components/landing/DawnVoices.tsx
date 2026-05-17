'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

/* ── Portrait illustrations ── */

function NomsakPortrait() {
  return (
    <svg viewBox="0 0 60 60" width="56" height="56" aria-label="Nomsa T.">
      <defs><clipPath id="cp-nt"><circle cx="30" cy="30" r="30"/></clipPath></defs>
      <g clipPath="url(#cp-nt)">
        <rect width="60" height="60" fill="#C8925A"/>
        <path d="M -4 65 L 2 46 L 20 40 L 40 40 L 58 46 L 64 65 Z" fill="#4A1520"/>
        <rect x="26" y="49" width="8" height="11" rx="2" fill="#6B3D22"/>
        <ellipse cx="30" cy="32" rx="14" ry="17" fill="#6B3D22"/>
        <ellipse cx="16" cy="33" rx="3" ry="3.5" fill="#6B3D22"/>
        <ellipse cx="44" cy="33" rx="3" ry="3.5" fill="#6B3D22"/>
        <circle cx="44" cy="36" r="1.4" fill="#D4A840" opacity="0.9"/>
        {/* doek / head wrap */}
        <ellipse cx="30" cy="17" rx="16" ry="13" fill="#B83820"/>
        <path d="M 14 24 Q 30 12 46 24 L 44 21 Q 30 10 16 21 Z" fill="#962E18"/>
        <ellipse cx="43" cy="14" rx="5" ry="7" fill="#B83820"/>
        <ellipse cx="43" cy="13" rx="4" ry="5.5" fill="#C84028"/>
        {/* eyes */}
        <ellipse cx="23" cy="29" rx="3.8" ry="2.8" fill="#F5E4D4"/>
        <circle cx="23" cy="29" r="1.9" fill="#250E04"/>
        <circle cx="23.8" cy="28.3" r="0.65" fill="#fff" opacity="0.75"/>
        <ellipse cx="37" cy="29" rx="3.8" ry="2.8" fill="#F5E4D4"/>
        <circle cx="37" cy="29" r="1.9" fill="#250E04"/>
        <circle cx="37.8" cy="28.3" r="0.65" fill="#fff" opacity="0.75"/>
        {/* greying eyebrows */}
        <path d="M 19 25.5 Q 23 24 27 25" stroke="#8A7060" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
        <path d="M 33 25 Q 37 24 41 25.5" stroke="#8A7060" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
        {/* age lines */}
        <path d="M 17 33 Q 19 35 18 38" stroke="#5A2E18" strokeWidth="0.7" fill="none" opacity="0.4"/>
        <path d="M 43 33 Q 41 35 42 38" stroke="#5A2E18" strokeWidth="0.7" fill="none" opacity="0.4"/>
        {/* nose */}
        <path d="M 30 33 L 28 37.5 Q 30 38.5 32 37.5 L 30 33" stroke="#5A2E18" strokeWidth="0.9" fill="none"/>
        {/* warm smile */}
        <path d="M 22 41 Q 30 47 38 41" stroke="#5A2E18" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        <path d="M 24 41.5 Q 30 45 36 41.5 Z" fill="#fff" opacity="0.85"/>
      </g>
      <circle cx="30" cy="30" r="29" fill="none" stroke="rgba(20,19,14,0.12)" strokeWidth="1.2"/>
    </svg>
  )
}

function SiphoPortrait() {
  return (
    <svg viewBox="0 0 60 60" width="56" height="56" aria-label="Sipho M.">
      <defs><clipPath id="cp-sm"><circle cx="30" cy="30" r="30"/></clipPath></defs>
      <g clipPath="url(#cp-sm)">
        <rect width="60" height="60" fill="#2A4A6A"/>
        <path d="M -4 65 L 3 46 L 18 39 L 42 39 L 57 46 L 64 65 Z" fill="#1A2E44"/>
        <path d="M 25 42 L 30 46 L 35 42" stroke="#2A4060" strokeWidth="1" fill="none"/>
        <rect x="26" y="48" width="8" height="12" rx="2" fill="#3A1E0A"/>
        <ellipse cx="30" cy="32" rx="14" ry="17" fill="#3A1E0A"/>
        <ellipse cx="16" cy="33" rx="3" ry="3.5" fill="#3A1E0A"/>
        <ellipse cx="44" cy="33" rx="3" ry="3.5" fill="#3A1E0A"/>
        {/* short natural coils */}
        <ellipse cx="30" cy="16" rx="15" ry="10" fill="#200E04"/>
        <path d="M 15 20 Q 16 14 20 12 Q 30 9 40 12 Q 44 14 45 20" fill="#200E04"/>
        <path d="M 20 17 Q 22 15 24 17" stroke="#150A04" strokeWidth="0.8" fill="none"/>
        <path d="M 28 14 Q 30 12 32 14" stroke="#150A04" strokeWidth="0.8" fill="none"/>
        <path d="M 36 17 Q 38 15 40 17" stroke="#150A04" strokeWidth="0.8" fill="none"/>
        {/* eyes */}
        <ellipse cx="23" cy="29" rx="4" ry="2.8" fill="#F0DEC8"/>
        <circle cx="23" cy="29" r="2" fill="#1A0A04"/>
        <circle cx="23.8" cy="28.2" r="0.7" fill="#fff" opacity="0.8"/>
        <ellipse cx="37" cy="29" rx="4" ry="2.8" fill="#F0DEC8"/>
        <circle cx="37" cy="29" r="2" fill="#1A0A04"/>
        <circle cx="37.8" cy="28.2" r="0.7" fill="#fff" opacity="0.8"/>
        <path d="M 18.5 25 Q 23 23.5 27 24.5" stroke="#180A04" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        <path d="M 33 24.5 Q 37 23.5 41.5 25" stroke="#180A04" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        <path d="M 30 33 L 27.5 38 Q 30 39.5 32.5 38 L 30 33" stroke="#2A1004" strokeWidth="1" fill="none"/>
        <circle cx="27" cy="38" r="1.2" fill="#2A1004" opacity="0.25"/>
        <circle cx="33" cy="38" r="1.2" fill="#2A1004" opacity="0.25"/>
        <path d="M 21 42 Q 30 49 39 42" stroke="#2A1004" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M 23 42.5 Q 30 47 37 42.5 Z" fill="#fff" opacity="0.9"/>
      </g>
      <circle cx="30" cy="30" r="29" fill="none" stroke="rgba(20,19,14,0.12)" strokeWidth="1.2"/>
    </svg>
  )
}

function FatimaPortrait() {
  return (
    <svg viewBox="0 0 60 60" width="56" height="56" aria-label="Fatima D.">
      <defs><clipPath id="cp-fd"><circle cx="30" cy="30" r="30"/></clipPath></defs>
      <g clipPath="url(#cp-fd)">
        <rect width="60" height="60" fill="#5A8A6A"/>
        <path d="M -4 65 L 2 48 L 20 42 L 40 42 L 58 48 L 64 65 Z" fill="#2E6A5A"/>
        {/* hijab drape */}
        <path d="M 8 32 Q 10 55 30 58 Q 50 55 52 32 Q 44 62 30 62 Q 16 62 8 32 Z" fill="#3A7A6A"/>
        <rect x="26" y="49" width="8" height="10" rx="2" fill="#A07448"/>
        <ellipse cx="30" cy="26" rx="20" ry="22" fill="#3A7A6A"/>
        <path d="M 10 30 Q 14 18 30 16 Q 46 18 50 30 L 48 34 Q 44 22 30 20 Q 16 22 12 34 Z" fill="#4A8A7A"/>
        <ellipse cx="30" cy="32" rx="13" ry="15" fill="#A07448"/>
        {/* eyes */}
        <ellipse cx="23.5" cy="28" rx="4" ry="3" fill="#F8EAD8"/>
        <circle cx="23.5" cy="28" r="2.1" fill="#3A1A08"/>
        <circle cx="24.4" cy="27.2" r="0.7" fill="#fff" opacity="0.85"/>
        <ellipse cx="36.5" cy="28" rx="4" ry="3" fill="#F8EAD8"/>
        <circle cx="36.5" cy="28" r="2.1" fill="#3A1A08"/>
        <circle cx="37.4" cy="27.2" r="0.7" fill="#fff" opacity="0.85"/>
        {/* lashes */}
        <path d="M 19.5 26 Q 20 24.5 21.5 25.5" stroke="#2A1008" strokeWidth="0.7" fill="none"/>
        <path d="M 27 25.5 Q 28.5 24.5 29 26" stroke="#2A1008" strokeWidth="0.7" fill="none"/>
        <path d="M 33 25.5 Q 33.5 24.5 35 25.5" stroke="#2A1008" strokeWidth="0.7" fill="none"/>
        <path d="M 40 26 Q 41.5 24.8 42 26.2" stroke="#2A1008" strokeWidth="0.7" fill="none"/>
        <path d="M 19.5 24 Q 23.5 22.5 27.5 23.5" stroke="#2A1008" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        <path d="M 32.5 23.5 Q 36.5 22.5 40.5 24" stroke="#2A1008" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        <path d="M 30 31 L 28.5 35 Q 30 36 31.5 35 L 30 31" stroke="#8A5C30" strokeWidth="0.9" fill="none"/>
        <path d="M 23 38 Q 30 44 37 38" stroke="#8A5C30" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
        <path d="M 25 38.5 Q 30 42.5 35 38.5 Z" fill="#fff" opacity="0.7"/>
      </g>
      <circle cx="30" cy="30" r="29" fill="none" stroke="rgba(20,19,14,0.12)" strokeWidth="1.2"/>
    </svg>
  )
}

function ThandiPortrait() {
  return (
    <svg viewBox="0 0 60 60" width="56" height="56" aria-label="Thandi K.">
      <defs><clipPath id="cp-tk"><circle cx="30" cy="30" r="30"/></clipPath></defs>
      <g clipPath="url(#cp-tk)">
        <rect width="60" height="60" fill="#C26840"/>
        <path d="M -4 65 L 2 47 L 20 41 L 40 41 L 58 47 L 64 65 Z" fill="#1A1408"/>
        <rect x="26" y="49" width="8" height="12" rx="2" fill="#5C2E18"/>
        {/* large natural afro */}
        <ellipse cx="30" cy="14" rx="19" ry="16" fill="#1A0A04"/>
        <ellipse cx="13" cy="22" rx="8" ry="14" fill="#1A0A04"/>
        <ellipse cx="47" cy="22" rx="8" ry="14" fill="#1A0A04"/>
        <ellipse cx="22" cy="9" rx="6" ry="5" fill="#250E06"/>
        <ellipse cx="30" cy="7" rx="6" ry="5" fill="#250E06"/>
        <ellipse cx="38" cy="9" rx="6" ry="5" fill="#250E06"/>
        <ellipse cx="30" cy="33" rx="14" ry="17" fill="#5C2E18"/>
        <ellipse cx="16" cy="34" rx="3" ry="3.5" fill="#5C2E18"/>
        <ellipse cx="44" cy="34" rx="3" ry="3.5" fill="#5C2E18"/>
        {/* gold hoop earrings */}
        <circle cx="16" cy="36" r="2.2" fill="none" stroke="#D4A030" strokeWidth="1.2"/>
        <circle cx="44" cy="36" r="2.2" fill="none" stroke="#D4A030" strokeWidth="1.2"/>
        {/* eyes */}
        <ellipse cx="23" cy="30" rx="4" ry="3" fill="#F2E0C8"/>
        <circle cx="23" cy="30" r="2" fill="#200E04"/>
        <circle cx="23.8" cy="29.2" r="0.7" fill="#fff" opacity="0.8"/>
        <ellipse cx="37" cy="30" rx="4" ry="3" fill="#F2E0C8"/>
        <circle cx="37" cy="30" r="2" fill="#200E04"/>
        <circle cx="37.8" cy="29.2" r="0.7" fill="#fff" opacity="0.8"/>
        <path d="M 18.5 26 Q 23 24.5 27 25.5" stroke="#1A0A04" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M 33 25.5 Q 37 24.5 41.5 26" stroke="#1A0A04" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M 30 34 L 27.5 38.5 Q 30 39.5 32.5 38.5 L 30 34" stroke="#4A2010" strokeWidth="1" fill="none"/>
        <circle cx="27.2" cy="38.8" r="1.3" fill="#4A2010" opacity="0.25"/>
        <circle cx="32.8" cy="38.8" r="1.3" fill="#4A2010" opacity="0.25"/>
        <path d="M 21 43 Q 30 50 39 43" stroke="#4A2010" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M 23 43.5 Q 30 48 37 43.5 Z" fill="#fff" opacity="0.92"/>
      </g>
      <circle cx="30" cy="30" r="29" fill="none" stroke="rgba(20,19,14,0.12)" strokeWidth="1.2"/>
    </svg>
  )
}

/* ── Data ── */

const QUOTES = [
  { q: 'e-Khadi helped me buy food for my kids at the end of the month. Paid it back with my SASSA grant. No stress.',  n: 'Nomsa T.',  p: 'Umlazi · KwaZulu-Natal',   Portrait: NomsakPortrait },
  { q: 'As a spaza shop owner, e-Khadi customers mean guaranteed sales. The QR system is dead simple.',                  n: 'Sipho M.',  p: 'Alexandra · Gauteng',        Portrait: SiphoPortrait  },
  { q: 'I was scared to borrow before. But this is my stokvel — people I trust. It felt safe.',                          n: 'Fatima D.', p: 'Khayelitsha · Western Cape', Portrait: FatimaPortrait },
  { q: 'The 2% fee is nothing compared to loan sharks. e-Khadi changed how I manage month-end completely.',              n: 'Thandi K.', p: 'Soweto · Gauteng',           Portrait: ThandiPortrait },
]

type Phase = 'idle' | 'out-r' | 'out-l' | 'in-r' | 'in-l'

/* ── Component ── */

export default function DawnVoices() {
  const [idx,   setIdx]   = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')
  const t1 = useRef<ReturnType<typeof setTimeout>>()
  const t2 = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => () => { clearTimeout(t1.current); clearTimeout(t2.current) }, [])

  const go = useCallback((dir: 1 | -1) => {
    if (phase !== 'idle') return
    const outPhase:   Phase = dir > 0 ? 'out-r' : 'out-l'
    const enterPhase: Phase = dir > 0 ? 'in-r'  : 'in-l'
    setPhase(outPhase)
    t1.current = setTimeout(() => {
      setIdx(i => (i + dir + QUOTES.length) % QUOTES.length)
      setPhase(enterPhase)
      // double rAF: wait for browser to paint the off-screen position before animating in
      requestAnimationFrame(() => requestAnimationFrame(() => setPhase('idle')))
    }, 300)
  }, [phase])

  const q = QUOTES[idx]

  return (
    <section className="day" id="voices">
      <div className="dawn-container">
        <div className="sec-cap reveal">
          <span className="cap-num">§ 04</span>
          <span className="cap-tag">Community Voices</span>
          <span className="cap-rule" />
          <span>04 Testimonies</span>
        </div>
        <h2 className="sec-heading reveal">
          In their <span className="acc">own words.</span>
        </h2>
      </div>

      <div className="dawn-container">
        <div className="nb-outer reveal">
          {/* Stacked page depth */}
          <div className="nb-back-2" aria-hidden />
          <div className="nb-back-1" aria-hidden />

          {/* Main notebook */}
          <div className="notebook">

            {/* Spiral binding */}
            <div className="nb-binding" aria-hidden>
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="nb-ring">
                  <div className="nb-ring-in" />
                </div>
              ))}
            </div>

            {/* Page */}
            <div className="nb-page-wrap">
              <div className={`nb-page nb-page--${phase}`}>

                {/* Ruled lines */}
                <div className="nb-rules" aria-hidden>
                  {Array.from({ length: 11 }).map((_, i) => <div key={i} className="nb-rule" />)}
                </div>

                {/* Top bar */}
                <div className="nb-head">
                  <span className="nb-title">e-Khadi · Community Voices</span>
                  <span className="nb-pg">{String(idx + 1).padStart(2, '0')} / {String(QUOTES.length).padStart(2, '0')}</span>
                </div>

                {/* Opening quote glyph */}
                <div className="nb-open-q" aria-hidden>&ldquo;</div>

                {/* Quote */}
                <blockquote className="nb-quote">{q.q}</blockquote>

                {/* Attribution */}
                <div className="nb-attr">
                  <div className="nb-portrait"><q.Portrait /></div>
                  <div className="nb-bio">
                    <div className="nb-name">{q.n}</div>
                    <div className="nb-place">{q.p}</div>
                    <div className="nb-stars">★★★★★</div>
                  </div>
                </div>

                {/* Nav embedded inside the book */}
                <div className="nb-foot">
                  <button className="nb-btn" onClick={() => go(-1)} aria-label="Previous">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M 15 5 L 8 12 L 15 19" />
                    </svg>
                  </button>
                  <div className="nb-dots">
                    {QUOTES.map((_, i) => (
                      <button
                        key={i}
                        className={'nb-dot' + (i === idx ? ' on' : '')}
                        onClick={() => go(i > idx ? 1 : -1)}
                        aria-label={`Go to testimonial ${i + 1}`}
                      />
                    ))}
                  </div>
                  <button className="nb-btn" onClick={() => go(1)} aria-label="Next">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M 9 5 L 16 12 L 9 19" />
                    </svg>
                  </button>
                </div>

                {/* Red margin line */}
                <div className="nb-margin" aria-hidden />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}