/**
 * ModelArts inference client for e-Khadi credit scoring.
 *
 * Region:     ap-southeast-1 (Singapore)
 * Project ID: 12d4b817c74d49f2b1649d903df7cc8a
 * Workspace:  default (id: "0")
 *
 * Env vars required for live inference (set after deploying a model):
 *   MODELARTS_ENDPOINT   — online service URL, e.g.
 *                          https://modelarts.ap-southeast-1.myhuaweicloud.com/v1/…/services/xxx/predict
 *   HW_AK / HW_SK        — AK/SK used to get an IAM token (already in env)
 *
 * If MODELARTS_ENDPOINT is not set, returns null and the caller falls back
 * to Gemini or the rule engine.
 */

import type { RecommendationInput } from './aiRecommendation'
import type { GeminiScoreResult } from './geminiScorer'

const MA_REGION   = 'ap-southeast-1'
const MA_HOST     = `https://modelarts.${MA_REGION}.myhuaweicloud.com`
const IAM_HOST    = 'https://iam.myhuaweicloud.com'
const PROJECT_ID  = '12d4b817c74d49f2b1649d903df7cc8a'
const WORKSPACE_ID = '0'

let _cachedToken: string | null = null
let _tokenExpiry = 0

async function getIAMToken(): Promise<string | null> {
  // setup-huawei.js writes OBS_ACCESS_KEY/OBS_SECRET_KEY (same AK/SK values) to .env.local
  const AK = process.env.OBS_ACCESS_KEY ?? process.env.HW_AK
  const SK = process.env.OBS_SECRET_KEY ?? process.env.HW_SK
  if (!AK || !SK) return null

  if (_cachedToken && Date.now() < _tokenExpiry) return _cachedToken

  try {
    const res = await fetch(`${IAM_HOST}/v3/auth/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth: {
          identity: {
            methods: ['hw_ak_sk'],
            hw_ak_sk: { access: { key: AK }, secret: { key: SK } },
          },
          scope: { project: { name: MA_REGION } },
        },
      }),
    })
    const token = res.headers.get('x-subject-token')
    if (!token) return null
    _cachedToken = token
    _tokenExpiry = Date.now() + 20 * 60 * 1000 // 20 min
    return token
  } catch {
    return null
  }
}

export async function modelartsScore(input: RecommendationInput): Promise<GeminiScoreResult | null> {
  const endpoint = process.env.MODELARTS_ENDPOINT
  if (!endpoint) return null

  const token = await getIAMToken()
  if (!token) return null

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
      body: JSON.stringify({
        instances: [{
          repayment_ratio: input.approvedRequestsCount > 0
            ? input.paidRepaymentsCount / input.approvedRequestsCount
            : 0,
          outstanding_debt: input.outstandingDebt,
          requests_this_month: input.requestsThisMonth,
          completed_cycles: 0,
          credit_score: input.creditScore,
          request_amount: input.requestAmount,
        }],
      }),
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) return null
    const data = await res.json()
    const pred = data?.predictions?.[0]
    if (!pred) return null

    const level = pred.level as 'HIGH_TRUST' | 'MEDIUM_RISK' | 'FLAG'
    const prob  = Number(pred.repay_probability ?? 0.5)

    return {
      level,
      confidence: Math.round(prob * 100),
      reason: `ModelArts LightGBM: ${Math.round(prob * 100)}% repayment probability`,
      riskFactors: prob < 0.5 ? ['Low predicted repayment probability'] : [],
      positiveSignals: prob >= 0.8 ? ['High predicted repayment probability'] : [],
      source: 'gemini', // repurposed field — displayed as AI badge
    }
  } catch {
    return null
  }
}

/** Checks ModelArts workspace status — used by health checks / monitoring */
export async function checkModelArtsHealth(): Promise<{ active: boolean; workspaceId: string | null }> {
  const token = await getIAMToken()
  if (!token) return { active: false, workspaceId: null }

  try {
    const res = await fetch(`${MA_HOST}/v1/${PROJECT_ID}/workspaces`, {
      headers: { 'X-Auth-Token': token },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return { active: false, workspaceId: null }
    const data = await res.json()
    const ws = data?.workspaces?.[0]
    return { active: ws?.status === 'NORMAL', workspaceId: ws?.id ?? null }
  } catch {
    return { active: false, workspaceId: null }
  }
}