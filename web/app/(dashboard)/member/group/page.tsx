import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { UsersRound, Calendar, Wallet, ShoppingCart, Zap, Pill, Baby, Package, Crown, User } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatCurrency, formatDate, getMonthName, getInitials } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

const bucketColors: Record<string, string> = {
  FOOD: 'bg-green-500',
  MEDICINE: 'bg-blue-500',
  TOILETRIES: 'bg-purple-500',
  ELECTRICITY: 'bg-yellow-500',
  BABY_PRODUCTS: 'bg-pink-500',
}

const bucketIcons: Record<string, React.ReactNode> = {
  FOOD: <ShoppingCart className="h-4 w-4" />,
  ELECTRICITY: <Zap className="h-4 w-4" />,
  MEDICINE: <Pill className="h-4 w-4" />,
  BABY_PRODUCTS: <Baby className="h-4 w-4" />,
  TOILETRIES: <Package className="h-4 w-4" />,
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
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-text-primary">My Group</h1>
        <Card>
          <CardContent className="text-center py-14">
            <UsersRound className="h-12 w-12 text-text-secondary mx-auto mb-4" />
            <p className="font-semibold text-text-primary">Not assigned to a group yet</p>
            <p className="text-sm text-text-secondary mt-2 max-w-sm mx-auto">
              An administrator will assign you to a stokvel group in your area. Check back soon.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const group = membership.group
  const wallet = group.wallet
  const buckets = wallet?.buckets || []
  const currentUserId = session.user.id

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">My Group</h1>
        <p className="text-text-secondary mt-1">{group.name}</p>
      </div>

      {/* Group overview */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-text-primary">{group.name}</h2>
              <div className="flex items-center gap-1.5 text-text-secondary mt-1">
                <span className="text-sm">{group.area.name}, {group.area.province}</span>
              </div>
              {group.description && (
                <p className="text-sm text-text-secondary mt-2">{group.description}</p>
              )}
            </div>
            <Badge variant="success" className="flex-shrink-0">Active</Badge>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-background rounded-xl">
              <p className="text-xl font-bold text-primary">{group.members.length}</p>
              <p className="text-xs text-text-secondary">Members</p>
            </div>
            <div className="text-center p-3 bg-background rounded-xl">
              <p className="text-xl font-bold text-success">{formatCurrency(Number(wallet?.balance || 0))}</p>
              <p className="text-xs text-text-secondary">Wallet</p>
            </div>
            <div className="text-center p-3 bg-background rounded-xl">
              <p className="text-xl font-bold text-text-primary">Day {group.rotationDay}</p>
              <p className="text-xs text-text-secondary">Rotation</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Members list */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Members ({group.members.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {group.members.map((member) => {
                const isCurrentUser = member.userId === currentUserId
                const isAdmin = member.role === 'ADMIN'
                const score = member.user.customerProfile?.creditScore || 0
                return (
                  <li
                    key={member.id}
                    className={cn(
                      'flex items-center gap-3 px-6 py-3',
                      isCurrentUser && 'bg-primary-light/50'
                    )}
                  >
                    <div className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold',
                      isCurrentUser ? 'bg-primary text-white' : 'bg-gray-100 text-text-secondary'
                    )}>
                      {getInitials(member.user.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium truncate">
                          {member.user.name}
                          {isCurrentUser && <span className="text-primary ml-1">(You)</span>}
                        </p>
                        {isAdmin && <Crown className="h-3 w-3 text-warning flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-text-secondary">Joined {formatDate(member.joinedAt)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={cn(
                        'text-xs font-semibold',
                        score >= 75 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-danger'
                      )}>
                        {score}
                      </p>
                      <p className="text-xs text-text-secondary">score</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>

        <div className="space-y-5">
          {/* Bucket allocations */}
          {buckets.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Spending Buckets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {buckets.map((bucket) => {
                  const allocated = Number(bucket.allocatedAmount)
                  const spent = Number(bucket.spentAmount)
                  const percent = allocated > 0 ? Math.min(100, Math.round((spent / allocated) * 100)) : 0
                  return (
                    <div key={bucket.id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <div className={cn('p-1.5 rounded-md text-white', bucketColors[bucket.category] || 'bg-gray-400')}>
                            {bucketIcons[bucket.category]}
                          </div>
                          <span className="text-xs font-medium">{bucket.category.replace('_', ' ')}</span>
                        </div>
                        <span className="text-xs text-text-secondary">
                          {formatCurrency(spent)} / {formatCurrency(allocated)}
                        </span>
                      </div>
                      <Progress value={percent} indicatorClassName={bucketColors[bucket.category]} className="h-2" />
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* Rotation schedule */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Rotation Schedule</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {group.rotationCycles.length === 0 ? (
                <div className="text-center py-6 text-sm text-text-secondary">
                  No rotation cycles scheduled yet
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {group.rotationCycles.map((cycle) => {
                    const isCurrentUserRecipient = cycle.recipientUserId === currentUserId
                    return (
                      <li key={cycle.id} className={cn(
                        'flex items-center justify-between px-6 py-3',
                        isCurrentUserRecipient && 'bg-primary-light/50'
                      )}>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-text-secondary flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium">
                              {getMonthName(cycle.month)} {cycle.year}
                            </p>
                            <p className="text-xs text-text-secondary">
                              {cycle.recipient.name}
                              {isCurrentUserRecipient && <span className="text-primary ml-1">(You)</span>}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{formatCurrency(Number(cycle.amount))}</p>
                          <Badge
                            variant={
                              cycle.status === 'COMPLETED' ? 'success' :
                              cycle.status === 'ACTIVE' ? 'blue' : 'secondary'
                            }
                            className="text-xs mt-0.5"
                          >
                            {cycle.status}
                          </Badge>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
