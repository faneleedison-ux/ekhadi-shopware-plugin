import { prisma } from '@/lib/db'
import type { ActivityItem } from '@/components/landing/ActivityFeedTicker'
import type { MapMarker } from '@/components/landing/SouthAfricaLiveMap'
import DawnMasthead  from '@/components/landing/DawnMasthead'
import DawnHero      from '@/components/landing/DawnHero'
import DawnBreak     from '@/components/landing/DawnBreak'
import DawnWhy       from '@/components/landing/DawnWhy'
import DawnStory     from '@/components/landing/DawnStory'
import DawnHow       from '@/components/landing/DawnHow'
import DawnImpact    from '@/components/landing/DawnImpact'
import DawnVoices    from '@/components/landing/DawnVoices'
import DawnFootprint from '@/components/landing/DawnFootprint'
import DawnFinal     from '@/components/landing/DawnFinal'
import DawnFoot      from '@/components/landing/DawnFoot'
import DawnReveal    from '@/components/landing/DawnReveal'

function anonymizeName(n: string) {
  const p = n.trim().split(' ').filter(Boolean)
  return p.length === 1 ? p[0] : `${p[0]} ${p[p.length - 1][0]}.`
}

async function getActivityFeed(): Promise<ActivityItem[]> {
  try {
    const requests = await prisma.creditRequest.findMany({
      where: { status: 'APPROVED' }, orderBy: { updatedAt: 'desc' }, take: 12,
      select: { amount: true, updatedAt: true, requester: { select: { name: true, customerProfile: { select: { area: { select: { name: true } } } } } } },
    })
    const now = Date.now()
    return requests.map((r) => ({
      name: anonymizeName(r.requester.name),
      area: r.requester.customerProfile?.area?.name ?? 'South Africa',
      amount: Number(r.amount),
      minutesAgo: Math.floor((now - new Date(r.updatedAt).getTime()) / 60_000),
    }))
  } catch { return [] }
}

/* Deterministic jitter so server and client render the same coordinates */
function jitter(seed: string, scale = 0.06): number {
  let h = 5381
  for (let i = 0; i < seed.length; i++) h = ((h << 5) + h) ^ seed.charCodeAt(i)
  return ((h >>> 0) / 0xffffffff - 0.5) * scale
}

const AREA_COORDS: Record<string, [number, number]> = {
  'Soweto':             [-26.2678, 27.8588],
  'Alexandra':          [-26.1042, 28.0875],
  'Tembisa':            [-25.9942, 28.2259],
  'Mamelodi':           [-25.7067, 28.3717],
  'Soshanguve':         [-25.5269, 28.1023],
  'Katlehong':          [-26.3569, 28.1570],
  'Khayelitsha':        [-34.0422, 18.6735],
  'Gugulethu':          [-33.9769, 18.5794],
  "Mitchell's Plain":   [-34.0444, 18.6228],
  'Delft':              [-33.9614, 18.6339],
  'Umlazi':             [-29.9692, 30.8888],
  'KwaMashu':           [-29.7383, 30.9831],
  'Inanda':             [-29.6725, 30.9022],
  'Ntuzuma':            [-29.7650, 30.9292],
  'Hammarsdale':        [-29.8667, 30.5083],
  'Mdantsane':          [-32.9833, 27.2333],
  'Motherwell':         [-33.8167, 25.5667],
  'Mthatha':            [-31.5892, 28.7842],
  'Seshego':            [-23.8414, 29.4483],
  'Giyani':             [-23.2994, 30.7206],
  'Tzaneen':            [-23.8333, 30.1667],
  'Kanyamazane':        [-25.0264, 30.8553],
  'Matsulu':            [-25.1097, 31.0014],
  'KwaMhlanga':         [-25.4000, 28.7167],
  'Ikageng':            [-26.7667, 26.6500],
  'Jouberton':          [-26.8500, 26.5833],
  'Moretele':           [-25.5300, 28.0800],
  'Mangaung':           [-29.1183, 26.2139],
  'Botshabelo':         [-29.2667, 26.7167],
  'Thaba Nchu':         [-29.2500, 26.8167],
  'Galeshewe':          [-28.7167, 24.7333],
  'Roodepan':           [-28.7500, 24.7667],
}

