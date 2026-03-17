'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get('role') || 'MEMBER'

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: defaultRole,
    sassaId: '',
    shopName: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errors: Record<string, string> = {}
    if (!formData.name.trim()) errors.name = 'Full name is required'
    if (!formData.email.trim()) errors.email = 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email address'
    if (!formData.password) errors.password = 'Password is required'
    if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters'
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match'
    if (formData.role === 'MEMBER' && !formData.sassaId.trim()) errors.sassaId = 'SASSA ID is required for members'
    if (formData.role === 'SHOP' && !formData.shopName.trim()) errors.shopName = 'Shop name is required'
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim() || undefined,
          password: formData.password,
          role: formData.role,
          sassaId: formData.sassaId.trim() || undefined,
          shopName: formData.shopName.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.')
        setLoading(false)
        return
      }

      router.push('/login?registered=true')
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-lg border-0 sm:border">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <CardDescription>Join e-Khadi and access community credit</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector */}
          <div className="space-y-1.5">
            <Label>I am registering as</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'MEMBER', label: 'Member', desc: 'SASSA recipient' },
                { value: 'SHOP', label: 'Shop Owner', desc: 'Spaza shop' },
              ].map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: r.value })}
                  className={`p-2.5 rounded-lg border-2 text-left transition-all ${
                    formData.role === r.value
                      ? 'border-primary bg-primary-light'
                      : 'border-border hover:border-gray-300'
                  }`}
                >
                  <p className={`text-xs font-semibold ${formData.role === r.value ? 'text-primary' : 'text-text-primary'}`}>
                    {r.label}
                  </p>
                  <p className="text-xs text-text-secondary">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              placeholder="Nomsa Dlamini"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={fieldErrors.name}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={fieldErrors.email}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone number (optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+27 82 123 4567"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          {/* MEMBER-specific fields */}
          {formData.role === 'MEMBER' && (
            <div className="space-y-1.5">
              <Label htmlFor="sassaId">SASSA ID</Label>
              <Input
                id="sassaId"
                placeholder="e.g. 8001015009087"
                value={formData.sassaId}
                onChange={(e) => setFormData({ ...formData, sassaId: e.target.value })}
                error={fieldErrors.sassaId}
              />
              <p className="text-xs text-text-secondary">Your 13-digit South African ID number used for SASSA</p>
            </div>
          )}

          {/* SHOP-specific fields */}
          {formData.role === 'SHOP' && (
            <div className="space-y-1.5">
              <Label htmlFor="shopName">Shop name</Label>
              <Input
                id="shopName"
                placeholder="e.g. Mama's Spaza"
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                error={fieldErrors.shopName}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={fieldErrors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-text-secondary hover:text-text-primary"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={fieldErrors.confirmPassword}
            />
          </div>

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            <UserPlus className="h-4 w-4 mr-2" />
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>

          <p className="text-xs text-text-secondary text-center">
            By registering, you agree to our Terms of Service and Privacy Policy
          </p>
        </form>
      </CardContent>
      <CardFooter className="justify-center pt-0">
        <p className="text-sm text-text-secondary">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-center">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  )
}
