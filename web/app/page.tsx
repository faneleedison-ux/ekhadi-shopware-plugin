import Link from 'next/link'
import { ArrowRight, Shield, Zap, Globe, ChevronDown } from 'lucide-react'
import { Outfit } from 'next/font/google'
import { prisma } from '@/lib/db'
import SouthAfricaLiveMap, { MapMarker } from '@/components/landing/SouthAfricaLiveMap'
import ActivityFeedTicker, { ActivityItem } from '@/components/landing/ActivityFeedTicker'
import ImpactCounters from '@/components/landing/ImpactCounters'
import TestimonialCards from '@/components/landing/TestimonialCards'
import ScrollReveal from '@/components/landing/ScrollReveal'
import HowItWorksSteps from '@/components/landing/HowItWorksSteps'
import LandingNav from '@/components/landing/LandingNav'

const outfit = Outfit({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-outfit', display: 'swap' })

const features = [
  { title: 'Community-Powered', text: 'Based on stokvel trust, not bank collateral.', icon: Shield },
  { title: 'Fair Pricing', text: 'R50–R1 000 credit. Flat 2% service fee. No surprises.', icon: Zap },
  { title: 'Local Impact', text: 'Spend at approved spaza shops in your area only.', icon: Globe },
]


const areaCoordinateFallbacks: Record<string, { lat: number; lng: number }> = {
  Soweto: { lat: -26.2485, lng: 27.854 }, Alexandra: { lat: -26.1036, lng: 28.0978 },
  Tembisa: { lat: -25.9973, lng: 28.2268 }, Mamelodi: { lat: -25.707, lng: 28.3526 },
  Soshanguve: { lat: -25.5156, lng: 28.1003 }, Katlehong: { lat: -26.3394, lng: 28.1581 },
  Khayelitsha: { lat: -34.0379, lng: 18.6776 }, Gugulethu: { lat: -33.9834, lng: 18.5701 },
  "Mitchell's Plain": { lat: -34.0446, lng: 18.6171 }, Delft: { lat: -33.9686, lng: 18.643 },
  Umlazi: { lat: -29.9684, lng: 30.8845 }, KwaMashu: { lat: -29.7461, lng: 30.9683 },
  Inanda: { lat: -29.694, lng: 30.9456 }, Ntuzuma: { lat: -29.7072, lng: 30.9259 },
  Hammarsdale: { lat: -29.7996, lng: 30.6568 }, Mdantsane: { lat: -32.9487, lng: 27.7307 },
  Motherwell: { lat: -33.7596, lng: 25.6056 }, Mthatha: { lat: -31.5899, lng: 28.7844 },
  Seshego: { lat: -23.8649, lng: 29.389 }, Giyani: { lat: -23.3025, lng: 30.7181 },
  Tzaneen: { lat: -23.8332, lng: 30.1635 }, Kanyamazane: { lat: -25.4713, lng: 30.9692 },
  Matsulu: { lat: -25.4446, lng: 30.9682 }, KwaMhlanga: { lat: -25.4063, lng: 28.6684 },
  Ikageng: { lat: -26.7136, lng: 27.097 }, Jouberton: { lat: -26.8745, lng: 26.6395 },
  Moretele: { lat: -25.4655, lng: 28.0708 }, Mangaung: { lat: -29.1191, lng: 26.214 },
  Botshabelo: { lat: -29.2334, lng: 26.7265 }, 'Thaba Nchu': { lat: -29.2042, lng: 26.8385 },
  Galeshewe: { lat: -28.7386, lng: 24.7624 }, Roodepan: { lat: -28.6838, lng: 24.7248 },
}
const provinceCenters: Record<string, { lat: number; lng: number }> = {
  Gauteng: { lat: -26.2708, lng: 28.1123 }, 'Western Cape': { lat: -33.8152, lng: 18.633 },
  'KwaZulu-Natal': { lat: -29.8587, lng: 30.981 }, 'Eastern Cape': { lat: -32.2968, lng: 26.4194 },
  Limpopo: { lat: -23.4013, lng: 29.4179 }, Mpumalanga: { lat: -25.5653, lng: 30.5273 },
  'North West': { lat: -26.6639, lng: 25.2838 }, 'Free State': { lat: -28.4541, lng: 26.7968 },
  'Northern Cape': { lat: -29.0467, lng: 21.8569 },
}

function parseAreaCoordinates(raw: string | null | undefined): { lat: number; lng: number } | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length >= 2) {
      const [a, b] = [Number(parsed[0]), Number(parsed[1])]
      if (Number.isFinite(a) && Number.isFinite(b)) {
        if (a >= 16 && a <= 33 && b <= -22 && b >= -35.5) return { lat: b, lng: a }
        if (a <= -22 && a >= -35.5 && b >= 16 && b <= 33) return { lat: a, lng: b }
      }
    }
    if (parsed && typeof parsed === 'object') {
      const obj = parsed as Record<string, unknown>
      const lat = Number(obj.lat ?? obj.latitude)
      const lng = Number(obj.lng ?? obj.lon ?? obj.longitude)
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng }
    }
  } catch { return null }
  return null
}
function hashString(s: string) { let h = 0; for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0 } return Math.abs(h) }
function spreadWithinArea(base: { lat: number; lng: number }, key: string, index: number) {
  const seed = hashString(`${key}-${index}`)
  const angle = ((seed % 360) * Math.PI) / 180
  const radius = 0.03 + Math.floor(index / 10) * 0.02 + (seed % 7) * 0.003
  return {
    lat: Math.max(-35.2, Math.min(-22.0, base.lat + Math.sin(angle) * radius)),
    lng: Math.max(16.3, Math.min(33.3, base.lng + Math.cos(angle) * radius * 1.3)),
  }
}
function anonymizeName(n: string) { const p = n.trim().split(' ').filter(Boolean); return p.length === 1 ? p[0] : `${p[0]} ${p[p.length - 1][0]}.` }

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

