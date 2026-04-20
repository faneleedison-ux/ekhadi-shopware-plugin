'use client'

import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'

export default function ReceiptButton({ transactionId }: { transactionId: string }) {
  const [loading, setLoading] = useState(false)

  async function download() {
    setLoading(true)
    try {
      const res = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId }),
      })

      if (res.headers.get('Content-Type')?.includes('application/pdf')) {
        // Direct PDF download (OBS not configured)
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `ekhadi-receipt-${transactionId.slice(0, 8)}.pdf`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        const { url } = await res.json()
        window.open(url, '_blank')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={download}
      disabled={loading}
      className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
      Receipt
    </button>
  )
}