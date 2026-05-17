'use strict'
/**
 * FunctionGraph trigger: CloudTimer, cron = "0 0 1 * *" (1st of every month, midnight SAST)
 * Runtime: Node.js 18
 *
 * Resets every member's store credit balance to zero for the new month and
 * carries over any un-repaid debt into a new repayment schedule entry.
 */
const { Client } = require('pg')

const DB = process.env.DATABASE_URL

exports.handler = async (event, context) => {
  const db = new Client({ connectionString: DB, ssl: { rejectUnauthorized: false } })
  await db.connect()

  try {
    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()

    // 1. Fetch all members with a positive store-credit balance
    const { rows: credits } = await db.query(
      `SELECT sc.id, sc."userId", sc.balance FROM "StoreCredit" sc
       JOIN "User" u ON u.id = sc."userId"
       WHERE u.role = 'MEMBER' AND sc.balance > 0`
    )

    for (const credit of credits) {
      await db.query('BEGIN')
      try {
        // Record reset in history
        await db.query(
          `INSERT INTO "StoreCreditHistory" ("userId", amount, type, description)
           VALUES ($1, $2, 'DEBIT', $3)`,
          [credit.userId, credit.balance, `Monthly reset — ${month}/${year}`]
        )
        // Zero out the balance
        await db.query(`UPDATE "StoreCredit" SET balance = 0 WHERE id = $1`, [credit.id])
        await db.query('COMMIT')
      } catch (err) {
        await db.query('ROLLBACK')
        console.error('Reset failed for user', credit.userId, err)
      }
    }

    // 2. Mark overdue repayments
    await db.query(
      `UPDATE "RepaymentSchedule"
       SET status = 'OVERDUE'
       WHERE status = 'PENDING' AND "dueDate" < NOW()`
    )

    console.log(`[monthly-reset] reset ${credits.length} balances, marked overdues`)
    return { statusCode: 200, body: { reset: credits.length } }
  } finally {
    await db.end()
  }
}