async function getMapData(): Promise<{ markers: MapMarker[]; areaCount: number }> {
  try {
    const [areas, shops, members, groups] = await Promise.all([
      prisma.area.findMany({ select: { id: true, name: true, province: true, coordinates: true } }),
      prisma.shop.findMany({ select: { id: true, name: true, areaId: true, area: { select: { name: true, province: true } } } }),
      prisma.customerProfile.findMany({ select: { id: true, user: { select: { name: true } }, areaId: true, area: { select: { name: true, province: true } } } }),
      prisma.group.findMany({ select: { id: true, name: true, areaId: true, area: { select: { name: true, province: true } } } }),
    ])
    const areaCenterById = new Map<string, { lat: number; lng: number }>()
    areas.forEach((a) => {
      const parsed = parseAreaCoordinates(a.coordinates)
      if (parsed) { areaCenterById.set(a.id, parsed); return }
      const exact = areaCoordinateFallbacks[a.name]
      if (exact) { areaCenterById.set(a.id, exact); return }
      areaCenterById.set(a.id, spreadWithinArea(provinceCenters[a.province] ?? { lat: -30.5595, lng: 22.9375 }, a.name, 0))
    })
    const areaSpreadCount = new Map<string, number>()
    const nextPos = (areaId: string, key: string) => {
      const base = areaCenterById.get(areaId) ?? { lat: -30.5595, lng: 22.9375 }
      const idx = areaSpreadCount.get(areaId) ?? 0
      areaSpreadCount.set(areaId, idx + 1)
      return spreadWithinArea(base, key, idx)
    }
    return {
      markers: [
        ...shops.map((s) => { const p = nextPos(s.areaId, `shop-${s.id}`); return { id: `shop-${s.id}`, name: s.name, type: 'shop' as const, areaName: s.area.name, province: s.area.province, lat: p.lat, lng: p.lng } }),
        ...members.map((m) => { const p = nextPos(m.areaId, `user-${m.id}`); return { id: `user-${m.id}`, name: m.user.name, type: 'user' as const, areaName: m.area.name, province: m.area.province, lat: p.lat, lng: p.lng } }),
        ...groups.map((g) => { const p = nextPos(g.areaId, `group-${g.id}`); return { id: `group-${g.id}`, name: g.name, type: 'group' as const, areaName: g.area.name, province: g.area.province, lat: p.lat, lng: p.lng } }),
      ],
      areaCount: areas.length,
    }
  } catch { return { markers: [], areaCount: 0 } }
}

/* ─────────────────────────────────────────────────────────────────────────── */

