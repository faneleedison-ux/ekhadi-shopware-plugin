import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/db'
import SouthAfricaLiveMap, { MapMarker } from '@/components/landing/SouthAfricaLiveMap'
import ActivityFeedTicker, { ActivityItem } from '@/components/landing/ActivityFeedTicker'
import ImpactCounters from '@/components/landing/ImpactCounters'
import TestimonialCards from '@/components/landing/TestimonialCards'

const quickPoints = [
  {
    title: 'Community-Powered',
    text: 'Loans are based on stokvel trust networks, not collateral-heavy banking.',
  },
  {
    title: 'Fair Pricing',
    text: 'R50-R300 credit with a clear flat 2% service fee.',
  },
  {
    title: 'Local Impact',
    text: 'Spend only on essentials at approved local spaza shops.',
  },
]

const steps = [
  {
    title: 'Join',
    text: 'Members join a local stokvel group.',
  },
  {
    title: 'Request',
    text: 'They request small essential-goods credit.',
  },
  {
    title: 'Repay',
    text: 'Repayment is deducted from the next grant cycle.',
  },
]

const areaCoordinateFallbacks: Record<string, { lat: number; lng: number }> = {
  Soweto: { lat: -26.2485, lng: 27.854 },
  Alexandra: { lat: -26.1036, lng: 28.0978 },
  Tembisa: { lat: -25.9973, lng: 28.2268 },
  Mamelodi: { lat: -25.707, lng: 28.3526 },
  Soshanguve: { lat: -25.5156, lng: 28.1003 },
  Katlehong: { lat: -26.3394, lng: 28.1581 },
  Khayelitsha: { lat: -34.0379, lng: 18.6776 },
  Gugulethu: { lat: -33.9834, lng: 18.5701 },
  "Mitchell's Plain": { lat: -34.0446, lng: 18.6171 },
  Delft: { lat: -33.9686, lng: 18.643 },
  Umlazi: { lat: -29.9684, lng: 30.8845 },
  KwaMashu: { lat: -29.7461, lng: 30.9683 },
  Inanda: { lat: -29.694, lng: 30.9456 },
  Ntuzuma: { lat: -29.7072, lng: 30.9259 },
  Hammarsdale: { lat: -29.7996, lng: 30.6568 },
  Mdantsane: { lat: -32.9487, lng: 27.7307 },
  Motherwell: { lat: -33.7596, lng: 25.6056 },
  Mthatha: { lat: -31.5899, lng: 28.7844 },
  Seshego: { lat: -23.8649, lng: 29.389 },
  Giyani: { lat: -23.3025, lng: 30.7181 },
  Tzaneen: { lat: -23.8332, lng: 30.1635 },
  Kanyamazane: { lat: -25.4713, lng: 30.9692 },
  Matsulu: { lat: -25.4446, lng: 30.9682 },
  KwaMhlanga: { lat: -25.4063, lng: 28.6684 },
  Ikageng: { lat: -26.7136, lng: 27.097 },
  Jouberton: { lat: -26.8745, lng: 26.6395 },
  Moretele: { lat: -25.4655, lng: 28.0708 },
  Mangaung: { lat: -29.1191, lng: 26.214 },
  Botshabelo: { lat: -29.2334, lng: 26.7265 },
  'Thaba Nchu': { lat: -29.2042, lng: 26.8385 },
  Galeshewe: { lat: -28.7386, lng: 24.7624 },
  Roodepan: { lat: -28.6838, lng: 24.7248 },
}

const provinceCenters: Record<string, { lat: number; lng: number }> = {
  Gauteng: { lat: -26.2708, lng: 28.1123 },
  'Western Cape': { lat: -33.8152, lng: 18.633 },
  'KwaZulu-Natal': { lat: -29.8587, lng: 30.981 },
  'Eastern Cape': { lat: -32.2968, lng: 26.4194 },
  Limpopo: { lat: -23.4013, lng: 29.4179 },
  Mpumalanga: { lat: -25.5653, lng: 30.5273 },
  'North West': { lat: -26.6639, lng: 25.2838 },
  'Free State': { lat: -28.4541, lng: 26.7968 },
  'Northern Cape': { lat: -29.0467, lng: 21.8569 },
}

function parseAreaCoordinates(raw: string | null | undefined): { lat: number; lng: number } | null {
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw)

    if (Array.isArray(parsed) && parsed.length >= 2) {
      const first = Number(parsed[0])
      const second = Number(parsed[1])

      if (Number.isFinite(first) && Number.isFinite(second)) {
        if (first >= 16 && first <= 33 && second <= -22 && second >= -35.5) {
          return { lat: second, lng: first }
        }

        if (first <= -22 && first >= -35.5 && second >= 16 && second <= 33) {
          return { lat: first, lng: second }
        }
      }
    }

    if (parsed && typeof parsed === 'object') {
      const obj = parsed as Record<string, unknown>
      const lat = Number(obj.lat ?? obj.latitude)
      const lng = Number(obj.lng ?? obj.lon ?? obj.longitude)

      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return { lat, lng }
      }
    }
  } catch {
    return null
  }

  return null
}

