/**
 * AI Recommendation scoring for pending credit requests.
 *
 * Levels:
 *   HIGH_TRUST  — strong repayment history, low frequency, good score, no debt
 *   MEDIUM_RISK — some positive signals but not all thresholds met
 *   FLAG        — one or more hard risk triggers present
 */

export type RecommendationLevel = 'HIGH_TRUST' | 'MEDIUM_RISK' | 'FLAG'

export interface RecommendationInput {
  /** RepaymentSchedule rows with status PAID for this user */
  paidRepaymentsCount: number
  /** CreditRequest rows with status APPROVED (historical) for this user */
  approvedRequestsCount: number
  /** CustomerProfile.creditScore (0–100) */
  creditScore: number
  /** Sum of PENDING RepaymentSchedule amounts */
  outstandingDebt: number
  /** CreditRequest rows created this calendar month (all statuses) */
  requestsThisMonth: number
  /** Amount being requested in this specific request */
  requestAmount: number
}

export interface RecommendationResult {
  level: RecommendationLevel
  reason: string
}

export function computeRecommendation(input: RecommendationInput): RecommendationResult {
  const {
    paidRepaymentsCount,
    approvedRequestsCount,
    creditScore,
    outstandingDebt,
    requestsThisMonth,
    requestAmount,
  } = input

  const repaymentRatio =
    approvedRequestsCount > 0 ? paidRepaymentsCount / approvedRequestsCount : null

  // ── Hard FLAG triggers ───────────────────────────────────────────────────────
  if (outstandingDebt > 0) {
    return {
      level: 'FLAG',
      reason: `R${outstandingDebt.toFixed(0)} outstanding debt not cleared`,
    }
  }
  if (requestsThisMonth >= 3) {
    return {
      level: 'FLAG',
      reason: `${requestsThisMonth} requests this month — unusual frequency`,
    }
  }
  if (repaymentRatio === 0 && approvedRequestsCount >= 2) {
    return {
      level: 'FLAG',
      reason: `Never repaid across ${approvedRequestsCount} approved requests`,
    }
  }
  if (requestAmount >= 200 && creditScore < 40) {
    return {
      level: 'FLAG',
      reason: `R${requestAmount} request with low credit score (${creditScore})`,
    }
  }

  // ── HIGH TRUST (all must hold) ───────────────────────────────────────────────
  const hasGoodRepayment = repaymentRatio !== null && repaymentRatio >= 0.8
  const isLowFrequency = requestsThisMonth <= 1
  const isGoodScore = creditScore >= 60
  const isReasonableAmount = requestAmount <= 200

  if (hasGoodRepayment && isLowFrequency && isGoodScore && isReasonableAmount) {
    return {
      level: 'HIGH_TRUST',
      reason: `${Math.round(repaymentRatio! * 100)}% repayment rate · score ${creditScore}`,
    }
  }

  // ── MEDIUM RISK (default) ────────────────────────────────────────────────────
  const parts: string[] = []
  if (repaymentRatio === null) parts.push('No repayment history')
  else if (repaymentRatio < 0.8) parts.push(`${Math.round(repaymentRatio * 100)}% repayment rate`)
  if (creditScore < 60) parts.push(`score ${creditScore}`)
  if (requestsThisMonth > 1) parts.push(`${requestsThisMonth} requests this month`)
  if (requestAmount > 200) parts.push(`large amount R${requestAmount}`)

  return {
    level: 'MEDIUM_RISK',
    reason: parts.join(' · ') || 'Standard review recommended',
  }
}
