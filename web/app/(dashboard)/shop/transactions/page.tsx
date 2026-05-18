import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { ArrowUpRight, Users, TrendingUp } from 'lucide-react'
import ReceiptButton from '@/components/shop/ReceiptButton'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatCurrency, formatDateTime } from '@/lib/utils'

export default async function ShopTransactionsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'SHOP') redirect('/login')

  const shop = await prisma.shop.findUnique({
    where: { userId: session.user.id },
    include: {
      area: {
        include: {
          _count: { select: { customerProfiles: true } },
        },
      },
    },
  })

  if (!shop) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl px-5 py-4">
          <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552] mb-1">Shop · e-Khadi</p>
          <h1 className="font-[var(--serif)] italic text-2xl text-[#14130E] leading-tight">Transactions</h1>
        </div>
        <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl text-center py-10 px-5">
          <p className="font-[var(--mono)] text-[11px] text-[#A89971]">No shop profile found. Contact an admin.</p>
        </div>
      </div>
    )
  }

  const areaMembers = await prisma.customerProfile.findMany({
    where: { areaId: shop.areaId },
    select: { userId: true },
  })
  const areaMemberIds = areaMembers.map((m) => m.userId)

  const transactions = await prisma.storeCreditHistory.findMany({
    where: {
      type: 'DEBIT',
      ...(areaMemberIds.length > 0 ? { userId: { in: areaMemberIds } } : {}),
    },
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  const totalVolume = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0)

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl px-5 py-4">
        <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552] mb-1">Shop · e-Khadi</p>
        <h1 className="font-[var(--serif)] italic text-2xl text-[#14130E] leading-tight">Transactions</h1>
        <p className="font-[var(--mono)] text-[10px] tracking-wide text-[#6B6552] mt-1">{shop.name} · {shop.area.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl p-4 text-center">
          <p className="font-[var(--serif)] italic text-2xl text-[#14130E]">{transactions.length}</p>
          <p className="font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#6B6552] mt-1">Total Transactions</p>
        </div>
        <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl p-4 text-center">
          <p className="font-[var(--serif)] italic text-2xl text-[#3F7B4F]">{formatCurrency(totalVolume)}</p>
          <p className="font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#6B6552] mt-1">Total Volume</p>
        </div>
        <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl p-4 text-center">
          <p className="font-[var(--serif)] italic text-2xl text-[#E11D2A]">{shop.area._count.customerProfiles}</p>
          <p className="font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#6B6552] mt-1">Area Members</p>
        </div>
      </div>

      {/* Transactions list */}
      <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[#C9BCA0]">
          <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552]">Sales</p>
          <p className="font-[var(--serif)] italic text-lg text-[#14130E] leading-tight">Recent Transactions</p>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-10 font-[var(--mono)] text-[11px] text-[#A89971]">No transactions found yet.</div>
        ) : (
          <ul>
            {transactions.map((tx, i) => (
              <li key={tx.id} className={`flex items-center justify-between gap-3 px-5 py-3 border-b border-[#C9BCA0] last:border-0 hover:bg-[#E11D2A]/4 transition-colors ${i % 2 === 0 ? 'bg-[#EBE0C7]' : 'bg-[#F2E9D6]'}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#E11D2A]/10 flex items-center justify-center flex-shrink-0">
                    <ArrowUpRight className="h-4 w-4 text-[#E11D2A]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-[var(--sans-dawn)] text-sm font-medium text-[#14130E] truncate">{tx.user.name}</p>
                    <p className="font-[var(--mono)] text-[10px] text-[#6B6552] truncate">{tx.user.email}</p>
                    <p className="font-[var(--mono)] text-[10px] text-[#A89971] truncate">{tx.description}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 space-y-1">
                  <p className="font-[var(--serif)] italic text-base text-[#E11D2A]">-{formatCurrency(Number(tx.amount))}</p>
                  <p className="font-[var(--mono)] text-[10px] text-[#6B6552]">{formatDateTime(tx.createdAt)}</p>
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-[var(--mono)] text-[9px] tracking-widest uppercase rounded px-2 py-0.5 border text-[#E11D2A] border-[#E11D2A]/30 bg-[#E11D2A]/10">DEBIT</span>
                    <ReceiptButton transactionId={tx.id} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
