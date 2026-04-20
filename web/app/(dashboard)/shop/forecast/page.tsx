import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import StockForecastCard, { ForecastItem } from '@/components/shop/StockForecastCard'

const CATEGORY_META: Record<string, { label: string; emoji: string; suggestions: (count: number) => string[] }> = {
  food:            { label: 'Food & Groceries', emoji: '🍞', suggestions: (n) => [`Stock ${Math.max(20, n * 2)}+ loaves of bread this week`, 'Maize meal, cooking oil, and rice move fast', 'Canned goods and long-life milk recommended'] },
  groceries:       { label: 'Food & Groceries', emoji: '🍞', suggestions: (n) => [`Stock ${Math.max(20, n * 2)}+ loaves of bread this week`, 'Maize meal and cooking oil are top sellers'] },
  medicine:        { label: 'Medicine', emoji: '💊', suggestions: (n) => [`Keep ${Math.max(40, n * 3)}+ headache tablets in stock`, 'Flu medication and antacids in demand', 'Baby Panado and Calpol frequently requested'] },
  toiletries:      { label: 'Toiletries & Hygiene', emoji: '🧴', suggestions: (n) => ['Soap, toothpaste, and shampoo are essentials', `Stock ${Math.max(15, n)}+ bars of soap`, 'Sanitary products sell consistently'] },
  electricity:     { label: 'Electricity & Airtime', emoji: '⚡', suggestions: (n) => [`Prepaid electricity tokens: expect ${Math.max(10, n)} purchases/week`, 'Airtime vouchers across all networks needed', 'Data bundles increasingly popular'] },
  'baby products': { label: 'Baby Products', emoji: '🍼', suggestions: (n) => [`Stock ${Math.max(10, n)}+ nappy packs`, 'Baby formula and cereal high demand', 'Baby wipes and Vaseline are weekly staples'] },
}

export default async function ForecastPage() {
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
  const memberFilter = memberIds.length > 0 ? { userId: { in: memberIds } } : {}

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)

  const [last30, prev30] = await Promise.all([
    prisma.storeCreditHistory.findMany({
      where: { type: 'DEBIT', ...memberFilter, createdAt: { gte: thirtyDaysAgo } },
      select: { description: true },
    }),
    prisma.storeCreditHistory.findMany({
      where: { type: 'DEBIT', ...memberFilter, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      select: { description: true },
    }),
  ])

  const parseCat = (desc: string) => desc.split(' - ').pop()?.toLowerCase().trim() ?? ''
  const countCats = (items: { description: string }[]) => {
    const counts: Record<string, number> = {}
    for (const item of items) {
      const cat = parseCat(item.description)
      if (cat) counts[cat] = (counts[cat] ?? 0) + 1
    }
    return counts
  }

  const current = countCats(last30)
  const prev = countCats(prev30)
  const total = Object.values(current).reduce((a, b) => a + b, 0)

  const forecastItems: ForecastItem[] = Object.entries(current)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, count]) => {
      const meta = CATEGORY_META[cat]
      const prevCount = prev[cat] ?? 0
      const trend = prevCount > 0 ? Math.round(((count - prevCount) / prevCount) * 100) : 0
      return {
        category: meta?.label ?? cat.charAt(0).toUpperCase() + cat.slice(1),
        emoji: meta?.emoji ?? '📦',
        percent: total > 0 ? Math.round((count / total) * 100) : 0,
        count,
        trend,
        suggestions: meta?.suggestions(count) ?? [`${count} purchases this month`],
      }
    })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">AI Stock Forecast</h1>
        <p className="text-text-secondary mt-1">{shop.name} — {shop.area.name}</p>
      </div>
      <StockForecastCard items={forecastItems} totalTransactions={last30.length} areaName={shop.area.name} />
    </div>
  )
}