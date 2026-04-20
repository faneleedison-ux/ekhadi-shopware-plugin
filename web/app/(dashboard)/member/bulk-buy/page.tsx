import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import BulkBuyBoard from '@/components/member/BulkBuyBoard'

export default async function BulkBuyPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'MEMBER') redirect('/login')

  const membership = await prisma.groupMember.findFirst({ where: { userId: session.user.id } })
  if (!membership) {
    return (
      <div className="text-center py-16">
        <p className="font-bold text-text-primary">You need to be in a group to use Bulk Buy</p>
      </div>
    )
  }

  const requests = await prisma.bulkBuyRequest.findMany({
    where: { groupId: membership.groupId, status: 'OPEN', expiresAt: { gte: new Date() } },
    orderBy: { createdAt: 'desc' },
    include: {
      creator: { select: { name: true } },
      participants: { include: { user: { select: { name: true } } } },
    },
  })

  return (
    <BulkBuyBoard
      requests={requests.map(r => ({
        id: r.id, title: r.title, description: r.description, category: r.category,
        unitPrice: Number(r.unitPrice), targetQty: r.targetQty, status: r.status,
        expiresAt: r.expiresAt.toISOString(),
        creator: r.creator,
        participants: r.participants.map(p => ({ id: p.id, quantity: p.quantity, user: p.user })),
      }))}
      currentUserId={session.user.id}
    />
  )
}