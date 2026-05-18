'use client'

import React, { useState, useEffect, useRef } from 'react'
import { signOut } from 'next-auth/react'
import { Bell, LogOut, ChevronDown, CheckCheck } from 'lucide-react'
import { getInitials, formatDateTime } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import ContextPath from '@/components/layout/ContextPath'

interface Notification { id: string; title: string; message: string; type: string; read: boolean; createdAt: string }
interface HeaderProps { userName: string; userEmail: string; userRole: string; pageTitle?: string }

const roleLabels: Record<string, string> = { ADMIN: 'Administrator', MEMBER: 'Member', SHOP: 'Shop Owner' }

export default function Header({ userName, userEmail, userRole, pageTitle }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try { const res = await fetch('/api/notifications'); if (res.ok) { const d = await res.json(); setNotifications(d.notifications); setUnreadCount(d.unreadCount) } } catch {}
  }
  const markAllRead = async () => { await fetch('/api/notifications', { method: 'PATCH' }); setNotifications((p) => p.map((n) => ({ ...n, read: true }))); setUnreadCount(0) }
  const markOneRead = async (id: string) => { await fetch(`/api/notifications?id=${id}`, { method: 'PATCH' }); setNotifications((p) => p.map((n) => n.id === id ? { ...n, read: true } : n)); setUnreadCount((p) => Math.max(0, p - 1)) }

  const typeColor = (type: string) => {
    if (type === 'CREDIT_APPROVED') return 'bg-success/10 border-success/20'
    if (type === 'CREDIT_REJECTED') return 'bg-danger/10 border-danger/20'
    return 'bg-primary/10 border-primary/20'
  }

  return (
    <header className="sticky top-0 z-20 bg-[#EBE0C7] border-b border-[#C9BCA0] h-16 flex items-center px-4 lg:px-6 gap-4">
      {/* Left: wordmark (mobile) or page title (desktop) */}
      <div className="flex-1 min-w-0">
        {pageTitle && <h1 className="font-[var(--serif)] italic text-lg text-[#14130E] truncate hidden lg:block">{pageTitle}</h1>}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-7 h-7 bg-[#E11D2A] rounded-lg flex items-center justify-center"><span className="text-white font-bold text-xs">eK</span></div>
          <span className="font-[var(--serif)] italic text-[#14130E] text-base">e-Khadi</span>
        </div>
      </div>

      {/* Centre: contextual path indicator */}
      <ContextPath />

      <div className="flex items-center gap-2">
        {/* Bell */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => { setShowNotifications(!showNotifications); setShowDropdown(false) }}
            className="relative p-2 bg-[#F2E9D6] border border-[#C9BCA0] rounded-xl hover:border-[#A89971] transition-colors">
            <Bell className="h-5 w-5 text-[#6B6552]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-danger rounded-full flex items-center justify-center px-0.5">
                <span className="text-white text-[10px] font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>
              </span>
            )}
          </button>
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-[#F2E9D6] rounded-xl border border-[#C9BCA0] z-20 animate-fade-in overflow-hidden" style={{boxShadow:'0 8px 32px rgba(20,19,14,0.12)'}}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#C9BCA0]">
                  <p className="font-[var(--sans-dawn)] text-sm font-medium text-[#14130E]">
                    Notifications {unreadCount > 0 && <span className="ml-2 px-1.5 py-0.5 bg-[#E11D2A] text-white rounded-full text-xs">{unreadCount}</span>}
                  </p>
                  {unreadCount > 0 && <button onClick={markAllRead} className="flex items-center gap-1 font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#E11D2A] hover:underline"><CheckCheck className="h-3 w-3" />Mark all read</button>}
                </div>
                <ul className="max-h-80 overflow-y-auto divide-y divide-[#C9BCA0]">
                  {notifications.length === 0 ? (
                    <li className="text-center py-8 font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#A89971]"><Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />No notifications yet</li>
                  ) : notifications.map((n) => (
                    <li key={n.id} onClick={() => !n.read && markOneRead(n.id)}
                      className={`px-4 py-3 cursor-pointer hover:bg-[#EBE0C7] transition-colors ${!n.read ? 'bg-[#E11D2A]/5' : ''}`}>
                      <div className={`rounded-lg p-2.5 border ${typeColor(n.type)}`}>
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-[var(--sans-dawn)] text-xs font-medium text-[#14130E]">{n.title}</p>
                          {!n.read && <span className="w-2 h-2 bg-[#E11D2A] rounded-full flex-shrink-0 mt-0.5" />}
                        </div>
                        <p className="font-[var(--sans-dawn)] text-xs text-[#6B6552] mt-1">{n.message}</p>
                        <p className="font-[var(--mono)] text-[10px] text-[#A89971] mt-1.5">{formatDateTime(n.createdAt)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button onClick={() => { setShowDropdown(!showDropdown); setShowNotifications(false) }}
            className="flex items-center gap-2 p-1.5 bg-[#F2E9D6] border border-[#C9BCA0] rounded-xl hover:border-[#A89971] transition-colors">
            <div className="w-8 h-8 rounded-full bg-[#E11D2A] flex items-center justify-center">
              <span className="text-white text-xs font-semibold">{getInitials(userName)}</span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="font-[var(--sans-dawn)] text-sm font-medium text-[#14130E] leading-tight">{userName}</p>
              <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552]">{roleLabels[userRole] || userRole}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-[#6B6552] hidden sm:block" />
          </button>
          {showDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-[#F2E9D6] rounded-xl border border-[#C9BCA0] z-20 py-1 animate-fade-in" style={{boxShadow:'0 8px 32px rgba(20,19,14,0.12)'}}>
                <div className="px-4 py-3 border-b border-[#C9BCA0]">
                  <p className="font-[var(--sans-dawn)] text-sm font-medium text-[#14130E]">{userName}</p>
                  <p className="font-[var(--mono)] text-[10px] tracking-wide text-[#6B6552] truncate">{userEmail}</p>
                  <Badge variant="blue" className="mt-1 text-xs">{roleLabels[userRole]}</Badge>
                </div>
                <button onClick={() => signOut({ callbackUrl: '/login' })}
                  className="flex items-center gap-3 w-full px-4 py-2.5 font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#E11D2A] hover:bg-[#EBE0C7] transition-colors">
                  <LogOut className="h-4 w-4" />Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}