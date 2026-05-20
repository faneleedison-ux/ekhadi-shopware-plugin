'use client'

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import gsap from 'gsap'

/* ════════════════════════════════════════════════════════
   Portraits — inline SVG illustrations
   ════════════════════════════════════════════════════════ */

function NomsakPortrait() {
  return (
    <svg viewBox="0 0 60 60" width="68" height="68" aria-label="Community Member">
      <defs><clipPath id="lcp-nt"><circle cx="30" cy="30" r="30"/></clipPath></defs>
      <g clipPath="url(#lcp-nt)">
        <rect width="60" height="60" fill="#C8925A"/>
        <path d="M -4 65 L 2 46 L 20 40 L 40 40 L 58 46 L 64 65 Z" fill="#4A1520"/>
        <rect x="26" y="49" width="8" height="11" rx="2" fill="#6B3D22"/>
        <ellipse cx="30" cy="32" rx="14" ry="17" fill="#6B3D22"/>
        <ellipse cx="16" cy="33" rx="3" ry="3.5" fill="#6B3D22"/>
        <ellipse cx="44" cy="33" rx="3" ry="3.5" fill="#6B3D22"/>
        <ellipse cx="30" cy="17" rx="16" ry="13" fill="#B83820"/>
        <path d="M 14 24 Q 30 12 46 24 L 44 21 Q 30 10 16 21 Z" fill="#962E18"/>
        <ellipse cx="43" cy="14" rx="5" ry="7" fill="#B83820"/>
        <ellipse cx="43" cy="13" rx="4" ry="5.5" fill="#C84028"/>
        <ellipse cx="23" cy="29" rx="3.8" ry="2.8" fill="#F5E4D4"/>
        <circle cx="23" cy="29" r="1.9" fill="#250E04"/>
        <circle cx="23.8" cy="28.3" r="0.65" fill="#fff" opacity="0.75"/>
        <ellipse cx="37" cy="29" rx="3.8" ry="2.8" fill="#F5E4D4"/>
        <circle cx="37" cy="29" r="1.9" fill="#250E04"/>
        <circle cx="37.8" cy="28.3" r="0.65" fill="#fff" opacity="0.75"/>
        <path d="M 19 25.5 Q 23 24 27 25" stroke="#8A7060" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
        <path d="M 33 25 Q 37 24 41 25.5" stroke="#8A7060" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
        <path d="M 30 33 L 28 37.5 Q 30 38.5 32 37.5 L 30 33" stroke="#5A2E18" strokeWidth="0.9" fill="none"/>
        <path d="M 22 41 Q 30 47 38 41" stroke="#5A2E18" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        <path d="M 24 41.5 Q 30 45 36 41.5 Z" fill="#fff" opacity="0.85"/>
      </g>
      <circle cx="30" cy="30" r="29" fill="none" stroke="rgba(20,19,14,0.12)" strokeWidth="1.2"/>
    </svg>
  )
}

function SiphoPortrait() {
  return (
    <svg viewBox="0 0 60 60" width="68" height="68" aria-label="Spaza Owner">
      <defs><clipPath id="lcp-sm"><circle cx="30" cy="30" r="30"/></clipPath></defs>
      <g clipPath="url(#lcp-sm)">
        <rect width="60" height="60" fill="#2A4A6A"/>
        <path d="M -4 65 L 3 46 L 18 39 L 42 39 L 57 46 L 64 65 Z" fill="#1A2E44"/>
        <rect x="26" y="48" width="8" height="12" rx="2" fill="#3A1E0A"/>
        <ellipse cx="30" cy="32" rx="14" ry="17" fill="#3A1E0A"/>
        <ellipse cx="16" cy="33" rx="3" ry="3.5" fill="#3A1E0A"/>
        <ellipse cx="44" cy="33" rx="3" ry="3.5" fill="#3A1E0A"/>
        <ellipse cx="30" cy="16" rx="15" ry="10" fill="#200E04"/>
        <path d="M 15 20 Q 16 14 20 12 Q 30 9 40 12 Q 44 14 45 20" fill="#200E04"/>
        <ellipse cx="23" cy="29" rx="4" ry="2.8" fill="#F0DEC8"/>
        <circle cx="23" cy="29" r="2" fill="#1A0A04"/>
        <circle cx="23.8" cy="28.2" r="0.7" fill="#fff" opacity="0.8"/>
        <ellipse cx="37" cy="29" rx="4" ry="2.8" fill="#F0DEC8"/>
        <circle cx="37" cy="29" r="2" fill="#1A0A04"/>
        <circle cx="37.8" cy="28.2" r="0.7" fill="#fff" opacity="0.8"/>
        <path d="M 18.5 25 Q 23 23.5 27 24.5" stroke="#180A04" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        <path d="M 33 24.5 Q 37 23.5 41.5 25" stroke="#180A04" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        <path d="M 30 33 L 27.5 38 Q 30 39.5 32.5 38 L 30 33" stroke="#2A1004" strokeWidth="1" fill="none"/>
        <path d="M 21 42 Q 30 49 39 42" stroke="#2A1004" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M 23 42.5 Q 30 47 37 42.5 Z" fill="#fff" opacity="0.9"/>
      </g>
      <circle cx="30" cy="30" r="29" fill="none" stroke="rgba(20,19,14,0.12)" strokeWidth="1.2"/>
    </svg>
  )
}

