// /noticias/[slug] — Artículo individual
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import DeptBadge, { type DeptKey } from '@/components/ui/DeptBadge'
import GoldLine from '@/components/ui/GoldLine'
import DOMPurify from 'isomorphic-dompurify'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const noticia = await prisma.noticia.findUnique({ where: { slug, publicada: true } })
    if (!noticia) return {}
    return { title: noticia.titulo, description: noticia.extracto }
  } catch { return {} }
}

// Dinámico — sin generateStaticParams en desarrollo sin DB
export const revalidate = 60

export default async function NoticiaPage({ params }: Props) {
  const { slug } = await params
  const noticia = await prisma.noticia.findUnique({
    where: { slug, publicada: true },
    include: { autor: { select: { id: true, username: true } } },
  })

  if (!noticia) notFound()

  const contenidoLimpio = DOMPurify.sanitize(noticia.contenido)
  const fecha = new Date(noticia.createdAt).toLocaleDateString('es', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <article style={{ maxWidth: 'var(--content-narrow)', margin: '0 auto', padding: 'var(--space-12) var(--space-6)' }}>
      {/* Header */}
      <header style={{ marginBottom: 'var(--space-8)' }}>
        <DeptBadge dept={noticia.departamento as DeptKey} />
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)',
          fontWeight: 900, letterSpacing: '0.04em', color: 'var(--color-gold-bright)',
          lineHeight: 1.2, marginBottom: 'var(--space-4)', marginTop: 'var(--space-4)',
        }}>
          {noticia.titulo}
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontStyle: 'italic', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>
          {noticia.extracto}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>{noticia.autor.username}</span>
          <span>·</span>
          <time dateTime={noticia.createdAt.toISOString()}>{fecha}</time>
        </div>
        <GoldLine style={{ marginTop: 'var(--space-6)' } as any} />
      </header>

      {/* Imagen */}
      {noticia.imagenUrl && (
        <div style={{ marginBottom: 'var(--space-8)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={noticia.imagenUrl} alt={noticia.titulo} style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
      )}

      {/* Contenido HTML sanitizado */}
      <div
        className="prose-cge"
        dangerouslySetInnerHTML={{ __html: contenidoLimpio }}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-lg)',
          color: 'var(--color-text)',
          lineHeight: 1.75,
        }}
      />
    </article>
  )
}
