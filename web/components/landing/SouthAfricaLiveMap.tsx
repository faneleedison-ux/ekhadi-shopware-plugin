'use client'

import { useEffect, useMemo, useState } from 'react'
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
const Marker = dynamic(
  () => import('react-leaflet').then((module) => module.Marker),
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

// Pin HTML for each marker type — square (shop), teardrop (user), diamond (group)
const PIN_HTML: Record<MapMarkerType, string> = {
  shop: `<div style="display:flex;flex-direction:column;align-items:center">
    <div style="width:30px;height:30px;background:#F97316;border-radius:7px;border:2.5px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(249,115,22,0.6)">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
        <path d="M3 9l2.45-4.9A2 2 0 017.24 3h9.52a2 2 0 011.8 1.1L21 9"/>
        <line x1="12" y1="3" x2="12" y2="9"/>
      </svg>
    </div>
    <div style="width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:8px solid #F97316"></div>
  </div>`,
  user: `<div style="display:flex;flex-direction:column;align-items:center">
    <div style="width:28px;height:28px;background:#0EA5E9;border-radius:50%;border:2.5px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(14,165,233,0.6)">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    </div>
    <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:6px solid #0EA5E9"></div>
  </div>`,
  group: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px">
    <div style="width:24px;height:24px;background:#10B981;border-radius:4px;border:2.5px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(16,185,129,0.6);transform:rotate(45deg)">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(-45deg)">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/>
        <path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    </div>
  </div>`,
}

export default function SouthAfricaLiveMap({ markers, areaCount }: Props) {
  const [leafletIcons, setLeafletIcons] = useState<Record<MapMarkerType, import('leaflet').DivIcon> | null>(null)

  useEffect(() => {
    import('leaflet').then(({ default: L }) => {
      setLeafletIcons({
        shop:  L.divIcon({ className: '', html: PIN_HTML.shop,  iconSize: [30, 38], iconAnchor: [15, 38], tooltipAnchor: [0, -40] }),
        user:  L.divIcon({ className: '', html: PIN_HTML.user,  iconSize: [28, 34], iconAnchor: [14, 34], tooltipAnchor: [0, -36] }),
        group: L.divIcon({ className: '', html: PIN_HTML.group, iconSize: [32, 32], iconAnchor: [16, 16], tooltipAnchor: [0, -18] }),
      })
    })
  }, [])

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

  const inputStyle: React.CSSProperties = {
    height: 40,
    borderRadius: 10,
    border: '1px solid rgba(24,119,242,0.3)',
    background: '#fff',
    color: '#1a1a2e',
    padding: '0 12px',
    fontSize: 13,
    outline: 'none',
    width: '100%',
  }

  return (
    <div style={{
      borderRadius: 24,
      border: '1px solid rgba(24,119,242,0.18)',
      background: '#fff',
      overflow: 'hidden',
      boxShadow: '0 4px 32px rgba(24,119,242,0.08)',
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: '20px 24px 18px',
        borderBottom: '1px solid rgba(24,119,242,0.1)',
        background: '#f8faff',
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', margin: '0 0 4px' }}>
          South Africa Community Map
        </h3>
        <p style={{ fontSize: 13, color: 'rgba(26,26,46,0.5)', margin: 0 }}>
          Live coverage across {areaCount} areas · {totals.shop} shops · {totals.user} members · {totals.group} stokvel groups
        </p>

        {/* Toggle buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
          {(Object.keys(markerMeta) as MapMarkerType[]).map((type) => {
            const isOn = visible[type]
            return (
              <button
                key={type}
                type="button"
                onClick={() => setVisible((prev) => ({ ...prev, [type]: !prev[type] }))}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  borderRadius: 9999,
                  border: `1px solid ${isOn ? markerMeta[type].color : 'rgba(255,255,255,0.12)'}`,
                  background: isOn ? `${markerMeta[type].color}18` : 'rgba(0,0,0,0.04)',
                  color: isOn ? markerMeta[type].color : 'rgba(26,26,46,0.4)',
                  padding: '5px 12px',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: isOn ? markerMeta[type].color : 'rgba(255,255,255,0.2)',
                  display: 'block',
                }} />
                {markerMeta[type].label}: {totals[type]}
              </button>
            )
          })}
        </div>

        {/* Search / filter row */}
        <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, area, or province…"
            style={inputStyle}
          />
          <select
            value={provinceFilter}
            onChange={(e) => setProvinceFilter(e.target.value)}
            style={{ ...inputStyle, minWidth: 170, cursor: 'pointer' }}
          >
            {provinces.map((p) => (
              <option key={p} value={p} style={{ background: '#fff', color: '#1a1a2e' }}>
                {p === 'ALL' ? 'All provinces' : p}
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
            style={{
              height: 40, borderRadius: 10,
              border: '1px solid rgba(24,119,242,0.3)',
              background: '#fff',
              color: 'rgba(26,26,46,0.6)',
              padding: '0 14px', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* ── Map ── */}
      <div style={{ position: 'relative', background: '#e8f0fe' }}>
        <div style={{
          position: 'absolute', left: 12, top: 12, zIndex: 450,
          borderRadius: 8,
          border: '1px solid rgba(24,119,242,0.2)',
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          padding: '6px 12px',
          fontSize: 11, fontWeight: 600,
          color: 'rgba(26,26,46,0.5)',
        }}>
          South Africa boundary overlay
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
              color: '#1877F2',
              weight: 2,
              fillColor: '#1877F2',
              fillOpacity: 0.07,
            }}
            positions={southAfricaOutline}
          />

          {leafletIcons && filtered.map((marker) => (
            <Marker
              key={marker.id}
              position={[marker.lat, marker.lng]}
              icon={leafletIcons[marker.type]}
              eventHandlers={{
                click:     () => setSelectedMarkerId(marker.id),
                mouseover: () => setHoveredMarkerId(marker.id),
                mouseout:  () => setHoveredMarkerId(null),
              }}
            >
              <Tooltip direction="top" offset={[0, -4]} opacity={1}>
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold">{marker.name}</p>
                  <p className="text-[11px] text-slate-400">{markerMeta[marker.type].label.slice(0, -1)} · {marker.areaName}</p>
                  <p className="text-[11px] text-slate-500">{marker.province}</p>
                </div>
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* ── Footer ── */}
      <div style={{
        padding: '14px 24px',
        borderTop: '1px solid rgba(24,119,242,0.1)',
        background: '#f8faff',
      }}>
        {activeMarker ? (
          <p style={{ fontSize: 13, color: 'rgba(26,26,46,0.7)', margin: '0 0 10px' }}>
            <span style={{ fontWeight: 700, color: '#1a1a2e' }}>Focused:</span>{' '}
            {activeMarker.name} ({markerMeta[activeMarker.type].label.slice(0, -1)}) · {activeMarker.areaName}, {activeMarker.province}
          </p>
        ) : (
          <p style={{ fontSize: 13, color: 'rgba(26,26,46,0.4)', margin: '0 0 10px' }}>
            Select a marker to view details · Showing {filtered.length} markers
          </p>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[
            { label: `Shops: ${visibleTotals.shop}`,   color: '#F97316' },
            { label: `Members: ${visibleTotals.user}`,  color: '#0EA5E9' },
            { label: `Groups: ${visibleTotals.group}`,  color: '#10B981' },
          ].map((b) => (
            <span key={b.label} style={{
              borderRadius: 9999,
              border: `1px solid ${b.color}35`,
              background: `${b.color}15`,
              color: b.color,
              padding: '3px 10px',
              fontSize: 11, fontWeight: 600,
            }}>
              {b.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}