import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { MapPin, Store, Plus, UsersRound } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default async function AreasPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const areas = await prisma.area.findMany({
    include: {
      shops: {
        include: { user: { select: { name: true, email: true } } },
      },
      _count: {
        select: { customerProfiles: true, groups: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Areas</h1>
          <p className="text-text-secondary mt-1">{areas.length} coverage areas</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Area
        </Button>
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
                    <p className="text-lg font-bold text-text-primary">{area._count.customerProfiles}</p>
                    <p className="text-xs text-text-secondary">Members</p>
                  </div>
                  <div className="text-center p-2 bg-background rounded-lg">
                    <p className="text-lg font-bold text-text-primary">{area._count.groups}</p>
                    <p className="text-xs text-text-secondary">Groups</p>
                  </div>
                  <div className="text-center p-2 bg-background rounded-lg">
                    <p className="text-lg font-bold text-text-primary">{area.shops.length}</p>
                    <p className="text-xs text-text-secondary">Shops</p>
                  </div>
                </div>

                {/* Shops list */}
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
                  <Button variant="outline" size="sm" className="text-xs h-7">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Shop
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
