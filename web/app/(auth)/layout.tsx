import React from 'react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-night">
      <div className="dawn-grain" aria-hidden="true" />

      <div className="auth-top">
        <Link href="/" className="auth-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back
        </Link>

        <Link href="/" className="auth-logo">e-Khadi</Link>

        <Link href="/register" className="auth-reg">Register →</Link>
      </div>

      <div className="auth-body">
        {children}
      </div>
    </div>
  )
}