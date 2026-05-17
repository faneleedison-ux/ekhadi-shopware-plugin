'use client'

const testimonials = [
  {
    quote: 'e-Khadi yasiphilisa. Ngaphandle kwayo izingane zami zizolamba.',
    translation: '"e-Khadi saved us. Without it my children would go hungry."',
    name: 'Nomsa D.', location: 'Umlazi, KwaZulu-Natal',
    language: 'isiZulu', initials: 'ND', accent: '#3B82F6',
  },
  {
    quote: 'Ke fumane moputso ke ntse ke dula gae. Ha ho na molato.',
    translation: '"I got support without leaving home. No shame, no hassle."',
    name: 'Thabo M.', location: 'Botshabelo, Free State',
    language: 'Sesotho', initials: 'TM', accent: '#10B981',
  },
  {
    quote: 'Abafazi bethu baphila ngenxa yalo — alifundisi thina ukusolwa.',
    translation: '"Our women survive because of it — it does not teach us shame."',
    name: 'Lungelo N.', location: 'Mdantsane, Eastern Cape',
    language: 'isiXhosa', initials: 'LN', accent: '#8B5CF6',
  },
]

export default function TestimonialCards() {
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {testimonials.map((t) => (
        <div
          key={t.name}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(24,119,242,0.18)',
            borderRadius: 20,
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            backdropFilter: 'blur(10px)',
            transition: 'box-shadow 0.3s, border-color 0.3s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = `0 0 40px ${t.accent}22`
            e.currentTarget.style.borderColor = `${t.accent}40`
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = 'none'
            e.currentTarget.style.borderColor = 'rgba(24,119,242,0.18)'
          }}
        >
          {/* Language badge */}
          <span style={{
            alignSelf: 'flex-start',
            fontSize: 11, fontWeight: 700,
            color: t.accent,
            background: `${t.accent}18`,
            border: `1px solid ${t.accent}35`,
            borderRadius: 9999,
            padding: '3px 10px',
            marginBottom: 16,
            letterSpacing: '0.04em',
          }}>
            {t.language}
          </span>

          {/* Quote */}
          <blockquote style={{
            fontSize: 15,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.9)',
            lineHeight: 1.6,
            flex: 1,
            margin: 0,
          }}>
            &ldquo;{t.quote}&rdquo;
          </blockquote>

          {/* Translation */}
          <p style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.35)',
            fontStyle: 'italic',
            marginTop: 12,
            lineHeight: 1.6,
          }}>
            {t.translation}
          </p>

          {/* Attribution */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            marginTop: 18, paddingTop: 18,
            borderTop: '1px solid rgba(255,255,255,0.07)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: t.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#fff',
              flexShrink: 0,
            }}>
              {t.initials}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', margin: 0 }}>{t.name}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: 0 }}>{t.location}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}