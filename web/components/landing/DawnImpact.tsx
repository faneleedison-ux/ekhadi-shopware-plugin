'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function useCountUp(target: number, run: boolean, dur = 2400, delay = 0) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!run) return
    let raf: number
    const t = setTimeout(() => {
      const start = performance.now()
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / dur)
        setV(Math.round(target * (1 - Math.pow(1 - p, 3))))
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }, delay)
    return () => { clearTimeout(t); cancelAnimationFrame(raf) }
  }, [target, run, dur, delay])
  return v
}

function StatNode({
  corner, lead, label, target, active, fmtFn, delay,
}: {
  corner: string; lead: string; label: string
  target: number; active: boolean; delay: number
  fmtFn: (n: number) => React.ReactNode
}) {
  const v = useCountUp(target, active, 2400, delay)
  return (
    <div className="imp-node">
      <div className={'imp-dot' + (active ? ' on' : '')} />
      <div className="imp-content">
        <div className="imp-tag">
          <span className="imp-corner">{corner}</span>
          <span className="imp-lead">{lead}</span>
        </div>
        <div className="imp-figure">{fmtFn(v)}</div>
        <div className="imp-label">{label}</div>
      </div>
    </div>
  )
}

export default function DawnImpact({
  familiesHelped,
  totalCreditIssued,
  activeGroups,
}: {
  familiesHelped: number
  totalCreditIssued: number
  activeGroups: number
}) {
  const sectionRef = useRef<HTMLElement>(null)
  const lineRef    = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(-1)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 65%',
            end: 'bottom 55%',
            scrub: 1.2,
            onUpdate(self) {
              const p = self.progress
              if (p >= 0.08) setActiveIdx(i => Math.max(i, 0))
              if (p >= 0.44) setActiveIdx(i => Math.max(i, 1))
              if (p >= 0.80) setActiveIdx(i => Math.max(i, 2))
            },
          },
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const fmtN = (n: number) => n.toLocaleString('en-ZA')
  const fmtR = (n: number) => <><span className="imp-sym">R</span>{n.toLocaleString('en-ZA')}</>

  return (
    <section className="day" id="impact" ref={sectionRef}>
      <div className="dawn-container">
        <div className="sec-cap reveal">
          <span className="cap-num">§ 03</span>
          <span className="cap-tag">Live Impact</span>
          <span className="cap-rule" />
          <span>Updated live</span>
        </div>
        <h2 className="sec-heading reveal">
          Real numbers. <span className="acc">Real people.</span>
        </h2>
      </div>

      <div className="dawn-container">
        <div className="imp-tl reveal">

          {/* Spine */}
          <div className="imp-spine">
            <div className="imp-spine-track" />
            <div className="imp-spine-fill" ref={lineRef} />
          </div>

          {/* Nodes */}
          <div className="imp-nodes">
            <StatNode
              corner="Members"   lead="As of today"
              label="Families helped to date"
              target={familiesHelped}    active={activeIdx >= 0} fmtFn={fmtN} delay={0}
            />
            <StatNode
              corner="Disbursed" lead="As of today"
              label="Total credit issued nationwide"
              target={totalCreditIssued} active={activeIdx >= 1} fmtFn={fmtR} delay={200}
            />
            <StatNode
              corner="Network"   lead="As of today"
              label="Active stokvel groups"
              target={activeGroups}      active={activeIdx >= 2} fmtFn={fmtN} delay={400}
            />
          </div>
        </div>
      </div>
    </section>
  )
}