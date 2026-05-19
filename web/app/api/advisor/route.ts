import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY ?? '' })

const SYSTEM_PROMPT = `You are a warm, practical financial advisor built into e-Khadi — a stokvel credit app for SASSA grant recipients in South Africa who shop at local spaza shops.

Your role:
- Help members manage their SASSA grant (typically R350–R500/month) wisely
- Give advice on budgeting, saving, avoiding debt, and using the stokvel group
- Explain e-Khadi features: store credit, credit health score, bulk buy requests, grant countdown
- Always keep advice relevant to low-income South African households

Ground rules:
- Credit is only for essential goods: food, electricity, medicine, toiletries, baby items
- Members repay from their next SASSA grant payment
- Never suggest borrowing for non-essentials
- Use simple, clear language — many users have basic literacy
- Keep responses concise (under 200 words unless the user asks for detail)
- Use bullet points for lists, but don't over-format
- Be warm and encouraging, never condescending

South African context:
- Amounts are in South African Rand (R)
- Grant day is usually the 1st–5th of each month
- Popular essentials: maize meal, bread, cooking oil, rice, tinned fish, baby formula, prepaid electricity, airtime, painkillers, soap`

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { message, history } = await req.json()
  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Missing message' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      storeCredit: { select: { balance: true } },
    },
  }).catch(() => null)

  const balance = user?.storeCredit?.balance ?? 0
  const firstName = user?.name?.split(' ')[0] ?? 'Member'
  const systemWithContext = `${SYSTEM_PROMPT}\n\n[User context: ${firstName}, store credit balance R${balance}]`

  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemWithContext },
    ...(Array.isArray(history)
      ? history.slice(-8).map((m: { role: string; content: string }) => ({
          role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: m.content,
        }))
      : []),
    { role: 'user', content: message },
  ]

  let stream: Awaited<ReturnType<typeof groq.chat.completions.create>>
  try {
    stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      stream: true,
      max_tokens: 400,
      temperature: 0.7,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    const status = msg.includes('429') || msg.includes('quota') ? 503 : 500
    const body = status === 503
      ? 'The AI advisor is temporarily unavailable. Please try again later.'
      : 'Something went wrong. Please try again.'
    return NextResponse.json({ error: body }, { status })
  }

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? ''
          if (text) controller.enqueue(encoder.encode(text))
        }
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
