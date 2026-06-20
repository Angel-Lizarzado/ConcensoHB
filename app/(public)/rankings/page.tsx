// /rankings — Rankings completos con historial de actividades
import { prisma } from '@/lib/prisma'
import { siglaToSlug } from '@/lib/slugify'
import Link from 'next/link'
import GoldLine from '@/components/ui/GoldLine'

export const revalidate = 60

export default async function RankingsPage() {
  const ejercitos = await prisma.ejercito.findMany({
    where: { activo: true },
    orderBy: { puntos: 'desc' },
    select: {
      id: true, sigla: true, nombre: true, escudo: true,
      puntos: true, ranking: true,
      _count: { select: { actividades: true } },
    },
  })

  const MEDALLA: Record<number, { color: string; bg: string; label: string }> = {
    1: { color: 'var(--color-gold)',   bg: 'oklch(0.75 0.12 75 / 0.08)',  label: 'I'   },
    2: { color: '#9aa4ae',             bg: 'oklch(0.6 0.01 220 / 0.08)',   label: 'II'  },
    3: { color: '#a07848',             bg: 'oklch(0.55 0.06 55 / 0.08)',   label: 'III' },
  }

  return (
    <div style={{ maxWidth: 'var(--content-default)', margin: '0 auto', padding: 'var(--space-12) var(--space-6)' }}>
      <div style={{ marginBottom: 'var(--space-10)' }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)', opacity: 0.75, marginBottom: 'var(--space-3)' }}>
          Tabla de posiciones
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-gold-bright)', marginBottom: 'var(--space-4)' }}>
          Rankings
        </h1>
        <GoldLine />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {ejercitos.map((e, i) => {
          const pos    = i + 1
          const medal  = MEDALLA[pos]
          const slug   = siglaToSlug(e.sigla)

          return (
            <Link
              key={e.id}
              href={`/ejercitos/${slug}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '60px auto 1fr auto auto',
                alignItems: 'center',
                gap: 'var(--space-5)',
                padding: 'var(--space-5) var(--space-6)',
                background: medal ? medal.bg : 'var(--color-surface)',
                border: `1px solid ${medal ? (pos === 1 ? 'var(--color-border-gold)' : 'var(--color-border)') : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-lg)',
                textDecoration: 'none',
                transition: 'border-color var(--transition), box-shadow var(--transition)',
              }}
              className="ranking-row"
            >
              {/* Posición */}
              <div style={{ textAlign: 'center' }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 900,
                  color: medal?.color ?? 'var(--color-text-faint)',
                  display: 'block',
                }}>
                  {medal?.label ?? pos}
                </span>
              </div>

              {/* Escudo */}
              <div style={{
                width: 48, height: 48, borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface-offset)', border: '1px solid var(--color-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, color: 'var(--color-gold)', flexShrink: 0,
              }}>
                {e.escudo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.escudo} alt="" style={{ width: 36, height: 36, objectFit: 'contain' }} />
                ) : e.sigla[0]}
              </div>

              {/* Nombre */}
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700, color: medal ? medal.color : 'var(--color-text)', letterSpacing: '0.04em' }}>
                  {e.sigla}
                </div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  {e.nombre}
                </div>
              </div>

              {/* Actividades */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
                  {e._count.actividades} actividades
                </div>
              </div>

              {/* Puntos */}
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 900, color: medal?.color ?? 'var(--color-gold)', whiteSpace: 'nowrap' }}>
                  {e.puntos.toLocaleString()}
                </span>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  pts
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
