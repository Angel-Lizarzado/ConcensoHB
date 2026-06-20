import { prisma } from '@/lib/prisma'
import GoldLine from '@/components/ui/GoldLine'
import { auth } from '@/lib/auth'

export const revalidate = 0 // siempre dinámica por auth

export default async function CalendarioPage() {
  const session = await auth()
  const isLoggedIn = !!session?.user

  // Fetch eventos. Si no está logueado, excluimos los JUICIOS.
  const where: any = { fecha: { gte: new Date() } }
  if (!isLoggedIn) {
    where.tipo = { not: 'JUICIO' }
  }

  const eventos = await prisma.evento.findMany({
    where,
    orderBy: { fecha: 'asc' },
    take: 50
  })

  // Agrupar por mes/año
  const agrupados = eventos.reduce((acc, ev) => {
    const d = new Date(ev.fecha)
    const key = d.toLocaleString('es', { month: 'long', year: 'numeric' })
    if (!acc[key]) acc[key] = []
    acc[key].push(ev)
    return acc
  }, {} as Record<string, typeof eventos>)

  const TIPO_COLORS: Record<string, string> = {
    JUICIO: 'bg-gold text-surface-offset',
    OFICIAL: 'bg-wireds text-surface-offset',
    REUNION: 'bg-onair text-surface-offset',
    DEFAULT: 'bg-surface-offset border border-border text-text'
  }

  return (
    <div style={{ maxWidth: 'var(--content)', margin: '0 auto', padding: 'var(--space-12) var(--space-6)' }}>
      <div style={{ marginBottom: 'var(--space-10)', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)', opacity: 0.75, marginBottom: 'var(--space-3)' }}>
          Agenda General
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-gold-bright)', marginBottom: 'var(--space-4)' }}>
          Calendario del Concilio
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontStyle: 'italic', color: 'var(--color-text-muted)', maxWidth: '60ch', margin: '0 auto var(--space-4)' }}>
          Próximas actividades, reuniones y eventos oficiales de los ejércitos.
          {!isLoggedIn && " Iniciá sesión para ver las audiencias de juzgado."}
        </p>
        <GoldLine />
      </div>

      {eventos.length === 0 ? (
        <p style={{ fontFamily: 'var(--font-ui)', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 'var(--space-12)' }}>
          No hay actividades programadas próximamente.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
          {Object.entries(agrupados).map(([mesAnio, evs]) => (
            <div key={mesAnio}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-gold)', textTransform: 'capitalize', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
                {mesAnio}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {evs.map(ev => {
                  const colorClass = TIPO_COLORS[ev.tipo] || TIPO_COLORS.DEFAULT
                  const fecha = new Date(ev.fecha)
                  return (
                    <div key={ev.id} className="bg-surface border border-border rounded-xl p-6 flex flex-col md:flex-row gap-6 md:items-center hover:border-gold/30 transition-colors">
                      <div className="flex flex-col items-center justify-center min-w-[80px] border-r border-border pr-6">
                        <span className="font-display text-3xl text-gold font-bold">{fecha.getDate()}</span>
                        <span className="font-ui text-xs text-text-muted uppercase tracking-wider">{fecha.toLocaleString('es', { weekday: 'short' })}</span>
                        <span className="font-ui text-sm text-text font-bold mt-1">{fecha.toLocaleString('es', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <span className={`font-ui text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded ${colorClass}`}>
                            {ev.tipo}
                          </span>
                        </div>
                        <h3 className="font-display text-xl text-text uppercase tracking-wide">{ev.nombre}</h3>
                        <p className="font-ui text-sm text-text-muted">{ev.descripcion}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
