'use client'

import { motion } from 'framer-motion'

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

const container = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const card = {
  hidden:  { opacity: 0, y: 32, scale: 0.96 },
  visible: { opacity: 1, y: 0,  scale: 1    },
}

export default function TestimonialCards() {
  return (
    <motion.div
      className="grid sm:grid-cols-3 gap-4"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0 }}
      variants={container}
    >
      {testimonials.map((t) => (
        <motion.div
          key={t.name}
          variants={card}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -8, scale: 1.02, boxShadow: `0 24px 64px ${t.accent}28` }}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(24,119,242,0.18)',
            borderRadius: 20,
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            backdropFilter: 'blur(10px)',
            cursor: 'default',
          }}
        >
          {/* Language badge */}
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.4 }}
            style={{
              alignSelf: 'flex-start',
              fontSize: 11, fontWeight: 700,
              color: t.accent,
              background: `${t.accent}18`,
              border: `1px solid ${t.accent}35`,
              borderRadius: 9999,
              padding: '3px 10px',
              marginBottom: 16,
              letterSpacing: '0.04em',
            }}
          >
            {t.language}
          </motion.span>

          <blockquote style={{
            fontSize: 15, fontWeight: 700,
            color: 'rgba(255,255,255,0.9)',
            lineHeight: 1.6, flex: 1, margin: 0,
          }}>
            &ldquo;{t.quote}&rdquo;
          </blockquote>

          <p style={{
            fontSize: 12, color: 'rgba(255,255,255,0.35)',
            fontStyle: 'italic', marginTop: 12, lineHeight: 1.6,
          }}>
            {t.translation}
          </p>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            marginTop: 18, paddingTop: 18,
            borderTop: '1px solid rgba(255,255,255,0.07)',
          }}>
            <motion.div
              whileHover={{ scale: 1.15, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: t.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}
            >
              {t.initials}
            </motion.div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', margin: 0 }}>{t.name}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: 0 }}>{t.location}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}