// /ejercitos/[slug] — Ficha pública detallada de un ejército
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { siglaToSlug } from '@/lib/slugify'
import GoldLine from '@/components/ui/GoldLine'
import DOMPurify from 'isomorphic-dompurify'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

// Dinámico — no generateStaticParams en desarrollo sin DB
// En producción con DATABASE_URL se puede habilitar ISR
export const revalidate = 60

export default async function EjercitoPage({ params }: Props) {
  const { slug } = await params

  const ejercitos = await prisma.ejercito.findMany({
    where: { activo: true },
    include: {
      miembros: {
        select: { id: true, username: true, rolEjercito: true },
        where: { rolEjercito: { not: null } },
        orderBy: { rolEjercito: 'asc' },
      },
      actividades: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, descripcion: true, puntos: true, createdAt: true },
      },
      _count: { select: { miembros: true } },
    },
  })

  const ejercito = ejercitos.find(e => siglaToSlug(e.sigla) === slug)
  if (!ejercito) notFound()

  const descripcionHtml = ejercito.descripcionRich
    ? DOMPurify.sanitize(ejercito.descripcionRich)
    : null

  const ROL_LABEL: Record<string, string> = {
    COMANDANTE: 'Comandante',
    EMBAJADOR:  'Embajador',
  }

  return (
    <div style={{ maxWidth: 'var(--content-wide)', margin: '0 auto', padding: 'var(--space-12) var(--space-6)' }}>

      {/* Banner */}
      {ejercito.banner && (
        <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 'var(--space-8)', height: 200 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ejercito.banner} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      {/* Header del ejército */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 'var(--space-8)', alignItems: 'start', marginBottom: 'var(--space-8)' }}>
        {/* Escudo */}
        <div style={{
          width: 100, height: 100, borderRadius: 'var(--radius-xl)',
          background: 'var(--color-surface)',
          border: '2px solid var(--color-border-gold)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {ejercito.escudo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ejercito.escudo} alt={`Escudo de ${ejercito.nombre}`} style={{ width: 80, height: 80, objectFit: 'contain' }} />
          ) : (
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 900, color: 'var(--color-gold)' }}>
              {ejercito.sigla[0]}
            </span>
          )}
        </div>

        {/* Info */}
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 900, color: 'var(--color-gold-bright)', letterSpacing: '0.06em' }}>
            {ejercito.sigla}
          </div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-lg)', fontWeight: 500, color: 'var(--color-text)', marginBottom: 'var(--space-2)' }}>
            {ejercito.nombre}
          </div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
            Fundado por {ejercito.fundador}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 'var(--space-6)', textAlign: 'center' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 900, color: 'var(--color-gold)' }}>
              {ejercito.puntos.toLocaleString()}
            </div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>puntos</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 900, color: 'var(--color-text-muted)' }}>
              {ejercito._count.miembros}
            </div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>miembros</div>
          </div>
          {ejercito.ranking && (
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 900, color: 'var(--color-gold)' }}>
                #{ejercito.ranking}
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>ranking</div>
            </div>
          )}
        </div>
      </div>

      <GoldLine />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-10)', marginTop: 'var(--space-8)' }}>
        {/* Descripción */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-gold)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 'var(--space-5)' }}>
            Sobre el ejército
          </h2>
          {descripcionHtml ? (
            <div
              className="prose-cge"
              dangerouslySetInnerHTML={{ __html: descripcionHtml }}
              style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text)', lineHeight: 1.75 }}
            />
          ) : (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
              {ejercito.descripcion ?? 'Este ejército aún no ha agregado una descripción.'}
            </p>
          )}
        </div>

        {/* Miembros */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 'var(--space-5)' }}>
            Personal
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {ejercito.miembros.length > 0 ? ejercito.miembros.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--color-text)' }}>
                  {m.username}
                </span>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-gold)', opacity: 0.7 }}>
                  {ROL_LABEL[m.rolEjercito ?? ''] ?? m.rolEjercito}
                </span>
              </div>
            )) : (
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
                Sin personal registrado
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
