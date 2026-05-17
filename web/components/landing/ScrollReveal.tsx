'use client'

import { useEffect, useRef, ReactNode } from 'react'

interface Props {
  children: ReactNode
  delay?: number
  className?: string
  stagger?: boolean
  staggerDelay?: number
}

export default function ScrollReveal({
  children,
  delay = 0,
  className = '',
  stagger = false,
  staggerDelay = 90,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (stagger) {
      const kids = Array.from(el.children) as HTMLElement[]
      kids.forEach((child, i) => {
        child.style.opacity = '0'
        child.style.transform = 'translateY(36px) scale(0.98)'
        child.style.transition = `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${i * staggerDelay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${i * staggerDelay}ms`
      })

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            kids.forEach((child) => {
              child.style.opacity = '1'
              child.style.transform = 'translateY(0) scale(1)'
            })
            observer.unobserve(el)
          }
        },
        { threshold: 0.07, rootMargin: '0px 0px -40px 0px' }
      )
      observer.observe(el)
      return () => observer.disconnect()
    }

    // Single-element reveal
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in-view')
          observer.unobserve(el)
        }
      },
      { threshold: 0.07, rootMargin: '0px 0px -50px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [stagger, staggerDelay])

  return (
    <div
      ref={ref}
      className={stagger ? className : `reveal ${className}`}
      style={stagger ? undefined : { transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
