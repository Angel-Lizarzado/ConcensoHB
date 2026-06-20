// RankingWidget — Server Component
// Muestra el top de ejércitos por puntos con posición medallada

import { siglaToSlug } from '@/lib/slugify'
import Link from 'next/link'

interface EjercitoRanking {
  id: string
  sigla: string
  nombre: string
  escudo: string | null
  puntos: number
  ranking: number | null
}

interface RankingWidgetProps {
  ejercitos: EjercitoRanking[]
}

const MEDAL_STYLES: Record<number, { color: string; label: string }> = {
  1: { color: 'var(--color-gold)',        label: 'I'   },
  2: { color: '#9aa4ae',                  label: 'II'  },
  3: { color: '#a07848',                  label: 'III' },
}

export default function RankingWidget({ ejercitos }: RankingWidgetProps) {
  return (
    <div className="widget">
      <div className="widget-header">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
        <h3 className="widget-title">Ranking Mensual</h3>
      </div>
      <div className="widget-body">
        <div role="list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {ejercitos.map((e, i) => {
            const pos = i + 1
            const medal = MEDAL_STYLES[pos]
            return (
              <Link
                key={e.id}
                href={`/ejercitos/${siglaToSlug(e.sigla)}`}
                role="listitem"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '26px 1fr auto',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  transition: 'background var(--transition)',
                }}
                className="ranking-row"
              >
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 900,
                  textAlign: 'center',
                  color: medal?.color ?? 'var(--color-text-faint)',
                }}>
                  {medal?.label ?? pos}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{
                    width: 26, height: 26,
                    background: 'var(--color-surface-offset)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, color: 'var(--color-gold)', flexShrink: 0,
                  }}>
                    {e.escudo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={e.escudo} alt="" width={20} height={20} style={{ objectFit: 'contain' }} />
                    ) : e.sigla[0]}
                  </div>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--color-text)' }}>
                    {e.sigla}
                  </span>
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-gold)', whiteSpace: 'nowrap' }}>
                  {e.puntos.toLocaleString()} pts
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
