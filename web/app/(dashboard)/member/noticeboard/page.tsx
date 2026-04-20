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
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" /> Community Noticeboard
        </h1>
        <p className="text-text-secondary mt-1">Announcements from your stokvel admin</p>
      </div>

      {notices.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-primary/8 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bell className="h-8 w-8 text-primary opacity-40" />
          </div>
          <p className="font-bold text-text-primary">No notices yet</p>
          <p className="text-sm text-text-secondary mt-1">Check back soon for community announcements</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notices.map(n => (
            <div key={n.id} className={`rounded-2xl border p-4 ${n.pinned ? 'bg-primary/5 border-primary/20' : 'bg-white border-border'}`}>
              {n.pinned && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-primary mb-2">
                  <Pin className="h-3 w-3" /> PINNED NOTICE
                </div>
              )}
              <p className="text-base font-bold text-text-primary">{n.title}</p>
              <p className="text-sm text-text-secondary mt-1.5 leading-relaxed whitespace-pre-wrap">{n.content}</p>
              <p className="text-[11px] text-text-secondary mt-3">
                Posted by <strong>{n.author.name}</strong> · {formatDate(new Date(n.createdAt))}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}