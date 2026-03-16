'use client'

import React, { useState, useEffect, useRef } from 'react'
import { signOut } from 'next-auth/react'
import { Bell, LogOut, ChevronDown, CheckCheck } from 'lucide-react'
import { getInitials, formatDateTime } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
}

interface HeaderProps {
  userName: string
  userEmail: string
  userRole: string
  pageTitle?: string
}

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrator',
  MEMBER: 'Member',
  SHOP: 'Shop Owner',
}

export default function Header({ userName, userEmail, userRole, pageTitle }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNotifications()
    // Poll every 30s for new notifications
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch {}
  }

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH' })
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const markOneRead = async (id: string) => {
    await fetch(`/api/notifications?id=${id}`, { method: 'PATCH' })
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const typeColor = (type: string) => {
    if (type === 'CREDIT_APPROVED') return 'bg-success/10 border-success/20'
    if (type === 'CREDIT_REJECTED') return 'bg-danger/10 border-danger/20'
    return 'bg-primary-light border-primary/20'
  }

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-border h-16 flex items-center px-4 lg:px-6 gap-4">
      {/* Page title — visible on desktop */}
      <div className="flex-1 min-w-0">
        {pageTitle && (
          <h1 className="text-lg font-semibold text-text-primary truncate hidden lg:block">
            {pageTitle}
          </h1>
        )}
        {/* Mobile: show e-Khadi brand */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">eK</span>
          </div>
          <span className="font-bold text-primary text-base">e-Khadi</span>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications)
              setShowDropdown(false)
            }}
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Bell className="h-5 w-5 text-text-secondary" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-danger rounded-full flex items-center justify-center px-0.5">
                <span className="text-white text-[10px] font-bold leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-border z-20 animate-fade-in overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-text-primary">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 bg-danger text-white rounded-full text-xs">
                        {unreadCount}
                      </span>
                    )}
                  </p>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <CheckCheck className="h-3 w-3" />
                      Mark all read
                    </button>
                  )}
                </div>

                <ul className="max-h-80 overflow-y-auto divide-y divide-border">
                  {notifications.length === 0 ? (
                    <li className="text-center py-8 text-text-secondary text-sm">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      No notifications yet
                    </li>
                  ) : (
                    notifications.map((n) => (
                      <li
                        key={n.id}
                        onClick={() => !n.read && markOneRead(n.id)}
                        className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-primary-light/40' : ''}`}
                      >
                        <div className={`rounded-lg p-2.5 border ${typeColor(n.type)}`}>
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-text-primary">{n.title}</p>
                            {!n.read && (
                              <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-0.5" />
                            )}
                          </div>
                          <p className="text-xs text-text-secondary mt-1 leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-text-secondary mt-1.5">{formatDateTime(n.createdAt)}</p>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowDropdown(!showDropdown)
              setShowNotifications(false)
            }}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white text-xs font-semibold">{getInitials(userName)}</span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-text-primary leading-tight">{userName}</p>
              <p className="text-xs text-text-secondary">{roleLabels[userRole] || userRole}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-text-secondary hidden sm:block" />
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-border z-20 py-1 animate-fade-in">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium text-text-primary">{userName}</p>
                  <p className="text-xs text-text-secondary truncate">{userEmail}</p>
                  <Badge variant="blue" className="mt-1 text-xs">
                    {roleLabels[userRole]}
                  </Badge>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}