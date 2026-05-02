import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Store, MapPin, Users, TrendingUp, ArrowUpRight, ArrowRight } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import StatsCard from '@/components/dashboard/StatsCard'
import SalesHeatmap from '@/components/shop/SalesHeatmap'

export default async function ShopDashboard() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'SHOP') redirect('/login')

  const shop = await prisma.shop.findUnique({
    where: { userId: session.user.id },
    include: { area: { include: { _count: { select: { customerProfiles: true } } } } },
  })

  if (!shop) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Store className="h-12 w-12 text-text-secondary mb-4" />
        <h2 className="text-lg font-semibold text-text-primary">No shop profile found</h2>
        <p className="text-sm text-text-secondary mt-1">Contact an admin to set up your shop account.</p>
      </div>
    )
  }

  const areaMembers = await prisma.customerProfile.findMany({
    where: { areaId: shop.areaId }, select: { userId: true },
  })
  const memberIds = areaMembers.map((m) => m.userId)
  const memberFilter = memberIds.length > 0 ? { userId: { in: memberIds } } : {}

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [recentTx, totalTxCount, monthlyVolume, topCategory, hourlyTx] = await Promise.all([
    prisma.storeCreditHistory.findMany({
      where: { type: 'DEBIT', ...memberFilter },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } },
    }),
    prisma.storeCreditHistory.count({ where: { type: 'DEBIT', ...memberFilter } }),
    prisma.storeCreditHistory.aggregate({
      where: { type: 'DEBIT', ...memberFilter, createdAt: { gte: thirtyDaysAgo } },
      _sum: { amount: true },
    }),
    prisma.storeCreditHistory.findMany({
      where: { type: 'DEBIT', ...memberFilter, createdAt: { gte: thirtyDaysAgo } },
      select: { description: true },
    }),
    prisma.storeCreditHistory.findMany({
      where: { type: 'DEBIT', ...memberFilter, createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    }),
  ])

  // Today's stats
  const [todayTxCount, todayVolumeAgg] = await Promise.all([
    prisma.storeCreditHistory.count({ where: { type: 'DEBIT', ...memberFilter, createdAt: { gte: todayStart } } }),
    prisma.storeCreditHistory.aggregate({
      where: { type: 'DEBIT', ...memberFilter, createdAt: { gte: todayStart } },
      _sum: { amount: true },
    }),
  ])
  const todayVolume = Number(todayVolumeAgg._sum.amount ?? 0)

  // Top category this month
  const catCounts: Record<string, number> = {}
  for (const tx of topCategory) {
    const cat = tx.description.split(' - ').pop()?.trim() ?? ''
    if (cat) catCounts[cat] = (catCounts[cat] ?? 0) + 1
  }
  const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]
  const monthVol = Number(monthlyVolume._sum.amount ?? 0)

  // Build hourly distribution (0-23)
  const hourlyData = Array.from({ length: 24 }, (_, h) =>
    hourlyTx.filter((t) => new Date(t.createdAt).getHours() === h).length
  )

  // Peak hour for "Today at a Glance"
  const peakHour = hourlyData.indexOf(Math.max(...hourlyData, 1))
  const peakHourLabel = peakHour === 0 ? '12am' : peakHour === 12 ? '12pm' : peakHour < 12 ? `${peakHour}am` : `${peakHour - 12}pm`

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Shop Dashboard</h1>
        <p className="text-text-secondary mt-1 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />{shop.name} · {shop.area.name}, {shop.area.province}
          <Badge variant={shop.isActive ? 'success' : 'destructive'} className="ml-1">{shop.isActive ? 'Active' : 'Inactive'}</Badge>
        </p>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Area Members" value={shop.area._count.customerProfiles} icon={<Users className="h-5 w-5 text-primary" />} description="In your area" iconBg="bg-primary-light" />
        <StatsCard title="Total Sales" value={totalTxCount} icon={<TrendingUp className="h-5 w-5 text-success" />} description="All time" iconBg="bg-green-50" />
        <StatsCard title="This Month" value={formatCurrency(monthVol)} icon={<ArrowUpRight className="h-5 w-5 text-warning" />} description="30-day volume" iconBg="bg-yellow-50" className="col-span-2 lg:col-span-1" />
        <StatsCard title="Top Category" value={topCat?.[0] ?? '—'} icon={<Store className="h-5 w-5 text-violet-500" />} description={topCat ? `${topCat[1]} purchases` : 'No data yet'} iconBg="bg-violet-50" className="col-span-2 lg:col-span-1" />
      </div>

      {/* Today at a Glance */}
      <div className="rounded-2xl border border-border bg-white p-4">
        <p className="text-sm font-bold text-text-primary mb-3">Today at a Glance</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-background rounded-xl">
            <p className="text-xl font-black text-text-primary">{todayTxCount}</p>
            <p className="text-[10px] text-text-secondary uppercase tracking-wide">Sales Today</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-xl">
            <p className="text-xl font-black text-success">{formatCurrency(todayVolume)}</p>
            <p className="text-[10px] text-text-secondary uppercase tracking-wide">Revenue Today</p>
          </div>
          <div className="text-center p-3 bg-primary-light rounded-xl">
            <p className="text-xl font-black text-primary">{peakHourLabel}</p>
            <p className="text-[10px] text-text-secondary uppercase tracking-wide">Peak Hour</p>
          </div>
        </div>
        {todayTxCount === 0 && (
          <p className="text-xs text-text-secondary text-center mt-3">No sales yet today. Members shop most at {peakHourLabel}.</p>
        )}
      </div>

      <SalesHeatmap hourlyData={hourlyData} />

      {/* Last 5 transactions summary */}
      <Card>
        <CardHeader className="pb-3 flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <Link href="/shop/transactions" className="text-xs text-primary hover:underline font-medium flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {recentTx.length === 0 ? (
            <div className="text-center py-8 text-text-secondary text-sm">No transactions yet</div>
          ) : (
            <ul className="divide-y divide-border">
              {recentTx.map((tx) => (
                <li key={tx.id} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50/50">
                  <div className="w-8 h-8 rounded-full bg-danger/10 flex items-center justify-center flex-shrink-0">
                    <ArrowUpRight className="h-3.5 w-3.5 text-danger" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tx.user.name}</p>
                    <p className="text-xs text-text-secondary">{formatDateTime(tx.createdAt)}</p>
                  </div>
                  <p className="text-sm font-semibold text-danger flex-shrink-0">-{formatCurrency(Number(tx.amount))}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}