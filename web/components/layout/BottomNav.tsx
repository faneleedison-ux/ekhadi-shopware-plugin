'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, UsersRound, FileText, Wallet, Home, CreditCard, Store, TrendingUp, Sparkles, Receipt, ShoppingBasket, Package, ShieldAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem { label: string; href: string; icon: React.ComponentType<{ className?: string }> }

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Members', href: '/admin/members', icon: Users },
  { label: 'Groups', href: '/admin/groups', icon: UsersRound },
  { label: 'Credits', href: '/admin/credit-requests', icon: FileText },
  { label: 'Fraud', href: '/admin/fraud', icon: ShieldAlert },
]
const memberNavItems: NavItem[] = [
  { label: 'Home', href: '/member', icon: Home },
  { label: 'Wallet', href: '/member/wallet', icon: Wallet },
  { label: 'Group', href: '/member/group', icon: UsersRound },
  { label: 'Credit', href: '/member/credit-request', icon: CreditCard },
  { label: 'Bulk Buy', href: '/member/bulk-buy', icon: ShoppingBasket },
]
const shopNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/shop', icon: Store },
  { label: 'Sales', href: '/shop/transactions', icon: TrendingUp },
  { label: 'AI Forecast', href: '/shop/forecast', icon: Sparkles },
  { label: 'Restock', href: '/shop/restock', icon: Package },
  { label: 'Receipts', href: '/shop/receipts', icon: Receipt },
]

export default function BottomNav({ userRole }: { userRole: string }) {
  const pathname = usePathname()
  const navItems = userRole === 'ADMIN' ? adminNavItems : userRole === 'MEMBER' ? memberNavItems : shopNavItems

  const activeIndex = navItems.findIndex(
    (item) =>
      pathname === item.href ||
      (item.href !== '/admin' &&
        item.href !== '/member' &&
        item.href !== '/shop' &&
        pathname.startsWith(item.href))
  )
  const indicatorIndex = activeIndex >= 0 ? activeIndex : 0

  return (
    <nav aria-label="Mobile navigation" className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border safe-area-pb shadow-lg" style={{ position: 'relative' }}>
      {/* Sliding active indicator */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: `calc(${indicatorIndex} * 25%)`,
          width: '25%',
          height: '2px',
          backgroundColor: '#E11D2A',
          transition: 'left 0.3s cubic-bezier(0.34,1.4,0.64,1)',
        }}
      />
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && item.href !== '/member' && item.href !== '/shop' && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}
              title={item.label}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
              className={cn('flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors flex-1 focus-visible:ring-2 focus-visible:ring-[#E11D2A] focus-visible:ring-offset-2 focus-visible:outline-none', isActive ? 'text-primary bg-white/15' : 'text-text-secondary hover:text-text-primary hover:bg-white/8')}>
              <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}