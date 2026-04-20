import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Receipts</h1>
        <p className="text-text-secondary mt-1">Download PDF receipts for any transaction — stored on Huawei OBS</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" />
            Transaction Receipts
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <p className="text-center py-10 text-text-secondary text-sm">No transactions yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {transactions.map((tx) => (
                <li key={tx.id} className="flex items-center justify-between gap-3 px-6 py-3 hover:bg-gray-50/50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary">{tx.user.name}</p>
                    <p className="text-xs text-text-secondary">{tx.description}</p>
                    <p className="text-xs text-text-secondary">{formatDateTime(tx.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="text-sm font-semibold text-danger">-{formatCurrency(Number(tx.amount))}</p>
                    <ReceiptButton transactionId={tx.id} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}