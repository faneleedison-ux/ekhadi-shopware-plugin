'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || ''
  const errorParam = searchParams.get('error')
  const registered = searchParams.get('registered') === 'true'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    errorParam === 'unauthorized' ? 'You do not have permission to access that page.' : null
  )

  const demoUsers = [
    { label: 'Admin', email: 'admin@ekhadi.co.za', password: 'Admin123!' },
    { label: 'Member', email: 'member@ekhadi.co.za', password: 'Member123!' },
    { label: 'Shop', email: 'shop@ekhadi.co.za', password: 'Shop123!' },
  ]

  function fillDemoAccount(emailValue: string, passwordValue: string) {
    setEmail(emailValue)
    setPassword(passwordValue)
    setError(null)
  }

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

      // Fetch session to get role for redirect
      const sessionRes = await fetch('/api/auth/session')
      const session = await sessionRes.json()

      if (session?.user?.role === 'ADMIN') {
        router.push('/admin')
      } else if (session?.user?.role === 'MEMBER') {
        router.push('/member')
      } else if (session?.user?.role === 'SHOP') {
        router.push('/shop')
      } else {
        router.push(callbackUrl || '/')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-lg border-0 sm:border">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-text-primary">Welcome back</CardTitle>
        <CardDescription>Sign in to continue to your dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        {registered && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-success">
            Account created successfully. You can sign in now.
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-danger">
            {error}
          </div>
        )}

        <div className="mb-4 p-3 bg-primary-light rounded-lg">
          <p className="text-xs font-semibold text-primary mb-2">Quick Demo Login</p>
          <div className="grid grid-cols-3 gap-2">
            {demoUsers.map((demo) => (
              <button
                key={demo.label}
                type="button"
                onClick={() => fillDemoAccount(demo.email, demo.password)}
                className="rounded-md border border-primary/20 bg-white px-2 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
              >
                Use {demo.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={() => setError('Password reset is not enabled in this demo yet. Please contact an admin.')}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            <LogIn className="h-4 w-4 mr-2" />
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center pt-0">
        <p className="text-sm text-text-secondary">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            Register
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
