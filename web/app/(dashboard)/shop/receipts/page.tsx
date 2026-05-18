import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Receipt } from 'lucide-react'
import ReceiptButton from '@/components/shop/ReceiptButton'

export default async function ReceiptsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'SHOP') redirect('/login')

  const shop = await prisma.shop.findUnique({
    where: { userId: session.user.id },
    include: { area: true },
  })
  if (!shop) redirect('/shop')

  const areaMembers = await prisma.customerProfile.findMany({
    where: { areaId: shop.areaId },
    select: { userId: true },
  })
  const memberIds = areaMembers.map((m) => m.userId)

  const transactions = await prisma.storeCreditHistory.findMany({
    where: {
      type: 'DEBIT',
      ...(memberIds.length > 0 ? { userId: { in: memberIds } } : {}),
    },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl px-5 py-4">
        <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552] mb-1">Shop · e-Khadi</p>
        <h1 className="font-[var(--serif)] italic text-2xl text-[#14130E] leading-tight flex items-center gap-2">
          <Receipt className="h-5 w-5 text-[#E11D2A]" /> Receipts
        </h1>
        <p className="font-[var(--mono)] text-[10px] tracking-wide text-[#6B6552] mt-1">Download PDF receipts — stored on Huawei OBS</p>
      </div>

      {/* Receipts list */}
      <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[#C9BCA0]">
          <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552]">Records</p>
          <p className="font-[var(--serif)] italic text-lg text-[#14130E] leading-tight">Transaction Receipts</p>
        </div>

        {transactions.length === 0 ? (
          <p className="text-center py-10 font-[var(--mono)] text-[11px] text-[#A89971]">No transactions yet.</p>
        ) : (
          <ul>
            {transactions.map((tx, i) => (
              <li key={tx.id} className={`flex items-center justify-between gap-3 px-5 py-3 border-b border-[#C9BCA0] last:border-0 ${i % 2 === 0 ? 'bg-[#EBE0C7]' : 'bg-[#F2E9D6]'}`}>
                <div className="min-w-0">
                  <p className="font-[var(--sans-dawn)] text-sm font-medium text-[#14130E]">{tx.user.name}</p>
                  <p className="font-[var(--mono)] text-[10px] text-[#6B6552] truncate">{tx.description}</p>
                  <p className="font-[var(--mono)] text-[10px] text-[#A89971]">{formatDateTime(tx.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <p className="font-[var(--serif)] italic text-base text-[#E11D2A]">-{formatCurrency(Number(tx.amount))}</p>
                  <ReceiptButton transactionId={tx.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
