'use client'

import { useEffect, useState } from 'react'

const ESTADOS = ['PENDIENTE', 'EN_PROCESO', 'RESUELTO', 'CERRADO']

interface Mediacion {
  id: string; solicitante: string; ejercito1: string; ejercito2: string
  estado: string; juezId: string | null; createdAt: string
}

export default function AdminMediaciones() {
  const [mediaciones, setMediaciones] = useState<Mediacion[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    fetch('/api/mediaciones').then(r => r.json()).then(d => setMediaciones(d.data ?? [])).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const cambiarEstado = async (id: string, estado: string) => {
    setUpdating(id)
    await fetch(`/api/mediaciones/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    })
    load()
    setUpdating(null)
  }

  const ESTADO_COLOR: Record<string, string> = {
    PENDIENTE:   'var(--color-gold)',
    EN_PROCESO:  'var(--color-wireds)',
    RESUELTO:    '#4a8a3a',
    CERRADO:     'var(--color-text-faint)',
  }

  return (
    <div>
      <h2 style={sectionTitle}>Mediaciones</h2>
      {loading ? <p style={muted}>Cargando…</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {mediaciones.map(m => (
            <div key={m.id} style={{ padding: 'var(--space-5)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-1)' }}>
                    {m.ejercito1} <span style={{ color: 'var(--color-gold)' }}>vs</span> {m.ejercito2}
                  </div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
                    Solicitante: {m.solicitante} · {new Date(m.createdAt).toLocaleDateString('es')}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: 600, color: ESTADO_COLOR[m.estado] ?? 'var(--color-text-muted)' }}>
                    {m.estado}
                  </span>
                  <select
                    value={m.estado}
                    onChange={e => cambiarEstado(m.id, e.target.value)}
                    disabled={updating === m.id}
                    className="input-gold"
                    style={{ padding: '4px 8px', width: 'auto', fontSize: 10 }}
                  >
                    {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
          {mediaciones.length === 0 && <p style={muted}>Sin mediaciones registradas.</p>}
        </div>
      )}
    </div>
  )
}

const sectionTitle: React.CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-gold-bright)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 'var(--space-6)' }
const muted: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }
