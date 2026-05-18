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
      ? 'bg-[#3F7B4F]/10 border-[#3F7B4F]/30 text-[#3F7B4F]'
      : 'bg-[#E11D2A]/10 border-[#E11D2A]/30 text-[#E11D2A]'

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
