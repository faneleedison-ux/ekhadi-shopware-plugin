'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Users,
  UsersRound,
  MapPin,
  CreditCard,
  FileText,
  Wallet,
  Home,
  Store,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  TrendingUp,
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

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
]

interface SidebarProps {
  userRole: string
  userName: string
  userEmail: string
}

export default function Sidebar({ userRole, userName, userEmail }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  const navItems =
    userRole === 'ADMIN'
      ? adminNavItems
      : userRole === 'MEMBER'
      ? memberNavItems
      : shopNavItems

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col h-screen sticky top-0 bg-primary text-white transition-all duration-300 ease-in-out z-30',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center h-16 px-4 border-b border-primary-dark/40', collapsed && 'justify-center')}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-primary font-bold text-sm">eK</span>
            </div>
            <span className="font-bold text-lg tracking-tight">e-Khadi</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-primary font-bold text-sm">eK</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && item.href !== '/member' && item.href !== '/shop' && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group',
                isActive
                  ? 'bg-white/20 text-white font-semibold'
                  : 'text-white/80 hover:bg-white/10 hover:text-white',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User section + collapse */}
      <div className="border-t border-primary-dark/40 p-2">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-semibold">{getInitials(userName)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              <p className="text-xs text-white/60 truncate">{userEmail}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors text-sm',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white/80 transition-colors text-sm mt-1',
            collapsed && 'justify-center px-2'
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
