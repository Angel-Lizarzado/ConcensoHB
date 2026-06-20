// /eventos — Lista completa de eventos
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import GoldLine from '@/components/ui/GoldLine'

export const revalidate = 60
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export default async function EventosPage() {
  const eventos = await prisma.evento.findMany({ orderBy: { fecha: 'asc' } })
  const ahora   = new Date()

  return (
    <div style={{ maxWidth: 'var(--content-default)', margin: '0 auto', padding: 'var(--space-12) var(--space-6)' }}>
      <div style={{ marginBottom: 'var(--space-10)' }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)', opacity: 0.75, marginBottom: 'var(--space-3)' }}>
          Calendario
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-gold-bright)', marginBottom: 'var(--space-4)' }}>
          Eventos
        </h1>
        <GoldLine />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {eventos.map(ev => {
          const fecha    = new Date(ev.fecha)
          const pasado   = fecha < ahora
          return (
            <Link
              key={ev.id}
              href={`/eventos/${ev.slug}`}
              style={{
                display: 'grid', gridTemplateColumns: '80px 1fr auto',
                gap: 'var(--space-6)', alignItems: 'center',
                padding: 'var(--space-5) var(--space-6)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                textDecoration: 'none', opacity: pasado ? 0.5 : 1,
                transition: 'border-color var(--transition)',
              }}
              className="evento-row"
            >
              {/* Date box */}
              <div style={{ background: 'var(--color-surface-offset)', border: '1px solid var(--color-border-gold)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', textAlign: 'center' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 900, color: 'var(--color-gold-bright)', display: 'block', lineHeight: 1 }}>
                  {fecha.getDate()}
                </span>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gold)', opacity: 0.8 }}>
                  {MESES[fecha.getMonth()].slice(0, 3)}
                </span>
              </div>
              {/* Info */}
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-1)' }}>
                  {ev.nombre}
                </div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
                  {ev.tipo}
                </div>
              </div>
              {/* Puntos */}
              {ev.puntos > 0 && (
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-gold)' }}>
                    +{ev.puntos}
                  </span>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>pts</div>
                </div>
              )}
            </Link>
          )
        })}
        {eventos.length === 0 && (
          <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-16) 0' }}>
            No hay eventos registrados aún.
          </p>
        )}
      </div>
    </div>
  )
}