function hashString(input: string) {
  let hash = 0

  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }

  return Math.abs(hash)
}

function spreadWithinArea(base: { lat: number; lng: number }, key: string, index: number): { lat: number; lng: number } {
  const seed = hashString(`${key}-${index}`)
  const angle = ((seed % 360) * Math.PI) / 180
  const ring = Math.floor(index / 10)
  const radius = 0.03 + ring * 0.02 + (seed % 7) * 0.003

  const lat = base.lat + Math.sin(angle) * radius
  const lng = base.lng + Math.cos(angle) * radius * 1.3

  return {
    lat: Math.max(-35.2, Math.min(-22.0, lat)),
    lng: Math.max(16.3, Math.min(33.3, lng)),
  }
}

function anonymizeName(fullName: string): string {
  const parts = fullName.trim().split(' ').filter(Boolean)
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1][0]}.`
}

async function getActivityFeed(): Promise<ActivityItem[]> {
  try {
    const requests = await prisma.creditRequest.findMany({
      where: { status: 'APPROVED' },
      orderBy: { updatedAt: 'desc' },
      take: 12,
      select: {
        amount: true,
        updatedAt: true,
        requester: {
          select: {
            name: true,
            customerProfile: {
              select: { area: { select: { name: true } } },
            },
          },
        },
      },
    })

    const now = Date.now()
    return requests.map((r) => ({
      name: anonymizeName(r.requester.name),
      area: r.requester.customerProfile?.area?.name ?? 'South Africa',
      amount: Number(r.amount),
      minutesAgo: Math.floor((now - new Date(r.updatedAt).getTime()) / 60_000),
    }))
  } catch {
    return []
  }
}

async function getImpactStats(): Promise<{
  familiesHelped: number
  totalCreditIssued: number
  activeGroups: number
}> {
  try {
    const [familiesHelped, creditAggregate, activeGroups] = await Promise.all([
      prisma.user.count({ where: { role: 'MEMBER' } }),
      prisma.creditRequest.aggregate({
        where: { status: 'APPROVED' },
        _sum: { amount: true },
      }),
      prisma.group.count(),
    ])
    return {
      familiesHelped,
      totalCreditIssued: Math.round(Number(creditAggregate._sum.amount ?? 0)),
      activeGroups,
    }
  } catch {
    return { familiesHelped: 0, totalCreditIssued: 0, activeGroups: 0 }
  }
}

async function getMapData(): Promise<{ markers: MapMarker[]; areaCount: number }> {
  try {
    const [areas, shops, members, groups] = await Promise.all([
      prisma.area.findMany({
        select: {
          id: true,
          name: true,
          province: true,
          coordinates: true,
        },
      }),
      prisma.shop.findMany({
        select: {
          id: true,
          name: true,
          areaId: true,
          area: {
            select: {
              name: true,
              province: true,
            },
          },
        },
      }),
      prisma.customerProfile.findMany({
        select: {
          id: true,
          user: {
            select: {
              name: true,
            },
          },
          areaId: true,
          area: {
            select: {
              name: true,
              province: true,
            },
          },
        },
      }),
      prisma.group.findMany({
        select: {
          id: true,
          name: true,
          areaId: true,
          area: {
            select: {
              name: true,
              province: true,
            },
          },
        },
      }),
    ])

    const areaCenterById = new Map<string, { lat: number; lng: number }>()

    areas.forEach((area) => {
      const parsed = parseAreaCoordinates(area.coordinates)

      if (parsed) {
        areaCenterById.set(area.id, parsed)
        return
      }

      const exact = areaCoordinateFallbacks[area.name]
      if (exact) {
        areaCenterById.set(area.id, exact)
        return
      }

      const provinceCenter = provinceCenters[area.province] ?? { lat: -30.5595, lng: 22.9375 }
      const seeded = spreadWithinArea(provinceCenter, area.name, 0)
      areaCenterById.set(area.id, seeded)
    })

    const areaSpreadCount = new Map<string, number>()

    const nextAreaPosition = (areaId: string, key: string) => {
      const base = areaCenterById.get(areaId) ?? { lat: -30.5595, lng: 22.9375 }
      const idx = areaSpreadCount.get(areaId) ?? 0
      areaSpreadCount.set(areaId, idx + 1)
      return spreadWithinArea(base, key, idx)
    }

    const shopMarkers: MapMarker[] = shops.map((shop) => {
      const point = nextAreaPosition(shop.areaId, `shop-${shop.id}`)

      return {
        id: `shop-${shop.id}`,
        name: shop.name,
        type: 'shop',
        areaName: shop.area.name,
        province: shop.area.province,
        lat: point.lat,
        lng: point.lng,
      }
    })

    const userMarkers: MapMarker[] = members.map((member) => {
      const point = nextAreaPosition(member.areaId, `user-${member.id}`)

      return {
        id: `user-${member.id}`,
        name: member.user.name,
        type: 'user',
        areaName: member.area.name,
        province: member.area.province,
        lat: point.lat,
        lng: point.lng,
      }
    })

    const groupMarkers: MapMarker[] = groups.map((group) => {
      const point = nextAreaPosition(group.areaId, `group-${group.id}`)

      return {
        id: `group-${group.id}`,
        name: group.name,
        type: 'group',
        areaName: group.area.name,
        province: group.area.province,
        lat: point.lat,
        lng: point.lng,
      }
    })

    return {
      markers: [...shopMarkers, ...userMarkers, ...groupMarkers],
      areaCount: areas.length,
    }
  } catch {
    return { markers: [], areaCount: 0 }
  }
}

export default async function LandingPage() {
  const [{ markers, areaCount }, activityItems, impactStats] = await Promise.all([
    getMapData(),
    getActivityFeed(),
    getImpactStats(),
  ])

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-border bg-white sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-base">eK</span>
            </div>
            <span className="font-bold text-2xl tracking-tight text-primary">e-Khadi</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="bg-gradient-to-br from-primary via-primary-dark to-blue-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <div className="max-w-3xl">
            <p className="text-blue-200 text-sm font-medium mb-3">Built for SASSA Communities</p>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight">
              Decentralized Community Credit
            </h1>
            <p className="mt-4 text-blue-100 text-lg leading-relaxed">
              A non-conventional finance model that gives underserved households fair micro-loans without traditional bank collateral.
            </p>

            <div className="mt-6 grid sm:grid-cols-3 gap-3 sm:auto-rows-fr">
              {quickPoints.map((point) => (
                <div
                  key={point.title}
                  className="h-full min-h-[128px] rounded-xl border border-white/20 bg-white/10 p-4 flex flex-col"
                >
                  <div className="flex items-center gap-2 text-blue-100">
                    <CheckCircle2 className="h-4 w-4 text-blue-200 flex-shrink-0" />
                    <p className="text-sm font-semibold">{point.title}</p>
                  </div>
                  <p className="text-xs text-blue-100 mt-2 leading-relaxed flex-1">{point.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link href="/register">
                <Button size="lg" className="bg-white text-primary hover:bg-blue-50 font-semibold w-full sm:w-auto">
                  Register as Member
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/register?role=SHOP">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20 w-full sm:w-auto"
                >
                  Register Your Shop
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Activity Feed */}
      <ActivityFeedTicker items={activityItems} />

      <section className="bg-background py-9">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-text-primary">How It Works</h2>
          <div className="mt-4 grid sm:grid-cols-3 gap-4 sm:auto-rows-fr">
            {steps.map((step, idx) => (
              <div key={step.title} className="bg-white rounded-xl p-5 border border-border h-full min-h-[158px] flex flex-col">
                <p className="text-xs font-semibold text-primary">STEP {idx + 1}</p>
                <p className="text-base font-bold text-text-primary mt-1">{step.title}</p>
                <p className="text-sm text-text-secondary mt-2 flex-1">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Impact Counters */}
      <section className="bg-white py-9 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-text-primary">Community Impact</h2>
          <p className="text-sm text-text-secondary mt-1 mb-5">
            Real numbers. Real people. Updated live from the platform.
          </p>
          <ImpactCounters
            familiesHelped={impactStats.familiesHelped}
            totalCreditIssued={impactStats.totalCreditIssued}
            activeGroups={impactStats.activeGroups}
          />
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-background py-9 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-text-primary">Voices from the Community</h2>
          <p className="text-sm text-text-secondary mt-1 mb-5">
            In their own words.
          </p>
          <TestimonialCards />
        </div>
      </section>

      <section className="bg-background py-9">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-text-primary">Community Footprint Map</h2>
          <p className="text-sm text-text-secondary mt-1 mb-4">
            Explore South Africa coverage for registered shops, users and stokvel groups.
          </p>
          <SouthAfricaLiveMap markers={markers} areaCount={areaCount} />
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl bg-primary text-white px-6 py-7 sm:px-8 sm:py-8">
            <h3 className="text-2xl font-bold">Simple. Fair. Community-Led.</h3>
            <p className="text-blue-100 mt-2 max-w-2xl text-sm sm:text-base">
              e-Khadi delivers practical financial access when families need it most.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <Link href="/register">
                <Button size="lg" className="bg-white text-primary hover:bg-blue-50 font-semibold w-full sm:w-auto">
                  Start Now
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 bg-white/10 text-white hover:bg-white/20 w-full sm:w-auto"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