function ThaboPortrait() {
  return (
    <svg viewBox="0 0 60 60" width="68" height="68" aria-label="Platform Admin">
      <defs><clipPath id="lcp-tb"><circle cx="30" cy="30" r="30"/></clipPath></defs>
      <g clipPath="url(#lcp-tb)">
        {/* bg - dark olive/professional */}
        <rect width="60" height="60" fill="#3A5A40"/>
        {/* suit / jacket */}
        <path d="M -4 65 L 4 44 L 18 38 L 30 42 L 42 38 L 56 44 L 64 65 Z" fill="#1A2820"/>
        {/* shirt collar */}
        <path d="M 24 40 L 30 46 L 36 40 L 32 38 L 30 42 L 28 38 Z" fill="#E8DED0"/>
        {/* neck */}
        <rect x="26" y="46" width="8" height="8" rx="2" fill="#7A4A28"/>
        {/* head */}
        <ellipse cx="30" cy="30" rx="13.5" ry="16" fill="#7A4A28"/>
        {/* ears */}
        <ellipse cx="16.5" cy="32" rx="2.8" ry="3.2" fill="#7A4A28"/>
        <ellipse cx="43.5" cy="32" rx="2.8" ry="3.2" fill="#7A4A28"/>
        {/* short natural hair */}
        <ellipse cx="30" cy="16" rx="14.5" ry="10" fill="#1A0A04"/>
        <path d="M 15.5 20 Q 16 13 22 11 Q 30 9 38 11 Q 44 13 44.5 20" fill="#1A0A04"/>
        {/* fade sides */}
        <ellipse cx="17" cy="25" rx="3.5" ry="7" fill="#2A1208" opacity=".6"/>
        <ellipse cx="43" cy="25" rx="3.5" ry="7" fill="#2A1208" opacity=".6"/>
        {/* eyes */}
        <ellipse cx="23.5" cy="29" rx="3.8" ry="2.8" fill="#F2DFC8"/>
        <circle cx="23.5" cy="29" r="1.9" fill="#1A0804"/>
        <circle cx="24.2" cy="28.3" r="0.65" fill="#fff" opacity="0.82"/>
        <ellipse cx="36.5" cy="29" rx="3.8" ry="2.8" fill="#F2DFC8"/>
        <circle cx="36.5" cy="29" r="1.9" fill="#1A0804"/>
        <circle cx="37.2" cy="28.3" r="0.65" fill="#fff" opacity="0.82"/>
        {/* eyebrows - thick, confident */}
        <path d="M 19 25 Q 23.5 23.5 27.5 24.5" stroke="#1A0A04" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <path d="M 32.5 24.5 Q 36.5 23.5 41 25" stroke="#1A0A04" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        {/* glasses */}
        <rect x="18.5" y="26" width="10" height="7" rx="3.5" fill="none" stroke="#D4A030" strokeWidth="1.2"/>
        <rect x="31.5" y="26" width="10" height="7" rx="3.5" fill="none" stroke="#D4A030" strokeWidth="1.2"/>
        <line x1="28.5" y1="29.5" x2="31.5" y2="29.5" stroke="#D4A030" strokeWidth="1.2"/>
        <line x1="18.5" y1="29.5" x2="16" y2="30" stroke="#D4A030" strokeWidth="1.2"/>
        <line x1="41.5" y1="29.5" x2="44" y2="30" stroke="#D4A030" strokeWidth="1.2"/>
        {/* nose */}
        <path d="M 30 33 L 28 37 Q 30 38 32 37 L 30 33" stroke="#5A2E18" strokeWidth="0.9" fill="none"/>
        {/* confident half-smile */}
        <path d="M 23 41 Q 30 46 37 41" stroke="#4A2010" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        <path d="M 25 41.5 Q 30 44.5 35 41.5 Z" fill="#fff" opacity="0.8"/>
      </g>
      <circle cx="30" cy="30" r="29" fill="none" stroke="rgba(20,19,14,0.12)" strokeWidth="1.2"/>
    </svg>
  )
}

