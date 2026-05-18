import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { UsersRound, CreditCard, ArrowRight, Calendar, QrCode, ShoppingBasket, Wallet } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatCurrency, formatDate, getMonthName } from '@/lib/utils'
import MemberVirtualCard from '@/components/dashboard/MemberVirtualCard'
import CreditHealthScoreCard from '@/components/dashboard/CreditHealthScoreCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import GrantStatusCard from '@/components/member/GrantStatusCard'
import StreakBadges from '@/components/member/StreakBadges'

function numericSeed(input: string): string {
  const digits = input.replace(/\D/g, '')
  if (digits.length >= 16) return digits.slice(0, 16)
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return `${Math.abs(hash)}`.padEnd(16, '7').slice(0, 16)
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
  const firstName = user.name.split(' ')[0]
  const areaName = user.customerProfile?.area?.name

  const greeting = (() => {
    const h = now.getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <div className="space-y-5 animate-fade-in">

      {/* 1. Greeting */}
      <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl px-5 py-4">
        <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552] mb-1">
          {areaName ?? 'Community'} · e-Khadi
        </p>
        <h1 className="font-[var(--serif)] italic text-2xl text-[#14130E] leading-tight">
          {greeting}, {firstName}.
        </h1>
        <p className="font-[var(--mono)] text-[10px] tracking-wide text-[#6B6552] mt-1">
          {now.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* 2. Virtual Card — balance is front and centre */}
      <MemberVirtualCard
        cardHolder={user.name.toUpperCase()}
        cardNumber={cardNumber}
        expiry={expiry}
        cvv={cvv}
        tierLabel={tierLabel}
        balance={creditBalance}
        creditLimit={300}
      />

      {/* 3. Journey / gamification — prominent, not buried */}
      <StreakBadges
        paidRepaymentsCount={paidRepaymentsCount}
        approvedRequestsCount={approvedRequestsCount}
        completedCyclesCount={completedCyclesCount}
      />

      {/* 3b. Onboarding card for new members */}
      {user.creditRequests.length === 0 && creditBalance === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary-light/30 p-5 text-center space-y-3">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-bold text-text-primary">Welcome to e-Khadi!</p>
            <p className="text-sm text-text-secondary mt-1">Request your first credit to start shopping at approved spaza shops in your area.</p>
          </div>
          <Link href="/member/credit-request">
            <Button className="w-full sm:w-auto">Request your first credit →</Button>
          </Link>
        </div>
      )}

      {/* 4. Quick actions */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { href: '/member/credit-request', icon: CreditCard,    label: 'Request Credit', iconColor: 'text-[#E11D2A]', bg: 'bg-[#E11D2A]/10' },
          { href: '/member/wallet',          icon: QrCode,        label: 'Scan & Pay',     iconColor: 'text-[#3F7B4F]', bg: 'bg-[#3F7B4F]/10' },
          { href: '/member/bulk-buy',        icon: ShoppingBasket,label: 'Bulk Buy',       iconColor: 'text-[#4A5C8A]', bg: 'bg-[#4A5C8A]/10' },
          { href: '/member/wallet',          icon: Wallet,        label: 'My Wallet',      iconColor: 'text-[#A07030]', bg: 'bg-[#A07030]/10' },
        ].map(({ href, icon: Icon, label, iconColor, bg }) => (
          <Link key={label} href={href}>
            <div className="bg-[#EBE0C7] rounded-2xl p-3 border border-[#C9BCA0] hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col items-center gap-2 cursor-pointer group">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center group-hover:bg-[#E11D2A] transition-colors`}>
                <Icon className={`h-5 w-5 ${iconColor} group-hover:text-white transition-colors`} />
              </div>
              <span className="font-[var(--mono)] text-[10px] tracking-wide uppercase text-[#14130E] text-center leading-tight">{label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* 5. Grant status — unified card */}
      <GrantStatusCard {...grantData} />

      {/* 6. Credit health — with clear next step */}
      <CreditHealthScoreCard
        approvedRequestsCount={approvedRequestsCount}
        paidRepaymentsCount={paidRepaymentsCount}
        outstandingDebt={outstandingDebt}
        completedCyclesCount={completedCyclesCount}
      />

      {/* 7. My group */}
      <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#C9BCA0]">
          <div>
            <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552]">Stokvel</p>
            <p className="font-[var(--serif)] italic text-lg text-[#14130E] leading-tight">My Group</p>
          </div>
          <Link href="/member/group" className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#E11D2A] flex items-center gap-1 hover:opacity-70 transition-opacity">
            View <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="p-4">
          {!activeGroup ? (
            <div className="text-center py-6">
              <UsersRound className="h-10 w-10 text-[#A89971] mx-auto mb-3" />
              <p className="font-[var(--sans-dawn)] text-sm font-medium text-[#6B6552]">Not in a group yet</p>
              <p className="font-[var(--mono)] text-[10px] tracking-wide text-[#A89971] mt-1">An admin will assign you to a stokvel group</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#F2E9D6] border border-[#C9BCA0] rounded-xl">
                <div>
                  <p className="font-[var(--serif)] italic text-base text-[#14130E]">{activeGroup.name}</p>
                  <p className="font-[var(--mono)] text-[10px] tracking-wide uppercase text-[#6B6552]">{activeGroup.area.name}</p>
                </div>
                <span className="font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#3F7B4F] border border-[#3F7B4F]/30 bg-[#3F7B4F]/10 rounded px-2 py-1">{activeGroup._count.members} members</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#F2E9D6] border border-[#C9BCA0] rounded-xl text-center">
                  <p className="font-[var(--serif)] italic text-lg text-[#E11D2A]">
                    {formatCurrency(Number(activeGroup.wallet?.balance || 0))}
                  </p>
                  <p className="font-[var(--mono)] text-[10px] tracking-wide uppercase text-[#6B6552]">Group wallet</p>
                </div>
                <div className="p-3 bg-[#F2E9D6] border border-[#C9BCA0] rounded-xl text-center">
                  {upcomingRotation ? (
                    <>
                      <p className="font-[var(--serif)] italic text-base text-[#14130E]">{getMonthName(upcomingRotation.month)}</p>
                      <p className="font-[var(--mono)] text-[10px] tracking-wide uppercase text-[#6B6552]">Next rotation</p>
                    </>
                  ) : (
                    <>
                      <p className="font-[var(--serif)] italic text-base text-[#A89971]">—</p>
                      <p className="font-[var(--mono)] text-[10px] tracking-wide uppercase text-[#A89971]">No rotation</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 8. Recent credit requests */}
      {user.creditRequests.length > 0 && (
        <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#C9BCA0]">
            <div>
              <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552]">Credit</p>
              <p className="font-[var(--serif)] italic text-lg text-[#14130E] leading-tight">Recent Requests</p>
            </div>
            <Link href="/member/credit-request" className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#E11D2A] flex items-center gap-1 hover:opacity-70 transition-opacity">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ul>
            {user.creditRequests.map((req, i) => (
              <li key={req.id} className={`flex items-center justify-between px-5 py-3 border-b border-[#C9BCA0] last:border-0 ${i % 2 === 0 ? 'bg-[#EBE0C7]' : 'bg-[#F2E9D6]'}`}>
                <div>
                  <p className="font-[var(--sans-dawn)] text-sm font-medium text-[#14130E]">{req.reason}</p>
                  <p className="font-[var(--mono)] text-[10px] tracking-wide text-[#6B6552]">{formatDate(req.createdAt)} · {req.group.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-[var(--serif)] italic text-base text-[#E11D2A]">{formatCurrency(Number(req.amount))}</p>
                  <span className={`font-[var(--mono)] text-[9px] tracking-widest uppercase rounded px-2 py-0.5 border ${
                    req.status === 'APPROVED' ? 'text-[#3F7B4F] border-[#3F7B4F]/30 bg-[#3F7B4F]/10' :
                    req.status === 'REJECTED' ? 'text-[#E11D2A] border-[#E11D2A]/30 bg-[#E11D2A]/10' :
                    'text-[#A07030] border-[#A07030]/30 bg-[#A07030]/10'
                  }`}>{req.status}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  )
}