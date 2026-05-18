import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, UsersRound, FileText, CreditCard, CheckCircle, XCircle, Clock, TrendingUp, ArrowRight } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatCurrency, formatDate } from '@/lib/utils'
import AnomalyAlerts from '@/components/admin/AnomalyAlerts'
import CreditRiskHeatmap from '@/components/admin/CreditRiskHeatmap'

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
  const approvalRate = recentRequests.length > 0 ? Math.round((approvedCount / recentRequests.length) * 100) : 0

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl px-5 py-4">
        <div className="flex items-end justify-between flex-wrap gap-3">
          <div>
            <div className="dawn-section-cap"><span className="dawn-section-cap-num">§ 01</span><span className="dawn-section-cap-rule" /><span className="dawn-section-cap-tag">Admin Dashboard</span></div>
            <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552] mb-1">Admin · e-Khadi</p>
            <h1 className="font-[var(--serif)] italic text-2xl text-[#14130E] leading-tight">Admin Dashboard</h1>
            <p className="font-[var(--mono)] text-[10px] tracking-wide text-[#6B6552] mt-1">Platform overview, approvals, and community operations.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/credit-requests">
              <div className="flex items-center gap-1.5 px-4 py-2 bg-[#E11D2A] rounded-xl font-[var(--mono)] text-[10px] tracking-widest uppercase text-white hover:bg-[#A60E1A] transition-colors cursor-pointer">
                <Clock className="h-3.5 w-3.5" />
                Review Requests
              </div>
            </Link>
            <Link href="/admin/groups">
              <div className="flex items-center gap-1.5 px-4 py-2 bg-[#F2E9D6] border border-[#C9BCA0] rounded-xl font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552] hover:border-[#E11D2A] hover:text-[#E11D2A] transition-colors cursor-pointer">
                <UsersRound className="h-3.5 w-3.5" />
                Manage Groups
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Members', value: totalMembers, sub: 'Registered SASSA recipients', icon: <Users className="h-5 w-5 text-[#4A5C8A]" />, bg: 'bg-[#4A5C8A]/10' },
          { label: 'Active Groups', value: totalGroups, sub: 'Stokvel groups', icon: <UsersRound className="h-5 w-5 text-[#3F7B4F]" />, bg: 'bg-[#3F7B4F]/10' },
          { label: 'Pending Requests', value: pendingRequests, sub: 'Awaiting approval', icon: <FileText className="h-5 w-5 text-[#A07030]" />, bg: 'bg-[#A07030]/10', highlight: pendingRequests > 0 },
          { label: 'Credit Issued', value: formatCurrency(totalIssued), sub: 'Total approved credit', icon: <CreditCard className="h-5 w-5 text-[#7B4F9B]" />, bg: 'bg-[#7B4F9B]/10' },
        ].map((kpi) => (
          <div key={kpi.label} className={`bg-[#EBE0C7] border rounded-2xl p-4 ${kpi.highlight ? 'border-[#A07030]/40' : 'border-[#C9BCA0]'}`}>
            <div className={`w-9 h-9 ${kpi.bg} rounded-xl flex items-center justify-center mb-3`}>
              {kpi.icon}
            </div>
            <p className="font-[var(--serif)] italic text-xl text-[#14130E] leading-tight">{kpi.value}</p>
            <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552] mt-0.5">{kpi.label}</p>
            <p className="font-[var(--mono)] text-[10px] text-[#A89971] mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Mini KPI row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl p-4 text-center">
          <p className="font-[var(--serif)] italic text-2xl text-[#3F7B4F]">{approvedCount}</p>
          <p className="font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#6B6552] mt-1">Recent Approvals</p>
          <p className="font-[var(--mono)] text-[9px] text-[#A89971]">From latest 8</p>
        </div>
        <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl p-4 text-center">
          <p className="font-[var(--serif)] italic text-2xl text-[#E11D2A]">{rejectedCount}</p>
          <p className="font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#6B6552] mt-1">Rejections</p>
          <p className="font-[var(--mono)] text-[9px] text-[#A89971]">From latest 8</p>
        </div>
        <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl p-4 text-center">
          <p className="font-[var(--serif)] italic text-2xl text-[#4A5C8A]">{approvalRate}%</p>
          <p className="font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#6B6552] mt-1">Approval Rate</p>
          <p className="font-[var(--mono)] text-[9px] text-[#A89971]">Latest requests</p>
        </div>
      </div>

      {/* AI Anomaly Alerts */}
      <AnomalyAlerts />

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Recent Credit Requests */}
        <div className="lg:col-span-2 bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#C9BCA0]">
            <div>
              <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552]">Credit</p>
              <p className="font-[var(--serif)] italic text-lg text-[#14130E] leading-tight">Recent Requests</p>
            </div>
            <Link href="/admin/credit-requests" className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#E11D2A] flex items-center gap-1 hover:opacity-70 transition-opacity">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentRequests.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center px-5">
              <FileText className="h-10 w-10 text-[#A89971] mb-3" />
              <p className="font-[var(--serif)] italic text-lg text-[#14130E]">Nothing here yet.</p>
              <p className="font-[var(--mono)] text-[10px] tracking-wide text-[#A89971] mt-1">Requests will appear here once members submit them</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#14130E]">
                    <th className="px-4 py-2.5 text-left font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#A89971]">Member</th>
                    <th className="px-4 py-2.5 text-left font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#A89971]">Group</th>
                    <th className="px-4 py-2.5 text-left font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#A89971]">Amount</th>
                    <th className="px-4 py-2.5 text-left font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#A89971]">Status</th>
                    <th className="px-4 py-2.5 text-left font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#A89971]">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRequests.map((req, i) => (
                    <tr key={req.id} className={`border-b border-[#C9BCA0] last:border-0 hover:bg-[#E11D2A]/3 transition-colors ${i % 2 === 0 ? 'bg-[#EBE0C7]' : 'bg-[#F2E9D6]'}`}>
                      <td className="px-4 py-3">
                        <p className="font-[var(--sans-dawn)] text-sm font-medium text-[#14130E]">{req.requester.name}</p>
                        <p className="font-[var(--mono)] text-[10px] text-[#6B6552]">{req.requester.email}</p>
                      </td>
                      <td className="px-4 py-3 font-[var(--sans-dawn)] text-sm text-[#14130E]">{req.group.name}</td>
                      <td className="px-4 py-3 font-[var(--serif)] italic text-base text-[#E11D2A]">{formatCurrency(Number(req.amount))}</td>
                      <td className="px-4 py-3">
                        <span className={`font-[var(--mono)] text-[9px] tracking-widest uppercase rounded px-2 py-0.5 border ${
                          req.status === 'APPROVED' ? 'text-[#3F7B4F] border-[#3F7B4F]/30 bg-[#3F7B4F]/10' :
                          req.status === 'REJECTED' ? 'text-[#E11D2A] border-[#E11D2A]/30 bg-[#E11D2A]/10' :
                          'text-[#A07030] border-[#A07030]/30 bg-[#A07030]/10'
                        }`}>{req.status}</span>
                      </td>
                      <td className="px-4 py-3 font-[var(--mono)] text-[10px] text-[#6B6552]">{formatDate(req.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Active Groups */}
          <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#C9BCA0]">
              <div>
                <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552]">Stokvel</p>
                <p className="font-[var(--serif)] italic text-base text-[#14130E]">Active Groups</p>
              </div>
              <Link href="/admin/groups" className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#E11D2A] flex items-center gap-1 hover:opacity-70 transition-opacity">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {activeGroups.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center px-4">
                <UsersRound className="h-10 w-10 text-[#A89971] mb-3" />
                <p className="font-[var(--serif)] italic text-lg text-[#14130E]">Nothing here yet.</p>
                <p className="font-[var(--mono)] text-[10px] tracking-wide text-[#A89971] mt-1">Groups will appear here once they are created</p>
              </div>
            ) : (
              <ul>
                {activeGroups.map((group, i) => (
                  <li key={group.id} className={`px-5 py-3 border-b border-[#C9BCA0] last:border-0 hover:bg-[#E11D2A]/4 transition-colors cursor-pointer ${i % 2 === 0 ? 'bg-[#EBE0C7]' : 'bg-[#F2E9D6]'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-[var(--sans-dawn)] text-sm font-semibold text-[#14130E]">{group.name}</p>
                        <p className="font-[var(--mono)] text-[10px] tracking-wide text-[#6B6552]">{group.area.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-[var(--mono)] text-[10px] text-[#E11D2A]">{group._count.members} members</p>
                        <p className="font-[var(--serif)] italic text-sm text-[#14130E]">
                          {formatCurrency(Number(group.wallet?.balance || 0))}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[#C9BCA0]">
              <p className="font-[var(--serif)] italic text-base text-[#14130E]">Quick Actions</p>
            </div>
            <div className="p-4 space-y-2">
              {[
                { href: '/admin/credit-requests', icon: <FileText className="h-4 w-4 text-[#A07030]" />, label: `Review ${pendingRequests} pending requests` },
                { href: '/admin/groups', icon: <UsersRound className="h-4 w-4 text-[#4A5C8A]" />, label: 'Manage groups' },
                { href: '/admin/members', icon: <Users className="h-4 w-4 text-[#3F7B4F]" />, label: 'View all members' },
              ].map((action) => (
                <Link key={action.href} href={action.href}>
                  <div className="flex items-center gap-3 px-4 py-3 bg-[#F2E9D6] border border-[#C9BCA0] rounded-xl hover:border-[#E11D2A] hover:bg-[#E11D2A]/5 transition-all cursor-pointer">
                    {action.icon}
                    <span className="font-[var(--mono)] text-[11px] tracking-wide text-[#14130E]">{action.label}</span>
                    <ArrowRight className="h-3 w-3 text-[#A89971] ml-auto" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Credit Risk Heatmap */}
      <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl p-5">
        <CreditRiskHeatmap />
      </div>
    </div>
  )
}
