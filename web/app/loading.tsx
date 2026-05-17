export default function LandingLoading() {
  const shimmer = {
    background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(24,119,242,0.08) 50%, rgba(255,255,255,0.04) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer-bg 1.5s infinite',
    borderRadius: 12,
  } as React.CSSProperties

  return (
    <div style={{ background: '#060C1E', minHeight: '100vh' }}>
      <style>{`
        @keyframes shimmer-bg {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Nav skeleton */}
      <div style={{
        height: 64, borderBottom: '1px solid rgba(24,119,242,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
      }}>
        <div style={{ ...shimmer, width: 100, height: 28 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ ...shimmer, width: 64, height: 32 }} />
          <div style={{ ...shimmer, width: 100, height: 32, borderRadius: 9999 }} />
        </div>
      </div>

      {/* Hero skeleton */}
      <div style={{ padding: '80px 24px 100px', maxWidth: 1152, margin: '0 auto' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ ...shimmer, width: 220, height: 28, borderRadius: 9999 }} />
            <div style={{ ...shimmer, width: '90%', height: 56 }} />
            <div style={{ ...shimmer, width: '70%', height: 56 }} />
            <div style={{ ...shimmer, width: '80%', height: 20, marginTop: 8 }} />
            <div style={{ ...shimmer, width: '60%', height: 20 }} />
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <div style={{ ...shimmer, width: 180, height: 48, borderRadius: 9999 }} />
              <div style={{ ...shimmer, width: 160, height: 48, borderRadius: 9999 }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ ...shimmer, width: 260, height: 440, borderRadius: 36 }} />
          </div>
        </div>
      </div>

      {/* Ticker skeleton */}
      <div style={{ ...shimmer, height: 44, borderRadius: 0 }} />

      {/* Features skeleton */}
      <div style={{ padding: '80px 24px', maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ ...shimmer, width: 280, height: 40, margin: '0 auto 48px', borderRadius: 8 }} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ ...shimmer, height: 180, borderRadius: 20 }} />
          ))}
        </div>
      </div>
    </div>
  )
}
