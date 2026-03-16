'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import type { LatLngExpression } from 'leaflet'

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

const saBounds: [[number, number], [number, number]] = [
  [SOUTH_AFRICA_BOUNDS.minLat, SOUTH_AFRICA_BOUNDS.minLng],
  [SOUTH_AFRICA_BOUNDS.maxLat, SOUTH_AFRICA_BOUNDS.maxLng],
]

// Simplified South Africa mainland boundary (lat, lng) for visual country overlay.
const southAfricaOutline: LatLngExpression[] = [
  [-28.5767, 16.3449],
  [-29.2573, 17.0629],
  [-30.7257, 17.5669],
  [-31.6616, 18.2479],
  [-32.6113, 18.2217],
  [-33.2814, 17.9252],
  [-34.8192, 18.4246],
  [-34.4626, 20.6891],
  [-34.4172, 22.5741],
  [-34.2588, 24.4153],
  [-33.9871, 25.9097],
  [-33.7968, 27.5424],
  [-33.9446, 28.6571],
  [-34.1425, 29.616],
  [-34.55, 30.9018],
  [-34.8191, 31.3256],
  [-34.0207, 31.08],
  [-32.172, 28.9256],
  [-30.6451, 28.2198],
  [-29.2413, 29.0184],
  [-28.8514, 28.5417],
  [-27.5325, 29.4321],
  [-26.9993, 30.9497],
  [-26.0226, 32.8301],
  [-25.5004, 32.0717],
  [-24.3694, 31.1914],
  [-23.6589, 30.5281],
  [-22.2716, 29.4321],
  [-22.1022, 28.0172],
  [-22.0913, 25.8475],
  [-22.8243, 25.6491],
  [-24.6964, 20.1657],
  [-28.5767, 16.3449],
]

const MapContainer = dynamic(
  () => import('react-leaflet').then((module) => module.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((module) => module.TileLayer),
  { ssr: false }
)
const Polygon = dynamic(
  () => import('react-leaflet').then((module) => module.Polygon),
  { ssr: false }
)
const CircleMarker = dynamic(
  () => import('react-leaflet').then((module) => module.CircleMarker),
  { ssr: false }
)
const Tooltip = dynamic(
  () => import('react-leaflet').then((module) => module.Tooltip),
  { ssr: false }
)
const ZoomControl = dynamic(
  () => import('react-leaflet').then((module) => module.ZoomControl),
  { ssr: false }
)

const markerMeta: Record<MapMarkerType, { label: string; color: string; ring: string }> = {
  shop: { label: 'Shops', color: '#F97316', ring: '#FDBA74' },
  user: { label: 'Users', color: '#0EA5E9', ring: '#7DD3FC' },
  group: { label: 'Stokvel Groups', color: '#10B981', ring: '#6EE7B7' },
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
  const mapCenter: LatLngExpression = [-29.2, 24.8]

  return (
    <div className="rounded-2xl border border-border bg-white shadow-xl overflow-hidden">
      <div className="px-5 pt-5 pb-4 border-b border-border bg-[radial-gradient(circle_at_top_left,_#dbeafe_0%,_#ecfeff_35%,_#ffffff_75%)]">
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

      <div className="relative bg-slate-900">
        <div className="absolute left-4 top-4 z-[450] rounded-lg border border-cyan-200/80 bg-white/90 px-3 py-2 text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur">
          True map projection with South Africa boundary overlay
        </div>

        <MapContainer
          center={mapCenter}
          zoom={5}
          minZoom={4}
          maxZoom={12}
          maxBounds={saBounds}
          maxBoundsViscosity={1}
          zoomControl={false}
          className="h-[460px] sm:h-[560px] w-full"
          scrollWheelZoom
        >
          <ZoomControl position="bottomright" />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          <Polygon
            pathOptions={{
              color: '#0369A1',
              weight: 2.5,
              fillColor: '#38BDF8',
              fillOpacity: 0.13,
            }}
            positions={southAfricaOutline}
          />

          {filtered.map((marker) => {
            const isSelected = marker.id === selectedMarkerId

            return (
              <CircleMarker
                key={marker.id}
                center={[marker.lat, marker.lng]}
                radius={isSelected ? 10 : 7}
                pathOptions={{
                  color: markerMeta[marker.type].ring,
                  weight: isSelected ? 4 : 2,
                  fillColor: markerMeta[marker.type].color,
                  fillOpacity: 0.95,
                }}
                eventHandlers={{
                  click: () => setSelectedMarkerId(marker.id),
                  mouseover: () => setHoveredMarkerId(marker.id),
                  mouseout: () => setHoveredMarkerId(null),
                }}
              >
                <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold">{marker.name}</p>
                    <p className="text-[11px] text-slate-600">{markerMeta[marker.type].label.slice(0, -1)} • {marker.areaName}</p>
                    <p className="text-[11px] text-slate-500">{marker.province}</p>
                  </div>
                </Tooltip>
              </CircleMarker>
            )
          })}
        </MapContainer>
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