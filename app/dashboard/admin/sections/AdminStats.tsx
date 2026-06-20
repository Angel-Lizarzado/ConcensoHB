'use client'

import { useEffect, useState } from 'react'

interface Stats {
  ejercitos: number
  usuarios: number
  noticias: number
  mediaciones: number
  mediacionesPendientes: number
  incidencias: number
}

export default function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // En producción con DB, estos vendrán de /api/admin/stats
    // Por ahora usamos endpoints existentes para componer
    Promise.all([
      fetch('/api/ejercitos').then(r => r.json()),
      fetch('/api/noticias?limit=1').then(r => r.json()),
      fetch('/api/mediaciones').then(r => r.json()),
    ]).then(([ejs, nots, meds]) => {
      setStats({
        ejercitos:             ejs.data?.length   ?? 0,
        usuarios:              0,
        noticias:              nots.meta?.total   ?? 0,
        mediaciones:           meds.data?.length  ?? 0,
        mediacionesPendientes: meds.data?.filter((m: any) => m.estado === 'PENDIENTE').length ?? 0,
        incidencias:           0,
      })
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h2 className="font-display text-lg font-bold text-gold-bright tracking-wider uppercase mb-6">
        Resumen General
      </h2>
      {loading ? (
        <p className="font-ui text-sm text-text-muted animate-pulse">Cargando estadísticas…</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          
          {/* Bento Grid Item 1: Mediaciones Pendientes (Destacado) */}
          <div className="md:col-span-2 bg-surface border border-border rounded-lg p-6 hover:-translate-y-1 hover:border-onair hover:shadow-lg transition-all duration-300 relative overflow-hidden"
               style={{ borderTop: '3px solid var(--color-onair)' }}>
            {/* Glow sutil en el fondo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-onair opacity-5 blur-3xl rounded-full"></div>
            
            <div className="font-display text-3xl font-black text-onair leading-none relative z-10">
              {stats?.mediacionesPendientes ?? '—'}
            </div>
            <div className="font-ui text-xs text-text-muted mt-2 tracking-widest uppercase relative z-10">
              Mediaciones Pendientes
            </div>
            <div className="font-ui text-xs text-text-faint mt-4 max-w-[80%] relative z-10">
              Requieren atención inmediata por parte de los Jueces.
            </div>
          </div>

          {/* Bento Grid Item 2: Ejércitos */}
          <div className="bg-surface border border-border rounded-lg p-6 hover:-translate-y-1 hover:border-border-gold hover:shadow-gold transition-all duration-300"
               style={{ borderTop: '3px solid var(--color-gold)' }}>
            <div className="font-display text-2xl font-black text-gold leading-none">
              {stats?.ejercitos ?? '—'}
            </div>
            <div className="font-ui text-xs text-text-muted mt-2 tracking-widest uppercase">
              Ejércitos Activos
            </div>
          </div>

          {/* Bento Grid Item 3: Noticias */}
          <div className="bg-surface border border-border rounded-lg p-6 hover:-translate-y-1 hover:border-wireds/50 hover:shadow-lg transition-all duration-300"
               style={{ borderTop: '3px solid var(--color-wireds)' }}>
            <div className="font-display text-2xl font-black text-wireds leading-none">
              {stats?.noticias ?? '—'}
            </div>
            <div className="font-ui text-xs text-text-muted mt-2 tracking-widest uppercase">
              Noticias
            </div>
          </div>

          {/* Bento Grid Item 4: Mediaciones Totales */}
          <div className="md:col-span-4 bg-surface border border-border rounded-lg p-6 hover:-translate-y-1 hover:border-border-gold hover:shadow-lg transition-all duration-300 flex items-center justify-between"
               style={{ borderTop: '3px solid var(--color-text)' }}>
            <div>
              <div className="font-display text-2xl font-black text-text leading-none">
                {stats?.mediaciones ?? '—'}
              </div>
              <div className="font-ui text-xs text-text-muted mt-2 tracking-widest uppercase">
                Mediaciones Históricas
              </div>
            </div>
            <div className="hidden sm:block font-ui text-xs text-text-faint max-w-sm text-right">
              Historial completo de intervenciones realizadas por el Concilio para mantener la paz.
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
