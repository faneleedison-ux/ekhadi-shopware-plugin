'use strict'
/**
 * FunctionGraph trigger: CloudTimer, cron = "0 8 * * *" (daily at 08:00 SAST)
 * Runtime: Node.js 18
 *
 * Finds repayments due in the next 3 days and sends a reminder via SMN.
 */
const { Client } = require('pg')
const https = require('https')

const DB    = process.env.DATABASE_URL
const TOKEN = process.env.HUAWEI_IAM_TOKEN   // pre-issued token, refresh monthly
const TOPIC = process.env.SMN_TOPIC_URN

async function publishSMN(subject, message) {
  if (!TOKEN || !TOPIC) return
  const topicPart = TOPIC.split(':').pop()
  const projectId = TOPIC.split(':')[4]
  const body = JSON.stringify({ subject, message })
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'smn.af-south-1.myhuaweicloud.com',
      path: `/v2/${projectId}/notifications/topics/${TOPIC}/publish`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': TOKEN,
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = ''
      res.on('data', (c) => { data += c })
      res.on('end', () => resolve(data))
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

exports.handler = async (event, context) => {
  const db = new Client({ connectionString: DB, ssl: { rejectUnauthorized: false } })
  await db.connect()

  try {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() + 3)

    const { rows } = await db.query(
      `SELECT rs.id, rs."userId", rs.amount, rs."dueDate",
              u.name, u.email
       FROM "RepaymentSchedule" rs
       JOIN "User" u ON u.id = rs."userId"
       WHERE rs.status = 'PENDING' AND rs."dueDate" <= $1
       ORDER BY rs."dueDate" ASC`,
      [cutoff]
    )

    for (const row of rows) {
      const dueStr = new Date(row.dueDate).toLocaleDateString('en-ZA', { timeZone: 'Africa/Johannesburg' })
      await publishSMN(
        'e-Khadi: Repayment Reminder',
        `Dear ${row.name},\n\nYour e-Khadi repayment of R${Number(row.amount).toFixed(2)} is due on ${dueStr}.\n\nPlease ensure funds are available to avoid your credit score being affected.\n\ne-Khadi Team`
      )
    }

    console.log(`[repayment-check] sent ${rows.length} reminders`)
    return { statusCode: 200, body: { reminders: rows.length } }
  } finally {
    await db.end()
  }
}
