import { GoogleGenerativeAI } from '@google/generative-ai'
import type { RecommendationLevel, RecommendationInput, RecommendationResult } from './aiRecommendation'

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null

export interface GeminiScoreResult extends RecommendationResult {
  confidence: number      // 0–100
  riskFactors: string[]
  positiveSignals: string[]
  source: 'gemini' | 'rules'
}

const MODEL = 'gemini-1.5-flash'

const SYSTEM_PROMPT = `You are a credit risk analyst for e-Khadi, a South African community stokvel credit platform for SASSA grant recipients at spaza shops.

Rules:
- Max credit R300, min R50
- Members repay from monthly SASSA grants
- Community-based accountability (stokvel groups)
- Essential goods only (food, toiletries, medicine)

Classify the member as exactly one of: HIGH_TRUST | MEDIUM_RISK | FLAG

Respond ONLY with valid JSON, no markdown:
{
  "level": "HIGH_TRUST" | "MEDIUM_RISK" | "FLAG",
  "confidence": 0-100,
  "reason": "one concise sentence",
  "riskFactors": ["factor1"],
  "positiveSignals": ["signal1"]
}`

function buildPrompt(input: RecommendationInput): string {
  const repaymentRatio = input.approvedRequestsCount > 0
    ? Math.round((input.paidRepaymentsCount / input.approvedRequestsCount) * 100)
    : null

  return `Member credit analysis:
- Credit score: ${input.creditScore}/100
- Repayment ratio: ${repaymentRatio !== null ? `${repaymentRatio}%` : 'No history'} (${input.paidRepaymentsCount} paid / ${input.approvedRequestsCount} approved)
- Outstanding debt: R${input.outstandingDebt.toFixed(2)}
- Requests this month: ${input.requestsThisMonth}
- Current request amount: R${input.requestAmount}

Classify this member.`
}

export async function geminiScore(input: RecommendationInput): Promise<GeminiScoreResult | null> {
  if (!genAI) return null

  try {
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: { temperature: 0.1, maxOutputTokens: 256 },
    })

    const result = await model.generateContent(buildPrompt(input))
    const text = result.response.text().trim()
    const parsed = JSON.parse(text)

    if (!['HIGH_TRUST', 'MEDIUM_RISK', 'FLAG'].includes(parsed.level)) return null

    return {
      level: parsed.level as RecommendationLevel,
      confidence: Math.min(100, Math.max(0, Number(parsed.confidence) || 70)),
      reason: String(parsed.reason || ''),
      riskFactors: Array.isArray(parsed.riskFactors) ? parsed.riskFactors : [],
      positiveSignals: Array.isArray(parsed.positiveSignals) ? parsed.positiveSignals : [],
      source: 'gemini',
    }
  } catch {
    return null
  }
}