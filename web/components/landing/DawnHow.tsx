'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const STEPS = [
  {
    roman: 'I',   num: '01',
    tag:   'Step 01 — Onboarding',
    headline: 'Sign up & join a stokvel.',
    body: 'Sign up and join a local stokvel group. Your community is your guarantor — and your encouragement.',
    corner: 'Onboarding',
  },
  {
    roman: 'II',  num: '02',
    tag:   'Step 02 — Apply',
    headline: 'Apply for credit instantly.',
    body: 'Apply for essential-goods credit instantly — from your phone or at the spaza shop counter.',
    corner: 'Apply',
  },
  {
    roman: 'III', num: '03',
    tag:   'Step 03 — Settle',
    headline: 'Repaid on payday.',
    body: 'Automatic deduction on your next SASSA cycle. No collectors. No interest. No surprises.',
    corner: 'Settle',
  },
]

export default function DawnHow() {
  const sectionRef = useRef<HTMLElement>(null)
  const stackRef   = useRef<HTMLDivElement>(null)
  const cardRefs   = useRef<(HTMLDivElement | null)[]>([null, null, null])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const [c0, c1, c2] = cardRefs.current
      if (!c0 || !c1 || !c2) return

      /*
       * Measure each card's natural position relative to the flex container.
       * dx/dy give us exactly how far we need to translate cards 1 & 2
       * backwards to sit on top of card 0 — works for both desktop (row)
       * and mobile (column) layouts.
       */
      const dx1 = c1.offsetLeft - c0.offsetLeft
      const dy1 = c1.offsetTop  - c0.offsetTop
      const dx2 = c2.offsetLeft - c0.offsetLeft
      const dy2 = c2.offsetTop  - c0.offsetTop

      // Stack all cards behind card 0, deepening with each layer
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

      // Card 0: stays in place, just settles with its rotation
      tl.to(c0, { rotation: -5, duration: 0.9, ease: 'back.out(1.4)' }, 0)

      // Card 1: swipes out from the stack to its natural position
      tl.to(c1, {
        x: 0, y: 0, rotation: 1, scale: 1,
        duration: 1.1, ease: 'back.out(1.9)',
      }, 0.9)

      // Card 2: swipes out last, landing at the far end of the row
      tl.to(c2, {
        x: 0, y: 0, rotation: 5, scale: 1,
        duration: 1.1, ease: 'back.out(1.9)',
      }, 1.8)
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section className="day" id="how" ref={sectionRef}>
      <div className="dawn-container">
        <div className="sec-cap reveal">
          <span className="cap-num">§ 02</span>
          <span className="cap-tag">How it Works</span>
          <span className="cap-rule" />
          <span>03 Steps</span>
        </div>
        <h2 className="sec-heading reveal">
          Three steps to <span className="acc">credit</span>.
        </h2>
      </div>

      <div className="dawn-container">
        <div className="how-stack-wrap" ref={stackRef}>
          {STEPS.map((s, i) => (
            <div
              key={i}
              className="how-card"
              ref={el => { cardRefs.current[i] = el }}
            >
              <span className="how-corner">{s.corner}</span>

              {/* Step number badge */}
              <div className="how-step-badge">
                <span className="how-step-dot" />
                {s.tag}
              </div>

              {/* Big Roman numeral */}
              <div className="how-roman">{s.roman}.</div>

              <h3 className="how-headline"
                dangerouslySetInnerHTML={{
                  __html: s.headline.replace(/(credit|stokvel|payday)/i, '<em>$1</em>'),
                }}
              />

              <p className="how-body">{s.body}</p>

              {/* Bottom rule with step number */}
              <div className="how-foot">
                <span className="how-foot-num">{s.num}</span>
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