import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { Users } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatDate, formatCurrency } from '@/lib/utils'

export default async function MembersPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const members = await prisma.user.findMany({
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

  const scoreBadge = (score: number | undefined) => {
    if (!score && score !== 0) return <span className="font-[var(--mono)] text-[9px] tracking-widest uppercase rounded px-2 py-0.5 border text-[#A89971] border-[#A89971]/30 bg-[#A89971]/10">No score</span>
    if (score >= 75) return <span className="font-[var(--mono)] text-[9px] tracking-widest uppercase rounded px-2 py-0.5 border text-[#3F7B4F] border-[#3F7B4F]/30 bg-[#3F7B4F]/10">{score} Excellent</span>
    if (score >= 50) return <span className="font-[var(--mono)] text-[9px] tracking-widest uppercase rounded px-2 py-0.5 border text-[#A07030] border-[#A07030]/30 bg-[#A07030]/10">{score} Good</span>
    return <span className="font-[var(--mono)] text-[9px] tracking-widest uppercase rounded px-2 py-0.5 border text-[#E11D2A] border-[#E11D2A]/30 bg-[#E11D2A]/10">{score} Low</span>
  }

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

      {/* Members table */}
      <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[#C9BCA0]">
          <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552]">Community</p>
          <p className="font-[var(--serif)] italic text-lg text-[#14130E] leading-tight">All Members</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#14130E]">
                <th className="px-4 py-2.5 text-left font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#A89971]">Name</th>
                <th className="px-4 py-2.5 text-left font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#A89971]">SASSA ID</th>
                <th className="px-4 py-2.5 text-left font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#A89971]">Area</th>
                <th className="px-4 py-2.5 text-left font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#A89971]">Group</th>
                <th className="px-4 py-2.5 text-left font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#A89971]">Grant</th>
                <th className="px-4 py-2.5 text-left font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#A89971]">Score</th>
                <th className="px-4 py-2.5 text-left font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#A89971]">Status</th>
                <th className="px-4 py-2.5 text-left font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#A89971]">Joined</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 font-[var(--mono)] text-[11px] text-[#A89971]">
                    No members registered yet. Run the seed to add demo data.
                  </td>
                </tr>
              ) : (
                members.map((member, i) => (
                  <tr key={member.id} className={`border-b border-[#C9BCA0] last:border-0 ${i % 2 === 0 ? 'bg-[#EBE0C7]' : 'bg-[#F2E9D6]'}`}>
                    <td className="px-4 py-3">
                      <p className="font-[var(--sans-dawn)] text-sm font-medium text-[#14130E]">{member.name}</p>
                      <p className="font-[var(--mono)] text-[10px] text-[#6B6552]">{member.email}</p>
                      {member.phone && <p className="font-[var(--mono)] text-[10px] text-[#6B6552]">{member.phone}</p>}
                    </td>
                    <td className="px-4 py-3 font-[var(--mono)] text-[11px] text-[#14130E]">
                      {member.customerProfile?.sassaId || '—'}
                    </td>
                    <td className="px-4 py-3 font-[var(--sans-dawn)] text-sm text-[#14130E]">
                      {member.customerProfile?.area?.name || '—'}
                    </td>
                    <td className="px-4 py-3 font-[var(--sans-dawn)] text-sm text-[#14130E]">
                      {member.groupMemberships.length > 0
                        ? member.groupMemberships.map((gm) => gm.group.name).join(', ')
                        : <span className="text-[#A89971]">No group</span>}
                    </td>
                    <td className="px-4 py-3 font-[var(--serif)] italic text-base text-[#E11D2A]">
                      {member.customerProfile
                        ? formatCurrency(Number(member.customerProfile.monthlyGrantAmount))
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {scoreBadge(member.customerProfile?.creditScore)}
                    </td>
                    <td className="px-4 py-3">
                      {member.customerProfile?.isActive ? (
                        <span className="font-[var(--mono)] text-[9px] tracking-widest uppercase rounded px-2 py-0.5 border text-[#3F7B4F] border-[#3F7B4F]/30 bg-[#3F7B4F]/10">Active</span>
                      ) : (
                        <span className="font-[var(--mono)] text-[9px] tracking-widest uppercase rounded px-2 py-0.5 border text-[#A89971] border-[#A89971]/30 bg-[#A89971]/10">Inactive</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-[var(--mono)] text-[10px] text-[#6B6552]">
                      {formatDate(member.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
