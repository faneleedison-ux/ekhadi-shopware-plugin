'use client'

import { useMemo, useState } from 'react'

export type MapMarkerType = 'shop' | 'user' | 'group'

export type MapMarker = {
  id: string
  name: string
  type: MapMarkerType
  areaName: string
  province: string
  lat: number
  lng: number
}

type Props = {
  markers: MapMarker[]
  areaCount: number
}

const SOUTH_AFRICA_BOUNDS = {
  minLat: -35.2,
  maxLat: -22.0,
  minLng: 16.3,
  maxLng: 33.3,
}

const MAP_WIDTH = 1000
const MAP_HEIGHT = 760

const markerMeta: Record<MapMarkerType, { label: string; color: string; ring: string }> = {
  shop: { label: 'Shops', color: '#F97316', ring: '#FDBA74' },
  user: { label: 'Users', color: '#0EA5E9', ring: '#7DD3FC' },
  group: { label: 'Stokvel Groups', color: '#10B981', ring: '#6EE7B7' },
}

function projectToSvg(lat: number, lng: number) {
  const x =
    ((Math.max(SOUTH_AFRICA_BOUNDS.minLng, Math.min(SOUTH_AFRICA_BOUNDS.maxLng, lng)) - SOUTH_AFRICA_BOUNDS.minLng) /
      (SOUTH_AFRICA_BOUNDS.maxLng - SOUTH_AFRICA_BOUNDS.minLng)) *
    MAP_WIDTH

  const y =
    ((SOUTH_AFRICA_BOUNDS.maxLat - Math.max(SOUTH_AFRICA_BOUNDS.minLat, Math.min(SOUTH_AFRICA_BOUNDS.maxLat, lat))) /
      (SOUTH_AFRICA_BOUNDS.maxLat - SOUTH_AFRICA_BOUNDS.minLat)) *
    MAP_HEIGHT

  return { x, y }
}

