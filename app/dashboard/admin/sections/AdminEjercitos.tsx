'use client'

import { useEffect, useState } from 'react'

interface Ejercito {
  id: string; sigla: string; nombre: string; activo: boolean; puntos: number
  _count: { miembros: number }
}

export default function AdminEjercitos() {
  const [ejercitos, setEjercitos] = useState<Ejercito[]>([])
  const [loading, setLoading]     = useState(true)
  const [form, setForm] = useState({ sigla: '', nombre: '', fundador: '', descripcion: '' })
  const [saving, setSaving]       = useState(false)
  const [msg, setMsg]             = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    fetch('/api/ejercitos?activo=all')
      .then(r => r.json())
      .then(d => setEjercitos(d.data ?? []))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const toggleActivo = async (id: string, activo: boolean, sigla: string) => {
    const slug = sigla.toLowerCase().replace(/\./g, '')
    await fetch(`/api/ejercitos/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: !activo }),
    })
    load()
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
    const res = await fetch('/api/ejercitos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) { setMsg('Ejército creado'); setForm({ sigla: '', nombre: '', fundador: '', descripcion: '' }); load() }
    else { const d = await res.json(); setMsg(d.error) }
    setSaving(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Crear ejército */}
      <section>
        <h2 style={sectionTitle}>Nuevo Ejército</h2>
        <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', maxWidth: 600 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={labelStyle}>Sigla</label>
            <input className="input-gold" value={form.sigla} onChange={e => setForm(p => ({ ...p, sigla: e.target.value }))} placeholder="F.A.M" required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={labelStyle}>Nombre</label>
            <input className="input-gold" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Fuerza Armada Mexicana" required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={labelStyle}>Fundador</label>
            <input className="input-gold" value={form.fundador} onChange={e => setForm(p => ({ ...p, fundador: e.target.value }))} placeholder="Username del fundador" required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={labelStyle}>Descripción</label>
            <input className="input-gold" value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} placeholder="Breve descripción" />
          </div>
          <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <button type="submit" className="btn-primary" disabled={saving} style={{ opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Creando…' : 'Crear Ejército'}
            </button>
            {msg && <span style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-gold)' }}>{msg}</span>}
          </div>
        </form>
      </section>

      {/* Lista */}
      <section>
        <h2 style={sectionTitle}>Ejércitos Registrados</h2>
        {loading ? <p style={muted}>Cargando…</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border-gold)' }}>
                  {['Sigla', 'Nombre', 'Miembros', 'Puntos', 'Estado', 'Acción'].map(h => (
                    <th key={h} style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'left', color: 'var(--color-gold)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ejercitos.map(e => (
                  <tr key={e.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={td}><span style={{ color: 'var(--color-gold)', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{e.sigla}</span></td>
                    <td style={td}>{e.nombre}</td>
                    <td style={td}>{e._count.miembros}</td>
                    <td style={td}>{e.puntos.toLocaleString()}</td>
                    <td style={td}>
                      <span style={{ color: e.activo ? '#4a8a3a' : 'var(--color-text-faint)', fontWeight: 600 }}>
                        {e.activo ? 'Activo' : 'Suspendido'}
                      </span>
                    </td>
                    <td style={td}>
                      <button
                        onClick={() => toggleActivo(e.id, e.activo, e.sigla)}
                        className="btn-secondary"
                        style={{ fontSize: 10, padding: 'var(--space-1) var(--space-3)' }}
                      >
                        {e.activo ? 'Suspender' : 'Activar'}
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
const labelStyle: React.CSSProperties   = { fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }
const muted: React.CSSProperties        = { fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }
const td: React.CSSProperties           = { padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-muted)', verticalAlign: 'middle' }
