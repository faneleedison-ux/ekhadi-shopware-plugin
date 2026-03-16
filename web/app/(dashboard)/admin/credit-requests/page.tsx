'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, FileText, Eye } from 'lucide-react'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

interface CreditRequest {
  id: string
  amount: string
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  requester: { name: string; email: string }
  group: { name: string }
  approver?: { name: string } | null
}

export default function CreditRequestsPage() {
  const [requests, setRequests] = useState<CreditRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<CreditRequest | null>(null)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL')

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/credit-requests')
      if (res.ok) {
        const data = await res.json()
        setRequests(data)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    setActionLoading(id + '-approve')
    try {
      const res = await fetch(`/api/credit-requests/${id}/approve`, { method: 'POST' })
      if (res.ok) {
        await fetchRequests()
        setSelectedRequest(null)
      }
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id: string) => {
    setActionLoading(id + '-reject')
    try {
      const res = await fetch(`/api/credit-requests/${id}/reject`, { method: 'POST' })
      if (res.ok) {
        await fetchRequests()
        setSelectedRequest(null)
      }
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = requests.filter((r) => filter === 'ALL' || r.status === filter)

  const counts = {
    ALL: requests.length,
    PENDING: requests.filter((r) => r.status === 'PENDING').length,
    APPROVED: requests.filter((r) => r.status === 'APPROVED').length,
    REJECTED: requests.filter((r) => r.status === 'REJECTED').length,
  }

  const totalAmount = filtered.reduce((sum, req) => sum + Number(req.amount), 0)

  const statusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED': return <Badge variant="success">Approved</Badge>
      case 'REJECTED': return <Badge variant="destructive">Rejected</Badge>
      default: return <Badge variant="warning">Pending</Badge>
    }
  }

  return (
    <div className="admin-shell">
      <div>
        <h1 className="admin-heading">Credit Requests</h1>
        <p className="admin-subheading">Review and manage member credit requests</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="admin-kpi-card">
          <CardContent className="admin-kpi-content">
            <p className="text-xs text-text-secondary">Total Requests</p>
            <p className="text-2xl font-bold text-text-primary mt-1">{counts.ALL}</p>
          </CardContent>
        </Card>
        <Card className="admin-kpi-card">
          <CardContent className="admin-kpi-content">
            <p className="text-xs text-text-secondary">Pending</p>
            <p className="text-2xl font-bold text-warning mt-1">{counts.PENDING}</p>
          </CardContent>
        </Card>
        <Card className="admin-kpi-card">
          <CardContent className="admin-kpi-content">
            <p className="text-xs text-text-secondary">Approved</p>
            <p className="text-2xl font-bold text-success mt-1">{counts.APPROVED}</p>
          </CardContent>
        </Card>
        <Card className="admin-kpi-card">
          <CardContent className="admin-kpi-content">
            <p className="text-xs text-text-secondary">Visible Amount</p>
            <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(totalAmount)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap bg-white border border-border rounded-xl p-2">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
              filter === status ? 'bg-white/20 text-white' : 'bg-gray-100 text-text-secondary'
            }`}>
              {counts[status]}
            </span>
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12 text-text-secondary">Loading requests...</div>
          ) : (
            <div className="admin-table-wrap">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-text-secondary py-12">
                        No {filter !== 'ALL' ? filter.toLowerCase() : ''} requests found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((req) => (
                      <TableRow key={req.id}>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-sm">{req.requester.name}</p>
                            <p className="text-xs text-text-secondary">{req.requester.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{req.group.name}</TableCell>
                        <TableCell>
                          <span className="font-semibold text-sm">{formatCurrency(Number(req.amount))}</span>
                          <p className="text-xs text-text-secondary">
                            Fee: {formatCurrency(Number(req.amount) * 0.02)}
                          </p>
                        </TableCell>
                        <TableCell className="text-sm max-w-[160px] truncate">{req.reason}</TableCell>
                        <TableCell>{statusBadge(req.status)}</TableCell>
                        <TableCell className="text-xs text-text-secondary">{formatDate(req.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedRequest(req)}
                              className="h-7 w-7 p-0"
                              title="View details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            {req.status === 'PENDING' && (
                              <>
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => handleApprove(req.id)}
                                  loading={actionLoading === req.id + '-approve'}
                                  className="h-7 px-2 text-xs"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleReject(req.id)}
                                  loading={actionLoading === req.id + '-reject'}
                                  className="h-7 px-2 text-xs"
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Credit Request Details</DialogTitle>
              <DialogDescription>
                Submitted {formatDateTime(selectedRequest.createdAt)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-text-secondary font-medium uppercase tracking-wide">Member</p>
                  <p className="text-sm font-semibold mt-1">{selectedRequest.requester.name}</p>
                  <p className="text-xs text-text-secondary">{selectedRequest.requester.email}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary font-medium uppercase tracking-wide">Group</p>
                  <p className="text-sm font-semibold mt-1">{selectedRequest.group.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-text-secondary font-medium uppercase tracking-wide">Amount Requested</p>
                  <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(Number(selectedRequest.amount))}</p>
                  <p className="text-xs text-text-secondary">
                    + {formatCurrency(Number(selectedRequest.amount) * 0.02)} service fee
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary font-medium uppercase tracking-wide">Status</p>
                  <div className="mt-1">{statusBadge(selectedRequest.status)}</div>
                </div>
              </div>
              <div>
                <p className="text-xs text-text-secondary font-medium uppercase tracking-wide">Reason</p>
                <p className="text-sm mt-1 p-3 bg-background rounded-lg">{selectedRequest.reason}</p>
              </div>
              {selectedRequest.approver && (
                <div>
                  <p className="text-xs text-text-secondary font-medium uppercase tracking-wide">Processed by</p>
                  <p className="text-sm mt-1">{selectedRequest.approver.name}</p>
                </div>
              )}
            </div>
            {selectedRequest.status === 'PENDING' && (
              <DialogFooter className="gap-2">
                <Button
                  variant="destructive"
                  onClick={() => handleReject(selectedRequest.id)}
                  loading={actionLoading === selectedRequest.id + '-reject'}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  variant="success"
                  onClick={() => handleApprove(selectedRequest.id)}
                  loading={actionLoading === selectedRequest.id + '-approve'}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
