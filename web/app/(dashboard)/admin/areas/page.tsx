import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import AreasClient from '@/components/admin/AreasClient'

export default async function AreasPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const areas = await prisma.area.findMany({
    include: {
      shops: {
        include: { user: { select: { name: true, email: true } } },
      },
      _count: {
        select: { customerProfiles: true, groups: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  const areaView = areas.map((area) => ({
    id: area.id,
    name: area.name,
    province: area.province,
    createdAt: area.createdAt.toISOString(),
    memberCount: area._count.customerProfiles,
    groupCount: area._count.groups,
    shops: area.shops.map((shop) => ({
      id: shop.id,
      name: shop.name,
      isActive: shop.isActive,
      user: {
        name: shop.user.name,
        email: shop.user.email,
      },
    })),
  }))

  return <AreasClient areas={areaView} />
}
