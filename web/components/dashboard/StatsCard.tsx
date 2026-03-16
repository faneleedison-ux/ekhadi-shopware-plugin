import React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  description?: string
  trend?: {
    value: number
    label: string
    positive?: boolean
  }
  className?: string
  iconBg?: string
}

export default function StatsCard({
  title,
  value,
  icon,
  description,
  trend,
  className,
  iconBg = 'bg-primary-light',
}: StatsCardProps) {
  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-secondary truncate">{title}</p>
            <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
            {description && (
              <p className="text-xs text-text-secondary mt-1">{description}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <span
                  className={cn(
                    'text-xs font-medium',
                    trend.positive ? 'text-success' : 'text-danger'
                  )}
                >
                  {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-text-secondary">{trend.label}</span>
              </div>
            )}
          </div>
          <div className={cn('p-3 rounded-xl flex-shrink-0', iconBg)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
