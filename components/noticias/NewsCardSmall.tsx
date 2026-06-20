// NewsCardSmall — Server Component
// Noticia en formato lista con barra de departamento, thumbnail y contenido

import Link from 'next/link'
import DeptBadge, { type DeptKey } from '@/components/ui/DeptBadge'

interface Noticia {
  id: string
  titulo: string
  slug: string
  departamento: string
  createdAt: Date
  autor: { id: string; username: string }
}

interface NewsCardSmallProps {
  noticia: Noticia
}

const DEPT_ICON: Record<string, string> = {
  NOTICIAS: '📰',
  WIREDS:   '⚙️',
  JUZGADO:  '⚖️',
  OFICIAL:  '🏛️',
}

export default function NewsCardSmall({ noticia }: NewsCardSmallProps) {
  const fecha = new Date(noticia.createdAt).toLocaleDateString('es', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
  const icon = DEPT_ICON[noticia.departamento] ?? '📄'

  return (
    <Link
      href={`/noticias/${noticia.slug}`}
      style={{
        display: 'grid',
        gridTemplateColumns: '4px 70px 1fr',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        textDecoration: 'none',
        transition: 'border-color var(--transition), box-shadow var(--transition)',
      }}
      className="news-item"
      data-dept={noticia.departamento.toLowerCase()}
    >
      {/* Barra de color departamento */}
      <span
        aria-hidden="true"
        style={{
          display: 'block',
          background: `var(--color-${noticia.departamento.toLowerCase()})`,
        }}
      />

      {/* Thumbnail */}
      <div style={{
        background: 'var(--color-surface-offset)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 'var(--text-xl)', color: 'var(--color-text-faint)',
      }} aria-hidden="true">
        {icon}
      </div>

      {/* Contenido */}
      <div style={{ padding: 'var(--space-4) var(--space-4) var(--space-4) 0' }}>
        <DeptBadge dept={noticia.departamento as DeptKey} size="sm" />
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-sm)',
          fontWeight: 600,
          color: 'var(--color-text)',
          marginBottom: 'var(--space-2)',
          lineHeight: 1.3,
        }}>
          {noticia.titulo}
        </h3>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
          {noticia.autor.username} · {fecha}
        </div>
      </div>
    </Link>
  )
}
