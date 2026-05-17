'use client'

import { useEffect } from 'react'

export default function DawnReveal() {
  useEffect(() => {
    // Wait one frame so all SSR-hydrated elements are laid out before observing
    const raf = requestAnimationFrame(() => {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              e.target.classList.add('in')
              io.unobserve(e.target) // stop watching once revealed
            }
          })
        },
        {
          threshold: 0,
          rootMargin: '0px 0px -40px 0px', // trigger 40px before element reaches bottom of viewport
        }
      )
      document.querySelectorAll('.dawn-page .reveal').forEach(el => io.observe(el))
      // Store on window so we can disconnect on unmount
      ;(window as Window & { _dawnRevealIO?: IntersectionObserver })._dawnRevealIO = io
    })
    return () => {
      cancelAnimationFrame(raf)
      ;(window as Window & { _dawnRevealIO?: IntersectionObserver })._dawnRevealIO?.disconnect()
    }
  }, [])
  return null
}