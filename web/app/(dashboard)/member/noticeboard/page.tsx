import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Bell, Pin } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function MemberNoticeboardPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'MEMBER') redirect('/login')

  const profile = await prisma.customerProfile.findUnique({
    where: { userId: session.user.id }, select: { areaId: true },
  })

  const notices = await prisma.noticeboard.findMany({
    where: profile?.areaId
      ? { OR: [{ areaId: profile.areaId }, { areaId: null }] }
      : { areaId: null },
    orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    include: { author: { select: { name: true } } },
  })

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl px-5 py-4">
        <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552] mb-1">Community · e-Khadi</p>
        <h1 className="font-[var(--serif)] italic text-2xl text-[#14130E] leading-tight flex items-center gap-2">
          <Bell className="h-5 w-5 text-[#E11D2A]" /> Noticeboard
        </h1>
        <p className="font-[var(--mono)] text-[10px] tracking-wide text-[#6B6552] mt-1">Announcements from your stokvel admin</p>
      </div>

      {notices.length === 0 ? (
        <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl text-center py-16 px-5">
          <div className="w-16 h-16 bg-[#E11D2A]/8 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bell className="h-8 w-8 text-[#E11D2A] opacity-30" />
          </div>
          <p className="font-[var(--sans-dawn)] font-bold text-[#14130E]">No notices yet</p>
          <p className="font-[var(--mono)] text-[10px] tracking-wide text-[#A89971] mt-1">Check back soon for community announcements</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map((n, i) => (
            <div key={n.id} className={`rounded-2xl border overflow-hidden ${
              n.pinned
                ? 'bg-[#E11D2A]/5 border-[#E11D2A]/20'
                : i % 2 === 0 ? 'bg-[#EBE0C7] border-[#C9BCA0]' : 'bg-[#F2E9D6] border-[#C9BCA0]'
            }`}>
              {n.pinned && (
                <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[#E11D2A]/20 bg-[#E11D2A]/8">
                  <Pin className="h-3 w-3 text-[#E11D2A]" />
                  <span className="font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#E11D2A]">Pinned Notice</span>
                </div>
              )}
              <div className="p-4">
                <p className="font-[var(--serif)] italic text-lg text-[#14130E] leading-tight">{n.title}</p>
                <p className="font-[var(--sans-dawn)] text-sm text-[#6B6552] mt-2 leading-relaxed whitespace-pre-wrap">{n.content}</p>
                <p className="font-[var(--mono)] text-[10px] tracking-wide text-[#A89971] mt-3">
                  Posted by <strong className="text-[#6B6552]">{n.author.name}</strong> · {formatDate(new Date(n.createdAt))}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
