'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

/* ─── SVG portraits ─────────────────────────────────────────── */

function NomsakPortrait() {
  return (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs><clipPath id="rg-nomsa"><circle cx="30" cy="30" r="28"/></clipPath></defs>
      <circle cx="30" cy="30" r="28" fill="#4A3520"/>
      <ellipse cx="30" cy="56" rx="18" ry="12" fill="#2D4A6B" clipPath="url(#rg-nomsa)"/>
      <ellipse cx="30" cy="22" rx="14" ry="13" fill="#8B5A2B"/>
      <ellipse cx="30" cy="12" rx="14" ry="8" fill="#E11D2A"/>
      <rect x="16" y="10" width="28" height="4" rx="2" fill="#A60E1A"/>
      <ellipse cx="30" cy="26" rx="10" ry="11" fill="#6B3A1F"/>
      <ellipse cx="26" cy="24" rx="2" ry="2.2" fill="#14130E"/>
      <ellipse cx="34" cy="24" rx="2" ry="2.2" fill="#14130E"/>
      <circle cx="26.6" cy="23.3" r="0.7" fill="white"/>
      <circle cx="34.6" cy="23.3" r="0.7" fill="white"/>
      <path d="M26 30 Q30 34 34 30" stroke="#14130E" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

function SiphoPortrait() {
  return (
    <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs><clipPath id="rg-sipho"><circle cx="30" cy="30" r="28"/></clipPath></defs>
      <circle cx="30" cy="30" r="28" fill="#2A3A2A"/>
      <ellipse cx="30" cy="56" rx="18" ry="12" fill="#F2E9D6" clipPath="url(#rg-sipho)"/>
      <rect x="24" y="44" width="12" height="16" rx="2" fill="#E2D9CE" clipPath="url(#rg-sipho)"/>
      <ellipse cx="30" cy="24" rx="11" ry="12" fill="#3D2010"/>
      <ellipse cx="30" cy="14" rx="11" ry="5" fill="#1A0F08"/>
      <ellipse cx="30" cy="26" rx="9" ry="10" fill="#4A2510"/>
      <ellipse cx="26.5" cy="24" rx="1.8" ry="2" fill="#14130E"/>
      <ellipse cx="33.5" cy="24" rx="1.8" ry="2" fill="#14130E"/>
      <circle cx="27.1" cy="23.4" r="0.6" fill="white"/>
      <circle cx="34.1" cy="23.4" r="0.6" fill="white"/>
      <path d="M26.5 29.5 Q30 32.5 33.5 29.5" stroke="#14130E" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

/* ─── Role config ─────────────────────────────────────────── */

const ROLES = [
  {
    id: 'MEMBER',
    corner: '01',
    roman: 'I',
    title: 'Community Member',
    body: 'SASSA grant recipient seeking community credit for essential household goods.',
    badge: 'Community',
    Portrait: NomsakPortrait,
  },
  {
    id: 'SHOP',
    corner: '02',
    roman: 'II',
    title: 'Spaza Owner',
    body: 'Local shop owner accepting e-Khadi credit from community members in your area.',
    badge: 'Merchant',
    Portrait: SiphoPortrait,
  },
]

/* ─── Main RegisterForm ───────────────────────────────────── */

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get('role') as 'MEMBER' | 'SHOP' | null

  const [selected, setSelected] = useState<number | null>(defaultRole ? ROLES.findIndex(r => r.id === defaultRole) : null)
  const [phase, setPhase] = useState<'pick' | 'form'>(defaultRole ? 'form' : 'pick')

  const [name,            setName]            = useState('')
  const [email,           setEmail]           = useState('')
  const [phone,           setPhone]           = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [sassaId,         setSassaId]         = useState('')
  const [shopName,        setShopName]        = useState('')
  const [showPw,          setShowPw]          = useState(false)
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState<string | null>(null)
  const [fieldErrors,     setFieldErrors]     = useState<Record<string, string>>({})

  const role = selected !== null ? ROLES[selected] : null

  function pickRole(i: number) {
    setSelected(i)
    setPhase('form')
  }

  function goBack() {
    setPhase('pick')
    setError(null)
    setFieldErrors({})
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = 'Full name is required'
    if (!email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email address'
    if (!password) errs.password = 'Password is required'
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match'
    if (role?.id === 'MEMBER' && !sassaId.trim()) errs.sassaId = 'SASSA ID is required'
    if (role?.id === 'SHOP' && !shopName.trim()) errs.shopName = 'Shop name is required'
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || undefined,
          password,
          role: role!.id,
          sassaId: sassaId.trim() || undefined,
          shopName: shopName.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Registration failed.'); return }
      router.push('/login?registered=true')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const FRow = ({ id, label, type = 'text', placeholder, value, onChange, error: err, hint, extra }: {
    id: string; label: string; type?: string; placeholder: string;
    value: string; onChange: (v: string) => void; error?: string; hint?: string; extra?: React.ReactNode
  }) => (
    <div className="lf-group">
      <label htmlFor={id} className="lf-label">{label}</label>
      <div className={extra ? 'lf-input-wrap' : ''}>
        <input id={id} type={type} placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)}
          className={`lf-input ${err ? 'border-[#E11D2A]' : ''}`}
          autoComplete="off" />
        {extra}
      </div>
      {hint && !err && <p className="lf-hint">{hint}</p>}
      {err && <p className="lf-hint" style={{ color: '#E11D2A', marginTop: 4 }}>{err}</p>}
    </div>
  )

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* Caption row */}
      <div className="login-cap">
        <span className="login-cap-num">§ 00</span>
        <span className="login-cap-rule" />
        <span className="login-cap-tag">Registration</span>
      </div>

      {/* Headline */}
      <h1 className="login-headline">Join e-Khadi.</h1>
      <p className="login-sub">
        {phase === 'pick' ? 'Choose your role to get started' : `Registering as ${role?.title}`}
      </p>

      {/* Phase: pick role */}
      {phase === 'pick' && (
        <div className="login-cards">
          {ROLES.map((r, i) => {
            const dim = selected !== null && selected !== i
            return (
              <button
                key={r.id}
                onClick={() => pickRole(i)}
                className={`login-role-card ${dim ? 'is-dimmed' : ''} ${selected === i ? 'is-selected' : ''}`}
                style={{ animationDelay: `${0.10 + i * 0.14}s` }}
              >
                <span className="lrc-corner">{r.corner}</span>
                <span className="lrc-roman">{r.roman}</span>
                <div className="lrc-portrait">
                  <div style={{ width: 56, height: 56 }}><r.Portrait /></div>
                </div>
                <p className="lrc-title">{r.title}</p>
                <p style={{ fontFamily: 'var(--sans-dawn)', fontSize: 13, lineHeight: 1.6, color: 'var(--ink)', opacity: .65, margin: '0 0 20px' }}>{r.body}</p>
                <div className="lrc-foot">
                  <span className="lrc-badge">{r.badge}</span>
                  <span className="lrc-select">Select <span className="lrc-arr">→</span></span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Phase: form */}
      {phase === 'form' && role && (
        <div className="login-form-zone">
          <div className="login-form-card">
            <div className="login-form-header">
              <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                <role.Portrait />
              </div>
              <p className="login-form-title">Create account</p>
              <span className="login-form-rolebadge">{role.badge}</span>
              <button className="login-form-change" onClick={goBack}>← Back</button>
            </div>

            <form onSubmit={handleSubmit} autoComplete="off">
              {error && <div className="lf-error">{error}</div>}

              <FRow id="name" label="Full Name" placeholder="Nomsa Dlamini"
                value={name} onChange={setName} error={fieldErrors.name} />

              <FRow id="email" label="Email Address" type="email" placeholder="you@example.com"
                value={email} onChange={setEmail} error={fieldErrors.email} />

              <FRow id="phone" label="Phone (optional)" type="tel" placeholder="+27 82 123 4567"
                value={phone} onChange={setPhone} />

              {role.id === 'MEMBER' && (
                <FRow id="sassaId" label="SASSA ID" placeholder="e.g. 8001015009087"
                  value={sassaId} onChange={setSassaId} error={fieldErrors.sassaId}
                  hint="Your 13-digit South African ID number used for SASSA" />
              )}

              {role.id === 'SHOP' && (
                <FRow id="shopName" label="Shop Name" placeholder="e.g. Mama's Spaza"
                  value={shopName} onChange={setShopName} error={fieldErrors.shopName} />
              )}

              <FRow id="password" label="Password" type={showPw ? 'text' : 'password'}
                placeholder="At least 8 characters"
                value={password} onChange={setPassword} error={fieldErrors.password}
                extra={
                  <button type="button" className="lf-eye" onClick={() => setShowPw(!showPw)}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />

              <FRow id="confirmPassword" label="Confirm Password" type="password"
                placeholder="Repeat your password"
                value={confirmPassword} onChange={setConfirmPassword}
                error={fieldErrors.confirmPassword} />

              <button type="submit" className="lf-submit" disabled={loading}>
                {loading ? 'Creating account…' : 'Create Account →'}
              </button>

              <p style={{ fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '.14em', color: 'var(--ink-mute)', textAlign: 'center', marginTop: 14, textTransform: 'uppercase' }}>
                By registering you agree to our{' '}
                <span style={{ color: 'var(--dawn)' }}>Terms</span> &amp;{' '}
                <span style={{ color: 'var(--dawn)' }}>Privacy Policy</span>
              </p>
            </form>

            <div className="lf-foot">
              <span>Already have an account?</span>{' '}
              <Link href="/login">Sign in →</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-center text-white/60">Loading…</div>}>
      <RegisterForm />
    </Suspense>
  )
}
