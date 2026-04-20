'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, Users, UsersRound, MapPin, CreditCard,
  FileText, Wallet, Home, Store, ChevronLeft, ChevronRight, LogOut, TrendingUp, Sparkles, Receipt,
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'

interface NavItem { label: string; href: string; icon: React.ComponentType<{ className?: string }> }

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Members', href: '/admin/members', icon: Users },
  { label: 'Groups', href: '/admin/groups', icon: UsersRound },
  { label: 'Areas', href: '/admin/areas', icon: MapPin },
  { label: 'Credit Requests', href: '/admin/credit-requests', icon: FileText },
]
const memberNavItems: NavItem[] = [
  { label: 'Home', href: '/member', icon: Home },
  { label: 'Wallet', href: '/member/wallet', icon: Wallet },
  { label: 'My Group', href: '/member/group', icon: UsersRound },
  { label: 'Credit Request', href: '/member/credit-request', icon: CreditCard },
]
const shopNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/shop', icon: Store },
  { label: 'Transactions', href: '/shop/transactions', icon: TrendingUp },
  { label: 'AI Stock Forecast', href: '/shop/forecast', icon: Sparkles },
  { label: 'Receipts', href: '/shop/receipts', icon: Receipt },
]

interface SidebarProps { userRole: string; userName: string; userEmail: string }

export default function Sidebar({ userRole, userName, userEmail }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const navItems = userRole === 'ADMIN' ? adminNavItems : userRole === 'MEMBER' ? memberNavItems : shopNavItems

  return (
    <aside className={cn(
      'hidden lg:flex flex-col h-screen sticky top-0 bg-sidebar border-r border-white/8 transition-all duration-300 z-30',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className={cn('flex items-center h-16 px-4 border-b border-white/8', collapsed && 'justify-center')}>
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg shadow-white/40 ring-2 ring-white/30" style={{boxShadow:'0 0 18px 4px rgba(255,255,255,0.55), 0 0 6px 1px rgba(255,255,255,0.8)'}}>
              <span className="text-primary font-bold text-sm">eK</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-white" style={{textShadow:'0 0 12px rgba(255,255,255,0.6)'}}>e-Khadi</span>
          </div>
        ) : (
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center" style={{boxShadow:'0 0 18px 4px rgba(255,255,255,0.55), 0 0 6px 1px rgba(255,255,255,0.8)'}}>
            <span className="text-primary font-bold text-sm">eK</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && item.href !== '/member' && item.href !== '/shop' && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150',
                isActive ? 'bg-primary text-white font-semibold' : 'text-white/55 hover:bg-white/8 hover:text-white',
                collapsed && 'justify-center px-2'
              )}>
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-white/8 p-2">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <span className="text-primary text-xs font-semibold">{getInitials(userName)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              <p className="text-xs text-white/40 truncate">{userEmail}</p>
            </div>
          </div>
        )}
        <button onClick={() => signOut({ callbackUrl: '/login' })} title={collapsed ? 'Sign Out' : undefined}
          className={cn('flex items-center gap-3 w-full px-3 py-2 rounded-lg text-white/45 hover:bg-white/8 hover:text-white transition-colors text-sm', collapsed && 'justify-center px-2')}>
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
        <button onClick={() => setCollapsed(!collapsed)}
          className={cn('flex items-center gap-3 w-full px-3 py-2 rounded-lg text-white/30 hover:bg-white/8 hover:text-white/60 transition-colors text-sm mt-0.5', collapsed && 'justify-center px-2')}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  )
}