/**
 * WhatsApp Business Cloud API integration.
 * Free tier: first 1,000 conversations/month at no charge.
 *
 * Setup:
 *  1. Go to developers.facebook.com → create a Meta App → add WhatsApp product
 *  2. Get Phone Number ID and temporary Access Token from the API Setup page
 *  3. Set WHATSAPP_PHONE_ID and WHATSAPP_TOKEN in .env.local
 *  4. Register a message template in Meta Business Suite (required for first message)
 *     Template name: ekhadi_notification
 *     Body: "Dear {{1}}, {{2}}"
 */

const BASE = 'https://graph.facebook.com/v19.0'

interface TextMessage { type: 'text'; body: string }
interface TemplateMessage {
  type: 'template'
  name: string
  language: string
  components: Array<{ type: string; parameters: Array<{ type: string; text: string }> }>
}

async function send(to: string, message: TextMessage | TemplateMessage): Promise<void> {
  const phoneId = process.env.WHATSAPP_PHONE_ID
  const token   = process.env.WHATSAPP_TOKEN
  if (!phoneId || !token) return

  const e164 = to.replace(/[\s\-()]/g, '').replace(/^\+/, '')

  const body: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    to: e164,
  }

  if (message.type === 'text') {
    body.type = 'text'
    body.text = { body: message.body }
  } else {
    body.type = 'template'
    body.template = {
      name: message.name,
      language: { code: message.language },
      components: message.components,
    }
  }

  try {
    const res = await fetch(`${BASE}/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('[WhatsApp] send failed:', err)
    }
  } catch (err) {
    console.error('[WhatsApp] network error:', err)
  }
}

export async function notifyWhatsApp(phone: string | null | undefined, name: string, message: string): Promise<void> {
  if (!phone) return
  await send(phone, { type: 'text', body: `*e-Khadi*\n\n${message}\n\n_Reply STOP to unsubscribe_` })
}

export async function sendCreditApproved(phone: string | null | undefined, name: string, amount: number): Promise<void> {
  if (!phone) return
  await notifyWhatsApp(phone, name,
    `Dear ${name},\n\nYour credit request of *R${amount.toFixed(2)}* has been ✅ *APPROVED*.\n\nFunds are now available in your e-Khadi wallet.`
  )
}

export async function sendCreditRejected(phone: string | null | undefined, name: string, amount: number): Promise<void> {
  if (!phone) return
  await notifyWhatsApp(phone, name,
    `Dear ${name},\n\nYour credit request of *R${amount.toFixed(2)}* was ❌ *not approved*.\n\nPlease contact your stokvel group admin for more info.`
  )
}

export async function sendRepaymentReminder(phone: string | null | undefined, name: string, amount: number, dueDate: string): Promise<void> {
  if (!phone) return
  await notifyWhatsApp(phone, name,
    `Dear ${name},\n\nFriendly reminder: your e-Khadi repayment of *R${amount.toFixed(2)}* is due on *${dueDate}*.\n\nKeep your credit score healthy by paying on time.`
  )
}