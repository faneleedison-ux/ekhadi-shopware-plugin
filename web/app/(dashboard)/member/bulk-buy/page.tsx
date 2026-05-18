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
      <div className="space-y-5 animate-fade-in">
        <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl px-5 py-4">
          <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552] mb-1">Community · e-Khadi</p>
          <h1 className="font-[var(--serif)] italic text-2xl text-[#14130E] leading-tight">Bulk Buy</h1>
        </div>
        <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl text-center py-16 px-5">
          <p className="font-[var(--sans-dawn)] font-bold text-[#14130E]">You need to be in a group to use Bulk Buy</p>
          <p className="font-[var(--mono)] text-[10px] tracking-wide text-[#A89971] mt-2">Contact an admin to be assigned to a stokvel group first.</p>
        </div>
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