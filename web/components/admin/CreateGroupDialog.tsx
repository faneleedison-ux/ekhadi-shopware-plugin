'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type AreaOption = {
  id: string
  name: string
  province: string
}

type Props = {
  areas: AreaOption[]
  onCreated?: (groupName: string) => void
}

export default function CreateGroupDialog({ areas, onCreated }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [areaId, setAreaId] = useState(areas[0]?.id ?? '')
  const [maxMembers, setMaxMembers] = useState(10)
  const [rotationDay, setRotationDay] = useState(1)
  const [description, setDescription] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !areaId) {
      setError('Group name and area are required.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          areaId,
          maxMembers,
          rotationDay,
          description: description.trim() || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Failed to create group.')
        setLoading(false)
        return
      }

      setOpen(false)
      onCreated?.(name.trim())
      setName('')
      setDescription('')
      setMaxMembers(10)
      setRotationDay(1)
      router.refresh()
    } catch {
      setError('Something went wrong while creating group.')
    } finally {
      setLoading(false)
    }
  }

  const noAreas = areas.length === 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={noAreas} title={noAreas ? 'Create an area first' : 'Create a new stokvel group'}>
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Stokvel Group</DialogTitle>
          <DialogDescription>
            Add a new group and initialize its wallet.
          </DialogDescription>
        </DialogHeader>

        {noAreas ? (
          <p className="text-sm text-text-secondary">No areas found. Create an area first from Admin Areas.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <p className="text-sm text-danger">{error}</p>}

            <div className="space-y-1.5">
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Soweto Savings Circle"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="group-area">Area</Label>
              <select
                id="group-area"
                className="w-full border border-border rounded-md px-3 py-2 bg-white text-sm"
                value={areaId}
                onChange={(e) => setAreaId(e.target.value)}
                required
              >
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name} ({area.province})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="group-max-members">Max Members</Label>
                <Input
                  id="group-max-members"
                  type="number"
                  min={2}
                  max={100}
                  value={maxMembers}
                  onChange={(e) => setMaxMembers(Number(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="group-rotation-day">Rotation Day</Label>
                <Input
                  id="group-rotation-day"
                  type="number"
                  min={1}
                  max={28}
                  value={rotationDay}
                  onChange={(e) => setRotationDay(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="group-description">Description (Optional)</Label>
              <Input
                id="group-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Community savings and support group"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" loading={loading}>
                {loading ? 'Creating...' : 'Create Group'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
