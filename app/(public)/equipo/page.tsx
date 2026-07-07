import { prisma } from '@/lib/prisma'
import { habboAvatarFull } from '@/lib/habbo'
import Image from 'next/image'

export const metadata = {
  title: 'Equipo | Concilio General de Ejércitos',
  description: 'Conoce a los administradores y personal del Concilio General de Ejércitos, su misión y trayectoria.',
}

export default async function EquipoPage() {
  const equipo = await prisma.user.findMany({
    where: { 
      role: { in: ['ADMIN', 'REPORTERO', 'JUEZ'] } 
    },
    select: { id: true, username: true, role: true, mision: true, biografia: true },
    orderBy: { createdAt: 'asc' } // O el orden que prefieran
  })

  const ROL_LABELS: Record<string, string> = {
    ADMIN: 'Administración',
    REPORTERO: 'Prensa / Reportero',
    JUEZ: 'Juez / Juzgado',
  }

  return (
    <div className="min-h-screen bg-bg pt-12 pb-24 px-6 relative">
        {/* Glow de fondo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] pointer-events-none opacity-[0.15]"
             style={{ background: 'radial-gradient(circle, var(--color-gold) 0%, transparent 70%)', filter: 'blur(100px)' }} />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h1 className="font-display text-4xl md:text-5xl font-black text-gold-bright uppercase tracking-wider mb-4 drop-shadow-md">
              Nuestro Equipo
            </h1>
            <p className="font-ui text-text-muted max-w-2xl mx-auto text-lg leading-relaxed">
              La transparencia es fundamental para el Concilio. Conoce a los líderes detrás de la organización, sus roles y misiones oficiales para garantizar la imparcialidad y el buen funcionamiento de la comunidad.
            </p>
          </div>

          <div className="flex flex-col gap-12">
            {equipo.map((miembro, index) => (
              <div 
                key={miembro.id} 
                className="group relative bg-surface border border-border-gold rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:border-gold hover:shadow-gold/10"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Columna de Avatar */}
                  <div className="md:w-64 shrink-0 bg-surface-offset flex flex-col items-center pt-8 border-b md:border-b-0 md:border-r border-border-gold relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gold/5 pointer-events-none" />
                    
                    <div className="relative z-10 w-32 h-44 mb-2 drop-shadow-xl transition-transform duration-300 group-hover:scale-105">
                      <Image
                        src={habboAvatarFull(miembro.username)}
                        alt={`Avatar de ${miembro.username}`}
                        fill
                        className="object-cover object-top [image-rendering:pixelated]"
                        unoptimized
                      />
                    </div>
                    
                    <div className="text-center w-full bg-surface-2 py-4 mt-auto border-t border-border z-10">
                      <h2 className="font-display text-2xl font-bold text-text mb-1 drop-shadow-sm">{miembro.username}</h2>
                      <div className="font-ui text-[10px] uppercase tracking-[0.2em] text-gold/80 bg-gold/10 inline-block px-3 py-1 rounded-sm border border-gold/30">
                        {ROL_LABELS[miembro.role] || miembro.role}
                      </div>
                    </div>
                  </div>

                  {/* Columna de Información */}
                  <div className="flex-1 p-8 md:p-10 flex flex-col">
                    <div className="mb-6 pb-6 border-b border-border">
                      <h3 className="font-ui text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Misión Oficial</h3>
                      <p className="font-display text-xl md:text-2xl text-gold-bright leading-tight font-medium">
                        {miembro.mision || 'Agente de Paz'}
                      </p>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-ui text-xs font-bold uppercase tracking-widest text-text-muted mb-4">Registro Público (CV)</h3>
                      <div className="font-body text-text/90 leading-relaxed space-y-4 whitespace-pre-wrap">
                        {miembro.biografia ? (
                          miembro.biografia
                        ) : (
                          <span className="italic text-text-faint">Sin registro público disponible por el momento.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {equipo.length === 0 && (
              <div className="text-center p-12 border border-border-gold rounded-xl bg-surface">
                <p className="font-ui text-text-muted">Aún no hay perfiles de equipo cargados.</p>
              </div>
            )}
          </div>
      </div>
    </div>
  )
}