const PROVINCE_COORDS: Record<string, [number, number]> = {
  'Gauteng':        [-26.2041, 28.0473],
  'Western Cape':   [-33.9249, 18.4241],
  'KwaZulu-Natal':  [-29.8587, 31.0218],
  'Eastern Cape':   [-32.2968, 26.4194],
  'Limpopo':        [-23.4013, 29.4179],
  'Mpumalanga':     [-25.5653, 30.5270],
  'North West':     [-26.6638, 25.4349],
  'Free State':     [-28.4541, 26.7968],
  'Northern Cape':  [-29.0467, 23.5818],
}

function coordsFor(areaName: string, province: string, id: string): [number, number] {
  const base = AREA_COORDS[areaName] ?? PROVINCE_COORDS[province] ?? [-29.2, 24.8]
  return [base[0] + jitter(id + 'lat'), base[1] + jitter(id + 'lng')]
}

async function getMapMarkers(): Promise<{ markers: MapMarker[]; areaCount: number }> {
  try {
    const [areas, shops, members, groups] = await Promise.all([
      prisma.area.findMany({ select: { id: true, name: true, province: true } }),
      prisma.shop.findMany({
        where: { isActive: true },
        select: { id: true, name: true, area: { select: { name: true, province: true } } },
      }),
      prisma.user.findMany({
        where: { role: 'MEMBER' },
        take: 60,
        select: { id: true, name: true, customerProfile: { select: { area: { select: { name: true, province: true } } } } },
      }),
      prisma.group.findMany({
        select: { id: true, name: true, area: { select: { name: true, province: true } } },
      }),
    ])

    const markers: MapMarker[] = []

    for (const s of shops) {
      const [lat, lng] = coordsFor(s.area.name, s.area.province, s.id)
      markers.push({ id: `shop-${s.id}`, name: s.name, type: 'shop', areaName: s.area.name, province: s.area.province, lat, lng })
    }
    for (const u of members) {
      const area = u.customerProfile?.area
      if (!area) continue
      const [lat, lng] = coordsFor(area.name, area.province, u.id)
      markers.push({ id: `user-${u.id}`, name: u.name, type: 'user', areaName: area.name, province: area.province, lat, lng })
    }
    for (const g of groups) {
      const [lat, lng] = coordsFor(g.area.name, g.area.province, g.id)
      markers.push({ id: `group-${g.id}`, name: g.name, type: 'group', areaName: g.area.name, province: g.area.province, lat, lng })
    }

    return { markers, areaCount: areas.length || 29 }
  } catch {
    return { markers: DEMO_MARKERS, areaCount: 29 }
  }
}

