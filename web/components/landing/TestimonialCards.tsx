const testimonials = [
  {
    quote: 'e-Khadi yasiphilisa. Ngaphandle kwayo izingane zami zizolamba.',
    translation: '"e-Khadi saved us. Without it my children would go hungry."',
    name: 'Nomsa D.',
    location: 'Umlazi, KwaZulu-Natal',
    language: 'isiZulu',
    initials: 'ND',
    color: 'bg-blue-600',
  },
  {
    quote: 'Ke fumane moputso ke ntse ke dula gae. Ha ho na molato.',
    translation: '"I got support without leaving home. No shame, no hassle."',
    name: 'Thabo M.',
    location: 'Botshabelo, Free State',
    language: 'Sesotho',
    initials: 'TM',
    color: 'bg-green-600',
  },
  {
    quote: 'Abafazi bethu baphila ngenxa yalo — alifundisi thina ukusolwa.',
    translation: '"Our women survive because of it — it does not teach us shame."',
    name: 'Lungelo N.',
    location: 'Mdantsane, Eastern Cape',
    language: 'isiXhosa',
    initials: 'LN',
    color: 'bg-purple-600',
  },
]

export default function TestimonialCards() {
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {testimonials.map((t) => (
        <div
          key={t.name}
          className="bg-white rounded-2xl border border-border p-5 flex flex-col shadow-sm"
        >
          {/* Language badge */}
          <span className="self-start text-xs font-semibold text-text-secondary bg-background px-2.5 py-1 rounded-full mb-3">
            {t.language}
          </span>

          {/* Native quote */}
          <blockquote className="text-base font-bold text-text-primary leading-snug flex-1">
            &ldquo;{t.quote}&rdquo;
          </blockquote>

          {/* Translation */}
          <p className="text-xs text-text-secondary italic mt-2 leading-relaxed">
            {t.translation}
          </p>

          {/* Attribution */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${t.color}`}
            >
              {t.initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">{t.name}</p>
              <p className="text-xs text-text-secondary">{t.location}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
