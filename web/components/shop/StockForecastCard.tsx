'use client'

import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export type ForecastItem = {
  category: string
  emoji: string
  percent: number
  count: number
  trend: number // positive = up, negative = down, 0 = stable
  suggestions: string[]
}

export default function StockForecastCard({ items, totalTransactions, areaName }: {
  items: ForecastItem[]
  totalTransactions: number
  areaName: string
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-500" />
            <CardTitle className="text-base">AI Stock Forecast</CardTitle>
          </div>
          <Badge variant="blue" className="text-xs">AI Powered</Badge>
        </div>
        <p className="text-xs text-text-secondary mt-1">
          Based on {totalTransactions} purchases in {areaName} — updated daily
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.category} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{item.emoji}</span>
                <span className="text-sm font-semibold text-text-primary">{item.category}</span>
                {item.trend > 5 && (
                  <span className="flex items-center gap-0.5 text-xs text-green-600 font-medium">
                    <TrendingUp className="h-3 w-3" />+{item.trend}%
                  </span>
                )}
                {item.trend < -5 && (
                  <span className="flex items-center gap-0.5 text-xs text-red-500 font-medium">
                    <TrendingDown className="h-3 w-3" />{item.trend}%
                  </span>
                )}
                {Math.abs(item.trend) <= 5 && (
                  <span className="flex items-center gap-0.5 text-xs text-text-secondary">
                    <Minus className="h-3 w-3" />stable
                  </span>
                )}
              </div>
              <span className="text-sm font-bold text-text-primary">{item.percent}%</span>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-primary transition-all duration-700"
                style={{ width: `${item.percent}%` }}
              />
            </div>

            {/* Suggestions */}
            <ul className="space-y-0.5 pl-1">
              {item.suggestions.map((s, i) => (
                <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                  <span className="text-primary mt-0.5">→</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-sm text-text-secondary text-center py-4">
            Not enough transaction data yet. Forecasts appear after 10+ purchases.
          </p>
        )}
      </CardContent>
    </Card>
  )
}