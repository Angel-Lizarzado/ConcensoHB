// /noticias — Feed completo paginado con filtro por departamento
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import NewsFeed from '@/components/noticias/NewsFeed'
import GoldLine from '@/components/ui/GoldLine'

export const revalidate = 60

const PER_PAGE = 12

interface Props {
  searchParams: Promise<{ page?: string; dept?: string }>
}

export default async function NoticiasPage({ searchParams }: Props) {
  const { page: pageParam, dept } = await searchParams
  const page  = Math.max(1, parseInt(pageParam ?? '1'))
  const skip  = (page - 1) * PER_PAGE

  const where: any = { publicada: true }
  if (dept && dept !== 'TODOS') where.departamento = dept

  const [noticias, total] = await Promise.all([
    prisma.noticia.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: PER_PAGE,
      select: {
        id: true, titulo: true, slug: true, extracto: true,
        imagenUrl: true, departamento: true, createdAt: true,
        autor: { select: { id: true, username: true } },
      },
    }),
    prisma.noticia.count({ where }),
  ])

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div style={{ maxWidth: 'var(--content-default)', margin: '0 auto', padding: 'var(--space-12) var(--space-6)' }}>
      {/* Header de sección */}
      <div style={{ marginBottom: 'var(--space-10)' }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)', opacity: 0.75, marginBottom: 'var(--space-3)' }}>
          Plataforma informativa
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-gold-bright)', marginBottom: 'var(--space-4)' }}>
          Noticias
        </h1>
        <GoldLine />
      </div>

      {/* Feed con filtros */}
      <NewsFeed noticias={noticias} />

      {/* Paginación */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-10)', flexWrap: 'wrap' }}>
          {page > 1 && (
            <Link
              href={`/noticias?page=${page - 1}${dept ? `&dept=${dept}` : ''}`}
              style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', textDecoration: 'none' }}
            >
              ← Anterior
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <Link
              key={p}
              href={`/noticias?page=${p}${dept ? `&dept=${dept}` : ''}`}
              style={{
                fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${p === page ? 'var(--color-border-gold)' : 'var(--color-border)'}`,
                background: p === page ? 'var(--color-gold-highlight)' : 'transparent',
                color: p === page ? 'var(--color-gold)' : 'var(--color-text-muted)',
                textDecoration: 'none', fontWeight: p === page ? 700 : 400,
              }}
            >
              {p}
            </Link>
          ))}
          {page < totalPages && (
            <Link
              href={`/noticias?page=${page + 1}${dept ? `&dept=${dept}` : ''}`}
              style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', textDecoration: 'none' }}
            >
              Siguiente →
            </Link>
          )}
        </div>
      )}

      <p style={{ textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginTop: 'var(--space-6)' }}>
        {total} {total === 1 ? 'noticia' : 'noticias'} · Página {page} de {totalPages || 1}
      </p>
    </div>
  )
}
