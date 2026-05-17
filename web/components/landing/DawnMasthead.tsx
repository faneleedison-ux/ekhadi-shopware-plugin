'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function DawnMasthead() {
  const [day, setDay] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const hero = document.querySelector('.hero')
      if (!hero) return
      setDay(hero.getBoundingClientRect().bottom < 80)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={'masthead ' + (day ? 'is-day' : '')}>
      <div className="mast-left">
        <span>Vol. I</span><span className="mast-sep">·</span>
        <span>No. 01</span><span className="mast-sep">·</span>
        <span>Dawn Edition</span><span className="mast-sep">·</span>
        <a href="#why" className="mast-nav-link">Why</a>
        <span className="mast-sep">·</span>
        <a href="#story" className="mast-nav-link">Story</a>
        <span className="mast-sep">·</span>
        <a href="#how" className="mast-nav-link">How</a>
        <span className="mast-sep">·</span>
        <a href="#impact" className="mast-nav-link">Impact</a>
      </div>
      <div className="mast-mark">e-Khadi</div>
      <div className="mast-right">
        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.14em' }}>May 2026</span>
        <Link href="/login">
          <button className="btn-mini">Sign in</button>
        </Link>
        <Link href="/register">
          <button className="btn-mini dawn">Register →</button>
        </Link>
      </div>
    </header>
  )
}