// EventsWidget — Server Component
// Próximos eventos con date box (día/mes)

import Link from 'next/link'

interface Evento {
  id: string
  nombre: string
  slug: string
  fecha: Date
  tipo: string
}

interface EventsWidgetProps {
  eventos: Evento[]
}

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

export default function EventsWidget({ eventos }: EventsWidgetProps) {
  return (
    <div className="widget">
      <div className="widget-header">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <h3 className="widget-title">Próximos Eventos</h3>
      </div>
      <div className="widget-body">
        <div role="list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {eventos.map(ev => {
            const fecha = new Date(ev.fecha)
            const dia   = fecha.getDate()
            const mes   = MESES[fecha.getMonth()]
            return (
              <Link
                key={ev.id}
                href={`/eventos/${ev.slug}`}
                role="listitem"
                style={{ display: 'grid', gridTemplateColumns: '42px 1fr', gap: 'var(--space-4)', alignItems: 'start', textDecoration: 'none' }}
              >
                <div style={{
                  background: 'var(--color-surface-offset)',
                  border: '1px solid var(--color-border-gold)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-2) var(--space-1)',
                  textAlign: 'center', flexShrink: 0,
                }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 900, color: 'var(--color-gold-bright)', display: 'block', lineHeight: 1 }}>
                    {dia}
                  </span>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gold)', opacity: 0.8 }}>
                    {mes}
                  </span>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.3, marginBottom: 3 }}>
                    {ev.nombre}
                  </div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
                    {ev.tipo}
                  </div>
                </div>
              </Link>
            )
          })}
          {eventos.length === 0 && (
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', textAlign: 'center', padding: 'var(--space-4) 0' }}>
              No hay eventos próximos
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