const DEMO_MARKERS: MapMarker[] = [
  { id: 'd-s1', name: 'Mama Zulu Spaza',   type: 'shop',  areaName: 'Umlazi',       province: 'KwaZulu-Natal', lat: -29.972, lng: 30.891 },
  { id: 'd-s2', name: 'Soweto Corner',      type: 'shop',  areaName: 'Soweto',       province: 'Gauteng',       lat: -26.271, lng: 27.862 },
  { id: 'd-s3', name: 'Cape Spaza',         type: 'shop',  areaName: 'Khayelitsha',  province: 'Western Cape',  lat: -34.045, lng: 18.678 },
  { id: 'd-s4', name: 'Alex Quick Shop',    type: 'shop',  areaName: 'Alexandra',    province: 'Gauteng',       lat: -26.107, lng: 28.091 },
  { id: 'd-s5', name: 'Mamelodi Market',    type: 'shop',  areaName: 'Mamelodi',     province: 'Gauteng',       lat: -25.704, lng: 28.376 },
  { id: 'd-u1', name: 'Nomsa T.',           type: 'user',  areaName: 'Umlazi',       province: 'KwaZulu-Natal', lat: -29.968, lng: 30.886 },
  { id: 'd-u2', name: 'Sipho M.',           type: 'user',  areaName: 'Soweto',       province: 'Gauteng',       lat: -26.265, lng: 27.855 },
  { id: 'd-u3', name: 'Fatima D.',          type: 'user',  areaName: 'Khayelitsha',  province: 'Western Cape',  lat: -34.039, lng: 18.670 },
  { id: 'd-u4', name: 'Thandi K.',          type: 'user',  areaName: 'Alexandra',    province: 'Gauteng',       lat: -26.102, lng: 28.083 },
  { id: 'd-u5', name: 'Lerato S.',          type: 'user',  areaName: 'Mamelodi',     province: 'Gauteng',       lat: -25.709, lng: 28.374 },
  { id: 'd-u6', name: 'Anele M.',           type: 'user',  areaName: 'Mdantsane',    province: 'Eastern Cape',  lat: -32.981, lng: 27.231 },
  { id: 'd-g1', name: 'Umlazi Ubuntu',      type: 'group', areaName: 'Umlazi',       province: 'KwaZulu-Natal', lat: -29.970, lng: 30.890 },
  { id: 'd-g2', name: 'Soweto Stokvel',     type: 'group', areaName: 'Soweto',       province: 'Gauteng',       lat: -26.270, lng: 27.858 },
  { id: 'd-g3', name: 'Khayelitsha Circle', type: 'group', areaName: 'Khayelitsha',  province: 'Western Cape',  lat: -34.043, lng: 18.675 },
  { id: 'd-g4', name: 'Tembisa Together',   type: 'group', areaName: 'Tembisa',      province: 'Gauteng',       lat: -25.996, lng: 28.228 },
]

async function getImpactStats() {
  try {
    const [familiesHelped, creditAggregate, activeGroups] = await Promise.all([
      prisma.user.count({ where: { role: 'MEMBER' } }),
      prisma.creditRequest.aggregate({ where: { status: 'APPROVED' }, _sum: { amount: true } }),
      prisma.group.count(),
    ])
    return { familiesHelped, totalCreditIssued: Math.round(Number(creditAggregate._sum.amount ?? 0)), activeGroups }
  } catch { return { familiesHelped: 0, totalCreditIssued: 0, activeGroups: 0 } }
}

export default async function LandingPage() {
  const [activityItems, impactStatsRaw, mapData] = await Promise.all([
    getActivityFeed(),
    getImpactStats(),
    getMapMarkers(),
  ])

  const impactStats = {
    familiesHelped:    impactStatsRaw.familiesHelped    || 1240,
    totalCreditIssued: impactStatsRaw.totalCreditIssued || 186000,
    activeGroups:      impactStatsRaw.activeGroups      || 99,
  }

  return (
    <div className="dawn-page">
      {/* Paper grain overlay */}
      <div className="dawn-grain" aria-hidden="true" />

      {/* IntersectionObserver for .reveal elements */}
      <DawnReveal />

      {/* Fixed masthead nav */}
      <DawnMasthead />

      {/* Night: video hero with wire ticker at top */}
      <DawnHero items={activityItems} />

      {/* Night → day gradient break */}
      <DawnBreak />

      {/* Cream paper sections */}
      <DawnWhy />
      <DawnStory />
      <DawnHow />
      <DawnImpact
        familiesHelped={impactStats.familiesHelped}
        totalCreditIssued={impactStats.totalCreditIssued}
        activeGroups={impactStats.activeGroups}
      />
      <DawnVoices />
      <DawnFootprint markers={mapData.markers} areaCount={mapData.areaCount} />
      <DawnFinal />
      <DawnFoot />
    </div>
  )
}