import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, UsersRound, FileText, CreditCard, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatCurrency, formatDate } from '@/lib/utils'
import StatsCard from '@/components/dashboard/StatsCard'
import AnomalyAlerts from '@/components/admin/AnomalyAlerts'
import CreditRiskHeatmap from '@/components/admin/CreditRiskHeatmap'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const [
    totalMembers,
    totalGroups,
    pendingRequests,
    recentRequests,
    activeGroups,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'MEMBER' } }),
    prisma.group.count(),
    prisma.creditRequest.count({ where: { status: 'PENDING' } }),
    prisma.creditRequest.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        requester: { select: { name: true, email: true } },
        group: { select: { name: true } },
      },
    }),
    prisma.group.findMany({
      take: 5,
      include: {
        _count: { select: { members: true } },
        area: { select: { name: true } },
        wallet: { select: { balance: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const totalCreditApproved = await prisma.creditRequest.aggregate({
    where: { status: 'APPROVED' },
    _sum: { amount: true },
  })

  const totalIssued = Number(totalCreditApproved._sum.amount || 0)
  const approvedCount = recentRequests.filter((r) => r.status === 'APPROVED').length
  const rejectedCount = recentRequests.filter((r) => r.status === 'REJECTED').length

  const statusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return <Badge variant="success">Approved</Badge>
      case 'REJECTED': return <Badge variant="destructive">Rejected</Badge>
      default: return <Badge variant="warning">Pending</Badge>
    }
  }

  return (
    <div className="admin-shell">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="admin-heading">Admin Dashboard</h1>
          <p className="admin-subheading">Platform overview, approvals, and community operations.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/credit-requests">
            <Button size="sm" className="gap-1.5">
              <Clock className="h-4 w-4" />
              Review Requests
            </Button>
          </Link>
          <Link href="/admin/groups">
            <Button size="sm" variant="outline" className="gap-1.5">
              <UsersRound className="h-4 w-4" />
              Manage Groups
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Members"
          value={totalMembers}
          icon={<Users className="h-5 w-5 text-primary" />}
          description="Registered SASSA recipients"
          iconBg="bg-primary-light"
        />
        <StatsCard
          title="Active Groups"
          value={totalGroups}
          icon={<UsersRound className="h-5 w-5 text-success" />}
          description="Stokvel groups"
          iconBg="bg-green-50"
        />
        <StatsCard
          title="Pending Requests"
          value={pendingRequests}
          icon={<FileText className="h-5 w-5 text-warning" />}
          description="Awaiting approval"
          iconBg="bg-yellow-50"
          accentColor={pendingRequests > 0 ? '#F7B928' : undefined}
        />
        <StatsCard
          title="Credit Issued"
          value={formatCurrency(totalIssued)}
          icon={<CreditCard className="h-5 w-5 text-purple-600" />}
          description="Total approved credit"
          iconBg="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="admin-kpi-card">
          <CardContent className="admin-kpi-content">
            <p className="text-xs text-text-secondary">Recent Approvals</p>
            <p className="text-xl font-bold text-success mt-1">{approvedCount}</p>
            <p className="text-xs text-text-secondary mt-1">From latest 8 requests</p>
          </CardContent>
        </Card>
        <Card className="admin-kpi-card">
          <CardContent className="admin-kpi-content">
            <p className="text-xs text-text-secondary">Recent Rejections</p>
            <p className="text-xl font-bold text-danger mt-1">{rejectedCount}</p>
            <p className="text-xs text-text-secondary mt-1">From latest 8 requests</p>
          </CardContent>
        </Card>
        <Card className="admin-kpi-card">
          <CardContent className="admin-kpi-content">
            <p className="text-xs text-text-secondary">Conversion Trend</p>
            <p className="text-xl font-bold text-primary mt-1">
              {recentRequests.length > 0 ? Math.round((approvedCount / recentRequests.length) * 100) : 0}%
            </p>
            <p className="text-xs text-text-secondary mt-1">Approval rate (latest requests)</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Anomaly Alerts */}
      <AnomalyAlerts />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Credit Requests */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Recent Credit Requests</CardTitle>
              <Link href="/admin/credit-requests">
                <Button variant="ghost" size="sm" className="text-primary">
                  View all
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="admin-table-wrap">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <div className="flex flex-col items-center py-8 text-center">
                            <FileText className="h-8 w-8 text-text-secondary mb-2 opacity-40" />
                            <p className="text-sm font-medium text-text-secondary">No credit requests yet</p>
                            <p className="text-xs text-text-secondary mt-0.5">Requests will appear here once members submit them</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentRequests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{req.requester.name}</p>
                              <p className="text-xs text-text-secondary">{req.requester.email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{req.group.name}</TableCell>
                          <TableCell className="text-sm font-semibold">{formatCurrency(Number(req.amount))}</TableCell>
                          <TableCell>{statusBadge(req.status)}</TableCell>
                          <TableCell className="text-xs text-text-secondary">{formatDate(req.createdAt)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Groups */}
        <div>
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Active Groups</CardTitle>
              <Link href="/admin/groups">
                <Button variant="ghost" size="sm" className="text-primary">
                  View all
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {activeGroups.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <UsersRound className="h-8 w-8 text-text-secondary mb-2 opacity-40" />
                  <p className="text-sm font-medium text-text-secondary">No groups yet</p>
                  <p className="text-xs text-text-secondary mt-0.5">Create your first stokvel group to get started</p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {activeGroups.map((group) => (
                    <li key={group.id} className="px-6 py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{group.name}</p>
                          <p className="text-xs text-text-secondary">{group.area.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium text-primary">{group._count.members} members</p>
                          <p className="text-xs text-text-secondary">
                            {formatCurrency(Number(group.wallet?.balance || 0))}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/credit-requests" className="block">
                <Button variant="outline" className="w-full justify-start gap-2 text-sm">
                  <FileText className="h-4 w-4 text-warning" />
                  Review {pendingRequests} pending requests
                </Button>
              </Link>
              <Link href="/admin/groups" className="block">
                <Button variant="outline" className="w-full justify-start gap-2 text-sm">
                  <UsersRound className="h-4 w-4 text-primary" />
                  Manage groups
                </Button>
              </Link>
              <Link href="/admin/members" className="block">
                <Button variant="outline" className="w-full justify-start gap-2 text-sm">
                  <Users className="h-4 w-4 text-success" />
                  View all members
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* AI Credit Risk Heatmap */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <CreditRiskHeatmap />
      </div>
    </div>
  )
}
