import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { Store, MapPin, Users, TrendingUp, ArrowUpRight, Clock, PieChart } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import StatsCard from '@/components/dashboard/StatsCard'
import PeakHoursChart from '@/components/shop/PeakHoursChart'
import CategorySpendDonut, { CategorySlice } from '@/components/shop/CategorySpendDonut'

const CATEGORY_SLICES: Omit<CategorySlice, 'amount'>[] = [
  { category: 'FOOD',          label: 'Food',          color: 'bg-green-500',  hex: '#22c55e' },
  { category: 'MEDICINE',      label: 'Medicine',      color: 'bg-blue-500',   hex: '#3b82f6' },
  { category: 'TOILETRIES',    label: 'Toiletries',    color: 'bg-purple-500', hex: '#a855f7' },
  { category: 'ELECTRICITY',   label: 'Electricity',   color: 'bg-yellow-500', hex: '#eab308' },
  { category: 'BABY_PRODUCTS', label: 'Baby Products', color: 'bg-pink-500',   hex: '#ec4899' },
]

export default async function ShopDashboard() {
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

  // Get member user IDs in this shop's area
  const areaMembers = shop
    ? await prisma.customerProfile.findMany({
        where: { areaId: shop.areaId },
        select: { userId: true },
      })
    : []

  const areaMemberIds = areaMembers.map((m) => m.userId)

  const memberFilter = areaMemberIds.length > 0 ? { userId: { in: areaMemberIds } } : {}

  const [recentTransactions, allDebitTimestamps, areaGroupBuckets] = await Promise.all([
    prisma.storeCreditHistory.findMany({
      where: { type: 'DEBIT', ...memberFilter },
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
    // All DEBIT timestamps for peak hours chart (last 90 days)
    prisma.storeCreditHistory.findMany({
      where: {
        type: 'DEBIT',
        ...memberFilter,
        createdAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      },
      select: { createdAt: true },
    }),
    // Category spend from group buckets in this area
    shop
      ? prisma.groupBucket.findMany({
          where: { wallet: { group: { areaId: shop.areaId } } },
          select: { category: true, spentAmount: true },
        })
      : Promise.resolve([]),
  ])

  // Build hour distribution (0–23)
  const hourCounts = new Array(24).fill(0) as number[]
  for (const tx of allDebitTimestamps) {
    hourCounts[new Date(tx.createdAt).getHours()]++
  }

  // Aggregate category spend
  const categoryTotals: Record<string, number> = {}
  for (const bucket of areaGroupBuckets) {
    const cat = bucket.category
    categoryTotals[cat] = (categoryTotals[cat] ?? 0) + Number(bucket.spentAmount)
  }
  const categorySlices: CategorySlice[] = CATEGORY_SLICES.map((meta) => ({
    ...meta,
    amount: categoryTotals[meta.category] ?? 0,
  }))

  const totalVolume = recentTransactions.reduce((sum, t) => sum + Number(t.amount), 0)

  if (!shop) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Store className="h-12 w-12 text-text-secondary mb-4" />
        <h2 className="text-lg font-semibold text-text-primary">No shop profile found</h2>
        <p className="text-sm text-text-secondary mt-1">Contact an admin to set up your shop account.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Shop Dashboard</h1>
        <p className="text-text-secondary mt-1">
          {shop.name} — Manage your e-Khadi transactions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Area Members"
          value={shop.area._count.customerProfiles}
          icon={<Users className="h-5 w-5 text-primary" />}
          description="In your coverage area"
          iconBg="bg-primary-light"
        />
        <StatsCard
          title="Transactions (All)"
          value={recentTransactions.length}
          icon={<TrendingUp className="h-5 w-5 text-success" />}
          description="Total processed"
          iconBg="bg-green-50"
        />
        <StatsCard
          title="Volume (ZAR)"
          value={formatCurrency(totalVolume)}
          icon={<ArrowUpRight className="h-5 w-5 text-warning" />}
          description="Total credit applied"
          iconBg="bg-yellow-50"
          className="col-span-2 lg:col-span-1"
        />
      </div>

      {/* Shop Info */}
      {shop && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Store className="h-4 w-4 text-primary" />
              Shop Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-text-secondary font-medium uppercase tracking-wide">Shop Name</p>
                  <p className="text-sm font-semibold mt-1">{shop.name}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary font-medium uppercase tracking-wide">Status</p>
                  <div className="mt-1">
                    <Badge variant={shop.isActive ? 'success' : 'destructive'}>
                      {shop.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-text-secondary font-medium uppercase tracking-wide">Coverage Area</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPin className="h-4 w-4 text-text-secondary" />
                    <p className="text-sm font-semibold">{shop.area.name}</p>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">{shop.area.province}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary font-medium uppercase tracking-wide">Active Members</p>
                  <p className="text-sm font-semibold mt-1">
                    {shop.area._count.customerProfiles} members in {shop.area.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-primary-light rounded-lg">
              <p className="text-xs font-medium text-primary">Accepted Categories</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Food', 'Medicine', 'Toiletries', 'Electricity', 'Baby Products'].map((cat) => (
                  <Badge key={cat} variant="blue" className="text-xs">{cat}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Charts row */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Peak Hours */}
        <Card>
          <CardHeader className="pb-3 flex-row items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Peak Transaction Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-text-secondary mb-3">
              When members are most active — based on last 90 days of DEBIT transactions.
            </p>
            <PeakHoursChart hourCounts={hourCounts} />
          </CardContent>
        </Card>

        {/* Category Spend Donut */}
        <Card>
          <CardHeader className="pb-3 flex-row items-center gap-2">
            <PieChart className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Top Spending Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-text-secondary mb-3">
              What your community actually needs most — aggregated from all stokvel group buckets in {shop.area.name}.
            </p>
            <CategorySpendDonut slices={categorySlices} />
          </CardContent>
        </Card>
      </div>

      {/* Transaction history */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentTransactions.length === 0 ? (
            <div className="text-center py-10">
              <TrendingUp className="h-10 w-10 text-text-secondary mx-auto mb-3" />
              <p className="text-sm font-medium text-text-secondary">No transactions yet</p>
              <p className="text-xs text-text-secondary mt-1">
                Transactions will appear here when members use their e-Khadi credit
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {recentTransactions.map((tx) => (
                <li key={tx.id} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50/50">
                  <div className="w-9 h-9 rounded-full bg-danger/10 flex items-center justify-center flex-shrink-0">
                    <ArrowUpRight className="h-4 w-4 text-danger" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tx.user.name}</p>
                    <p className="text-xs text-text-secondary">{formatDateTime(tx.createdAt)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-danger">-{formatCurrency(Number(tx.amount))}</p>
                    <p className="text-xs text-text-secondary truncate max-w-[100px]">{tx.description}</p>
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
