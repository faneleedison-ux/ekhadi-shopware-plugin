'use client'
import { usePathname } from 'next/navigation'

const PAGE_LABELS: Record<string, string> = {
  '/admin': 'Dashboard', '/admin/members': 'Members', '/admin/groups': 'Groups',
  '/admin/areas': 'Areas', '/admin/credit-requests': 'Credit Requests',
  '/admin/noticeboard': 'Noticeboard', '/admin/fraud': 'Fraud Detection',
  '/member': 'Home', '/member/wallet': 'Wallet', '/member/group': 'My Group',
  '/member/credit-request': 'Request Credit', '/member/noticeboard': 'Noticeboard',
  '/member/bulk-buy': 'Bulk Buy', '/member/profile': 'Profile',
  '/shop': 'Dashboard', '/shop/transactions': 'Transactions',
  '/shop/receipts': 'Receipts', '/shop/restock': 'Restock Orders',
  '/shop/forecast': 'AI Forecast',
}

const PORTAL_LABELS: Record<string, string> = {
  admin: 'Admin Portal', member: 'Member Portal', shop: 'Shop Portal',
}

export default function ContextPath() {
  const pathname = usePathname()
  const portal = pathname.split('/')[1]
  const portalLabel = PORTAL_LABELS[portal] ?? ''
  const pageLabel = PAGE_LABELS[pathname] ?? ''
  if (!portalLabel) return null
  return (
    <span className="hidden lg:flex items-center gap-2 font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#A89971]">
      <span>{portalLabel}</span>
      {pageLabel && pageLabel !== 'Dashboard' && (
        <><span className="text-[#C9BCA0]">·</span><span className="text-[#6B6552]">{pageLabel}</span></>
      )}
    </span>
  )
}
