'use client'

import { useEffect, useState } from 'react'

interface Actividad {
  id: string; descripcion: string; puntos: number; createdAt: string
  ejercito: { sigla: string; nombre: string }
  evento: { nombre: string } | null
}
interface Ejercito { id: string; sigla: string; nombre: string }
interface Evento   { id: string; nombre: string; puntos: number }

export default function AdminActividades() {
  const [actividades, setActividades] = useState<Actividad[]>([])
  const [ejercitos,   setEjercitos]   = useState<Ejercito[]>([])
  const [eventos,     setEventos]     = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm]   = useState({ ejercitoId: '', eventoId: '', descripcion: '', puntos: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]     = useState<string | null>(null)

  const load = () => {
    Promise.all([
      fetch('/api/actividades').then(r => r.json()),
      fetch('/api/ejercitos').then(r => r.json()),
      fetch('/api/eventos').then(r => r.json()),
    ]).then(([acts, ejs, evs]) => {
      setActividades(acts.data ?? [])
      setEjercitos(ejs.data   ?? [])
      setEventos(evs.data     ?? [])
    }).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
    const res = await fetch('/api/actividades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) { setMsg('Actividad registrada'); setForm({ ejercitoId: '', eventoId: '', descripcion: '', puntos: '' }); load() }
    else { const d = await res.json(); setMsg(d.error) }
    setSaving(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <section>
        <h2 style={sectionTitle}>Registrar Actividad / Puntos</h2>
        <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', maxWidth: 600 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={labelStyle}>Ejército</label>
            <select className="input-gold" value={form.ejercitoId} onChange={e => setForm(p => ({ ...p, ejercitoId: e.target.value }))} required>
              <option value="">Seleccionar…</option>
              {ejercitos.map(e => <option key={e.id} value={e.id}>{e.sigla} — {e.nombre}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={labelStyle}>Evento (opcional)</label>
            <select className="input-gold" value={form.eventoId} onChange={e => setForm(p => ({ ...p, eventoId: e.target.value }))}>
              <option value="">Sin evento asociado</option>
              {eventos.map(e => <option key={e.id} value={e.id}>{e.nombre} (+{e.puntos} pts)</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Descripción</label>
            <input className="input-gold" value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} placeholder="Ej: Participación en torneo, Premio primer lugar" required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={labelStyle}>Puntos (negativo para penalizar)</label>
            <input className="input-gold" type="number" value={form.puntos} onChange={e => setForm(p => ({ ...p, puntos: e.target.value }))} placeholder="100" required />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-4)' }}>
            <button type="submit" className="btn-primary" disabled={saving} style={{ opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Registrando…' : 'Registrar'}
            </button>
            {msg && <span style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-gold)' }}>{msg}</span>}
          </div>
        </form>
      </section>

      <section>
        <h2 style={sectionTitle}>Historial de Actividades</h2>
        {loading ? <p style={muted}>Cargando…</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {actividades.map(a => (
              <div key={a.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 'var(--space-5)', alignItems: 'center', padding: 'var(--space-4) var(--space-5)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-gold)' }}>
                  {a.ejercito.sigla}
                </span>
                <div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>{a.descripcion}</div>
                  {a.evento && <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>Evento: {a.evento.nombre}</div>}
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-base)', color: a.puntos >= 0 ? 'var(--color-gold)' : 'var(--color-onair)', whiteSpace: 'nowrap' }}>
                  {a.puntos >= 0 ? '+' : ''}{a.puntos} pts
                </span>
              </div>
            ))}
            {actividades.length === 0 && <p style={muted}>Sin actividades registradas aún.</p>}
          </div>
        )}
      </section>
    </div>
  )
}

const sectionTitle: React.CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-gold-bright)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 'var(--space-6)' }
const labelStyle: React.CSSProperties   = { fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }
const muted: React.CSSProperties        = { fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }
