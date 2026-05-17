import SouthAfricaLiveMap, { MapMarker } from './SouthAfricaLiveMap'

const PROVINCE_TICKER = [
  { name: 'Gauteng',        count: '06 areas' },
  { name: 'KwaZulu-Natal',  count: '05 areas' },
  { name: 'Western Cape',   count: '04 areas' },
  { name: 'Eastern Cape',   count: '03 areas' },
  { name: 'Limpopo',        count: '03 areas' },
  { name: 'Mpumalanga',     count: '03 areas' },
  { name: 'North West',     count: '03 areas' },
  { name: 'Free State',     count: '03 areas' },
  { name: 'Northern Cape',  count: '02 areas' },
]

type Props = { markers: MapMarker[]; areaCount: number }

export default function DawnFootprint({ markers, areaCount }: Props) {
  const doubled = [...PROVINCE_TICKER, ...PROVINCE_TICKER]

  return (
    <section className="day" id="footprint">
      <div className="dawn-container">
        <div className="sec-cap reveal">
          <span className="cap-num">§ 05</span>
          <span className="cap-tag">South Africa Footprint</span>
          <span className="cap-rule" />
          <span>All 09 Provinces</span>
        </div>
        <h2 className="sec-heading reveal">
          Nine provinces. <span className="acc">One Ubuntu.</span>
        </h2>
      </div>

      {/* Stats */}
      <div className="dawn-container">
        <div className="fp-stats reveal">
          <div className="cell">
            <div className="v"><span className="acc">{areaCount}</span></div>
            <div className="l">Areas served across the country</div>
          </div>
          <div className="cell">
            <div className="v">850<span className="acc">+</span></div>
            <div className="l">Active spaza shop partners</div>
          </div>
        </div>
      </div>

      {/* Province ticker strip */}
      <div className="prov-ticker">
        <div className="prov-ticker-inner">
          <div className="prov-label">
            <span className="prov-dot" />
            09 Provinces
          </div>
          <div className="prov-track">
            <div className="prov-rail">
              {doubled.map((p, i) => (
                <span key={i} className="prov-item">
                  <span className="prov-name">{p.name}</span>
                  <span className="prov-sep">·</span>
                  <span className="prov-count">{p.count}</span>
                  <span className="prov-pipe">|</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Leaflet map */}
      <div className="dawn-container">
        <div className="reveal">
          <SouthAfricaLiveMap markers={markers} areaCount={areaCount} />
        </div>
      </div>
    </section>
  )
}