'use client'

import { CheckCircle2, AlertTriangle, X } from 'lucide-react'

type ToastType = 'success' | 'error'

type Props = {
  type: ToastType
  message: string
  onClose: () => void
}

export default function ToastMessage({ type, message, onClose }: Props) {
  const style =
    type === 'success'
      ? 'bg-green-50 border-green-200 text-green-800'
      : 'bg-red-50 border-red-200 text-red-800'

  return (
    <div className={`fixed right-4 top-4 z-[100] min-w-[280px] max-w-md border rounded-lg shadow-lg px-4 py-3 ${style}`}>
      <div className="flex items-start gap-2">
        {type === 'success' ? (
          <CheckCircle2 className="h-5 w-5 mt-0.5" />
        ) : (
          <AlertTriangle className="h-5 w-5 mt-0.5" />
        )}
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          type="button"
          className="opacity-70 hover:opacity-100"
          aria-label="Close toast"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
