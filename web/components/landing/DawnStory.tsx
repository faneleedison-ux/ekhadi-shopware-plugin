'use client'

import { useEffect, useRef, useState } from 'react'

const CHAPTERS = [
  {
    roman: 'I',   num: '01', label: 'The Gap',      tag: 'Chapter 01',
    fig: '17',    unit: 'M', sym: '',
    figLbl: 'SASSA Families',
    h: 'End of month. Empty cupboards.',
    body: '17 million South African families face the same cruel gap — the grant arrives, but the month doesn\'t end. Food runs short. Dignity takes a hit.',
    statPre: 'Stat.', stat: '73% run short', statTail: 'before the next grant cycle.',
    bg: '#F2E9D6', glow: 'rgba(176,90,80,.18)', cardGlow: 'rgba(176,90,80,.18)', c: '#A23E2E',
  },
  {
    roman: 'II',  num: '02', label: 'Ubuntu',       tag: 'Chapter 02',
    fig: '89',    unit: 'K', sym: '',
    figLbl: 'Active Stokvels',
    h: 'Your community has your back.',
    body: 'Stokvels have pooled community trust for generations. e-Khadi digitises that Ubuntu spirit — turning your neighbours\' vouching into instant, fair credit.',
    statPre: 'Stat.', stat: 'R1 000 maximum credit', statTail: 'available to every member.',
    bg: '#EFDFC4', glow: 'rgba(225,29,42,.24)', cardGlow: 'rgba(225,29,42,.22)', c: '#E11D2A',
  },
  {
    roman: 'III', num: '03', label: 'The Approval', tag: 'Chapter 03',
    fig: '60',    unit: 's', sym: '',
    figLbl: 'Approval Time',
    h: 'Credit in your hand in 60 seconds.',
    body: 'No bank branch. No forms. No judgment. Apply on your phone or at the spaza shop. Your stokvel vouches for you. Credit is yours.',
    statPre: 'Stat.', stat: '2% flat service fee', statTail: 'with zero hidden costs.',
    bg: '#EBD7B0', glow: 'rgba(207,142,46,.28)', cardGlow: 'rgba(207,142,46,.22)', c: '#B47023',
  },
  {
    roman: 'IV',  num: '04', label: 'Freedom',      tag: 'Chapter 04',
    fig: '923',   unit: 'M', sym: 'R',
    figLbl: 'Credit Issued',
    h: 'Repaid automatically. No stress. Ever.',
    body: 'Next SASSA payday, it\'s settled automatically. No collectors. No shame. Just full cupboards, family dignity, and a community that rises together.',
    statPre: 'Stat.', stat: '1.8M families empowered', statTail: 'nationwide and counting.',
    bg: '#E6D8B6', glow: 'rgba(74,124,89,.24)', cardGlow: 'rgba(74,124,89,.18)', c: '#3F7B4F',
  },
]

export default function DawnStory() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const w = wrapRef.current
      if (!w) return
      const rect = w.getBoundingClientRect()
      const total = w.scrollHeight - window.innerHeight
      const passed = Math.min(Math.max(-rect.top, 0), total)
      const p = total > 0 ? passed / total : 0
      setActive(Math.min(CHAPTERS.length - 1, Math.floor(p * CHAPTERS.length * 0.999)))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const ch = CHAPTERS[active]

  return (
    <div className="story-wrap" id="story" ref={wrapRef}>
      <div
        className="story-sticky"
        style={{
          '--story-bg':        ch.bg,
          '--story-glow':      ch.glow,
          '--story-card-glow': ch.cardGlow,
          '--story-c':         ch.c,
        } as React.CSSProperties}
      >
        {/* Progress rail */}
        <div className="story-rail">
          {CHAPTERS.map((c, i) => (
            <div key={i} className={'rail-step ' + (i === active ? 'active' : i < active ? 'done' : '')}>
              <span className="tick" />
              <span>{c.num}</span>
              {i === active && <span style={{ opacity: .6, marginLeft: 6 }}>{c.label}</span>}
            </div>
          ))}
        </div>

        <div className="story-inner">
          {/* Left: visual card */}
          <div className="story-numeral">
            <div className="stage">
              <span className="stage-corner">Fig. {ch.num}</span>
              <span className="stage-corner tr">{ch.label}</span>
              <span className="stage-corner bl">e-Khadi</span>
              <span className="stage-corner br">South Africa</span>
              <div className="num-track">
                {CHAPTERS.map((c, i) => (
                  <div key={i} className={'num-slide ' + (i === active ? 'active' : '')}>
                    <div className="figure">
                      {c.sym && <span className="sym">{c.sym}</span>}
                      <span>{c.fig}</span>
                      {c.unit && <span className="unit">{c.unit}</span>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="stage-lbl">{ch.figLbl}</div>
            </div>
          </div>

          {/* Right: text */}
          <div className="story-text">
            <div className="ch-meta"><span>{ch.tag}</span><span>—</span><span>{ch.label}</span></div>
            <h2 key={'h' + active}>{ch.h}</h2>
            <p key={'p' + active}>{ch.body}</p>
            <div className="stat-strip">
              <span className="pre">{ch.statPre}</span>
              <span className="body"><em>{ch.stat}</em> {ch.statTail}</span>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="story-cue">
          <span>{String(active + 1).padStart(2, '0')} / 04</span>
          <div className="line" />
          <span>Scroll to continue</span>
        </div>
      </div>
    </div>
  )
}