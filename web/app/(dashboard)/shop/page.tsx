import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Store, MapPin, Users, TrendingUp, ArrowUpRight, ArrowRight } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
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
      <div className="space-y-5 animate-fade-in">
        <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl px-5 py-4">
          <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552] mb-1">Shop · e-Khadi</p>
          <h1 className="font-[var(--serif)] italic text-2xl text-[#14130E] leading-tight">Shop Dashboard</h1>
        </div>
        <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl text-center py-14 px-5">
          <Store className="h-12 w-12 text-[#A89971] mx-auto mb-4" />
          <p className="font-[var(--sans-dawn)] font-semibold text-[#14130E]">No shop profile found</p>
          <p className="font-[var(--mono)] text-[10px] tracking-wide text-[#A89971] mt-2">Contact an admin to set up your shop account.</p>
        </div>
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

  const [todayTxCount, todayVolumeAgg] = await Promise.all([
    prisma.storeCreditHistory.count({ where: { type: 'DEBIT', ...memberFilter, createdAt: { gte: todayStart } } }),
    prisma.storeCreditHistory.aggregate({
      where: { type: 'DEBIT', ...memberFilter, createdAt: { gte: todayStart } },
      _sum: { amount: true },
    }),
  ])
  const todayVolume = Number(todayVolumeAgg._sum.amount ?? 0)

  const catCounts: Record<string, number> = {}
  for (const tx of topCategory) {
    const cat = tx.description.split(' - ').pop()?.trim() ?? ''
    if (cat) catCounts[cat] = (catCounts[cat] ?? 0) + 1
  }
  const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]
  const monthVol = Number(monthlyVolume._sum.amount ?? 0)

  const hourlyData = Array.from({ length: 24 }, (_, h) =>
    hourlyTx.filter((t) => new Date(t.createdAt).getHours() === h).length
  )
  const peakHour = hourlyData.indexOf(Math.max(...hourlyData, 1))
  const peakHourLabel = peakHour === 0 ? '12am' : peakHour === 12 ? '12pm' : peakHour < 12 ? `${peakHour}am` : `${peakHour - 12}pm`

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl px-5 py-4">
        <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552] mb-1">Shop · e-Khadi</p>
        <h1 className="font-[var(--serif)] italic text-2xl text-[#14130E] leading-tight">Shop Dashboard</h1>
        <div className="flex items-center gap-2 mt-1">
          <MapPin className="h-3 w-3 text-[#A89971]" />
          <p className="font-[var(--mono)] text-[10px] tracking-wide text-[#6B6552]">{shop.name} · {shop.area.name}, {shop.area.province}</p>
          <span className={`font-[var(--mono)] text-[9px] tracking-widest uppercase rounded px-2 py-0.5 border ${
            shop.isActive
              ? 'text-[#3F7B4F] border-[#3F7B4F]/30 bg-[#3F7B4F]/10'
              : 'text-[#E11D2A] border-[#E11D2A]/30 bg-[#E11D2A]/10'
          }`}>{shop.isActive ? 'Active' : 'Inactive'}</span>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Area Members', value: shop.area._count.customerProfiles, sub: 'In your area', icon: <Users className="h-5 w-5 text-[#4A5C8A]" />, bg: 'bg-[#4A5C8A]/10' },
          { label: 'Total Sales', value: totalTxCount, sub: 'All time', icon: <TrendingUp className="h-5 w-5 text-[#3F7B4F]" />, bg: 'bg-[#3F7B4F]/10' },
          { label: 'This Month', value: formatCurrency(monthVol), sub: '30-day volume', icon: <ArrowUpRight className="h-5 w-5 text-[#A07030]" />, bg: 'bg-[#A07030]/10' },
          { label: 'Top Category', value: topCat?.[0] ?? '—', sub: topCat ? `${topCat[1]} purchases` : 'No data yet', icon: <Store className="h-5 w-5 text-[#7B4F9B]" />, bg: 'bg-[#7B4F9B]/10' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl p-4">
            <div className={`w-9 h-9 ${kpi.bg} rounded-xl flex items-center justify-center mb-3`}>
              {kpi.icon}
            </div>
            <p className="font-[var(--serif)] italic text-xl text-[#14130E] leading-tight">{kpi.value}</p>
            <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552] mt-0.5">{kpi.label}</p>
            <p className="font-[var(--mono)] text-[10px] text-[#A89971] mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Today at a Glance */}
      <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[#C9BCA0]">
          <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552]">Live</p>
          <p className="font-[var(--serif)] italic text-lg text-[#14130E] leading-tight">Today at a Glance</p>
        </div>
        <div className="grid grid-cols-3 gap-0">
          <div className="text-center p-4 border-r border-[#C9BCA0] bg-[#F2E9D6]">
            <p className="font-[var(--serif)] italic text-2xl text-[#14130E]">{todayTxCount}</p>
            <p className="font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#6B6552] mt-0.5">Sales Today</p>
          </div>
          <div className="text-center p-4 border-r border-[#C9BCA0] bg-[#F2E9D6]">
            <p className="font-[var(--serif)] italic text-2xl text-[#3F7B4F]">{formatCurrency(todayVolume)}</p>
            <p className="font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#6B6552] mt-0.5">Revenue Today</p>
          </div>
          <div className="text-center p-4 bg-[#F2E9D6]">
            <p className="font-[var(--serif)] italic text-2xl text-[#E11D2A]">{peakHourLabel}</p>
            <p className="font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#6B6552] mt-0.5">Peak Hour</p>
          </div>
        </div>
        {todayTxCount === 0 && (
          <p className="font-[var(--mono)] text-[10px] tracking-wide text-[#A89971] text-center py-3 border-t border-[#C9BCA0]">
            No sales yet today. Members shop most at {peakHourLabel}.
          </p>
        )}
      </div>

      <SalesHeatmap hourlyData={hourlyData} />

      {/* Recent Activity */}
      <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#C9BCA0]">
          <div>
            <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552]">Sales</p>
            <p className="font-[var(--serif)] italic text-lg text-[#14130E] leading-tight">Recent Activity</p>
          </div>
          <Link href="/shop/transactions" className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#E11D2A] flex items-center gap-1 hover:opacity-70 transition-opacity">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {recentTx.length === 0 ? (
          <div className="text-center py-8 font-[var(--mono)] text-[11px] text-[#A89971]">No transactions yet</div>
        ) : (
          <ul>
            {recentTx.map((tx, i) => (
              <li key={tx.id} className={`flex items-center gap-3 px-5 py-3 border-b border-[#C9BCA0] last:border-0 ${i % 2 === 0 ? 'bg-[#EBE0C7]' : 'bg-[#F2E9D6]'}`}>
                <div className="w-8 h-8 rounded-full bg-[#E11D2A]/10 flex items-center justify-center flex-shrink-0">
                  <ArrowUpRight className="h-3.5 w-3.5 text-[#E11D2A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-[var(--sans-dawn)] text-sm font-medium text-[#14130E] truncate">{tx.user.name}</p>
                  <p className="font-[var(--mono)] text-[10px] tracking-wide text-[#6B6552]">{formatDateTime(tx.createdAt)}</p>
                </div>
                <p className="font-[var(--serif)] italic text-base text-[#E11D2A] flex-shrink-0">-{formatCurrency(Number(tx.amount))}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}