'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  description?: string
  trend?: { value: number; label: string; positive?: boolean }
  className?: string
  iconBg?: string
  accentColor?: string
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const duration = 900
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(ease * value))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])
  return <>{display.toLocaleString()}</>
}

export default function StatsCard({
  title, value, icon, description, trend, className, iconBg = 'bg-primary-light', accentColor,
}: StatsCardProps) {
  const isNumeric = typeof value === 'number'

  return (
    <Card className={cn('admin-kpi-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200', className)}>
      <CardContent className="admin-kpi-content">
        {accentColor && (
          <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: accentColor }} />
        )}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide truncate">{title}</p>
            <p className="text-2xl font-black text-text-primary mt-1.5 leading-none">
              {isNumeric ? <AnimatedNumber value={value as number} /> : value}
            </p>
            {description && <p className="text-xs text-text-secondary mt-1.5">{description}</p>}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded-full',
                  trend.positive ? 'text-success bg-success/10' : 'text-danger bg-danger/10')}>
                  {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-text-secondary">{trend.label}</span>
              </div>
            )}
          </div>
          <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm', iconBg)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}