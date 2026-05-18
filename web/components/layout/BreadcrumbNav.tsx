'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const PATH_LABELS: Record<string, string> = {
  admin: 'Admin',
  members: 'Members',
  groups: 'Groups',
  areas: 'Areas',
  'credit-requests': 'Credit Requests',
  noticeboard: 'Noticeboard',
  fraud: 'Fraud Detection',
  member: 'Home',
  wallet: 'Wallet',
  group: 'My Group',
  'credit-request': 'Request Credit',
  'bulk-buy': 'Bulk Buy',
  profile: 'Profile',
  shop: 'Dashboard',
  transactions: 'Transactions',
  receipts: 'Receipts',
  restock: 'Restock',
  forecast: 'Forecast',
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
    <nav
      className="flex items-center gap-0 px-4 lg:px-6 py-2 border-b border-[#C9BCA0] bg-[#F4EDE1]/60"
      style={{ fontFamily: 'var(--mono)' }}
    >
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center">
          {i > 0 && (
            <span
              className="mx-2 text-[#E11D2A] text-[11px] select-none"
              aria-hidden="true"
            >
              ·
            </span>
          )}
          {crumb.isLast ? (
            <span className="text-[11px] text-[#14130E] font-medium tracking-wide">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="text-[11px] text-[#6B6552] tracking-wide hover:text-[#14130E] transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}