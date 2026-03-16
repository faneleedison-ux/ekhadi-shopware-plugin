import React from 'react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary py-4 px-6 flex justify-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-primary font-bold text-sm">eK</span>
          </div>
          <span className="font-bold text-xl text-white tracking-tight">e-Khadi</span>
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className="py-4 text-center text-xs text-text-secondary">
        <p>© 2024 e-Khadi. Community credit for South Africa.</p>
      </div>
    </div>
  )
}
