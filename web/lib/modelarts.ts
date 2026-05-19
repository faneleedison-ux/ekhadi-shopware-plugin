/**
 * ModelArts inference client for e-Khadi credit scoring.
 *
 * Model:      LightGBM credit scorer (trained on e-Khadi repayment data)
 * Deployment: FastAPI microservice on production server (port 8001, internal only)
 *             PM2 process name: scorer | model file: /root/credit_scorer.txt
 *
 * MODELARTS_ENDPOINT=http://localhost:8001 in production .env.local
 * No auth needed (localhost-only binding).
 *
 * Falls back to Gemini scorer or rule engine if endpoint is not set.
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

  try {
    const isLocal = endpoint.startsWith('http://localhost') || endpoint.startsWith('http://127.')
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }

    if (!isLocal) {
      const token = await getIAMToken()
      if (!token) return null
      headers['X-Auth-Token'] = token
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
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
      reason: `LightGBM: ${Math.round(prob * 100)}% repayment probability`,
      riskFactors: prob < 0.5 ? ['Low predicted repayment probability'] : [],
      positiveSignals: prob >= 0.8 ? ['High predicted repayment probability'] : [],
      source: 'gemini',
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