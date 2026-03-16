import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { Users } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

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

  const getCreditBadge = (score: number | undefined) => {
    if (!score && score !== 0) return <Badge variant="secondary">No score</Badge>
    if (score >= 75) return <Badge variant="success">{score} Excellent</Badge>
    if (score >= 50) return <Badge variant="warning">{score} Good</Badge>
    return <Badge variant="destructive">{score} Low</Badge>
  }

  return (
    <div className="admin-shell">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="admin-heading">Members</h1>
          <p className="admin-subheading">{members.length} registered members</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            All Members
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="admin-table-wrap">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>SASSA ID</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Grant Amount</TableHead>
                  <TableHead>Credit Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-text-secondary py-12">
                      No members registered yet. Run the seed to add demo data.
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-sm text-text-primary">{member.name}</p>
                          <p className="text-xs text-text-secondary">{member.email}</p>
                          {member.phone && <p className="text-xs text-text-secondary">{member.phone}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        {member.customerProfile?.sassaId || '—'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {member.customerProfile?.area?.name || '—'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {member.groupMemberships.length > 0
                          ? member.groupMemberships.map((gm) => gm.group.name).join(', ')
                          : <span className="text-text-secondary">No group</span>}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {member.customerProfile
                          ? formatCurrency(Number(member.customerProfile.monthlyGrantAmount))
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {getCreditBadge(member.customerProfile?.creditScore)}
                      </TableCell>
                      <TableCell>
                        {member.customerProfile?.isActive ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-text-secondary">
                        {formatDate(member.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
