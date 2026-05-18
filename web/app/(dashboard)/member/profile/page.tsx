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
    <div className="space-y-5 animate-fade-in max-w-lg">

      {/* Header */}
      <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl px-5 py-4">
        <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552] mb-1">Account · e-Khadi</p>
        <h1 className="font-[var(--serif)] italic text-2xl text-[#14130E] leading-tight">My Profile</h1>
        <p className="font-[var(--mono)] text-[10px] tracking-wide text-[#6B6552] mt-1">Update your name, photo and contact details</p>
      </div>

      {/* Avatar + form card */}
      <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl overflow-hidden">

        {/* Avatar section */}
        <div className="flex flex-col items-center py-6 border-b border-[#C9BCA0] bg-[#F2E9D6]">
          <div
            onClick={() => fileRef.current?.click()}
            className="relative w-24 h-24 rounded-full cursor-pointer overflow-hidden border-2 border-[#C9BCA0] hover:border-[#E11D2A] transition-colors"
            style={{ background: preview ? 'transparent' : '#C9BCA0' }}
          >
            {preview
              ? <img src={preview} alt="avatar" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center font-[var(--serif)] italic text-3xl text-[#6B6552]">
                  {initials || <User size={32} className="text-[#6B6552]" />}
                </div>
            }
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Camera size={22} className="text-white" />
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
          <p className="font-[var(--mono)] text-[10px] tracking-wide text-[#A89971] mt-3">
            {uploading ? 'Uploading…' : 'Tap to change photo'}
          </p>
        </div>

        {/* Fields */}
        <div className="p-5 space-y-4">
          <div>
            <label className="flex items-center gap-1.5 font-[var(--mono)] text-[11px] tracking-widest uppercase text-[#6B6552] mb-2">
              <User size={13} /> Full Name
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full px-4 py-3 bg-[#F2E9D6] border border-[#C9BCA0] rounded-xl font-[var(--sans-dawn)] text-sm text-[#14130E] outline-none focus:border-[#E11D2A] transition-colors"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 font-[var(--mono)] text-[11px] tracking-widest uppercase text-[#6B6552] mb-2">
              <Mail size={13} /> Email
            </label>
            <input
              value={session?.user?.email ?? ''}
              disabled
              className="w-full px-4 py-3 bg-[#F2E9D6] border border-[#C9BCA0] rounded-xl font-[var(--sans-dawn)] text-sm text-[#A89971] opacity-60 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 font-[var(--mono)] text-[11px] tracking-widest uppercase text-[#6B6552] mb-2">
              <Phone size={13} /> Phone (WhatsApp)
            </label>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+27 60 000 0000"
              className="w-full px-4 py-3 bg-[#F2E9D6] border border-[#C9BCA0] rounded-xl font-[var(--sans-dawn)] text-sm text-[#14130E] outline-none focus:border-[#E11D2A] transition-colors"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl border border-[#E11D2A]/30 bg-[#E11D2A]/10 font-[var(--mono)] text-[11px] text-[#E11D2A]">
              {error}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-[var(--mono)] text-[11px] tracking-widest uppercase transition-all ${
              saved
                ? 'bg-[#3F7B4F] text-white'
                : saving || uploading
                ? 'bg-[#C9BCA0] text-[#6B6552] cursor-not-allowed'
                : 'bg-[#E11D2A] hover:bg-[#A60E1A] text-white cursor-pointer'
            }`}
          >
            {saved ? <><CheckCircle size={16} /> Saved</> : saving ? 'Saving…' : <><Save size={16} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  )
}