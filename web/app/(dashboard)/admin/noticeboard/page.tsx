import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import NoticeboardAdmin from '@/components/admin/NoticeboardAdmin'

export default async function AdminNoticeboardPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const notices = await prisma.noticeboard.findMany({
    orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    take: 30,
    include: { author: { select: { name: true } } },
  })
  const areas = await prisma.area.findMany({ select: { id: true, name: true } })

  return (
    <NoticeboardAdmin
      notices={notices.map(n => ({ ...n, createdAt: n.createdAt.toISOString(), updatedAt: n.updatedAt.toISOString() }))}
      areas={areas}
    />
  )
}