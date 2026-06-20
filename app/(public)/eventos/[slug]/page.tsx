// /eventos/[slug] — Detalle de evento individual
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import GoldLine from '@/components/ui/GoldLine'

interface Props { params: Promise<{ slug: string }> }

export const revalidate = 60

export default async function EventoPage({ params }: Props) {
  const { slug } = await params
  const evento = await prisma.evento.findUnique({ where: { slug } })
  if (!evento) notFound()

  const fecha = new Date(evento.fecha).toLocaleDateString('es', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: 'var(--space-12) var(--space-6)' }}>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)', opacity: 0.75, marginBottom: 'var(--space-3)' }}>
        {evento.tipo}
      </p>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 900, color: 'var(--color-gold-bright)', marginBottom: 'var(--space-4)' }}>
        {evento.nombre}
      </h1>
      <time style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
        {fecha}
      </time>
      {evento.puntos > 0 && (
        <span style={{ marginLeft: 'var(--space-4)', fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-gold)' }}>
          +{evento.puntos} pts
        </span>
      )}
      <GoldLine style={{ margin: 'var(--space-6) 0' } as any} />
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', color: 'var(--color-text)', lineHeight: 1.75 }}>
        {evento.descripcion}
      </p>
    </div>
  )
}
