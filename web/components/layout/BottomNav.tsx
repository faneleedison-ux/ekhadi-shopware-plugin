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

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border safe-area-pb shadow-lg">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && item.href !== '/member' && item.href !== '/shop' && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}
              className={cn('flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors flex-1', isActive ? 'text-primary' : 'text-text-secondary hover:text-text-primary')}>
              <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}