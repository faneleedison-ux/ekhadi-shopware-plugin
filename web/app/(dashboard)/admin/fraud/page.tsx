import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import FraudAlertPanel from '@/components/admin/FraudAlertPanel'

export default async function FraudPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const alerts = await prisma.fraudAlert.findMany({
    where: { resolved: false },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { user: { select: { name: true, email: true } } },
  })

  return (
    <FraudAlertPanel
      alerts={alerts.map(a => ({
        id: a.id,
        type: a.type,
        description: a.description,
        createdAt: a.createdAt.toISOString(),
        user: a.user,
      }))}
    />
  )
}