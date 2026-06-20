// EjercitoCard — Server Component
// Card de ejército para la lista en /ejercitos

import Link from 'next/link'
import { siglaToSlug } from '@/lib/slugify'

interface Ejercito {
  id: string
  sigla: string
  nombre: string
  descripcion: string | null
  escudo: string | null
  puntos: number
  ranking: number | null
  _count: { miembros: number }
}

interface EjercitoCardProps {
  ejercito: Ejercito
  posicion?: number
}

export default function EjercitoCard({ ejercito, posicion }: EjercitoCardProps) {
  const slug = siglaToSlug(ejercito.sigla)

  return (
    <Link
      href={`/ejercitos/${slug}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        textDecoration: 'none',
        transition: 'border-color var(--transition), box-shadow var(--transition)',
      }}
      className="ejercito-card"
    >
      {/* Header con escudo */}
      <div style={{
        height: 100,
        background: 'linear-gradient(135deg, var(--color-surface-offset), var(--color-surface-accent))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
        borderBottom: '1px solid var(--color-border)',
      }}>
        {posicion && posicion <= 3 && (
          <div style={{
            position: 'absolute', top: 'var(--space-3)', left: 'var(--space-3)',
            fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', fontWeight: 900,
            color: posicion === 1 ? 'var(--color-gold)' : posicion === 2 ? '#9aa4ae' : '#a07848',
          }}>
            #{posicion}
          </div>
        )}
        {ejercito.escudo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ejercito.escudo} alt={`Escudo de ${ejercito.nombre}`} style={{ width: 64, height: 64, objectFit: 'contain' }} />
        ) : (
          <div style={{
            width: 64, height: 64, borderRadius: 'var(--radius-lg)',
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border-gold)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)',
            fontWeight: 900, color: 'var(--color-gold)',
          }}>
            {ejercito.sigla[0]}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: 'var(--space-5)', flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-gold)', letterSpacing: '0.06em', marginBottom: 'var(--space-1)' }}>
          {ejercito.sigla}
        </div>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-text)', marginBottom: 'var(--space-3)' }}>
          {ejercito.nombre}
        </div>
        {ejercito.descripcion && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: 'var(--space-4)' }}>
            {ejercito.descripcion.length > 100 ? ejercito.descripcion.slice(0, 100) + '…' : ejercito.descripcion}
          </p>
        )}

        {/* Stats */}
        <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'auto', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 900, color: 'var(--color-gold)' }}>
              {ejercito.puntos.toLocaleString()}
            </div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              pts
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 900, color: 'var(--color-text-muted)' }}>
              {ejercito._count.miembros}
            </div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              miembros
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
