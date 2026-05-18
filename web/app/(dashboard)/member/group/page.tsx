import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { UsersRound, Calendar, Crown, ShoppingCart, Zap, Pill, Baby, Package } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatCurrency, formatDate, getMonthName, getInitials } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

const bucketBar: Record<string, string> = {
  FOOD: 'bg-[#3F7B4F]',
  MEDICINE: 'bg-[#4A5C8A]',
  TOILETRIES: 'bg-[#7B4F9B]',
  ELECTRICITY: 'bg-[#A07030]',
  BABY_PRODUCTS: 'bg-[#B05070]',
}

const bucketIcons: Record<string, React.ReactNode> = {
  FOOD: <ShoppingCart className="h-3.5 w-3.5" />,
  ELECTRICITY: <Zap className="h-3.5 w-3.5" />,
  MEDICINE: <Pill className="h-3.5 w-3.5" />,
  BABY_PRODUCTS: <Baby className="h-3.5 w-3.5" />,
  TOILETRIES: <Package className="h-3.5 w-3.5" />,
}

export default async function GroupPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'MEMBER') redirect('/login')

  const membership = await prisma.groupMember.findFirst({
    where: { userId: session.user.id },
    include: {
      group: {
        include: {
          area: { select: { name: true, province: true } },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  customerProfile: { select: { creditScore: true } },
                },
              },
            },
            orderBy: { joinedAt: 'asc' },
          },
          wallet: {
            include: { buckets: true },
          },
          rotationCycles: {
            include: {
              recipient: { select: { id: true, name: true } },
            },
            orderBy: [{ year: 'desc' }, { month: 'desc' }],
            take: 6,
          },
        },
      },
    },
  })

  if (!membership) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl px-5 py-4">
          <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552] mb-1">Stokvel · e-Khadi</p>
          <h1 className="font-[var(--serif)] italic text-2xl text-[#14130E] leading-tight">My Group</h1>
        </div>
        <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl text-center py-14 px-5">
          <UsersRound className="h-12 w-12 text-[#A89971] mx-auto mb-4" />
          <p className="font-[var(--sans-dawn)] font-semibold text-[#14130E]">Not assigned to a group yet</p>
          <p className="font-[var(--mono)] text-[10px] tracking-wide text-[#A89971] mt-2 max-w-sm mx-auto">
            An administrator will assign you to a stokvel group in your area. Check back soon.
          </p>
        </div>
      </div>
    )
  }

  const group = membership.group
  const wallet = group.wallet
  const buckets = wallet?.buckets || []
  const currentUserId = session.user.id

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl px-5 py-4">
        <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552] mb-1">Stokvel · e-Khadi</p>
        <h1 className="font-[var(--serif)] italic text-2xl text-[#14130E] leading-tight">My Group</h1>
        <p className="font-[var(--mono)] text-[10px] tracking-wide text-[#6B6552] mt-1">{group.name} · {group.area.name}</p>
      </div>

      {/* Group overview */}
      <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[#C9BCA0] flex items-start justify-between">
          <div>
            <p className="font-[var(--serif)] italic text-lg text-[#14130E]">{group.name}</p>
            <p className="font-[var(--mono)] text-[10px] tracking-wide uppercase text-[#6B6552]">{group.area.name}, {group.area.province}</p>
            {group.description && <p className="font-[var(--sans-dawn)] text-sm text-[#6B6552] mt-1">{group.description}</p>}
          </div>
          <span className="font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#3F7B4F] border border-[#3F7B4F]/30 bg-[#3F7B4F]/10 rounded px-2 py-1">Active</span>
        </div>
        <div className="grid grid-cols-3 gap-0">
          {[
            { label: 'Members', value: group.members.length, serif: true },
            { label: 'Wallet', value: formatCurrency(Number(wallet?.balance || 0)), serif: true, red: false, green: true },
            { label: 'Rotation Day', value: `Day ${group.rotationDay}`, serif: true },
          ].map((stat, i) => (
            <div key={stat.label} className={`text-center p-4 ${i < 2 ? 'border-r border-[#C9BCA0]' : ''} bg-[#F2E9D6]`}>
              <p className={`font-[var(--serif)] italic text-xl ${stat.green ? 'text-[#3F7B4F]' : 'text-[#E11D2A]'}`}>{stat.value}</p>
              <p className="font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#6B6552] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Members list */}
        <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-[#C9BCA0]">
            <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552]">Stokvel</p>
            <p className="font-[var(--serif)] italic text-lg text-[#14130E]">Members ({group.members.length})</p>
          </div>
          <ul>
            {group.members.map((member, i) => {
              const isCurrentUser = member.userId === currentUserId
              const isAdmin = member.role === 'ADMIN'
              const score = member.user.customerProfile?.creditScore || 0
              return (
                <li
                  key={member.id}
                  className={cn(
                    'flex items-center gap-3 px-5 py-3 border-b border-[#C9BCA0] last:border-0',
                    isCurrentUser ? 'bg-[#E11D2A]/5' : i % 2 === 0 ? 'bg-[#EBE0C7]' : 'bg-[#F2E9D6]'
                  )}
                >
                  <div className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-[var(--mono)] text-xs font-bold',
                    isCurrentUser ? 'bg-[#E11D2A] text-white' : 'bg-[#C9BCA0] text-[#6B6552]'
                  )}>
                    {getInitials(member.user.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-[var(--sans-dawn)] text-sm font-medium text-[#14130E] truncate">
                        {member.user.name}
                        {isCurrentUser && <span className="text-[#E11D2A] ml-1 font-[var(--mono)] text-[10px]">(You)</span>}
                      </p>
                      {isAdmin && <Crown className="h-3 w-3 text-[#A07030] flex-shrink-0" />}
                    </div>
                    <p className="font-[var(--mono)] text-[10px] tracking-wide text-[#6B6552]">Joined {formatDate(member.joinedAt)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={cn(
                      'font-[var(--serif)] italic text-base',
                      score >= 75 ? 'text-[#3F7B4F]' : score >= 50 ? 'text-[#A07030]' : 'text-[#E11D2A]'
                    )}>
                      {score}
                    </p>
                    <p className="font-[var(--mono)] text-[9px] tracking-widest uppercase text-[#A89971]">score</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="space-y-5">
          {/* Bucket allocations */}
          {buckets.length > 0 && (
            <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-[#C9BCA0]">
                <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552]">Budget</p>
                <p className="font-[var(--serif)] italic text-lg text-[#14130E]">Spending Buckets</p>
              </div>
              <div className="p-4 space-y-4">
                {buckets.map((bucket) => {
                  const allocated = Number(bucket.allocatedAmount)
                  const spent = Number(bucket.spentAmount)
                  const percent = allocated > 0 ? Math.min(100, Math.round((spent / allocated) * 100)) : 0
                  return (
                    <div key={bucket.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={cn('p-1.5 rounded-lg text-white', bucketBar[bucket.category] || 'bg-[#A89971]')}>
                            {bucketIcons[bucket.category]}
                          </div>
                          <span className="font-[var(--mono)] text-[11px] tracking-wide text-[#14130E]">{bucket.category.replace('_', ' ')}</span>
                        </div>
                        <span className="font-[var(--mono)] text-[10px] text-[#6B6552]">
                          {formatCurrency(spent)} / {formatCurrency(allocated)}
                        </span>
                      </div>
                      <Progress value={percent} indicatorClassName={bucketBar[bucket.category]} className="h-1.5" />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Rotation schedule */}
          <div className="bg-[#EBE0C7] border border-[#C9BCA0] rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[#C9BCA0]">
              <p className="font-[var(--mono)] text-[10px] tracking-widest uppercase text-[#6B6552]">Stokvel</p>
              <p className="font-[var(--serif)] italic text-lg text-[#14130E]">Rotation Schedule</p>
            </div>

            {group.rotationCycles.length === 0 ? (
              <div className="text-center py-6 font-[var(--mono)] text-[10px] tracking-wide text-[#A89971]">
                No rotation cycles scheduled yet
              </div>
            ) : (
              <ul>
                {group.rotationCycles.map((cycle, i) => {
                  const isCurrentUserRecipient = cycle.recipientUserId === currentUserId
                  return (
                    <li key={cycle.id} className={cn(
                      'flex items-center justify-between px-5 py-3 border-b border-[#C9BCA0] last:border-0',
                      isCurrentUserRecipient ? 'bg-[#E11D2A]/5' : i % 2 === 0 ? 'bg-[#EBE0C7]' : 'bg-[#F2E9D6]'
                    )}>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#A89971] flex-shrink-0" />
                        <div>
                          <p className="font-[var(--sans-dawn)] text-sm font-medium text-[#14130E]">
                            {getMonthName(cycle.month)} {cycle.year}
                          </p>
                          <p className="font-[var(--mono)] text-[10px] tracking-wide text-[#6B6552]">
                            {cycle.recipient.name}
                            {isCurrentUserRecipient && <span className="text-[#E11D2A] ml-1">(You)</span>}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-[var(--serif)] italic text-base text-[#14130E]">{formatCurrency(Number(cycle.amount))}</p>
                        <span className={`font-[var(--mono)] text-[9px] tracking-widest uppercase rounded px-2 py-0.5 border ${
                          cycle.status === 'COMPLETED' ? 'text-[#3F7B4F] border-[#3F7B4F]/30 bg-[#3F7B4F]/10' :
                          cycle.status === 'ACTIVE' ? 'text-[#4A5C8A] border-[#4A5C8A]/30 bg-[#4A5C8A]/10' :
                          'text-[#A07030] border-[#A07030]/30 bg-[#A07030]/10'
                        }`}>{cycle.status}</span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}