export default function SouthAfricaLiveMap({ markers, areaCount }: Props) {
  const [visible, setVisible] = useState<Record<MapMarkerType, boolean>>({
    shop: true,
    user: true,
    group: true,
  })
  const [query, setQuery] = useState('')
  const [provinceFilter, setProvinceFilter] = useState('ALL')
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null)
  const [hoveredMarkerId, setHoveredMarkerId] = useState<string | null>(null)

  const provinces = useMemo(
    () => ['ALL', ...Array.from(new Set(markers.map((marker) => marker.province))).sort()],
    [markers]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()

    return markers.filter((marker) => {
      if (!visible[marker.type]) {
        return false
      }

      if (provinceFilter !== 'ALL' && marker.province !== provinceFilter) {
        return false
      }

      if (!q) {
        return true
      }

      return (
        marker.name.toLowerCase().includes(q) ||
        marker.areaName.toLowerCase().includes(q) ||
        marker.province.toLowerCase().includes(q)
      )
    })
  }, [markers, visible, provinceFilter, query])

  const totals = useMemo(
    () => ({
      shop: markers.filter((m) => m.type === 'shop').length,
      user: markers.filter((m) => m.type === 'user').length,
      group: markers.filter((m) => m.type === 'group').length,
    }),
    [markers]
  )

  const selected = useMemo(
    () => filtered.find((marker) => marker.id === selectedMarkerId) ?? null,
    [filtered, selectedMarkerId]
  )

  const hovered = useMemo(
    () => filtered.find((marker) => marker.id === hoveredMarkerId) ?? null,
    [filtered, hoveredMarkerId]
  )

  const visibleTotals = useMemo(
    () => ({
      shop: filtered.filter((m) => m.type === 'shop').length,
      user: filtered.filter((m) => m.type === 'user').length,
      group: filtered.filter((m) => m.type === 'group').length,
    }),
    [filtered]
  )

  const activeMarker = selected ?? hovered

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-4 border-b border-border bg-gradient-to-r from-sky-50 via-white to-emerald-50">
        <h3 className="text-xl font-bold text-text-primary">South Africa Community Map</h3>
        <p className="text-sm text-text-secondary mt-1">
          Live coverage across {areaCount} areas with {totals.shop} shops, {totals.user} users and {totals.group} stokvel groups.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {(Object.keys(markerMeta) as MapMarkerType[]).map((type) => {
            const active = visible[type]

            return (
              <button
                key={type}
                type="button"
                onClick={() => setVisible((prev) => ({ ...prev, [type]: !prev[type] }))}
                className={[
                  'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                  active
                    ? 'border-transparent text-white'
                    : 'border-border bg-white text-text-secondary hover:bg-slate-50',
                ].join(' ')}
                style={active ? { backgroundColor: markerMeta[type].color } : undefined}
              >
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: active ? '#FFFFFF' : markerMeta[type].color }}
                />
                {markerMeta[type].label}: {totals[type]}
              </button>
            )
          })}
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, area, or province"
            className="h-10 rounded-lg border border-border bg-white px-3 text-sm text-text-primary placeholder:text-text-secondary/70"
          />

          <select
            value={provinceFilter}
            onChange={(e) => setProvinceFilter(e.target.value)}
            className="h-10 min-w-[170px] rounded-lg border border-border bg-white px-3 text-sm text-text-primary"
          >
            {provinces.map((province) => (
              <option key={province} value={province}>
                {province === 'ALL' ? 'All provinces' : province}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              setQuery('')
              setProvinceFilter('ALL')
              setSelectedMarkerId(null)
              setHoveredMarkerId(null)
              setVisible({ shop: true, user: true, group: true })
            }}
            className="h-10 rounded-lg border border-border bg-white px-3 text-xs font-semibold text-text-secondary hover:bg-slate-50"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="relative bg-slate-950/95">
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          className="h-[440px] sm:h-[520px] w-full"
          role="img"
          aria-label="Interactive South Africa map with community markers"
        >
          <defs>
            <linearGradient id="seaGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0B2447" />
              <stop offset="100%" stopColor="#111827" />
            </linearGradient>
            <linearGradient id="saGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#DDE7F3" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#seaGradient)" onClick={() => setSelectedMarkerId(null)} />

          <path
            d="M171 571 L156 543 L167 522 L205 498 L223 466 L247 448 L289 444 L321 427 L358 427 L391 405 L418 418 L456 414 L489 392 L526 383 L553 357 L592 361 L637 344 L664 369 L706 388 L729 423 L766 434 L802 461 L821 508 L855 522 L877 558 L867 605 L829 641 L780 648 L755 681 L723 700 L692 697 L640 726 L582 726 L535 703 L478 705 L446 681 L413 686 L374 670 L342 644 L307 626 L273 592 L236 591 Z"
            fill="url(#saGradient)"
            stroke="#93A6C1"
            strokeWidth="3"
            onClick={() => setSelectedMarkerId(null)}
          />

          {filtered.map((marker) => {
            const point = projectToSvg(marker.lat, marker.lng)
            const isSelected = marker.id === selectedMarkerId

            return (
              <g key={marker.id} transform={`translate(${point.x}, ${point.y})`}>
                <circle
                  r={isSelected ? 11 : 8}
                  fill="transparent"
                  stroke={markerMeta[marker.type].ring}
                  strokeWidth={isSelected ? 3 : 2}
                  opacity={0.85}
                />
                <circle
                  r={isSelected ? 7 : 5}
                  fill={markerMeta[marker.type].color}
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  className="cursor-pointer"
                  onClick={() => setSelectedMarkerId(marker.id)}
                  onMouseEnter={() => setHoveredMarkerId(marker.id)}
                  onMouseLeave={() => setHoveredMarkerId(null)}
                >
                  <title>
                    {marker.name} ({markerMeta[marker.type].label}) - {marker.areaName}, {marker.province}
                  </title>
                </circle>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="px-5 py-4 border-t border-border bg-slate-50/80">
        {activeMarker ? (
          <p className="text-sm text-text-primary">
            <span className="font-semibold">Focused:</span> {activeMarker.name} ({markerMeta[activeMarker.type].label.slice(0, -1)}) in {activeMarker.areaName}, {activeMarker.province}
          </p>
        ) : (
          <p className="text-sm text-text-secondary">
            Select a marker to view details. Showing {filtered.length} visible markers.
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-orange-100 px-2 py-1 font-medium text-orange-700">Visible shops: {visibleTotals.shop}</span>
          <span className="rounded-full bg-sky-100 px-2 py-1 font-medium text-sky-700">Visible users: {visibleTotals.user}</span>
          <span className="rounded-full bg-emerald-100 px-2 py-1 font-medium text-emerald-700">Visible groups: {visibleTotals.group}</span>
        </div>
      </div>
    </div>
  )
}