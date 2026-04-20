import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { ArrowUpRight, TrendingUp } from 'lucide-react'
import ReceiptButton from '@/components/shop/ReceiptButton'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-text-primary">Transactions</h1>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-text-secondary">No shop profile found. Contact an admin.</p>
          </CardContent>
        </Card>
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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Transactions</h1>
        <p className="text-text-secondary mt-1">{shop.name} - {shop.area.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-text-secondary">Total Transactions</p>
            <p className="text-2xl font-bold text-text-primary mt-1">{transactions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-text-secondary">Total Volume</p>
            <p className="text-2xl font-bold text-success mt-1">{formatCurrency(totalVolume)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-text-secondary">Area Members</p>
            <p className="text-2xl font-bold text-primary mt-1">{shop.area._count.customerProfiles}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <div className="text-center py-10 text-text-secondary">No transactions found yet.</div>
          ) : (
            <ul className="divide-y divide-border">
              {transactions.map((tx) => (
                <li key={tx.id} className="flex items-center justify-between gap-3 px-6 py-3 hover:bg-gray-50/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-danger/10 flex items-center justify-center flex-shrink-0">
                      <ArrowUpRight className="h-4 w-4 text-danger" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{tx.user.name}</p>
                      <p className="text-xs text-text-secondary truncate">{tx.user.email}</p>
                      <p className="text-xs text-text-secondary mt-0.5 truncate">{tx.description}</p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 space-y-1">
                    <p className="text-sm font-semibold text-danger">-{formatCurrency(Number(tx.amount))}</p>
                    <p className="text-xs text-text-secondary">{formatDateTime(tx.createdAt)}</p>
                    <div className="flex items-center justify-end gap-2">
                      <Badge variant="destructive" className="text-xs">DEBIT</Badge>
                      <ReceiptButton transactionId={tx.id} />
                    </div>
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
