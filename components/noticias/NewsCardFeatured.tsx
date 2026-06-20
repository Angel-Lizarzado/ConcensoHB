// NewsCardFeatured — Server Component
// Noticia destacada con imagen placeholder y borde por departamento

import Link from 'next/link'
import DeptBadge, { type DeptKey } from '@/components/ui/DeptBadge'

interface Noticia {
  id: string
  titulo: string
  slug: string
  extracto: string
  imagenUrl: string | null
  departamento: string
  createdAt: Date
  autor: { id: string; username: string }
}

interface NewsCardFeaturedProps {
  noticia: Noticia
}

const DEPT_BORDER: Record<string, string> = {
  NOTICIAS: 'var(--color-noticias)',
  WIREDS:   'var(--color-wireds)',
  JUZGADO:  'var(--color-juzgado)',
  OFICIAL:  'var(--color-gold)',
}

export default function NewsCardFeatured({ noticia }: NewsCardFeaturedProps) {
  const borderColor = DEPT_BORDER[noticia.departamento] ?? 'var(--color-gold)'
  const fecha = new Date(noticia.createdAt).toLocaleDateString('es', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <article
      style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        marginBottom: 'var(--space-6)',
        borderLeft: `3px solid ${borderColor}`,
        transition: 'box-shadow var(--transition)',
      }}
      className="news-featured"
    >
      {/* Imagen / placeholder */}
      <div style={{
        width: '100%', height: 200,
        background: 'linear-gradient(135deg, var(--color-surface-offset) 0%, var(--color-surface-accent) 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {noticia.imagenUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={noticia.imagenUrl}
            alt={noticia.titulo}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <svg width="50" height="54" viewBox="0 0 88 96" fill="none" opacity="0.12" aria-hidden="true">
            <path d="M44 2 L84 88 L68 82 L44 28 L20 82 L4 88 Z" fill="#C9A84C" />
            <path d="M44 22 L72 84 L54 78 L44 52 L34 78 L16 84 Z" fill="#080807" />
          </svg>
        )}
      </div>

      <div style={{ padding: 'var(--space-6) var(--space-8)' }}>
        <DeptBadge dept={noticia.departamento as DeptKey} />

        <Link href={`/noticias/${noticia.slug}`} style={{ textDecoration: 'none' }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-lg)',
            fontWeight: 700,
            color: 'var(--color-text)',
            marginBottom: 'var(--space-3)',
            lineHeight: 1.3,
            transition: 'color var(--transition)',
          }}
          className="news-title-hover"
          >
            {noticia.titulo}
          </h3>
        </Link>

        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          color: 'var(--color-text-muted)',
          lineHeight: 1.6,
          marginBottom: 'var(--space-5)',
          maxWidth: '72ch',
        }}>
          {noticia.extracto}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text-muted)' }}>
            <div style={{
              width: 22, height: 22,
              background: 'var(--color-surface-offset)',
              border: '1px solid var(--color-border-gold)',
              borderRadius: 'var(--radius-full)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, color: 'var(--color-gold)', fontFamily: 'var(--font-ui)', fontWeight: 700, flexShrink: 0,
            }}>
              {noticia.autor.username[0].toUpperCase()}
            </div>
            <span>{noticia.autor.username}</span>
          </div>
          <span>{fecha}</span>
        </div>
      </div>
    </article>
  )
}
