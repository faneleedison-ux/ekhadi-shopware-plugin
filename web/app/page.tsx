import Link from 'next/link'
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/db'
import SouthAfricaLiveMap, { MapMarker } from '@/components/landing/SouthAfricaLiveMap'
import ActivityFeedTicker, { ActivityItem } from '@/components/landing/ActivityFeedTicker'
import ImpactCounters from '@/components/landing/ImpactCounters'
import TestimonialCards from '@/components/landing/TestimonialCards'
import ScrollReveal from '@/components/landing/ScrollReveal'

const features = [
  { title: 'Community-Powered', text: 'Based on stokvel trust, not bank collateral.', icon: Shield },
  { title: 'Fair Pricing', text: 'R50–R1 000 credit. Flat 2% service fee. No surprises.', icon: Zap },
  { title: 'Local Impact', text: 'Spend at approved spaza shops in your area only.', icon: Globe },
]

const steps = [
  { title: 'Join', text: 'Sign up and join a local stokvel group.' },
  { title: 'Request', text: 'Apply for essential-goods credit instantly.' },
  { title: 'Repay', text: 'Automatic deduction on your next SASSA cycle.' },
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

export default async function LandingPage() {
  const [{ markers, areaCount }, activityItems, impactStats] = await Promise.all([
    getMapData(), getActivityFeed(), getImpactStats(),
  ])

  return (
    <div className="min-h-screen bg-background">

      {/* ── Navbar ──────────────────────────── */}
      <nav className="glass-nav sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/30">
              <span className="text-white font-bold text-sm">eK</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-white">e-Khadi</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-primary text-white hover:bg-primary-dark rounded-full px-5 shadow-md shadow-primary/30">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────── */}
      <section className="bg-sidebar pt-20 pb-24 text-center px-5">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/25 rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            <span className="text-primary text-xs font-bold uppercase tracking-wider">Built for SASSA Communities</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold leading-tight text-white">
            Credit that works<br />
            <span className="text-primary">for you.</span>
          </h1>

          <p className="mt-5 text-white/50 text-lg max-w-xl mx-auto">
            Fair micro-loans for South African households — powered by community trust.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-primary text-white hover:bg-primary-dark rounded-full px-8 shadow-lg shadow-primary/30 font-bold">
                Register as Member <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link href="/register?role=SHOP">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full px-8">
                Register Your Shop
              </Button>
            </Link>
          </div>

          {/* Phone mockup */}
          <div className="mt-16 inline-block relative">
            <div className="absolute inset-0 bg-primary/25 rounded-[2rem] blur-2xl scale-95" />
            <div className="relative w-64 bg-[#12122A] rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden">
              <div className="h-6 bg-[#0D0D20] flex items-center justify-center">
                <div className="w-16 h-3 bg-[#12122A] rounded-full" />
              </div>
              <div className="px-4 pb-5 pt-2">
                {/* Balance */}
                <div className="bg-gradient-to-br from-primary to-primary-dark rounded-xl p-4 mb-3">
                  <p className="text-white/60 text-[10px] uppercase tracking-wider">Available Credit</p>
                  <p className="text-white text-3xl font-bold mt-0.5">R 750.00</p>
                  <div className="flex justify-between mt-3 pt-2.5 border-t border-white/15">
                    <div><p className="text-white/50 text-[9px]">MEMBER</p><p className="text-white text-xs font-semibold">Nomsa D.</p></div>
                    <div className="text-right"><p className="text-white/50 text-[9px]">GROUP</p><p className="text-white text-xs font-semibold">Umlazi</p></div>
                  </div>
                </div>
                {/* Actions */}
                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  {['Credit', 'Wallet', 'Group'].map((a) => (
                    <div key={a} className="bg-white/5 border border-white/6 rounded-lg p-2 text-center">
                      <p className="text-primary text-sm mb-0.5">◈</p>
                      <span className="text-white/50 text-[10px]">{a}</span>
                    </div>
                  ))}
                </div>
                {/* Transactions */}
                <p className="text-white/30 text-[9px] uppercase tracking-widest mb-1.5">Recent</p>
                {[
                  { label: 'Food & Grocery', amount: '-R120', pos: false },
                  { label: 'Credit Received', amount: '+R750', pos: true },
                  { label: 'Toiletries', amount: '-R80', pos: false },
                ].map((tx, i) => (
                  <div key={i} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${tx.pos ? 'bg-success/15' : 'bg-danger/15'}`}>
                        <span className={`text-[9px] font-bold ${tx.pos ? 'text-success' : 'text-danger'}`}>{tx.pos ? '↓' : '↑'}</span>
                      </div>
                      <p className="text-white text-[11px]">{tx.label}</p>
                    </div>
                    <span className={`text-[11px] font-bold ${tx.pos ? 'text-success' : 'text-danger'}`}>{tx.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Activity Ticker ────────────────── */}
      <ActivityFeedTicker items={activityItems} />

      {/* ── Features ──────────────────────── */}
      <section className="py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Why e-Khadi</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">Banking that puts you first</h2>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-3 gap-4">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <ScrollReveal key={f.title} delay={i * 100}>
                  <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow h-full">
                    <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-bold text-text-primary text-lg mb-2">{f.title}</h3>
                    <p className="text-text-secondary text-sm leading-relaxed">{f.text}</p>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────── */}
      <section className="py-24 px-5 bg-card">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">3 Easy Steps</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">How It Works</h2>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <ScrollReveal key={s.title} delay={i * 120}>
                <div className="text-center p-6">
                  <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/25">
                    <span className="text-white font-bold text-2xl">{i + 1}</span>
                  </div>
                  <h3 className="font-bold text-text-primary text-xl mb-2">{s.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{s.text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Impact Stats ──────────────────── */}
      <section className="py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Live Impact</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">Real numbers. Real people.</h2>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={100}>
            <ImpactCounters
              familiesHelped={impactStats.familiesHelped}
              totalCreditIssued={impactStats.totalCreditIssued}
              activeGroups={impactStats.activeGroups}
            />
          </ScrollReveal>
        </div>
      </section>

      {/* ── Testimonials ──────────────────── */}
      <section className="py-24 px-5 bg-card">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Community Voices</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-text-primary">In their own words</h2>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <TestimonialCards />
          </ScrollReveal>
        </div>
      </section>

      {/* ── Map ───────────────────────────── */}
      <section className="py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-10">
              <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">Coverage</p>
              <h2 className="text-3xl font-bold text-text-primary">South Africa Footprint</h2>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
              <SouthAfricaLiveMap markers={markers} areaCount={areaCount} />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────── */}
      <section className="py-24 px-5 bg-sidebar">
        <ScrollReveal>
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-14 h-14 bg-primary/20 border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-primary font-bold text-xl">eK</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-bold text-white">Simple. Fair. Community-Led.</h3>
            <p className="text-white/50 mt-4 leading-relaxed">
              Financial access when your family needs it most.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-primary text-white hover:bg-primary-dark rounded-full px-8 shadow-lg shadow-primary/30 font-bold">
                  Start Now <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full px-8">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ── Footer ────────────────────────── */}
      <footer className="bg-card border-t border-border py-6 px-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">eK</span>
            </div>
            <span className="font-semibold text-text-primary text-sm">e-Khadi</span>
          </div>
          <p className="text-text-secondary text-xs">© 2025 e-Khadi. Community credit for South Africa.</p>
          <div className="flex gap-4">
            <Link href="/login" className="text-xs text-text-secondary hover:text-primary transition-colors">Sign In</Link>
            <Link href="/register" className="text-xs text-text-secondary hover:text-primary transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}