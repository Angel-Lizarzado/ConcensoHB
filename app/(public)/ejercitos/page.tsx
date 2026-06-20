// /ejercitos — Lista completa de ejércitos con info y descripción
import { prisma } from '@/lib/prisma'
import EjercitoCard from '@/components/ejercitos/EjercitoCard'
import GoldLine from '@/components/ui/GoldLine'

export const revalidate = 60

export default async function EjercitosPage() {
  const ejercitos = await prisma.ejercito.findMany({
    where: { activo: true },
    orderBy: { puntos: 'desc' },
    select: {
      id: true, sigla: true, nombre: true, descripcion: true,
      escudo: true, banner: true, puntos: true, ranking: true,
      _count: { select: { miembros: true } },
    },
  })

  return (
    <div style={{ maxWidth: 'var(--content-wide)', margin: '0 auto', padding: 'var(--space-12) var(--space-6)' }}>
      <div style={{ marginBottom: 'var(--space-10)' }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)', opacity: 0.75, marginBottom: 'var(--space-3)' }}>
          Comunidad militar
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-gold-bright)', marginBottom: 'var(--space-4)' }}>
          Ejércitos Afiliados
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontStyle: 'italic', color: 'var(--color-text-muted)', maxWidth: '60ch', marginBottom: 'var(--space-4)' }}>
          Todas las fuerzas militares activas afiliadas al Concilio General de Ejércitos.
        </p>
        <GoldLine />
      </div>

      {ejercitos.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'var(--space-6)',
        }}>
          {ejercitos.map((e, i) => (
            <EjercitoCard key={e.id} ejercito={e} posicion={i + 1} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xl)', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
            No hay ejércitos afiliados aún.
          </p>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)', color: 'var(--color-text-faint)', marginTop: 'var(--space-4)' }}>
            Sé el primero en afiliarte al Concilio.
          </p>
        </div>
      )}
    </div>
  )
}
