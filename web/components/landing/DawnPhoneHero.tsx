'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function DawnPhoneHero() {
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

      gsap.set(phoneRef.current, { transformPerspective: 1100 })

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

    const onMove = (e: MouseEvent) => {
      if (!containerRef.current || !phoneRef.current || !isHovered.current) return
      const { left, top, width, height } = containerRef.current.getBoundingClientRect()
      const nx = (e.clientX - left - width  / 2) / (width  / 2)
      const ny = (e.clientY - top  - height / 2) / (height / 2)
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
    <div ref={containerRef} className="dph-container">

      {/* Credit Score chip */}
      <div ref={chip1Ref} className="dph-chip dph-chip-1">
        <p className="dph-chip-lbl">Credit Score</p>
        <p className="dph-chip-val"><span className="dph-star">★</span> 92 / 100</p>
      </div>

      {/* Next Payday chip */}
      <div ref={chip2Ref} className="dph-chip dph-chip-2">
        <p className="dph-chip-lbl">Next Payday</p>
        <p className="dph-chip-val dph-amber">5 Days</p>
      </div>

      {/* Last Repaid chip */}
      <div ref={chip3Ref} className="dph-chip dph-chip-3">
        <p className="dph-chip-lbl">Last Repaid</p>
        <p className="dph-chip-val dph-green">+R750 ✓</p>
      </div>

      {/* Phone body (GSAP rotates this) */}
      <div ref={phoneRef} className="dph-phone">

        {/* Orbit rings */}
        <div className="dph-ring dph-ring-inner" />
        <div className="dph-ring dph-ring-outer" />

        {/* Radial glow */}
        <div className="dph-glow" />

        {/* Shell */}
        <div className="dph-shell">

          {/* Notch */}
          <div className="dph-notch">
            <div className="dph-notch-pill" />
          </div>

          <div className="dph-screen">

            {/* Balance card */}
            <div className="dph-balance-card">
              <div className="dph-balance-orb" />
              <p className="dph-bal-label">Available Credit</p>
              <p className="dph-bal-amount">R 750.00</p>
              <div className="dph-bal-foot">
                <div>
                  <p className="dph-meta-label">Member</p>
                  <p className="dph-meta-val">Nomsa D.</p>
                </div>
                <div className="dph-meta-right">
                  <p className="dph-meta-label">Group</p>
                  <p className="dph-meta-val">Umlazi</p>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="dph-actions">
              {['Credit', 'Wallet', 'Group'].map((a) => (
                <div key={a} className="dph-action">
                  <p className="dph-action-icon">◈</p>
                  <span className="dph-action-label">{a}</span>
                </div>
              ))}
            </div>

            {/* Transactions */}
            <p className="dph-tx-heading">Recent</p>
            {[
              { label: 'Food & Grocery',  amount: '-R120', pos: false },
              { label: 'Credit Received', amount: '+R750', pos: true  },
              { label: 'Toiletries',      amount: '-R80',  pos: false },
            ].map((tx, i) => (
              <div key={i} className={'dph-tx' + (i < 2 ? ' dph-tx-sep' : '')}>
                <div className="dph-tx-left">
                  <div className={'dph-tx-dot' + (tx.pos ? ' pos' : ' neg')} />
                  <p className="dph-tx-label">{tx.label}</p>
                </div>
                <span className={'dph-tx-amount' + (tx.pos ? ' pos' : ' neg')}>{tx.amount}</span>
              </div>
            ))}

          </div>
        </div>
      </div>
    </div>
  )
}
