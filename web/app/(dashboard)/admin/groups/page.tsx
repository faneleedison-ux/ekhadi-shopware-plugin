import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import GroupsTableClient from '@/components/admin/GroupsTableClient'

export default async function GroupsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const areas = await prisma.area.findMany({
    select: { id: true, name: true, province: true },
    orderBy: { name: 'asc' },
  })

  const groups = await prisma.group.findMany({
    include: {
      area: { select: { name: true, province: true } },
      _count: { select: { members: true } },
      wallet: { select: { balance: true } },
      rotationCycles: {
        where: { status: 'ACTIVE' },
        include: { recipient: { select: { name: true } } },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const groupView = groups.map((group) => ({
    id: group.id,
    name: group.name,
    description: group.description,
    area: {
      name: group.area.name,
      province: group.area.province,
    },
    memberCount: group._count.members,
    maxMembers: group.maxMembers,
    walletBalance: Number(group.wallet?.balance || 0),
    rotationDay: group.rotationDay,
    createdAt: group.createdAt.toISOString(),
    activeRecipientName: group.rotationCycles[0]?.recipient.name ?? null,
  }))

  return <GroupsTableClient groups={groupView} areas={areas} />
}
