'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const ITEMS = [
  {
    roman: 'I',   num: '01',
    corner: 'Trust',
    tag: '— Trust',
    title: 'Community-Powered',
    body: 'Based on stokvel trust, not bank collateral. Your neighbours vouch for you — the way it has always worked.',
  },
  {
    roman: 'II',  num: '02',
    corner: 'Pricing',
    tag: '— Pricing',
    title: 'Fair Pricing',
    body: 'R50 – R1 000 credit. A flat 2% service fee. No interest, no penalties, no surprises.',
  },
  {
    roman: 'III', num: '03',
    corner: 'Place',
    tag: '— Place',
    title: 'Local Impact',
    body: 'Spend at approved spaza shops in your area only. Every rand stays in your community.',
  },
]

export default function DawnWhy() {
  const sectionRef = useRef<HTMLElement>(null)
  const stackRef   = useRef<HTMLDivElement>(null)
  const cardRefs   = useRef<(HTMLDivElement | null)[]>([null, null, null])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const [c0, c1, c2] = cardRefs.current
      if (!c0 || !c1 || !c2) return

      const dx1 = c1.offsetLeft - c0.offsetLeft
      const dy1 = c1.offsetTop  - c0.offsetTop
      const dx2 = c2.offsetLeft - c0.offsetLeft
      const dy2 = c2.offsetTop  - c0.offsetTop

      gsap.set(c0, { zIndex: 3, rotation: -2,  scale: 1    })
      gsap.set(c1, { x: -dx1 + 10, y: -dy1 + 12, rotation:  4, scale: 0.97, zIndex: 2 })
      gsap.set(c2, { x: -dx2 + 20, y: -dy2 + 22, rotation:  9, scale: 0.94, zIndex: 1 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stackRef.current,
          start: 'top 62%',
          toggleActions: 'play none none reverse',
        },
      })

      tl.to(c0, { rotation: -5, duration: 0.9, ease: 'back.out(1.4)' }, 0)
      tl.to(c1, { x: 0, y: 0, rotation: 1, scale: 1, duration: 1.1, ease: 'back.out(1.9)' }, 0.9)
      tl.to(c2, { x: 0, y: 0, rotation: 5, scale: 1, duration: 1.1, ease: 'back.out(1.9)' }, 1.8)
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section className="day" id="why" ref={sectionRef}>
      <div className="dawn-container">
        <div className="sec-cap reveal">
          <span className="cap-num">§ 01</span>
          <span className="cap-tag">Why e-Khadi</span>
          <span className="cap-rule" />
          <span>03 Principles</span>
        </div>
        <h2 className="sec-heading reveal">
          Banking that puts <span className="acc">you</span> first.
        </h2>
      </div>

      <div className="dawn-container">
        <div className="how-stack-wrap" ref={stackRef}>
          {ITEMS.map((it, i) => (
            <div
              key={i}
              className="how-card"
              ref={el => { cardRefs.current[i] = el }}
            >
              <span className="how-corner">{it.corner}</span>

              <div className="how-step-badge">
                <span className="how-step-dot" />
                {it.tag}
              </div>

              <div className="how-roman">{it.roman}.</div>

              <h3 className="how-headline">{it.title}</h3>

              <p className="how-body">{it.body}</p>

              <div className="how-foot">
                <span className="how-foot-num">{it.num}</span>
                <span className="how-foot-rule" />
                <span className="how-foot-of">/ 03</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}