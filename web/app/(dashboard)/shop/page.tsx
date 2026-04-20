import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Store, MapPin, Users, TrendingUp, ArrowUpRight, Sparkles, Receipt, ArrowRight, CheckCircle } from 'lucide-react'
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

      {/* Quick links to other sections */}
      <div className="grid sm:grid-cols-3 gap-3">
        <Link href="/shop/forecast" className="group rounded-2xl border border-indigo-200 bg-gradient-to-br from-sky-50 to-indigo-50 p-4 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">AI</span>
          </div>
          <p className="font-semibold text-text-primary text-sm">AI Stock Forecast</p>
          <p className="text-xs text-text-secondary mt-0.5">See what to restock this week</p>
          <div className="flex items-center gap-1 mt-3 text-xs text-indigo-500 font-medium">View forecast <ArrowRight className="h-3 w-3" /></div>
        </Link>

        <Link href="/shop/transactions" className="group rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span className="text-xs font-bold text-green-600">{totalTxCount}</span>
          </div>
          <p className="font-semibold text-text-primary text-sm">Transactions</p>
          <p className="text-xs text-text-secondary mt-0.5">Full sales history & details</p>
          <div className="flex items-center gap-1 mt-3 text-xs text-green-600 font-medium">View all <ArrowRight className="h-3 w-3" /></div>
        </Link>

        <Link href="/shop/receipts" className="group rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50 p-4 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <Receipt className="h-5 w-5 text-blue-500" />
            <CheckCircle className="h-4 w-4 text-blue-400" />
          </div>
          <p className="font-semibold text-text-primary text-sm">Receipts</p>
          <p className="text-xs text-text-secondary mt-0.5">Download PDF receipts (OBS)</p>
          <div className="flex items-center gap-1 mt-3 text-xs text-blue-500 font-medium">View receipts <ArrowRight className="h-3 w-3" /></div>
        </Link>
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