import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { uploadToOBS } from '@/lib/obs'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { transactionId } = await req.json()

  const tx = await prisma.storeCreditHistory.findUnique({
    where: { id: transactionId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
          customerProfile: { include: { area: true } },
          groupMemberships: {
            include: { group: true },
            take: 1,
          },
        },
      },
    },
  })

  if (!tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })

  // Find the shop for this transaction by parsing the description
  const shopName = tx.description.includes(' - ')
    ? tx.description.split('Purchase at ')[1]?.split(' - ')[0] ?? 'e-Khadi Shop'
    : 'e-Khadi Shop'

  const category = tx.description.split(' - ').pop() ?? tx.description

  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([420, 620])
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const W = 420
  const { height } = page.getSize()
  let y = height - 40

  // Header bar
  page.drawRectangle({ x: 0, y: height - 80, width: W, height: 80, color: rgb(0.38, 0.0, 0.93) })
  page.drawText('e-Khadi', { x: 24, y: height - 42, font: bold, size: 26, color: rgb(1, 1, 1) })
  page.drawText('Store Credit Receipt', { x: 24, y: height - 62, font, size: 11, color: rgb(0.85, 0.75, 1) })

  y = height - 100

  const divider = () => {
    page.drawLine({ start: { x: 24, y }, end: { x: W - 24, y }, thickness: 0.5, color: rgb(0.88, 0.88, 0.88) })
    y -= 16
  }

  const row = (label: string, value: string, highlight = false) => {
    page.drawText(label, { x: 24, y, font, size: 10, color: rgb(0.55, 0.55, 0.55) })
    page.drawText(value, {
      x: 180, y, font: highlight ? bold : font, size: 10,
      color: highlight ? rgb(0.38, 0.0, 0.93) : rgb(0.1, 0.1, 0.1),
    })
    y -= 20
  }

  y -= 8
  row('Receipt No.', `#${tx.id.slice(0, 12).toUpperCase()}`)
  row('Date & Time', new Date(tx.createdAt).toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' }))
  divider()

  row('Member Name', tx.user.name)
  row('Email', tx.user.email)
  if (tx.user.phone) row('Phone', tx.user.phone)
  if (tx.user.customerProfile?.area) {
    row('Area', tx.user.customerProfile.area.name)
    row('Province', tx.user.customerProfile.area.province)
  }
  divider()

  row('Shop', shopName)
  row('Stokvel Group', tx.user.groupMemberships?.[0]?.group.name ?? 'Community Group')
  row('Category', category)
  divider()

  // Amount highlighted
  page.drawRectangle({ x: 24, y: y - 6, width: W - 48, height: 32, color: rgb(0.96, 0.93, 1) })
  page.drawText('Amount Deducted', { x: 34, y: y + 6, font, size: 10, color: rgb(0.55, 0.55, 0.55) })
  page.drawText(`R ${Number(tx.amount).toFixed(2)}`, {
    x: 180, y: y + 6, font: bold, size: 14, color: rgb(0.38, 0.0, 0.93),
  })
  y -= 46
  divider()

  // Status
  page.drawText('Status', { x: 24, y, font, size: 10, color: rgb(0.55, 0.55, 0.55) })
  page.drawRectangle({ x: 178, y: y - 3, width: 60, height: 16, color: rgb(0.88, 1, 0.9) })
  page.drawText('COMPLETED', { x: 182, y: y + 1, font: bold, size: 9, color: rgb(0.1, 0.65, 0.2) })
  y -= 30

  divider()

  // Footer
  page.drawText('This is an official e-Khadi transaction receipt.', {
    x: 24, y, font, size: 9, color: rgb(0.65, 0.65, 0.65),
  })
  y -= 14
  page.drawText('e-Khadi — Empowering South African Communities through Digital Finance', {
    x: 24, y, font, size: 8, color: rgb(0.75, 0.75, 0.75),
  })

  const pdfBytes = await pdfDoc.save()
  const key = `receipts/${tx.userId}/${tx.id}.pdf`

  try {
    const url = await uploadToOBS(key, Buffer.from(pdfBytes), 'application/pdf')
    return NextResponse.json({ url, receiptId: tx.id })
  } catch {
    // OBS not configured — return PDF directly
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ekhadi-receipt-${tx.id.slice(0, 8)}.pdf"`,
      },
    })
  }
}