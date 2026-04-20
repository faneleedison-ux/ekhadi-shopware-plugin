'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle, RefreshCw, Zap, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Alert {
  id: string
  type: string
  description: string
  createdAt: string
  user: { name: string; email: string }
}

const TYPE_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  RAPID_PURCHASES: { label: 'Rapid Purchases', color: 'text-red-500', bg: 'bg-red-50 border-red-200', icon: '⚡' },
  HIGH_VELOCITY: { label: 'High Spend Velocity', color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200', icon: '🔥' },
  DUPLICATE_CATEGORY: { label: 'Duplicate Category', color: 'text-amber-500', bg: 'bg-amber-50 border-amber-200', icon: '🔁' },
}

export default function FraudAlertPanel({ alerts: initial }: { alerts: Alert[] }) {
  const [alerts, setAlerts] = useState(initial)
  const [running, setRunning] = useState(false)
  const [resolving, setResolving] = useState<string | null>(null)

  async function runCheck() {
    setRunning(true)
    const res = await fetch('/api/fraud/check', { method: 'POST' })
    const data = await res.json()
    if (data.newAlerts > 0) window.location.reload()
    setRunning(false)
  }

  async function resolve(id: string) {
    setResolving(id)
    await fetch('/api/fraud/check', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setAlerts(alerts.filter(a => a.id !== id))
    setResolving(null)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Fraud Detection</h1>
          <p className="text-text-secondary mt-1">Automated alerts for suspicious activity patterns</p>
        </div>
        <button
          onClick={runCheck}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white rounded-xl disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #1877F2, #0f4fa8)' }}
        >
          <RefreshCw className={`h-4 w-4 ${running ? 'animate-spin' : ''}`} />
          Run Scan
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Active Alerts', value: alerts.length, color: 'text-danger' },
          { label: 'Rapid Purchases', value: alerts.filter(a => a.type === 'RAPID_PURCHASES').length, color: 'text-red-500' },
          { label: 'High Velocity', value: alerts.filter(a => a.type === 'HIGH_VELOCITY').length, color: 'text-orange-500' },
        ].map(s => (
          <Card key={s.label} className="admin-kpi-card">
            <CardContent className="admin-kpi-content">
              <p className="text-xs text-text-secondary">{s.label}</p>
              <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <p className="font-bold text-text-primary">No active alerts</p>
          <p className="text-sm text-text-secondary mt-1">Run a scan to check for new suspicious patterns</p>
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-danger" /> Active Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {alerts.map(alert => {
                const meta = TYPE_META[alert.type] ?? { label: alert.type, color: 'text-text-primary', bg: 'bg-background border-border', icon: '⚠️' }
                return (
                  <li key={alert.id} className="px-6 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center border ${meta.bg} flex-shrink-0`}>
                        <span className="text-base">{meta.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-text-primary">{alert.user.name}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.bg} ${meta.color}`}>
                            {meta.label}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary mt-0.5">{alert.user.email}</p>
                        <p className="text-xs text-text-primary mt-1">{alert.description}</p>
                        <p className="text-[10px] text-text-secondary mt-1">{new Date(alert.createdAt).toLocaleString('en-ZA')}</p>
                      </div>
                      <button
                        onClick={() => resolve(alert.id)}
                        disabled={resolving === alert.id}
                        className="flex items-center gap-1.5 text-xs text-success font-bold bg-success/10 border border-success/20 px-3 py-1.5 rounded-xl hover:bg-success/20 transition-colors flex-shrink-0"
                      >
                        <CheckCircle className="h-3 w-3" />
                        {resolving === alert.id ? '...' : 'Resolve'}
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}