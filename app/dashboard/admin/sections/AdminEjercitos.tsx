'use client'

import { useEffect, useState } from 'react'

interface Ejercito {
  id: string; sigla: string; nombre: string; activo: boolean; puntos: number
  fundador: string
  _count: { miembros: number }
}

export default function AdminEjercitos() {
  const [ejercitos, setEjercitos] = useState<Ejercito[]>([])
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)

  const load = () => {
    setLoading(true)
    fetch('/api/ejercitos?activo=all')
      .then(r => r.json())
      .then(d => setEjercitos(d.data ?? []))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const toggleActivo = async (id: string, activo: boolean, sigla: string) => {
    setSaving(true)
    const slug = sigla.toLowerCase().replace(/\./g, '')
    await fetch(`/api/ejercitos/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: !activo }),
    })
    load()
    setSaving(false)
  }

  const handleDeny = async (id: string, sigla: string) => {
    if (!confirm(`¿Estás seguro de denegar y ELIMINAR el ejército ${sigla}?`)) return
    setSaving(true)
    const slug = sigla.toLowerCase().replace(/\./g, '')
    await fetch(`/api/ejercitos/${slug}`, { method: 'DELETE' })
    load()
    setSaving(false)
  }

  const pendientes = ejercitos.filter(e => !e.activo)
  const registrados = ejercitos.filter(e => e.activo)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Solicitudes Pendientes */}
      <section>
        <h2 style={sectionTitle}>Solicitudes Pendientes / Suspendidos</h2>
        {loading ? <p style={muted}>Cargando…</p> : pendientes.length === 0 ? <p style={muted}>No hay solicitudes pendientes.</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            {pendientes.map(e => (
              <div key={e.id} style={{ background: 'var(--color-surface-offset)', border: '1px solid var(--color-border-gold)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-gold)', textTransform: 'uppercase' }}>{e.nombre}</h3>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', letterSpacing: '0.1em' }}>SIGLA: {e.sigla}</p>
                </div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  Fundador: <strong style={{ color: 'var(--color-text)' }}>{e.fundador}</strong>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'auto' }}>
                  <button onClick={() => toggleActivo(e.id, e.activo, e.sigla)} disabled={saving} style={{ flex: 1, padding: 'var(--space-2)', background: '#4a8a3a', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontWeight: 700, opacity: saving ? 0.6 : 1 }}>
                    ✅ Aprobar
                  </button>
                  <button onClick={() => handleDeny(e.id, e.sigla)} disabled={saving} style={{ flex: 1, padding: 'var(--space-2)', background: 'var(--color-onair)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontFamily: 'var(--font-ui)', fontWeight: 700, opacity: saving ? 0.6 : 1 }}>
                    ❌ Denegar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Lista */}
      <section>
        <h2 style={sectionTitle}>Ejércitos Registrados (Activos)</h2>
        {loading ? <p style={muted}>Cargando…</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border-gold)' }}>
                  {['Sigla', 'Nombre', 'Fundador', 'Miembros', 'Puntos', 'Acción'].map(h => (
                    <th key={h} style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'left', color: 'var(--color-gold)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {registrados.map(e => (
                  <tr key={e.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={td}><span style={{ color: 'var(--color-gold)', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{e.sigla}</span></td>
                    <td style={td}>{e.nombre}</td>
                    <td style={td}>{e.fundador}</td>
                    <td style={td}>{e._count.miembros}</td>
                    <td style={td}>{e.puntos.toLocaleString()}</td>
                    <td style={td}>
                      <button onClick={() => toggleActivo(e.id, e.activo, e.sigla)} disabled={saving} className="btn-secondary" style={{ fontSize: 10, padding: 'var(--space-1) var(--space-3)', opacity: saving ? 0.6 : 1 }}>
                        Suspender
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}

const sectionTitle: React.CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-gold-bright)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 'var(--space-6)' }
const muted: React.CSSProperties        = { fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }
const td: React.CSSProperties           = { padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-muted)', verticalAlign: 'middle' }
