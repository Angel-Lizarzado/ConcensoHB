'use client'

// NewsFeed — Client Component
// Feed de noticias con filtro por departamento en cliente

import { useState } from 'react'
import NewsCardSmall from './NewsCardSmall'

type DeptFilter = 'TODOS' | 'NOTICIAS' | 'WIREDS' | 'JUZGADO' | 'OFICIAL'

interface Noticia {
  id: string
  titulo: string
  slug: string
  departamento: string
  createdAt: Date
  autor: { id: string; username: string }
}

interface NewsFeedProps {
  noticias: Noticia[]
}

const FILTROS: { key: DeptFilter; label: string }[] = [
  { key: 'TODOS',    label: 'Todos'    },
  { key: 'NOTICIAS', label: 'Noticias' },
  { key: 'WIREDS',   label: 'Wireds'   },
  { key: 'JUZGADO',  label: 'Juzgado'  },
  { key: 'OFICIAL',  label: 'Oficial'  },
]

export default function NewsFeed({ noticias }: NewsFeedProps) {
  const [filtro, setFiltro] = useState<DeptFilter>('TODOS')

  const filtradas = filtro === 'TODOS'
    ? noticias
    : noticias.filter(n => n.departamento === filtro)

  return (
    <div>
      {/* Filtros */}
      <div
        role="tablist"
        aria-label="Filtrar por departamento"
        style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}
      >
        {FILTROS.map(f => (
          <button
            key={f.key}
            role="tab"
            aria-selected={filtro === f.key}
            onClick={() => setFiltro(f.key)}
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 'var(--text-xs)',
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: 'var(--space-2) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${filtro === f.key ? 'var(--color-border-gold)' : 'var(--color-border)'}`,
              background: filtro === f.key ? 'var(--color-gold-highlight)' : 'transparent',
              color: filtro === f.key ? 'var(--color-gold)' : 'var(--color-text-muted)',
              cursor: 'pointer',
              transition: 'all var(--transition)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div role="list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {filtradas.length > 0 ? (
          filtradas.map(n => (
            <NewsCardSmall key={n.id} noticia={n} />
          ))
        ) : (
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)', color: 'var(--color-text-faint)', padding: 'var(--space-8) 0', textAlign: 'center' }}>
            No hay noticias en este departamento
          </p>
        )}
      </div>
    </div>
  )
}
