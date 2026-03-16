'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Store, Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ToastMessage from '@/components/ui/toast-message'

type ShopView = {
  id: string
  name: string
  isActive: boolean
  user: {
    name: string
    email: string
  }
}

type AreaView = {
  id: string
  name: string
  province: string
  createdAt: string
  memberCount: number
  groupCount: number
  shops: ShopView[]
}

type Props = {
  areas: AreaView[]
}

type ToastState = {
  type: 'success' | 'error'
  message: string
} | null

export default function AreasClient({ areas }: Props) {
  const router = useRouter()

  const [toast, setToast] = useState<ToastState>(null)

  const [addAreaOpen, setAddAreaOpen] = useState(false)
  const [areaName, setAreaName] = useState('')
  const [province, setProvince] = useState('')
  const [addingArea, setAddingArea] = useState(false)

  const [shopArea, setShopArea] = useState<AreaView | null>(null)
  const [shopName, setShopName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [ownerPhone, setOwnerPhone] = useState('')
  const [ownerPassword, setOwnerPassword] = useState('')
  const [addingShop, setAddingShop] = useState(false)

  async function handleAddArea(e: React.FormEvent) {
    e.preventDefault()
    if (!areaName.trim() || !province.trim()) {
      setToast({ type: 'error', message: 'Area name and province are required.' })
      return
    }

    setAddingArea(true)
    try {
      const res = await fetch('/api/areas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: areaName.trim(), province: province.trim() }),
      })

      const data = await res.json()
      if (!res.ok) {
        setToast({ type: 'error', message: data?.error || 'Failed to add area.' })
        return
      }

      setAreaName('')
      setProvince('')
      setAddAreaOpen(false)
      setToast({ type: 'success', message: `Area "${data.name}" added.` })
      router.refresh()
    } catch {
      setToast({ type: 'error', message: 'Something went wrong while adding area.' })
    } finally {
      setAddingArea(false)
    }
  }

  function openAddShopDialog(area: AreaView) {
    setShopArea(area)
    setShopName('')
    setOwnerName('')
    setOwnerEmail('')
    setOwnerPhone('')
    setOwnerPassword('')
  }

  async function handleAddShop(e: React.FormEvent) {
    e.preventDefault()
    if (!shopArea) return

    if (!shopName.trim() || !ownerName.trim() || !ownerEmail.trim() || !ownerPassword.trim()) {
      setToast({ type: 'error', message: 'Shop name, owner name, email and password are required.' })
      return
    }

    setAddingShop(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ownerName.trim(),
          email: ownerEmail.trim(),
          password: ownerPassword,
          role: 'SHOP',
          phone: ownerPhone.trim() || undefined,
          shopName: shopName.trim(),
          areaId: shopArea.id,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setToast({ type: 'error', message: data?.error || 'Failed to add shop.' })
        return
      }

      const newShopName = shopName.trim()
      setShopArea(null)
      setToast({ type: 'success', message: `Shop "${newShopName}" added to ${shopArea.name}.` })
      router.refresh()
    } catch {
      setToast({ type: 'error', message: 'Something went wrong while adding shop.' })
    } finally {
      setAddingShop(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && (
        <ToastMessage
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Areas</h1>
          <p className="text-text-secondary mt-1">{areas.length} coverage areas</p>
        </div>

        <Dialog open={addAreaOpen} onOpenChange={setAddAreaOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Area
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Area</DialogTitle>
              <DialogDescription>Create a new coverage area.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddArea} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="area-name">Area Name</Label>
                <Input
                  id="area-name"
                  value={areaName}
                  onChange={(e) => setAreaName(e.target.value)}
                  placeholder="e.g. Soweto Zone 3"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="area-province">Province</Label>
                <Input
                  id="area-province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="e.g. Gauteng"
                  required
                />
              </div>

              <DialogFooter>
                <Button type="submit" loading={addingArea}>
                  {addingArea ? 'Adding...' : 'Add Area'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {areas.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="h-10 w-10 text-text-secondary mx-auto mb-3" />
            <p className="text-text-secondary font-medium">No areas configured</p>
            <p className="text-sm text-text-secondary mt-1">
              Add coverage areas or run the seed to create demo data.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {areas.map((area) => (
            <Card key={area.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{area.name}</CardTitle>
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin className="h-3.5 w-3.5 text-text-secondary" />
                      <span className="text-xs text-text-secondary">{area.province}</span>
                    </div>
                  </div>
                  <div className="bg-primary-light p-2 rounded-lg">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-2 bg-background rounded-lg">
                    <p className="text-lg font-bold text-text-primary">{area.memberCount}</p>
                    <p className="text-xs text-text-secondary">Members</p>
                  </div>
                  <div className="text-center p-2 bg-background rounded-lg">
                    <p className="text-lg font-bold text-text-primary">{area.groupCount}</p>
                    <p className="text-xs text-text-secondary">Groups</p>
                  </div>
                  <div className="text-center p-2 bg-background rounded-lg">
                    <p className="text-lg font-bold text-text-primary">{area.shops.length}</p>
                    <p className="text-xs text-text-secondary">Shops</p>
                  </div>
                </div>

                {area.shops.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
                      Registered Shops
                    </p>
                    <ul className="space-y-2">
                      {area.shops.map((shop) => (
                        <li key={shop.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Store className="h-3.5 w-3.5 text-text-secondary" />
                            <div>
                              <p className="text-xs font-medium text-text-primary">{shop.name}</p>
                              <p className="text-xs text-text-secondary">{shop.user.name}</p>
                            </div>
                          </div>
                          <Badge variant={shop.isActive ? 'success' : 'secondary'} className="text-xs">
                            {shop.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                  <span className="text-xs text-text-secondary">Added {formatDate(area.createdAt)}</span>
                  <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => openAddShopDialog(area)}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Shop
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!shopArea} onOpenChange={(open) => !open && setShopArea(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Shop</DialogTitle>
            <DialogDescription>
              {shopArea ? `Create a shop account in ${shopArea.name}.` : 'Create a new shop account.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddShop} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="shop-name">Shop Name</Label>
              <Input
                id="shop-name"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Mama Nandi Spaza"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="owner-name">Owner Name</Label>
              <Input
                id="owner-name"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Nandi Dlamini"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="owner-email">Owner Email</Label>
              <Input
                id="owner-email"
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                placeholder="shop@example.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="owner-phone">Owner Phone (Optional)</Label>
              <Input
                id="owner-phone"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                placeholder="+27..."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="owner-password">Temporary Password</Label>
              <Input
                id="owner-password"
                type="password"
                value={ownerPassword}
                onChange={(e) => setOwnerPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
              />
            </div>

            <DialogFooter>
              <Button type="submit" loading={addingShop}>
                {addingShop ? 'Adding...' : 'Add Shop'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
