'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Camera, Save, User, Phone, Mail, CheckCircle } from 'lucide-react'

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const fileRef = useRef<HTMLInputElement>(null)

  const [name,      setName]      = useState('')
  const [phone,     setPhone]     = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [preview,   setPreview]   = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)
  const [error,     setError]     = useState('')

  useEffect(() => {
    fetch('/api/users/me').then(r => r.json()).then(u => {
      setName(u.name ?? '')
      setPhone(u.phone ?? '')
      setAvatarUrl(u.avatarUrl ?? '')
      setPreview(u.avatarUrl ?? '')
    })
  }, [])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'avatars')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Upload failed')
      setAvatarUrl(data.url)
    } catch (err: any) {
      setError(err.message)
      setPreview(avatarUrl)
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, avatarUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Save failed')
      await update({ name: data.name })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 28 }}>My Profile</h1>

      {/* Avatar */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            position: 'relative', width: 96, height: 96,
            borderRadius: '50%', cursor: 'pointer',
            background: preview ? 'transparent' : 'linear-gradient(135deg,#1877F2,#0f4fa8)',
            border: '3px solid #1877F2',
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {preview
            ? <img src={preview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ color: '#fff', fontSize: 28, fontWeight: 700 }}>{initials || <User size={32} color="#fff" />}</span>
          }
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0, transition: 'opacity 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
          >
            <Camera size={22} color="#fff" />
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleFileChange} />
        <p style={{ fontSize: 12, color: '#888', marginTop: 10 }}>
          {uploading ? 'Uploading…' : 'Tap to change photo'}
        </p>
      </div>

      {/* Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Full Name" icon={<User size={16} />}>
          <input
            value={name} onChange={e => setName(e.target.value)}
            placeholder="Your full name"
            style={inputStyle}
          />
        </Field>

        <Field label="Email" icon={<Mail size={16} />}>
          <input value={session?.user?.email ?? ''} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
        </Field>

        <Field label="Phone (for WhatsApp notifications)" icon={<Phone size={16} />}>
          <input
            value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="+27 60 000 0000"
            style={inputStyle}
          />
        </Field>
      </div>

      {error && (
        <p style={{ color: '#ef4444', fontSize: 13, marginTop: 12, padding: '10px 14px', background: '#fef2f2', borderRadius: 8 }}>
          {error}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving || uploading}
        style={{
          marginTop: 24, width: '100%',
          background: saved ? '#16a34a' : 'linear-gradient(135deg,#1877F2,#0f4fa8)',
          color: '#fff', border: 'none', borderRadius: 12,
          padding: '14px 0', fontSize: 15, fontWeight: 700,
          cursor: saving || uploading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          opacity: saving || uploading ? 0.7 : 1,
          transition: 'background 0.3s',
        }}
      >
        {saved ? <><CheckCircle size={18} /> Saved</> : saving ? 'Saving…' : <><Save size={18} /> Save Changes</>}
      </button>
    </div>
  )
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        {icon} {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px',
  border: '1px solid #e2e8f0', borderRadius: 10,
  fontSize: 14, outline: 'none', boxSizing: 'border-box',
  background: '#fff',
}