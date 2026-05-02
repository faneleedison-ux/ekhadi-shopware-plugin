import Link from 'next/link'
import { Button } from './button'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: { label: string; href: string }
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-background flex items-center justify-center mb-4 text-text-secondary">
        {icon}
      </div>
      <p className="text-sm font-semibold text-text-primary">{title}</p>
      <p className="text-xs text-text-secondary mt-1.5 max-w-xs leading-relaxed">{description}</p>
      {action && (
        <Link href={action.href} className="mt-4">
          <Button size="sm">{action.label}</Button>
        </Link>
      )}
    </div>
  )
}