/* ════════════════════════════════════════════════════════
   Role data
   ════════════════════════════════════════════════════════ */

const ROLES = [
  {
    id: 'MEMBER',
    corner: 'Member',
    roman: 'I.',
    title: 'Community Member',
    body: 'Shop at your local spaza on credit. Repay automatically when your SASSA grant arrives.',
    badge: 'SASSA-Aligned',
    email: 'member@ekhadi.co.za',
    password: 'Member123!',
    Portrait: NomsakPortrait,
  },
  {
    id: 'SHOP',
    corner: 'Shop',
    roman: 'II.',
    title: 'Spaza Owner',
    body: 'Accept e-Khadi payments from community members. Grow your local shop.',
    badge: 'Shop Owner',
    email: 'shop@ekhadi.co.za',
    password: 'Shop123!',
    Portrait: SiphoPortrait,
  },
  {
    id: 'ADMIN',
    corner: 'Admin',
    roman: 'III.',
    title: 'Platform Admin',
    body: 'Manage credit requests, member accounts, stokvel groups and transactions.',
    badge: 'Admin',
    email: 'admin@ekhadi.co.za',
    password: 'Admin123!',
    Portrait: ThaboPortrait,
  },
]

/* ════════════════════════════════════════════════════════
   Login form content
   ════════════════════════════════════════════════════════ */

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || ''
  const errorParam = searchParams.get('error')
  const registered = searchParams.get('registered') === 'true'

  const [selected, setSelected] = useState<number | null>(null)
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(
    errorParam === 'unauthorized' ? 'You do not have permission to access that page.' : null
  )

  const cardsRef = useRef<HTMLDivElement>(null)
  const formRef  = useRef<HTMLDivElement>(null)

  /* Slide form in after selection */
  useEffect(() => {
    if (selected !== null && formRef.current) {
      gsap.fromTo(formRef.current,
        { y: 44, opacity: 0, scale: 0.96 },
        { y: 0,  opacity: 1, scale: 1, duration: 0.52, ease: 'back.out(1.4)' }
      )
    }
  }, [selected])

  const selectRole = useCallback((idx: number) => {
    setSelected(idx)
    setEmail(ROLES[idx].email)
    setPassword(ROLES[idx].password)
    setError(null)

    requestAnimationFrame(() => {
      const cards = Array.from(
        cardsRef.current?.querySelectorAll<HTMLElement>('.login-role-card') ?? []
      )
      const isMobile = window.innerWidth < 800
      cards.forEach((card, i) => {
        if (i === idx) {
          gsap.to(card, { scale: 1.03, duration: 0.15, ease: 'power2.out', yoyo: true, repeat: 1 })
        } else {
          const diff = i - idx
          const x = isMobile ? 0 : (diff < 0 ? -60 : 60)
          const y = isMobile ? (diff < 0 ? -36 : 36) : 14
          gsap.to(card, {
            opacity: 0, x, y, scale: 0.84,
            duration: 0.32,
            ease: 'power3.in',
            delay: 0.05 * Math.abs(diff),
          })
        }
      })
    })
  }, [])

  const clearRole = useCallback(() => {
    if (formRef.current) {
      gsap.to(formRef.current, {
        y: -28, opacity: 0, scale: 0.96,
        duration: 0.24, ease: 'power2.in',
        onComplete: () => {
          setSelected(null)
          setEmail('')
          setPassword('')
          setError(null)
          requestAnimationFrame(() => {
            const cards = Array.from(
              cardsRef.current?.querySelectorAll<HTMLElement>('.login-role-card') ?? []
            )
            gsap.set(cards, { x: 0, y: 28, scale: 0.9, opacity: 0 })
            gsap.to(cards, {
              opacity: 1, y: 0, scale: 1,
              duration: 0.52,
              ease: 'back.out(1.5)',
              stagger: 0.1,
            })
          })
        },
      })
    } else {
      setSelected(null)
      setEmail('')
      setPassword('')
      setError(null)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      })
      if (result?.error) {
        setError(result.error === 'CredentialsSignin' ? 'Invalid email or password.' : result.error)
        setLoading(false)
        return
      }
      const sessionRes = await fetch('/api/auth/session')
      const session = await sessionRes.json()
      if (session?.user?.role === 'ADMIN')  router.push('/admin')
      else if (session?.user?.role === 'MEMBER') router.push('/member')
      else if (session?.user?.role === 'SHOP')   router.push('/shop')
      else router.push(callbackUrl || '/')
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      {/* Caption */}
      <div className="login-cap">
        <span className="login-cap-num">§ 01</span>
        <span className="login-cap-tag">Sign In</span>
        <span className="login-cap-rule" />
        <span className="login-cap-num">Demo Access</span>
      </div>

      <h1 className="login-headline">
        Welcome back<span style={{ color: 'var(--dawn)' }}>.</span>
      </h1>
      <p className="login-sub">Choose your role to continue</p>

      {/* ── 3 Role Cards ── */}
      <div className="login-cards" ref={cardsRef}>
        {ROLES.map((role, idx) => (
          <div
            key={role.id}
            className={
              'login-role-card' +
              (selected === idx ? ' is-selected' : '') +
              (selected !== null && selected !== idx ? ' is-dimmed' : '')
            }
            onClick={() => selectRole(idx)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && selectRole(idx)}
          >
            <span className="lrc-corner">{role.corner}</span>

            <div className="lrc-portrait">
              <role.Portrait />
            </div>

            <div className="lrc-roman">{role.roman}</div>
            <h3 className="lrc-title">{role.title}</h3>
            <p className="lrc-body">{role.body}</p>

            <div className="lrc-foot">
              <span className="lrc-badge">{role.badge}</span>
              <span className="lrc-select">
                {selected === idx ? 'Selected' : 'Select'}
                &nbsp;
                <span className="lrc-arr">{selected === idx ? '✓' : '→'}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Login Form (appears after card selection) ── */}
      {selected !== null && (
        <div className="login-form-zone" ref={formRef}>
          <div className="login-form-card">
            <div className="login-form-header">
              <span className="login-form-title">Sign in</span>
              <span className="login-form-rolebadge">{ROLES[selected].corner}</span>
              <button className="login-form-change" type="button" onClick={clearRole}>
                ← Change
              </button>
            </div>

            {registered && (
              <div className="lf-success">Account created successfully. Sign in now.</div>
            )}
            {error && <div className="lf-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="lf-group">
                <label className="lf-label" htmlFor="lf-email">Email</label>
                <input
                  id="lf-email"
                  className="lf-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="lf-group">
                <label className="lf-label" htmlFor="lf-pw">Password</label>
                <div className="lf-input-wrap">
                  <input
                    id="lf-pw"
                    className="lf-input"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="lf-eye"
                    onClick={() => setShowPw(s => !s)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              <button type="submit" className="lf-submit" disabled={loading}>
                {loading
                  ? 'Signing in…'
                  : `Sign in as ${ROLES[selected].corner} →`
                }
              </button>
            </form>

            <p className="lf-foot">
              New to e-Khadi?{' '}
              <Link href="/register">Register now</Link>
            </p>
          </div>
        </div>
      )}
    </>
  )
}

/* ════════════════════════════════════════════════════════
   Page export
   ════════════════════════════════════════════════════════ */

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="login-sub" style={{ marginTop: 80 }}>Loading…</p>}>
      <LoginContent />
    </Suspense>
  )
}