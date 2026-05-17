'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const SY = 'var(--font-outfit), sans-serif'
const BLUE = '#1877F2'

export default function LandingNav() {
  const [open, setOpen]       = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: scrolled ? 'rgba(6,12,30,0.97)' : 'rgba(6,12,30,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(24,119,242,0.15)',
        transition: 'background 0.3s',
      }}>
        <div className="max-w-6xl mx-auto px-5" style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ position: 'relative', width: 38, height: 38 }}>
              <div className="animate-spin-slow" style={{
                position: 'absolute', inset: -5,
                border: '1.5px solid transparent',
                borderTopColor: BLUE,
                borderRightColor: 'rgba(24,119,242,0.3)',
                borderRadius: '50%',
              }} />
              <div style={{
                width: 38, height: 38,
                background: 'linear-gradient(135deg, #1877F2, #0f4fa8)',
                borderRadius: 11,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 18px rgba(24,119,242,0.5)',
              }}>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: 13, fontFamily: SY }}>eK</span>
              </div>
            </div>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 17, letterSpacing: '-0.03em', fontFamily: SY }}>
              e-Khadi
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex" style={{ gap: 8, alignItems: 'center' }}>
            <Link href="/login">
              <button style={{
                background: 'transparent', border: 'none',
                color: 'rgba(255,255,255,0.6)',
                padding: '8px 14px', borderRadius: 8,
                cursor: 'pointer', fontSize: 14, fontWeight: 600,
              }}>Sign In</button>
            </Link>
            <Link href="/register">
              <button style={{
                background: 'linear-gradient(135deg, #1877F2, #0f4fa8)',
                border: 'none', color: '#fff',
                padding: '9px 20px', borderRadius: 9999,
                cursor: 'pointer', fontSize: 14, fontWeight: 700,
                boxShadow: '0 0 20px rgba(24,119,242,0.45)',
                fontFamily: SY,
              }}>Get Started</button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, padding: 8,
              cursor: 'pointer', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Menu size={20} />
          </button>
        </div>
      </motion.nav>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Drawer panel */}
          <motion.div
            key="drawer"
            initial={{ x: 320 }} animate={{ x: 0 }} exit={{ x: 320 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 51,
              width: 300,
              background: '#0A1020',
              borderLeft: '1px solid rgba(24,119,242,0.2)',
              display: 'flex', flexDirection: 'column',
            }}>
            {/* Drawer header */}
            <div style={{
              height: 64,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 20px',
              borderBottom: '1px solid rgba(24,119,242,0.12)',
            }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 16, fontFamily: SY }}>e-Khadi</span>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: 'none',
                  borderRadius: 8, padding: 6, cursor: 'pointer',
                  color: 'rgba(255,255,255,0.6)',
                  display: 'flex', alignItems: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Links */}
            <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              {[
                { label: 'Sign In',              href: '/login',              variant: 'ghost' as const },
                { label: 'Register as Member',   href: '/register',           variant: 'primary' as const },
                { label: 'Register Your Shop',   href: '/register?role=SHOP', variant: 'ghost' as const },
              ].map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                  <button style={{
                    width: '100%', textAlign: 'left',
                    padding: '13px 16px', borderRadius: 12,
                    border: link.variant === 'primary' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    background: link.variant === 'primary' ? 'linear-gradient(135deg, #1877F2, #0f4fa8)' : 'rgba(255,255,255,0.04)',
                    color: link.variant === 'primary' ? '#fff' : 'rgba(255,255,255,0.65)',
                    fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'inherit',
                    boxShadow: link.variant === 'primary' ? '0 0 20px rgba(24,119,242,0.25)' : 'none',
                  }}>
                    {link.label}
                  </button>
                </Link>
              ))}
            </div>

            {/* Drawer footer */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: 11, margin: 0 }}>
                © 2025 e-Khadi · Community credit for South Africa
              </p>
            </div>
          </motion.div>
        </>
      )}
      </AnimatePresence>
    </>
  )
}
