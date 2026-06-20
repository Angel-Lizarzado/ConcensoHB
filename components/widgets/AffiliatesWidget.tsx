// AffiliatesWidget — Server Component
// Lista de ejércitos afiliados activos con dot verde de estado

import Link from 'next/link'
import { siglaToSlug } from '@/lib/slugify'

interface Ejercito {
  id: string
  sigla: string
  nombre: string
  escudo: string | null
}

interface AffiliatesWidgetProps {
  ejercitos: Ejercito[]
}

export default function AffiliatesWidget({ ejercitos }: AffiliatesWidgetProps) {
  return (
    <div className="widget">
      <div className="widget-header">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <h3 className="widget-title">Ejércitos Afiliados</h3>
      </div>
      <div className="widget-body">
        <div role="list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {ejercitos.map(e => (
            <Link
              key={e.id}
              href={`/ejercitos/${siglaToSlug(e.sigla)}`}
              role="listitem"
              style={{
                display: 'grid',
                gridTemplateColumns: '32px 1fr auto',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid transparent',
                textDecoration: 'none',
                transition: 'all var(--transition)',
              }}
              className="affiliate-row"
            >
              <div style={{
                width: 32, height: 32,
                background: 'var(--color-surface-offset)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, color: 'var(--color-gold)', flexShrink: 0,
              }}>
                {e.escudo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.escudo} alt="" width={24} height={24} style={{ objectFit: 'contain' }} />
                ) : e.sigla[0]}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-gold)', letterSpacing: '0.08em' }}>
                  {e.sigla}
                </div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {e.nombre}
                </div>
              </div>
              {/* Dot verde activo */}
              <div
                title="Activo"
                style={{ width: 6, height: 6, borderRadius: '50%', background: '#4a8a3a', boxShadow: '0 0 5px #4a8a3a', flexShrink: 0 }}
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
