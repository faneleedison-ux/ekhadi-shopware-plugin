import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { Users } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import MembersTable, { type SerializedMember } from '@/components/admin/MembersTable'

export default async function MembersPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const rawMembers = await prisma.user.findMany({
    where: { role: 'MEMBER' },
    include: {
      customerProfile: {
        include: { area: { select: { name: true } } },
      },
      groupMemberships: {
        include: { group: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Serialize Dates to ISO strings for the client component
  const members: SerializedMember[] = rawMembers.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    phone: m.phone,
    createdAt: m.createdAt.toISOString(),
    customerProfile: m.customerProfile
      ? {
          sassaId: m.customerProfile.sassaId,
          monthlyGrantAmount: m.customerProfile.monthlyGrantAmount.toString(),
          creditScore: m.customerProfile.creditScore,
          isActive: m.customerProfile.isActive,
          area: m.customerProfile.area ?? null,
        }
      : null,
    groupMemberships: m.groupMemberships.map((gm) => ({
      group: { name: gm.group.name },
    })),
  }))

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl px-5 py-4 flex items-end justify-between flex-wrap gap-3">
        <div>
          <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552] mb-1">Admin · e-Khadi</p>
          <h1 className="font-[var(--serif)] italic text-2xl text-[#14130E] leading-tight">Members</h1>
          <p className="font-[var(--mono)] text-[10px] tracking-wide text-[#6B6552] mt-1">{members.length} registered members</p>
        </div>
        <div className="flex items-center gap-2 bg-[#F2E9D6] border border-[#C9BCA0] rounded-xl px-3 py-2">
          <Users className="h-4 w-4 text-[#4A5C8A]" />
          <span className="font-[var(--serif)] italic text-xl text-[#14130E]">{members.length}</span>
          <span className="font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#6B6552]">Total</span>
        </div>
      </div>

      {/* Members table with search + sort */}
      <MembersTable members={members} />
    </div>
  )
}
