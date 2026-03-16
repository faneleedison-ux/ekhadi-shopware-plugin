'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UsersRound, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import CreateGroupDialog from '@/components/admin/CreateGroupDialog'
import ToastMessage from '@/components/ui/toast-message'

type AreaOption = {
  id: string
  name: string
  province: string
}

type GroupView = {
  id: string
  name: string
  description: string | null
  area: { name: string; province: string }
  memberCount: number
  maxMembers: number
  walletBalance: number
  rotationDay: number
  createdAt: string
  activeRecipientName: string | null
}

type Props = {
  groups: GroupView[]
  areas: AreaOption[]
}

type ToastState = {
  type: 'success' | 'error'
  message: string
} | null

export default function GroupsTableClient({ groups, areas }: Props) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [toast, setToast] = useState<ToastState>(null)

  const totalMembers = useMemo(
    () => groups.reduce((acc, g) => acc + g.memberCount, 0),
    [groups]
  )

  const totalWallet = useMemo(
    () => groups.reduce((acc, g) => acc + g.walletBalance, 0),
    [groups]
  )

  async function handleDelete(groupId: string, groupName: string) {
    const confirmed = window.confirm(`Delete group \"${groupName}\"? This cannot be undone.`)
    if (!confirmed) return

    setDeletingId(groupId)
    try {
      const res = await fetch(`/api/groups/${groupId}`, { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok) {
        setToast({ type: 'error', message: data?.error || 'Failed to delete group.' })
        setDeletingId(null)
        return
      }

      setToast({ type: 'success', message: `Group \"${groupName}\" deleted.` })
      router.refresh()
    } catch {
      setToast({ type: 'error', message: 'Something went wrong while deleting group.' })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="admin-shell">
      {toast && (
        <ToastMessage
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="admin-heading">Stokvel Groups</h1>
          <p className="admin-subheading">{groups.length} active groups across all areas</p>
        </div>
        <CreateGroupDialog
          areas={areas}
          onCreated={(groupName) => {
            setToast({ type: 'success', message: `Group \"${groupName}\" created.` })
          }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="admin-kpi-card">
          <CardContent className="admin-kpi-content text-center">
            <p className="text-2xl font-bold text-primary">{groups.length}</p>
            <p className="text-xs text-text-secondary mt-1">Total Groups</p>
          </CardContent>
        </Card>
        <Card className="admin-kpi-card">
          <CardContent className="admin-kpi-content text-center">
            <p className="text-2xl font-bold text-success">{totalMembers}</p>
            <p className="text-xs text-text-secondary mt-1">Total Members</p>
          </CardContent>
        </Card>
        <Card className="admin-kpi-card">
          <CardContent className="admin-kpi-content text-center">
            <p className="text-2xl font-bold text-text-primary">{formatCurrency(totalWallet)}</p>
            <p className="text-xs text-text-secondary mt-1">Total Wallet Balance</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <UsersRound className="h-4 w-4 text-primary" />
            All Groups
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="admin-table-wrap">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group Name</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Wallet Balance</TableHead>
                  <TableHead>Rotation Day</TableHead>
                  <TableHead>Current Rotation</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-text-secondary py-12">
                      No groups yet. Create a group or run the seed for demo data.
                    </TableCell>
                  </TableRow>
                ) : (
                  groups.map((group) => {
                    const isFull = group.memberCount >= group.maxMembers
                    return (
                      <TableRow key={group.id}>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-sm">{group.name}</p>
                            {group.description && (
                              <p className="text-xs text-text-secondary truncate max-w-[180px]">
                                {group.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{group.area.name}</p>
                            <p className="text-xs text-text-secondary">{group.area.province}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {group.memberCount}/{group.maxMembers}
                            </span>
                            {isFull && <Badge variant="destructive" className="text-xs">Full</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-sm">
                          {formatCurrency(group.walletBalance)}
                        </TableCell>
                        <TableCell className="text-sm">Day {group.rotationDay}</TableCell>
                        <TableCell>
                          {group.activeRecipientName ? (
                            <div>
                              <Badge variant="success">Active</Badge>
                              <p className="text-xs text-text-secondary mt-0.5">
                                {group.activeRecipientName}
                              </p>
                            </div>
                          ) : (
                            <Badge variant="secondary">No active rotation</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-text-secondary">
                          {formatDate(group.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-danger hover:text-danger"
                            onClick={() => handleDelete(group.id, group.name)}
                            loading={deletingId === group.id}
                            title="Delete group"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
