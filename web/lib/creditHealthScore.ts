/**
 * TypeScript port of CreditRulesEngine.php + GrantCycleService.php scoring logic.
 *
 * Score components (0–100 total):
 *   Repayment ratio         → 0–40 pts  (paid repayments / approved requests)
 *   Repayment speed         → 0–20 pts  (simplified: 20 if any repayment made)
 *   No outstanding debt     → 0–20 pts
 *   Grant cycle consistency → 0–20 pts  (2 pts per completed cycle, max 10 cycles)
 *
 * Score → credit limit:
 *   80+  → R300
 *   60+  → R200
 *   40+  → R150
 *   20+  → R100
 *   <20  → R50  (minimum always available to grant recipients)
 */

export const MIN_LIMIT = 50
export const MAX_LIMIT = 300
export const FEE_PERCENTAGE = 2

export interface ScoreBreakdown {
  repaymentScore: number        // 0–40
  speedScore: number            // 0–20
  noDebtScore: number           // 0–20
  cycleConsistencyScore: number // 0–20
}

export interface CreditHealthInput {
  /** CreditRequest rows with status APPROVED for this user */
  approvedRequestsCount: number
  /** RepaymentSchedule rows with status PAID for this user */
  paidRepaymentsCount: number
  /** Sum of RepaymentSchedule.amount where status PENDING */
  outstandingDebt: number
  /** GrantCycle rows with status COMPLETED for this user */
  completedCyclesCount: number
}

export interface CreditHealthResult {
  score: number
  creditLimit: number
  /** Next tier above current limit (0 when already at R300) */
  nextLimit: number
  breakdown: ScoreBreakdown
  color: 'green' | 'yellow' | 'red'
  advice: string[]
}

export function scoreToLimit(score: number): number {
  if (score >= 80) return 300
  if (score >= 60) return 200
  if (score >= 40) return 150
  if (score >= 20) return 100
  return MIN_LIMIT
}

function nextLimitTier(score: number): number {
  if (score >= 80) return 0
  if (score >= 60) return 300
  if (score >= 40) return 200
  if (score >= 20) return 150
  return 100
}

export function computeScoreBreakdown(input: CreditHealthInput): ScoreBreakdown {
  const { approvedRequestsCount, paidRepaymentsCount, outstandingDebt, completedCyclesCount } = input

  const repaymentRatio = approvedRequestsCount > 0 ? paidRepaymentsCount / approvedRequestsCount : 0
  const repaymentScore = Math.round(repaymentRatio * 40)

  const speedScore = paidRepaymentsCount > 0 ? 20 : 0

  const noDebtScore = outstandingDebt === 0 ? 20 : 0

  const cycleConsistencyScore = Math.min(20, completedCyclesCount * 2)

  return { repaymentScore, speedScore, noDebtScore, cycleConsistencyScore }
}

export function computeCreditHealth(input: CreditHealthInput): CreditHealthResult {
  const breakdown = computeScoreBreakdown(input)
  const score =
    breakdown.repaymentScore +
    breakdown.speedScore +
    breakdown.noDebtScore +
    breakdown.cycleConsistencyScore

  const creditLimit = scoreToLimit(score)
  const nextLimit = nextLimitTier(score)
  const color: 'green' | 'yellow' | 'red' =
    score >= 70 ? 'green' : score >= 40 ? 'yellow' : 'red'
  const advice = buildAdvice(score, input, nextLimit)

  return { score, creditLimit, nextLimit, breakdown, color, advice }
}

function buildAdvice(
  score: number,
  input: CreditHealthInput,
  nextLimit: number
): string[] {
  const { outstandingDebt, paidRepaymentsCount, approvedRequestsCount, completedCyclesCount } = input

  if (outstandingDebt > 0) {
    return [
      `You have R${outstandingDebt.toFixed(2)} outstanding. Avoid requesting more credit until your next grant cycle.`,
    ]
  }

  const lines: string[] = []

  if (score >= 80) {
    lines.push('Excellent! You have reached the highest e-Khadi credit limit of R300.')
    lines.push('Keep repaying on time to maintain your Gold standing.')
    return lines
  }

  if (approvedRequestsCount === 0) {
    lines.push('No credit history yet. Request your first credit to start building your score.')
  } else if (paidRepaymentsCount === approvedRequestsCount) {
    lines.push(`You repay on time — you qualify for a R${nextLimit} limit increase.`)
  } else {
    const unpaid = approvedRequestsCount - paidRepaymentsCount
    lines.push(
      `${unpaid} approved ${unpaid === 1 ? 'request has' : 'requests have'} not been fully repaid. Settling these will improve your score.`
    )
  }

  const cyclesLeft = 10 - completedCyclesCount
  if (cyclesLeft > 0) {
    lines.push(
      `Complete ${cyclesLeft} more grant ${cyclesLeft === 1 ? 'cycle' : 'cycles'} to earn up to ${cyclesLeft * 2} more consistency points.`
    )
  }

  return lines
}

export function computeServiceFee(principal: number): number {
  return Math.round(principal * FEE_PERCENTAGE) / 100
}
