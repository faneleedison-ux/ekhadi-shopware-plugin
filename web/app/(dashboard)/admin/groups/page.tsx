import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { UsersRound, Plus } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default async function GroupsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Stokvel Groups</h1>
          <p className="text-text-secondary mt-1">{groups.length} active groups</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{groups.length}</p>
            <p className="text-xs text-text-secondary mt-1">Total Groups</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-success">
              {groups.reduce((acc, g) => acc + g._count.members, 0)}
            </p>
            <p className="text-xs text-text-secondary mt-1">Total Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-text-primary">
              {formatCurrency(groups.reduce((acc, g) => acc + Number(g.wallet?.balance || 0), 0))}
            </p>
            <p className="text-xs text-text-secondary mt-1">Total Wallet Balance</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <UsersRound className="h-4 w-4 text-primary" />
            All Groups
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group Name</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Wallet Balance</TableHead>
                <TableHead>Rotation Day</TableHead>
                <TableHead>Current Rotation</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-text-secondary py-12">
                    No groups yet. Create a group or run the seed for demo data.
                  </TableCell>
                </TableRow>
              ) : (
                groups.map((group) => {
                  const activeRotation = group.rotationCycles[0]
                  const isFull = group._count.members >= group.maxMembers
                  return (
                    <TableRow key={group.id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-sm">{group.name}</p>
                          {group.description && (
                            <p className="text-xs text-text-secondary truncate max-w-[180px]">
                              {group.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{group.area.name}</p>
                          <p className="text-xs text-text-secondary">{group.area.province}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {group._count.members}/{group.maxMembers}
                          </span>
                          {isFull && <Badge variant="destructive" className="text-xs">Full</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-sm">
                        {formatCurrency(Number(group.wallet?.balance || 0))}
                      </TableCell>
                      <TableCell className="text-sm">
                        Day {group.rotationDay}
                      </TableCell>
                      <TableCell>
                        {activeRotation ? (
                          <div>
                            <Badge variant="success">Active</Badge>
                            <p className="text-xs text-text-secondary mt-0.5">
                              {activeRotation.recipient.name}
                            </p>
                          </div>
                        ) : (
                          <Badge variant="secondary">No active rotation</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-text-secondary">
                        {formatDate(group.createdAt)}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
