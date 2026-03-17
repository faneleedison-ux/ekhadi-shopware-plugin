import { prisma } from '@/lib/db'

const SA_PROVINCES = [
  'Gauteng',
  'Western Cape',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Free State',
  'Northern Cape',
]

type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'NO_DATA'

interface ProvinceRisk {
  province: string
  riskLevel: RiskLevel
  riskScore: number        // 0–1
  totalRequests: number
  rejectedRequests: number
  rejectionRate: number    // 0–1
  overdueRepayments: number
  overdueRate: number      // 0–1
}

const riskConfig: Record<RiskLevel, { bg: string; border: string; badge: string; label: string; dot: string }> = {
  HIGH: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
    label: 'High Risk',
    dot: 'bg-red-500',
  },
  MEDIUM: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    label: 'Medium Risk',
    dot: 'bg-amber-500',
  },
  LOW: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-700',
    label: 'Low Risk',
    dot: 'bg-green-500',
  },
  NO_DATA: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    badge: 'bg-gray-100 text-gray-500',
    label: 'No Data',
    dot: 'bg-gray-400',
  },
}

async function getProvinceRiskData(): Promise<ProvinceRisk[]> {
  const [areas, profiles, requests, repayments] = await Promise.all([
    prisma.area.findMany({ select: { id: true, province: true } }),
    prisma.customerProfile.findMany({ select: { userId: true, areaId: true } }),
    prisma.creditRequest.findMany({ select: { requesterId: true, status: true } }),
    prisma.repaymentSchedule.findMany({ select: { userId: true, status: true } }),
  ])

  // Build lookup maps
  const areaProvince = new Map(areas.map((a) => [a.id, a.province]))
  const userProvince = new Map(
    profiles.map((p) => [p.userId, areaProvince.get(p.areaId) ?? 'Unknown'])
  )

  // Aggregate credit requests per province
  const reqStats: Record<string, { total: number; rejected: number }> = {}
  for (const req of requests) {
    const prov = userProvince.get(req.requesterId) ?? 'Unknown'
    if (!reqStats[prov]) reqStats[prov] = { total: 0, rejected: 0 }
    reqStats[prov].total++
    if (req.status === 'REJECTED') reqStats[prov].rejected++
  }

  // Aggregate repayments per province
  const repStats: Record<string, { total: number; overdue: number }> = {}
  for (const rep of repayments) {
    const prov = userProvince.get(rep.userId) ?? 'Unknown'
    if (!repStats[prov]) repStats[prov] = { total: 0, overdue: 0 }
    repStats[prov].total++
    if (rep.status === 'OVERDUE') repStats[prov].overdue++
  }

  return SA_PROVINCES.map((province) => {
    const req = reqStats[province]
    const rep = repStats[province]

    if (!req && !rep) {
      return {
        province,
        riskLevel: 'NO_DATA',
        riskScore: 0,
        totalRequests: 0,
        rejectedRequests: 0,
        rejectionRate: 0,
        overdueRepayments: 0,
        overdueRate: 0,
      }
    }

    const totalRequests = req?.total ?? 0
    const rejectedRequests = req?.rejected ?? 0
    const rejectionRate = totalRequests > 0 ? rejectedRequests / totalRequests : 0

    const totalRepayments = rep?.total ?? 0
    const overdueRepayments = rep?.overdue ?? 0
    const overdueRate = totalRepayments > 0 ? overdueRepayments / totalRepayments : 0

    // Weighted risk score (rejection 60%, overdue 40%)
    const riskScore = rejectionRate * 0.6 + overdueRate * 0.4
    const riskLevel: RiskLevel = riskScore > 0.4 ? 'HIGH' : riskScore > 0.2 ? 'MEDIUM' : 'LOW'

    return {
      province,
      riskLevel,
      riskScore,
      totalRequests,
      rejectedRequests,
      rejectionRate,
      overdueRepayments,
      overdueRate,
    }
  }).sort((a, b) => {
    const order: Record<RiskLevel, number> = { HIGH: 0, MEDIUM: 1, LOW: 2, NO_DATA: 3 }
    return order[a.riskLevel] - order[b.riskLevel]
  })
}

export default async function CreditRiskHeatmap() {
  const provinces = await getProvinceRiskData()

  const highCount = provinces.filter((p) => p.riskLevel === 'HIGH').length
  const mediumCount = provinces.filter((p) => p.riskLevel === 'MEDIUM').length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="admin-heading text-base">AI Credit Risk Heatmap</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Province-level rejection rates and overdue repayments. Flags systemic issues before they escalate.
          </p>
        </div>
        {/* Summary pills */}
        <div className="flex gap-2 flex-wrap">
          {highCount > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700">
              {highCount} high-risk {highCount === 1 ? 'province' : 'provinces'}
            </span>
          )}
          {mediumCount > 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
              {mediumCount} medium-risk
            </span>
          )}
          {highCount === 0 && mediumCount === 0 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
              All provinces low risk ✓
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
        {provinces.map((p) => {
          const cfg = riskConfig[p.riskLevel]
          return (
            <div
              key={p.province}
              className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}
            >
              {/* Province header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <p className="text-sm font-bold text-text-primary leading-tight">{p.province}</p>
                <span className={`flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                  {cfg.label}
                </span>
              </div>

              {p.riskLevel === 'NO_DATA' ? (
                <p className="text-xs text-text-secondary">No activity recorded yet</p>
              ) : (
                <div className="space-y-2">
                  {/* Rejection rate */}
                  <div>
                    <div className="flex justify-between text-xs text-text-secondary mb-1">
                      <span>Rejection rate</span>
                      <span className="font-medium text-text-primary">
                        {Math.round(p.rejectionRate * 100)}%
                        <span className="text-text-secondary font-normal"> ({p.rejectedRequests}/{p.totalRequests})</span>
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-current"
                        style={{
                          width: `${Math.round(p.rejectionRate * 100)}%`,
                          color: p.riskLevel === 'HIGH' ? '#ef4444' : p.riskLevel === 'MEDIUM' ? '#f59e0b' : '#22c55e',
                        }}
                      />
                    </div>
                  </div>

                  {/* Overdue repayments */}
                  <div className="flex justify-between text-xs">
                    <span className="text-text-secondary">Overdue repayments</span>
                    <span className={`font-semibold ${p.overdueRepayments > 0 ? 'text-danger' : 'text-success'}`}>
                      {p.overdueRepayments}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
