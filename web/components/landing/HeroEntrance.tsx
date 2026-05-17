'use client'

/**
 * Mounts invisibly, runs a one-shot GSAP entrance sequence on the hero text
 * elements (targeted by ID) the moment the page paints.
 */

import { useEffect } from 'react'
import gsap from 'gsap'

export default function HeroEntrance() {
  useEffect(() => {
    // Immediate set so elements start invisible before first-visible-frame
    gsap.set(
      ['#hero-badge', '#hero-h1', '#hero-sub', '#hero-btns', '#hero-trust'],
      { opacity: 0, y: 32 },
    )

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.to('#hero-badge', { opacity: 1, y: 0, duration: 0.7 }, 0.1)
      .to('#hero-h1',    { opacity: 1, y: 0, duration: 0.85 }, 0.22)
      .to('#hero-sub',   { opacity: 1, y: 0, duration: 0.75 }, 0.4)
      .to('#hero-btns',  { opacity: 1, y: 0, duration: 0.65 }, 0.55)
      .to('#hero-trust', { opacity: 1, y: 0, duration: 0.55 }, 0.7)

    return () => { tl.kill() }
  }, [])

  return null
}