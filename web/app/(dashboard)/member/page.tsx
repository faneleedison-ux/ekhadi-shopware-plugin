import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Wallet, UsersRound, CreditCard, History, ArrowRight, Calendar } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatCurrency, formatDate, getMonthName } from '@/lib/utils'
import CreditBalanceCard from '@/components/dashboard/CreditBalanceCard'
import CreditHealthScoreCard from '@/components/dashboard/CreditHealthScoreCard'
import GrantProgressCard from '@/components/dashboard/GrantProgressCard'
import MemberVirtualCard from '@/components/dashboard/MemberVirtualCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

function numericSeed(input: string): string {
  const digits = input.replace(/\D/g, '')

  if (digits.length >= 16) {
    return digits.slice(0, 16)
  }

  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }

  const fallback = `${Math.abs(hash)}`.padEnd(16, '7').slice(0, 16)
  return fallback
}

function formatCardNumber(cardDigits: string) {
  return cardDigits.match(/.{1,4}/g)?.join(' ') ?? cardDigits
}

export default async function MemberDashboard() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'MEMBER') redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      customerProfile: {
        include: { area: { select: { name: true } } },
      },
      storeCredit: true,
      groupMemberships: {
        include: {
          group: {
            include: {
              area: { select: { name: true } },
              wallet: { select: { balance: true } },
              _count: { select: { members: true } },
              rotationCycles: {
                where: { status: { in: ['PENDING', 'ACTIVE'] } },
                orderBy: { month: 'asc' },
                take: 1,
              },
            },
          },
        },
        take: 1,
      },
      grantCycles: {
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      creditRequests: {
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { group: { select: { name: true } } },
      },
    },
  })

  if (!user) redirect('/login')

  // Fetch scoring inputs for AI Debt Health Score Card
  const [approvedRequestsCount, paidRepaymentsCount, pendingRepayments, completedCyclesCount] =
    await Promise.all([
      prisma.creditRequest.count({ where: { requesterId: user.id, status: 'APPROVED' } }),
      prisma.repaymentSchedule.count({ where: { userId: user.id, status: 'PAID' } }),
      prisma.repaymentSchedule.aggregate({
        where: { userId: user.id, status: 'PENDING' },
        _sum: { amount: true },
      }),
      prisma.grantCycle.count({ where: { userId: user.id, status: 'COMPLETED' } }),
    ])

  const outstandingDebt = Number(pendingRepayments._sum.amount || 0)

  const creditBalance = Number(user.storeCredit?.balance || 0)
  const activeGroup = user.groupMemberships[0]?.group
  const activeGrantCycle = user.grantCycles[0]
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const grantData = activeGrantCycle
    ? {
        grantAmount: Number(activeGrantCycle.grantAmount),
        spentAmount: Number(activeGrantCycle.spentAmount),
        repaidAmount: Number(activeGrantCycle.repaidAmount),
        month: activeGrantCycle.month,
        year: activeGrantCycle.year,
      }
    : {
        grantAmount: Number(user.customerProfile?.monthlyGrantAmount || 350),
        spentAmount: 0,
        repaidAmount: 0,
        month: currentMonth,
        year: currentYear,
      }

  const upcomingRotation = activeGroup?.rotationCycles[0]
  const sourceId = user.customerProfile?.sassaId || user.id
  const cardDigits = numericSeed(sourceId)
  const cardNumber = formatCardNumber(cardDigits)
  const cvv = cardDigits.slice(-3)
  const expiryMonth = String((now.getMonth() + 1 + 24) % 12 || 12).padStart(2, '0')
  const expiryYear = String((now.getFullYear() + 2) % 100).padStart(2, '0')
  const expiry = `${expiryMonth}/${expiryYear}`
  const tierLabel = activeGroup ? 'Community Gold' : 'Community Standard'

  return (
    <div className="space-y-5 animate-fade-in">
      <MemberVirtualCard
        cardHolder={user.name.toUpperCase()}
        cardNumber={cardNumber}
        expiry={expiry}
        cvv={cvv}
        tierLabel={tierLabel}
      />

      <div>
        <h1 className="text-xl font-bold text-text-primary">
          Hello, {user.name.split(' ')[0]} 👋
        </h1>
        <p className="text-text-secondary text-sm mt-0.5">
          {user.customerProfile?.area?.name || 'Your'} community credit dashboard
        </p>
      </div>

      {/* Credit Balance Card */}
      <CreditBalanceCard
        balance={creditBalance}
        memberName={user.name}
        sassaId={user.customerProfile?.sassaId}
      />

      {/* AI Debt Health Score Card */}
      <CreditHealthScoreCard
        approvedRequestsCount={approvedRequestsCount}
        paidRepaymentsCount={paidRepaymentsCount}
        outstandingDebt={outstandingDebt}
        completedCyclesCount={completedCyclesCount}
      />

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link href="/member/credit-request">
          <div className="bg-white rounded-xl p-4 border border-border hover:shadow-md transition-all flex flex-col items-center gap-2 cursor-pointer group">
            <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center group-hover:bg-primary transition-colors">
              <CreditCard className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
            </div>
            <span className="text-xs font-semibold text-text-primary text-center">Request Credit</span>
          </div>
        </Link>
        <Link href="/member/wallet">
          <div className="bg-white rounded-xl p-4 border border-border hover:shadow-md transition-all flex flex-col items-center gap-2 cursor-pointer group">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-success transition-colors">
              <Wallet className="h-5 w-5 text-success group-hover:text-white transition-colors" />
            </div>
            <span className="text-xs font-semibold text-text-primary text-center">My Wallet</span>
          </div>
        </Link>
        <Link href="/member/group">
          <div className="bg-white rounded-xl p-4 border border-border hover:shadow-md transition-all flex flex-col items-center gap-2 cursor-pointer group">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-600 transition-colors">
              <UsersRound className="h-5 w-5 text-purple-600 group-hover:text-white transition-colors" />
            </div>
            <span className="text-xs font-semibold text-text-primary text-center">My Group</span>
          </div>
        </Link>
        <Link href="/member/wallet">
          <div className="bg-white rounded-xl p-4 border border-border hover:shadow-md transition-all flex flex-col items-center gap-2 cursor-pointer group">
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center group-hover:bg-warning transition-colors">
              <History className="h-5 w-5 text-warning group-hover:text-white transition-colors" />
            </div>
            <span className="text-xs font-semibold text-text-primary text-center">History</span>
          </div>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Grant Progress */}
        <GrantProgressCard {...grantData} />

        {/* Active Group */}
        <Card>
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <CardTitle className="text-base">My Stokvel Group</CardTitle>
            <Link href="/member/group">
              <Button variant="ghost" size="sm" className="text-primary h-7 px-2">
                View <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {!activeGroup ? (
              <div className="text-center py-6">
                <UsersRound className="h-10 w-10 text-text-secondary mx-auto mb-3" />
                <p className="text-sm font-medium text-text-secondary">Not in a group yet</p>
                <p className="text-xs text-text-secondary mt-1">An admin will assign you to a stokvel group</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <div>
                    <p className="font-semibold text-text-primary">{activeGroup.name}</p>
                    <p className="text-xs text-text-secondary">{activeGroup.area.name}</p>
                  </div>
                  <Badge variant="success">{activeGroup._count.members} members</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-background rounded-lg text-center">
                    <p className="text-lg font-bold text-primary">
                      {formatCurrency(Number(activeGroup.wallet?.balance || 0))}
                    </p>
                    <p className="text-xs text-text-secondary">Group wallet</p>
                  </div>
                  <div className="p-3 bg-background rounded-lg text-center">
                    {upcomingRotation ? (
                      <>
                        <p className="text-sm font-bold text-text-primary">
                          {getMonthName(upcomingRotation.month)}
                        </p>
                        <p className="text-xs text-text-secondary">Next rotation</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-text-secondary">—</p>
                        <p className="text-xs text-text-secondary">No rotation</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent credit requests */}
      {user.creditRequests.length > 0 && (
        <Card>
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Requests</CardTitle>
            <Link href="/member/credit-request">
              <Button variant="ghost" size="sm" className="text-primary h-7 px-2">
                View all <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {user.creditRequests.map((req) => (
                <li key={req.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{req.reason}</p>
                    <p className="text-xs text-text-secondary">{formatDate(req.createdAt)} · {req.group.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">{formatCurrency(Number(req.amount))}</p>
                    <Badge
                      variant={
                        req.status === 'APPROVED' ? 'success' :
                        req.status === 'REJECTED' ? 'destructive' : 'warning'
                      }
                      className="text-xs mt-0.5"
                    >
                      {req.status}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