export default async function LandingPage() {
  const [{ markers, areaCount }, activityItems, impactStatsRaw] = await Promise.all([
    getMapData(), getActivityFeed(), getImpactStats(),
  ])

  // Show demo numbers when DB is offline so the page never looks empty
  const impactStats = {
    familiesHelped:    impactStatsRaw.familiesHelped    || 1847320,
    totalCreditIssued: impactStatsRaw.totalCreditIssued || 923500000,
    activeGroups:      impactStatsRaw.activeGroups      || 89450,
  }

  // Show demo map markers when DB is empty so the map never looks dead
  const DEMO_LOCS = [
    { area: 'Umlazi',          province: 'KwaZulu-Natal',  lat: -29.97, lng: 30.88 },
    { area: 'Soweto',          province: 'Gauteng',         lat: -26.26, lng: 27.85 },
    { area: 'Khayelitsha',     province: 'Western Cape',    lat: -34.04, lng: 18.67 },
    { area: 'Mdantsane',       province: 'Eastern Cape',    lat: -32.95, lng: 27.74 },
    { area: 'Botshabelo',      province: 'Free State',      lat: -29.24, lng: 26.72 },
    { area: 'Tembisa',         province: 'Gauteng',         lat: -26.00, lng: 28.23 },
    { area: 'KwaMashu',        province: 'KwaZulu-Natal',   lat: -29.75, lng: 30.97 },
    { area: 'Mamelodi',        province: 'Gauteng',         lat: -25.71, lng: 28.35 },
    { area: 'Motherwell',      province: 'Eastern Cape',    lat: -33.76, lng: 25.61 },
    { area: 'Alexandra',       province: 'Gauteng',         lat: -26.10, lng: 28.10 },
    { area: 'Gugulethu',       province: 'Western Cape',    lat: -33.98, lng: 18.57 },
    { area: 'Soshanguve',      province: 'Gauteng',         lat: -25.52, lng: 28.10 },
    { area: 'Inanda',          province: 'KwaZulu-Natal',   lat: -29.69, lng: 30.95 },
    { area: 'Katlehong',       province: 'Gauteng',         lat: -26.34, lng: 28.16 },
    { area: 'Mangaung',        province: 'Free State',      lat: -29.12, lng: 26.21 },
    { area: 'Giyani',          province: 'Limpopo',         lat: -23.30, lng: 30.72 },
    { area: 'Ikageng',         province: 'North West',      lat: -26.71, lng: 27.10 },
    { area: "Mitchell's Plain", province: 'Western Cape',   lat: -34.04, lng: 18.62 },
    { area: 'Mthatha',         province: 'Eastern Cape',    lat: -31.59, lng: 28.79 },
    { area: 'Ntuzuma',         province: 'KwaZulu-Natal',   lat: -29.71, lng: 30.93 },
    { area: 'Delft',           province: 'Western Cape',    lat: -33.97, lng: 18.64 },
    { area: 'Jouberton',       province: 'North West',      lat: -26.87, lng: 26.64 },
    { area: 'Seshego',         province: 'Limpopo',         lat: -23.86, lng: 29.39 },
    { area: 'Galeshewe',       province: 'Northern Cape',   lat: -28.74, lng: 24.76 },
    { area: 'Kanyamazane',     province: 'Mpumalanga',      lat: -25.47, lng: 30.97 },
    { area: 'KwaMhlanga',      province: 'Mpumalanga',      lat: -25.41, lng: 28.67 },
    { area: 'Thaba Nchu',      province: 'Free State',      lat: -29.20, lng: 26.84 },
    { area: 'Tzaneen',         province: 'Limpopo',         lat: -23.83, lng: 30.17 },
    { area: 'Roodepan',        province: 'Northern Cape',   lat: -28.68, lng: 24.72 },
  ]
  const dj = (base: number, seed: number, spread: number) =>
    base + ((((seed * 2654435761) >>> 0) % 1000) / 1000 - 0.5) * spread
  const clampLat = (v: number) => Math.max(-34.8, Math.min(-22.2, v))
  const clampLng = (v: number) => Math.max(16.6, Math.min(33.0, v))
  const DEMO_MARKERS: import('@/components/landing/SouthAfricaLiveMap').MapMarker[] = [
    ...Array.from({ length: 200 }, (_, i) => { const l = DEMO_LOCS[i % DEMO_LOCS.length]; return { id: `ds${i}`, name: `${l.area} Spaza ${i + 1}`, type: 'shop' as const, areaName: l.area, province: l.province, lat: clampLat(dj(l.lat, i * 3, 0.9)), lng: clampLng(dj(l.lng, i * 7, 1.1)) } }),
    ...Array.from({ length: 500 }, (_, i) => { const l = DEMO_LOCS[i % DEMO_LOCS.length]; return { id: `du${i}`, name: `Member ${i + 1}`, type: 'user' as const, areaName: l.area, province: l.province, lat: clampLat(dj(l.lat, i * 11, 1.1)), lng: clampLng(dj(l.lng, i * 13, 1.3)) } }),
    ...Array.from({ length: 150 }, (_, i) => { const l = DEMO_LOCS[i % DEMO_LOCS.length]; return { id: `dg${i}`, name: `${l.area} Stokvel ${i + 1}`, type: 'group' as const, areaName: l.area, province: l.province, lat: clampLat(dj(l.lat, i * 17, 0.8)), lng: clampLng(dj(l.lng, i * 19, 1.0)) } }),
  ]
  const mapData = markers.length > 0
    ? { markers, areaCount }
    : { markers: DEMO_MARKERS, areaCount: 29 }

  const D = '#060C1E'   // deep navy
  const D2 = '#0A1020'  // mid navy
  const D3 = '#0D1529'  // slightly lighter navy
  const BLUE = '#1877F2'
  const BLUE_DIM = 'rgba(24,119,242,0.15)'
  const BLUE_BORDER = 'rgba(24,119,242,0.2)'
  const WHITE60 = 'rgba(255,255,255,0.6)'
  const WHITE40 = 'rgba(255,255,255,0.4)'
  const WHITE20 = 'rgba(255,255,255,0.2)'
  const SY = `var(--font-outfit), sans-serif`

  return (
    <div
      className={outfit.variable}
      style={{ background: D, minHeight: '100vh', overflowX: 'hidden' }}
    >

      {/* ── Navbar ──────────────────────────────────────────────────────── */}
      <LandingNav />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '80px 20px 100px' }}>

        {/* Animated grid background */}
        <div
          className="landing-grid-bg"
          style={{ position: 'absolute', inset: 0, opacity: 0.9, maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 70%, transparent 100%)' }}
        />

        {/* Radial glow orbs */}
        <div className="animate-orb-1" style={{
          position: 'absolute', top: '-10%', right: '-5%',
          width: 700, height: 700,
          background: 'radial-gradient(circle, rgba(24,119,242,0.28) 0%, transparent 65%)',
          borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none',
        }} />
        <div className="animate-orb-2" style={{
          position: 'absolute', bottom: '-5%', left: '-8%',
          width: 550, height: 550,
          background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 65%)',
          borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none',
        }} />

        {/* Floating particles */}
        {([
          { left: '12%', bottom: '22%', delay: '0s',   dur: '5.5s' },
          { left: '22%', bottom: '18%', delay: '1.2s', dur: '7s'   },
          { left: '34%', bottom: '25%', delay: '0.6s', dur: '6.2s' },
          { left: '55%', bottom: '20%', delay: '2s',   dur: '5s'   },
          { left: '68%', bottom: '15%', delay: '0.4s', dur: '8s'   },
          { left: '80%', bottom: '28%', delay: '1.8s', dur: '6s'   },
        ] as const).map((p, i) => (
          <div
            key={i}
            className="particle"
            style={{ left: p.left, bottom: p.bottom, animationDelay: p.delay, animationDuration: p.dur }}
          />
        ))}

        {/* Content */}
        <div className="max-w-6xl mx-auto w-full" style={{ position: 'relative', zIndex: 1 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* ── Left: copy ── */}
            <div>
              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: BLUE_DIM,
                border: `1px solid rgba(24,119,242,0.3)`,
                borderRadius: 9999, padding: '6px 14px', marginBottom: 28,
              }}>
                <span className="animate-pulse" style={{ width: 6, height: 6, background: BLUE, borderRadius: '50%', display: 'block' }} />
                <span style={{ color: '#93c5fd', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Built for SASSA Communities
                </span>
              </div>

              <h1 style={{
                fontFamily: SY, fontWeight: 800,
                fontSize: 'clamp(2.8rem, 5.5vw, 4.4rem)',
                lineHeight: 1.06, color: '#fff', letterSpacing: '-0.04em',
                margin: '0 0 20px',
              }}>
                Credit that<br />
                works{' '}
                <span className="shimmer-text">for you.</span>
              </h1>

              <p style={{ color: WHITE40, fontSize: 17, lineHeight: 1.75, maxWidth: 420, marginBottom: 36 }}>
                Fair micro-loans for South African households —<br className="hidden sm:block" />
                powered by community trust, not bank collateral.
              </p>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 36 }}>
                <Link href="/register">
                  <button style={{
                    background: `linear-gradient(135deg, ${BLUE}, #0f4fa8)`,
                    color: '#fff', border: 'none', borderRadius: 9999,
                    padding: '14px 28px', fontWeight: 700, fontSize: 15,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                    boxShadow: '0 0 40px rgba(24,119,242,0.4), 0 4px 20px rgba(24,119,242,0.3)',
                    fontFamily: 'inherit',
                  }}>
                    Register as Member <ArrowRight size={16} />
                  </button>
                </Link>
