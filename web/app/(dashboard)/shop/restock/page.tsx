import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import RestockForm from '@/components/shop/RestockForm'

export default async function RestockPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'SHOP') redirect('/login')

  const shop = await prisma.shop.findUnique({ where: { userId: session.user.id } })
  if (!shop) redirect('/shop')

  const orders = await prisma.restockOrder.findMany({
    where: { shopId: shop.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  return <RestockForm shopName={shop.name} recentOrders={orders.map(o => ({ ...o, items: o.items as any, createdAt: o.createdAt.toISOString(), updatedAt: o.updatedAt.toISOString() }))} />
}