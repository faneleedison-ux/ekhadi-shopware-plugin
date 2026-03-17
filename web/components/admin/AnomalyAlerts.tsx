import { prisma } from '@/lib/db'
import { AlertTriangle, AlertOctagon, ShieldCheck } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

type AlertSeverity = 'CRITICAL' | 'WARNING'

interface AnomalyAlert {
  id: string
  severity: AlertSeverity
  title: string
  detail: string
}

async function detectAnomalies(): Promise<AnomalyAlert[]> {
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

  const [recentRequests, monthlyLargeRequests, overdueRequests] = await Promise.all([
    // All requests in last 48 hours (for group frequency check)
    prisma.creditRequest.findMany({
      where: { createdAt: { gte: fortyEightHoursAgo } },
      select: {
        id: true,
        groupId: true,
        amount: true,
        group: { select: { name: true } },
        requester: { select: { name: true } },
      },
    }),
    // Requests >= R200 this month (for double-request check)
    prisma.creditRequest.findMany({
      where: {
        createdAt: { gte: monthStart },
        amount: { gte: 200 },
      },
      select: {
        id: true,
        requesterId: true,
        amount: true,
        requester: { select: { name: true } },
      },
    }),
    // Members with OVERDUE repayments who also submitted a request this month
    prisma.repaymentSchedule.findMany({
      where: { status: 'OVERDUE' },
      select: { userId: true, amount: true },
    }),
  ])

  const alerts: AnomalyAlert[] = []

  // ── Rule 1: 3+ requests from same group in 48 hours ──────────────────────────
  const groupCounts = new Map<string, { name: string; count: number; members: Set<string> }>()
  for (const req of recentRequests) {
    if (!groupCounts.has(req.groupId)) {
      groupCounts.set(req.groupId, { name: req.group.name, count: 0, members: new Set() })
    }
    const entry = groupCounts.get(req.groupId)!
    entry.count++
    entry.members.add(req.requester.name)
  }
  for (const [groupId, info] of groupCounts) {
    if (info.count >= 3) {
      alerts.push({
        id: `group-freq-${groupId}`,
        severity: 'CRITICAL',
        title: `High request frequency — ${info.name}`,
        detail: `${info.count} requests in 48 hours from ${info.members.size} member${info.members.size > 1 ? 's' : ''}: ${[...info.members].slice(0, 3).join(', ')}`,
      })
    }
  }

  // ── Rule 2: Same member requested R200+ twice or more this month ─────────────
  const memberLargeReqs = new Map<string, { name: string; count: number; total: number }>()
  for (const req of monthlyLargeRequests) {
    if (!memberLargeReqs.has(req.requesterId)) {
      memberLargeReqs.set(req.requesterId, { name: req.requester.name, count: 0, total: 0 })
    }
    const entry = memberLargeReqs.get(req.requesterId)!
    entry.count++
    entry.total += Number(req.amount)
  }
  for (const [userId, info] of memberLargeReqs) {
    if (info.count >= 2) {
      alerts.push({
        id: `double-max-${userId}`,
        severity: 'WARNING',
        title: `Repeated large requests — ${info.name}`,
        detail: `${info.count} requests ≥ R200 this month (total: ${formatCurrency(info.total)})`,
      })
    }
  }

  // ── Rule 3: Member with OVERDUE repayment submitted a new request this month ──
  const overdueUserIds = new Set(overdueRequests.map((r) => r.userId))
  if (overdueUserIds.size > 0) {
    const overdueWithNewRequest = await prisma.creditRequest.findMany({
      where: {
        requesterId: { in: [...overdueUserIds] },
        createdAt: { gte: monthStart },
      },
      select: {
        id: true,
        requesterId: true,
        amount: true,
        requester: { select: { name: true } },
      },
    })

    const seenUserIds = new Set<string>()
    for (const req of overdueWithNewRequest) {
      if (seenUserIds.has(req.requesterId)) continue
      seenUserIds.add(req.requesterId)

      const owedEntry = overdueRequests.find((r) => r.userId === req.requesterId)
      alerts.push({
        id: `overdue-newreq-${req.requesterId}`,
        severity: 'CRITICAL',
        title: `New request with overdue debt — ${req.requester.name}`,
        detail: `Requested ${formatCurrency(Number(req.amount))} this month with ${formatCurrency(Number(owedEntry?.amount ?? 0))} overdue`,
      })
    }
  }

  return alerts
}

export default async function AnomalyAlerts() {
  const alerts = await detectAnomalies()

  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL').length
  const warningCount = alerts.filter((a) => a.severity === 'WARNING').length

  return (
    <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertOctagon className={`h-5 w-5 ${alerts.length > 0 ? 'text-danger' : 'text-success'}`} />
          <h2 className="text-base font-bold text-text-primary">AI Anomaly Alerts</h2>
        </div>
        <div className="flex gap-2">
          {criticalCount > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
              {criticalCount} critical
            </span>
          )}
          {warningCount > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
              {warningCount} warning
            </span>
          )}
          {alerts.length === 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
              All clear
            </span>
          )}
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="flex items-center gap-3 py-4 text-text-secondary">
          <ShieldCheck className="h-8 w-8 text-success flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-success">No anomalies detected</p>
            <p className="text-xs mt-0.5">All request patterns are within normal thresholds.</p>
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {alerts.map((alert) => {
            const isCritical = alert.severity === 'CRITICAL'
            return (
              <li
                key={alert.id}
                className={`flex items-start gap-3 rounded-xl p-3 ${
                  isCritical ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'
                }`}
              >
                <AlertTriangle
                  className={`h-4 w-4 flex-shrink-0 mt-0.5 ${isCritical ? 'text-danger' : 'text-warning'}`}
                />
                <div>
                  <p className="text-sm font-semibold text-text-primary">{alert.title}</p>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{alert.detail}</p>
                </div>
                <span
                  className={`ml-auto flex-shrink-0 text-xs font-bold uppercase tracking-wide ${
                    isCritical ? 'text-danger' : 'text-warning'
                  }`}
                >
                  {alert.severity}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