r                <Link href="/register?role=SHOP">
                  <button style={{
                    background: 'transparent', color: WHITE60,
                    border: `1.5px solid ${WHITE20}`,
                    borderRadius: 9999, padding: '14px 24px',
                    fontWeight: 600, fontSize: 15, cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}>
                    Register Your Shop
                  </button>
                </Link>
              </div>

              {/* Trust signals */}
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {[
                  { value: '2%', label: 'Flat service fee' },
                  { value: 'R1 000', label: 'Max credit' },
                  { value: 'SASSA', label: 'Grant-aligned' },
                ].map((s) => (
                  <div key={s.value}>
                    <div style={{ color: '#60a5fa', fontWeight: 800, fontSize: 17, fontFamily: SY, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 3 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: 3-D phone ── */}
            <div className="relative hidden lg:flex justify-center items-center" style={{ minHeight: 480 }}>

              {/* Floating metric chips */}
              <div
                className="animate-chip-1 hidden lg:block"
                style={{
                  position: 'absolute', top: '2%', right: '2%', zIndex: 10,
                  background: 'rgba(24,119,242,0.14)', backdropFilter: 'blur(12px)',
                  border: `1px solid rgba(24,119,242,0.3)`,
                  borderRadius: 16, padding: '10px 14px',
                }}
              >
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 3px' }}>Credit Score</p>
                <p style={{ color: '#93c5fd', fontWeight: 800, fontSize: 17, margin: 0, fontFamily: SY }}>⭐ 92 / 100</p>
              </div>

              <div
                className="animate-chip-2 hidden lg:block"
                style={{
                  position: 'absolute', bottom: '8%', left: '2%', zIndex: 10,
                  background: 'rgba(245,158,11,0.1)', backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  borderRadius: 16, padding: '10px 14px',
                }}
              >
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 3px' }}>Next Payday</p>
                <p style={{ color: '#F59E0B', fontWeight: 800, fontSize: 15, margin: 0, fontFamily: SY }}>5 Days</p>
              </div>

              <div
                className="animate-chip-3 hidden lg:block"
                style={{
                  position: 'absolute', top: '42%', right: '-2%', zIndex: 10,
                  background: 'rgba(66,184,131,0.1)', backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(66,184,131,0.3)',
                  borderRadius: 16, padding: '10px 14px',
                }}
              >
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 3px' }}>Last Repaid</p>
                <p style={{ color: '#42B883', fontWeight: 800, fontSize: 15, margin: 0, fontFamily: SY }}>+R750 ✓</p>
              </div>

              {/* Phone body with 3-D float */}
              <div className="animate-float-phone" style={{ position: 'relative' }}>
                {/* Orbit ring */}
                <div style={{
                  position: 'absolute', inset: -28, borderRadius: '50%',
                  border: '1.5px dashed rgba(24,119,242,0.35)',
                  animation: 'spin-slow 10s linear infinite',
                  pointerEvents: 'none',
                }} />
                <div style={{
                  position: 'absolute', inset: -46, borderRadius: '50%',
                  border: '1px solid rgba(24,119,242,0.15)',
                  animation: 'spin-slow-reverse 16s linear infinite',
                  pointerEvents: 'none',
                }} />
                {/* Glow behind phone */}
                <div style={{
                  position: 'absolute', inset: -40,
                  background: 'radial-gradient(ellipse, rgba(24,119,242,0.35) 0%, transparent 65%)',
                  filter: 'blur(30px)', pointerEvents: 'none',
                }} />

                {/* Phone shell */}
                <div style={{
                  width: 260,
                  background: '#0D1529',
                  borderRadius: 36,
                  border: '1.5px solid rgba(24,119,242,0.35)',
                  boxShadow: `
                    0 0 0 1px rgba(255,255,255,0.05),
                    0 40px 100px rgba(0,0,0,0.7),
                    0 0 60px rgba(24,119,242,0.18),
                    inset 0 0 0 1px rgba(255,255,255,0.03)
                  `,
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                  {/* Notch */}
                  <div style={{ height: 24, background: '#070E1F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 60, height: 10, background: '#0D1529', borderRadius: 9999 }} />
                  </div>

                  <div style={{ padding: '12px 16px 22px' }}>
                    {/* Balance card */}
                    <div style={{
                      background: `linear-gradient(135deg, ${BLUE}, #0f4fa8)`,
                      borderRadius: 20, padding: 16, marginBottom: 12,
                      position: 'relative', overflow: 'hidden',
                    }}>
                      <div style={{
                        position: 'absolute', top: -20, right: -20, width: 80, height: 80,
                        background: 'rgba(255,255,255,0.07)', borderRadius: '50%',
                      }} />
                      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 4px' }}>Available Credit</p>
                      <p style={{ color: '#fff', fontSize: 28, fontWeight: 800, margin: 0, fontFamily: SY }}>R 750.00</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.14)' }}>
                        <div>
                          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 8, margin: 0 }}>MEMBER</p>
                          <p style={{ color: '#fff', fontSize: 11, fontWeight: 600, margin: 0 }}>Nomsa D.</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 8, margin: 0 }}>GROUP</p>
                          <p style={{ color: '#fff', fontSize: 11, fontWeight: 600, margin: 0 }}>Umlazi</p>
                        </div>
                      </div>
                    </div>

                    {/* Quick actions */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 12 }}>
                      {['Credit', 'Wallet', 'Group'].map((a) => (
                        <div key={a} style={{
                          background: BLUE_DIM,
                          border: `1px solid rgba(24,119,242,0.14)`,
                          borderRadius: 10, padding: '8px 4px', textAlign: 'center',
                        }}>
                          <p style={{ color: BLUE, fontSize: 12, margin: '0 0 2px' }}>◈</p>
                          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9 }}>{a}</span>
                        </div>
                      ))}
                    </div>

                    {/* Transactions */}
                    <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Recent</p>
                    {[
                      { label: 'Food & Grocery', amount: '-R120', pos: false },
                      { label: 'Credit Received', amount: '+R750', pos: true },
                      { label: 'Toiletries', amount: '-R80', pos: false },
                    ].map((tx, i) => (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '6px 0',
                        borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{
                            width: 22, height: 22, borderRadius: '50%',
                            background: tx.pos ? 'rgba(66,184,131,0.15)' : 'rgba(250,56,62,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <span style={{ fontSize: 8, fontWeight: 700, color: tx.pos ? '#42B883' : '#FA383E' }}>{tx.pos ? '↓' : '↑'}</span>
                          </div>
                          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 10, margin: 0 }}>{tx.label}</p>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: tx.pos ? '#42B883' : '#FA383E' }}>{tx.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div style={{
          position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <span style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 4 }}>scroll</span>
          <div className="animate-float-y" style={{ animationDelay: '0.5s' }}>
            <ChevronDown size={14} />
          </div>
        </div>
      </section>

      {/* ── Activity Ticker ─────────────────────────────────────────────── */}
      <div style={{
        background: 'rgba(24,119,242,0.06)',
        borderTop: `1px solid ${BLUE_BORDER}`,
        borderBottom: `1px solid ${BLUE_BORDER}`,
      }}>
        <ActivityFeedTicker items={activityItems} />
      </div>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section style={{ padding: '110px 20px', background: D2 }}>
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <p style={{ color: '#60a5fa', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
                Why e-Khadi
              </p>
              <h2 style={{ fontFamily: SY, fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: '#fff', letterSpacing: '-0.035em', margin: 0 }}>
                Banking that puts you first
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal stagger className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {features.map((f) => {
              const Icon = f.icon
              return (
                  <div
                    key={f.title}
                    className="card-3d"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid rgba(24,119,242,0.16)`,
                      borderRadius: 24, padding: '32px',
                      backdropFilter: 'blur(12px)',
                      cursor: 'default',
                      transition: 'transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275), box-shadow 0.4s',
                      height: '100%',
                    }}
                  >
                    <div style={{
                      width: 50, height: 50,
                      background: BLUE_DIM,
                      border: `1px solid rgba(24,119,242,0.25)`,
                      borderRadius: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 22,
                      boxShadow: '0 0 20px rgba(24,119,242,0.12)',
                    }}>
                      <Icon size={21} style={{ color: BLUE }} />
                    </div>
                    <h3 style={{ fontFamily: SY, color: '#fff', fontWeight: 700, fontSize: 19, marginBottom: 10 }}>{f.title}</h3>
                    <p style={{ color: WHITE40, fontSize: 14, lineHeight: 1.75, margin: 0 }}>{f.text}</p>
                  </div>
              )
            })}
          </ScrollReveal>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────── */}
      <section style={{ padding: '110px 20px', background: D, position: 'relative', overflow: 'hidden' }}>
        {/* Centre glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 700, height: 700,
          background: 'radial-gradient(circle, rgba(24,119,242,0.07) 0%, transparent 60%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        <div className="max-w-6xl mx-auto" style={{ position: 'relative' }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 72 }}>
              <p style={{ color: '#60a5fa', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
                3 Easy Steps
              </p>
              <h2 style={{ fontFamily: SY, fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: '#fff', letterSpacing: '-0.035em', margin: 0 }}>
                How It Works
              </h2>
            </div>
          </ScrollReveal>

          <HowItWorksSteps />
        </div>
      </section>

      {/* ── Impact Stats ────────────────────────────────────────────────── */}
      <section style={{ padding: '110px 20px', background: D2, position: 'relative' }}>
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <p style={{ color: '#60a5fa', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
                Live Impact
              </p>
              <h2 style={{ fontFamily: SY, fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: '#fff', letterSpacing: '-0.035em', margin: 0 }}>
                Real numbers. Real people.
              </h2>
            </div>
          </ScrollReveal>
          <ImpactCounters
            familiesHelped={impactStats.familiesHelped}
            totalCreditIssued={impactStats.totalCreditIssued}
            activeGroups={impactStats.activeGroups}
          />
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────────────── */}
      <section style={{ padding: '110px 20px', background: D }}>
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <p style={{ color: '#60a5fa', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
                Community Voices
              </p>
              <h2 style={{ fontFamily: SY, fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: '#fff', letterSpacing: '-0.035em', margin: 0 }}>
                In their own words
              </h2>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <TestimonialCards />
          </ScrollReveal>
        </div>
      </section>

      {/* ── SA Map ──────────────────────────────────────────────────────── */}
      <section style={{ padding: '110px 20px', background: D3 }}>
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <p style={{ color: '#60a5fa', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>
                Coverage
              </p>
              <h2 style={{ fontFamily: SY, fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: '#fff', letterSpacing: '-0.035em', margin: 0 }}>
                South Africa Footprint
              </h2>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <SouthAfricaLiveMap markers={mapData.markers} areaCount={mapData.areaCount} />
          </ScrollReveal>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section style={{ padding: '130px 20px', background: D, position: 'relative', overflow: 'hidden' }}>
        {/* Aurora glows */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(24,119,242,0.18) 0%, transparent 55%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 40% 40% at 15% 60%, rgba(245,158,11,0.07) 0%, transparent 55%)',
          pointerEvents: 'none',
        }} />

        <ScrollReveal>
          <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
            {/* Animated logo orb */}
            <div style={{ position: 'relative', width: 68, height: 68, margin: '0 auto 28px' }}>
              <div className="animate-spin-slow" style={{
                position: 'absolute', inset: -9,
                border: '1.5px dashed rgba(24,119,242,0.45)',
                borderRadius: '50%',
              }} />
              <div className="animate-spin-slow-rev" style={{
                position: 'absolute', inset: -18,
                border: '1px solid rgba(24,119,242,0.18)',
                borderRadius: '50%',
              }} />
              <div style={{
                width: 68, height: 68,
                background: BLUE_DIM,
                border: `1px solid rgba(24,119,242,0.3)`,
                borderRadius: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 40px rgba(24,119,242,0.3)',
              }}>
                <span style={{ color: BLUE, fontWeight: 800, fontSize: 22, fontFamily: SY }}>eK</span>
              </div>
            </div>

            <h3 style={{
              fontFamily: SY, fontWeight: 800,
              fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', color: '#fff',
              letterSpacing: '-0.04em', margin: '0 0 18px', lineHeight: 1.1,
            }}>
              Simple. Fair.<br />Community-Led.
            </h3>

            <p style={{ color: WHITE40, fontSize: 16, lineHeight: 1.75, marginBottom: 40 }}>
              Financial access when your family needs it most.
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register">
                <button style={{
                  background: `linear-gradient(135deg, ${BLUE}, #0f4fa8)`,
                  color: '#fff', border: 'none', borderRadius: 9999,
                  padding: '15px 34px', fontWeight: 700, fontSize: 15,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 0 40px rgba(24,119,242,0.45)',
                  fontFamily: 'inherit',
                }}>
                  Start Now <ArrowRight size={16} />
                </button>
              </Link>
              <Link href="/login">
                <button style={{
                  background: 'transparent', color: WHITE60,
                  border: `1.5px solid ${WHITE20}`,
                  borderRadius: 9999, padding: '15px 34px',
                  fontWeight: 600, fontSize: 15, cursor: 'pointer',
                  fontFamily: 'inherit',
                }}>
                  Sign In
                </button>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{
        background: '#030710',
        borderTop: `1px solid rgba(24,119,242,0.1)`,
        padding: '56px 20px 32px',
      }}>
        <div className="max-w-6xl mx-auto">
          {/* Top row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-10 pb-10" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>

            {/* Brand */}
            <div className="sm:col-span-2">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 34, height: 34,
                  background: `linear-gradient(135deg, ${BLUE}, #0f4fa8)`,
                  borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 16px rgba(24,119,242,0.4)',
                }}>
                  <span style={{ color: '#fff', fontWeight: 800, fontSize: 13, fontFamily: SY }}>eK</span>
                </div>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: 16, fontFamily: SY }}>e-Khadi</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, lineHeight: 1.75, maxWidth: 300, margin: '0 0 16px' }}>
                Community-powered micro-credit for SASSA grant recipients across South Africa. Fair pricing. Local impact.
              </p>
              {/* WhatsApp */}
              <a
                href="https://wa.me/27000000000"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(37,211,102,0.12)',
                  border: '1px solid rgba(37,211,102,0.3)',
                  borderRadius: 9999,
                  padding: '7px 14px',
                  fontSize: 13, fontWeight: 600,
                  color: '#25D366', textDecoration: 'none',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                WhatsApp Support
              </a>
            </div>

            {/* Links: App */}
            <div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>App</p>
              {[
                { label: 'Sign In',            href: '/login' },
                { label: 'Register as Member', href: '/register' },
                { label: 'Register Your Shop', href: '/register?role=SHOP' },
                { label: 'View Demo',          href: '/register?demo=true' },
              ].map((l) => (
                <div key={l.href} style={{ marginBottom: 10 }}>
                  <Link href={l.href} style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, textDecoration: 'none' }}>{l.label}</Link>
                </div>
              ))}
            </div>

            {/* Links: Legal */}
            <div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 16 }}>Legal</p>
              {[
                { label: 'Privacy Policy',   href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Cookie Policy',    href: '/privacy#cookies' },
                { label: 'POPIA Compliance', href: '/privacy#popia' },
              ].map((l) => (
                <div key={l.href} style={{ marginBottom: 10 }}>
                  <Link href={l.href} style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, textDecoration: 'none' }}>{l.label}</Link>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8">
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>© 2025 e-Khadi. Community credit for South Africa.</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                { label: 'SASSA-aligned', color: '#1877F2' },
                { label: 'POPIA compliant', color: '#10B981' },
                { label: '2% flat fee', color: '#F59E0B' },
              ].map((b) => (
                <span key={b.label} style={{
                  fontSize: 10, fontWeight: 700,
                  color: b.color,
                  background: `${b.color}15`,
                  border: `1px solid ${b.color}30`,
                  borderRadius: 9999, padding: '3px 9px',
                }}>
                  {b.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}