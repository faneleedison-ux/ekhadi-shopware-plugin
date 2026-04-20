import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const TIPS: Record<string, { answer: string; emoji: string }> = {
  save: {
    emoji: '🏦',
    answer: "To save on your SASSA grant:\n\n• Set aside R50–R100 before spending anything else — pay yourself first.\n• Use your stokvel group wallet to pool savings; the group earns more together.\n• Buy dry goods (rice, maize meal) in bulk when grant day arrives — it's cheaper per unit.\n• Avoid buying on credit for non-essentials like airtime. Rather use Wi-Fi when available.",
  },
  budget: {
    emoji: '📊',
    answer: "A simple budget for a R350 grant:\n\n• Food & groceries — R180 (51%)\n• Electricity & data — R60 (17%)\n• Toiletries & hygiene — R40 (11%)\n• Medicine & health — R30 (9%)\n• Savings (stokvel) — R30 (9%)\n• Emergency buffer — R10 (3%)\n\nTrack every purchase using the Wallet tab — it shows exactly where your credit goes.",
  },
  debt: {
    emoji: '💳',
    answer: "To stay debt-free:\n\n• Only request credit for essential goods (food, medicine, electricity).\n• Repay on time — your credit health score improves with each on-time repayment.\n• Don't borrow more than you can repay from the next grant.\n• If you're struggling, speak to your stokvel group admin — repayment plans can be arranged.",
  },
  food: {
    emoji: '🍞',
    answer: "Stretching your food budget:\n\n• Buy maize meal, rice, and dried beans — they go further than processed food.\n• Check the AI Stock Forecast — it shows what's in demand, so you shop early before stock runs low.\n• Avoid buying single-serving snacks; buy larger packs and divide them.\n• Plan meals for the week before shopping so nothing goes to waste.",
  },
  electricity: {
    emoji: '⚡',
    answer: "Cutting electricity costs:\n\n• Buy prepaid electricity in smaller amounts more frequently — it helps you track usage.\n• Unplug appliances when not in use — standby power adds up.\n• Use one light bulb per room at night instead of all lights.\n• Cook in bulk — one long cooking session uses less electricity than multiple short ones.",
  },
  stokvel: {
    emoji: '🤝',
    answer: "Making the most of your stokvel:\n\n• Attend every rotation — missing one means you forfeit your turn.\n• Use your payout month to buy something that saves you money long-term (e.g., bulk food).\n• Keep your repayments on time — it builds trust and keeps the group's wallet healthy.\n• View the Group tab to see your rotation schedule and how much is in the group wallet.",
  },
  score: {
    emoji: '⭐',
    answer: "How to improve your credit health score:\n\n• Repay credit on time every month — this is the biggest factor.\n• Don't miss a grant cycle repayment.\n• Only request credit for goods you truly need.\n• Complete full repayment cycles without extensions.\n• Check your score card on the home screen — it updates with each transaction.",
  },
}

function findTopic(message: string): string | null {
  const m = message.toLowerCase()
  if (m.includes('save') || m.includes('saving') || m.includes('money')) return 'save'
  if (m.includes('budget') || m.includes('spend') || m.includes('allocat')) return 'budget'
  if (m.includes('debt') || m.includes('owe') || m.includes('repay') || m.includes('borrow')) return 'debt'
  if (m.includes('food') || m.includes('groceri') || m.includes('bread') || m.includes('eat')) return 'food'
  if (m.includes('electric') || m.includes('power') || m.includes('prepaid') || m.includes('light')) return 'electricity'
  if (m.includes('stokvel') || m.includes('group') || m.includes('rotat') || m.includes('pool')) return 'stokvel'
  if (m.includes('score') || m.includes('credit') || m.includes('health') || m.includes('rating')) return 'score'
  return null
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { message } = await req.json()
  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Missing message' }, { status: 400 })
  }

  const topic = findTopic(message)
  if (topic) {
    const tip = TIPS[topic]
    return NextResponse.json({ answer: tip.answer, emoji: tip.emoji })
  }

  // Default: show menu of topics
  return NextResponse.json({
    emoji: '💡',
    answer: "I can help you with financial tips on:\n\n• **Saving money** — type \"how do I save?\"\n• **Budgeting** — type \"help me budget\"\n• **Avoiding debt** — type \"how to avoid debt\"\n• **Stretching food** — type \"food tips\"\n• **Electricity** — type \"electricity tips\"\n• **Stokvel groups** — type \"stokvel advice\"\n• **Credit score** — type \"improve my score\"\n\nWhat would you like help with?",
  })
}