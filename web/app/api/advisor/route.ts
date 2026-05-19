import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Groq from 'groq-sdk'

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

// Rule-based fallback used when no API key is configured
function ruleBasedReply(message: string, firstName: string, balance: number): string {
  const q = message.toLowerCase()
  if (q.includes('budget') || q.includes('plan') || q.includes('spend')) {
    return `Hi ${firstName}! Here is a simple budget plan for your SASSA grant:\n\n• Food & groceries — 40% (R140–R200)\n• Electricity & water — 15% (R52–R75)\n• Transport — 10% (R35–R50)\n• Toiletries & hygiene — 10% (R35–R50)\n• Emergency savings — 10% (R35–R50)\n• Other essentials — 15%\n\nTip: Use e-Khadi credit only for essentials when you run short before grant day. Always repay on time to keep your credit score healthy.`
  }
  if (q.includes('save') || q.includes('saving')) {
    return `Saving on a small income is hard but possible, ${firstName}:\n\n• Set aside R20–R50 on grant day before spending anything else\n• Buy maize meal, rice, and cooking oil in bulk through the Bulk Buy feature — you save up to 15%\n• Avoid buying on credit for non-essential items\n• Join your stokvel group's savings rotation to build a lump sum\n\nEven R20 saved each month becomes R240 by year-end.`
  }
  if (q.includes('debt') || q.includes('owe') || q.includes('outstanding')) {
    return `To avoid debt traps, ${firstName}:\n\n• Only request credit for essential goods (food, electricity, medicine)\n• Never borrow more than you can repay from your next grant\n• Keep your e-Khadi credit requests below R150 if your score is below 50\n• Pay outstanding balances as soon as your grant arrives\n\n${balance > 0 ? `You currently have R${balance} credit available — use it wisely.` : 'Your credit balance is clear — great position to be in!'}`
  }
  if (q.includes('credit score') || q.includes('score') || q.includes('improve')) {
    return `Your credit score (0–100) grows by:\n\n• Repaying on time — worth 40 points\n• Repaying quickly (within 48hrs) — worth 20 points\n• Having no outstanding debt — worth 20 points\n• Using credit consistently across grant cycles — worth 20 points\n\nThe higher your score, the more credit you unlock. Aim for 60+ to reach the R200 credit tier.`
  }
  if (q.includes('grant') || q.includes('sassa') || q.includes('payment')) {
    return `SASSA grants are usually paid on the 1st–5th of each month, ${firstName}.\n\n• R350/month for Social Relief of Distress (SRD)\n• R2 090/month for Disability Grant\n• R2 090/month for Old Age Pension\n\nOn grant day: pay your e-Khadi balance first, then budget the rest. Your repayment is deducted automatically — you don't need to do anything extra.`
  }
  if (q.includes('shop') || q.includes('spaza') || q.includes('buy') || q.includes('spend')) {
    return `You can use your e-Khadi credit at any registered spaza shop in your area, ${firstName}.\n\n• Show your QR code at checkout\n• Only use credit for essentials: food, electricity, medicine, toiletries, baby items\n• Check the app for shops near you\n• Bulk Buy lets your stokvel group order together to get better prices`
  }
  // Generic fallback
  return `Hi ${firstName}! I'm here to help you manage your money wisely.\n\nYou can ask me about:\n• Budgeting your SASSA grant\n• How to save money\n• Avoiding debt\n• Improving your credit score\n• How e-Khadi credit works\n\nWhat would you like help with?`
}

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
    select: { name: true, storeCredit: { select: { balance: true } } },
  }).catch(() => null)

  const balance = Number(user?.storeCredit?.balance ?? 0)
  const firstName = user?.name?.split(' ')[0] ?? 'Member'

  // No API key — use rule-based fallback
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    const reply = ruleBasedReply(message, firstName, balance)
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(reply))
        controller.close()
      },
    })
    return new Response(readable, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  }

  const groq = new Groq({ apiKey })
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
    const reply = ruleBasedReply(message, firstName, balance)
    if (msg.includes('429') || msg.includes('quota') || msg.includes('401')) {
      const encoder = new TextEncoder()
      const readable = new ReadableStream({
        start(controller) { controller.enqueue(encoder.encode(reply)); controller.close() },
      })
      return new Response(readable, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
    }
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
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

  return new Response(readable, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
