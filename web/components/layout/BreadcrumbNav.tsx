'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

const PATH_LABELS: Record<string, string> = {
  member: 'Home',
  wallet: 'Wallet',
  'credit-request': 'Credit Request',
  group: 'My Group',
  'bulk-buy': 'Bulk Buy',
  noticeboard: 'Noticeboard',
  shop: 'Dashboard',
  transactions: 'Transactions',
  forecast: 'AI Forecast',
  restock: 'Restock Orders',
  receipts: 'Receipts',
  admin: 'Admin',
  members: 'Members',
  groups: 'Groups',
  areas: 'Areas',
  'credit-requests': 'Credit Requests',
  fraud: 'Fraud Detection',
}

export default function BreadcrumbNav() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length <= 1) return null

  const crumbs = segments.map((seg, i) => ({
    label: PATH_LABELS[seg] ?? seg,
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }))

  return (
    <nav className="flex items-center gap-1 text-[11px] text-text-secondary px-4 lg:px-6 py-2 border-b border-border bg-background/60">
      <Home className="h-3 w-3 flex-shrink-0" />
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3 text-border" />
          {crumb.isLast ? (
            <span className="font-semibold text-text-primary">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-primary transition-colors">{crumb.label}</Link>
          )}
        </span>
      ))}
    </nav>
  )
}