'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import GoldLine from '@/components/ui/GoldLine'

const TiptapEditor = dynamic(() => import('@/app/dashboard/reportero/TiptapEditor'), { ssr: false, loading: () => <div style={{ padding: 'var(--space-6)', color: 'var(--color-text-faint)', fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)' }}>Cargando editor…</div> })

interface Sesion { userId: string; username: string; role: string; ejercitoId: string | null }
interface Ejercito { id: string; sigla: string; nombre: string }
interface Incidencia {
  id: string; titulo: string; estado: string; createdAt: string
  ejercitoDenunciante: { sigla: string; nombre?: string }
  ejercitoDenunciado:  { sigla: string; nombre?: string }
  juez?: { username: string } | null
  _count: { pruebas: number }
}

interface Props {
  sesion:               Sesion
  incidenciasIniciales: Incidencia[]
  ejercitos:            Ejercito[]
  puedeCrear:           boolean
}

const ESTADO_COLOR: Record<string, string> = {
  ABIERTA:      'var(--color-gold)',
  EN_REVISION:  'var(--color-wireds)',
  EN_PROCESO:   'var(--color-noticias)',
  RESUELTA:     '#4a8a3a',
  DESESTIMADA:  'var(--color-text-faint)',
}

const ESTADO_LABEL: Record<string, string> = {
  ABIERTA:      'Abierta — en revisión por el Concilio',
  EN_REVISION:  'En revisión por un Juez',
  EN_PROCESO:   'En proceso — ambas partes notificadas',
  RESUELTA:     'Resuelta',
  DESESTIMADA:  'Desestimada',
}

type Vista = 'lista' | 'nueva' | 'detalle'

export default function IncidenciasClient({ sesion, incidenciasIniciales, ejercitos, puedeCrear }: Props) {
  const [incidencias, setIncidencias] = useState(incidenciasIniciales)
  const [vista, setVista]             = useState<Vista>('lista')
  const [seleccionada, setSeleccionada] = useState<any>(null)
  const [form, setForm]               = useState({ titulo: '', descripcion: '', ejercitoDenunciadoId: '' })
  const [pruebas, setPruebas]         = useState<{ tipo: string; valor: string; descripcion: string }[]>([])
  const [saving, setSaving]           = useState(false)
  const [msg, setMsg]                 = useState<string | null>(null)
  const [comentario, setComentario]   = useState('')
  const [resolucion, setResolucion]   = useState('')

  const esJuezAdmin = sesion.role === 'ADMIN' || sesion.role === 'JUEZ'

  const reload = async () => {
    const r = await fetch('/api/incidencias')
    const d = await r.json()
    setIncidencias(d.data ?? [])
  }

  const verDetalle = async (id: string) => {
    const r = await fetch(`/api/incidencias/${id}`)
    if (r.ok) { setSeleccionada(await r.json()); setVista('detalle') }
  }

  const crearIncidencia = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setMsg(null)
    const res = await fetch('/api/incidencias', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setMsg(data.error); setSaving(false); return }

    // Subir pruebas si hay
    for (const p of pruebas.filter(p => p.valor.trim())) {
      await fetch(`/api/incidencias/${data.id}/pruebas`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(p),
      })
    }

    setMsg('Incidencia registrada. El Concilio la revisará en privado.')
    setForm({ titulo: '', descripcion: '', ejercitoDenunciadoId: '' })
    setPruebas([])
    reload()
    setSaving(false)
    setTimeout(() => setVista('lista'), 2000)
  }

  const agregarPrueba = () => setPruebas(p => [...p, { tipo: 'url', valor: '', descripcion: '' }])
  const editarPrueba  = (i: number, key: string, val: string) =>
    setPruebas(prev => prev.map((p, idx) => idx === i ? { ...p, [key]: val } : p))

  const enviarComentario = async () => {
    if (!comentario.trim() || !seleccionada) return
    await fetch(`/api/incidencias/${seleccionada.id}/comentarios`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contenido: comentario }),
    })
    setComentario('')
    verDetalle(seleccionada.id)
  }

  const resolverIncidencia = async () => {
    if (!resolucion.trim() || !seleccionada) return
    setSaving(true)
    const res = await fetch(`/api/incidencias/${seleccionada.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'RESUELTA', resolucion, juezId: sesion.userId }),
    })
    if (res.ok) { setMsg('Incidencia resuelta. Se generó noticia en Juzgado.'); reload(); setVista('lista') }
    setSaving(false)
  }

  const cambiarEstado = async (estado: string) => {
    if (!seleccionada) return
    await fetch(`/api/incidencias/${seleccionada.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado, juezId: estado === 'EN_REVISION' ? sesion.userId : undefined }),
    })
    reload(); verDetalle(seleccionada.id)
  }

  // ==================== RENDER ====================

  if (vista === 'detalle' && seleccionada) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--space-10) var(--space-6)' }}>
        <button onClick={() => setVista('lista')} className="btn-secondary" style={{ fontSize: 11, padding: '6px 14px', marginBottom: 'var(--space-6)' }}>
          ← Volver
        </button>

        {/* Cabecera */}
        <div style={{ background: 'var(--color-surface)', border: `1px solid ${ESTADO_COLOR[seleccionada.estado]}`, borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-gold-bright)', marginBottom: 'var(--space-2)' }}>
                {seleccionada.titulo}
              </h1>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
                <strong style={{ color: 'var(--color-gold)' }}>{seleccionada.ejercitoDenunciante?.sigla}</strong>
                {' '}<span style={{ color: 'var(--color-text-muted)' }}>denunció a</span>{' '}
                <strong style={{ color: 'var(--color-noticias)' }}>{seleccionada.ejercitoDenunciado?.sigla}</strong>
                {' · '}{new Date(seleccionada.createdAt).toLocaleDateString('es')}
              </p>
            </div>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: 700, color: ESTADO_COLOR[seleccionada.estado], background: 'var(--color-surface-offset)', border: `1px solid ${ESTADO_COLOR[seleccionada.estado]}`, borderRadius: 'var(--radius-sm)', padding: '4px 10px' }}>
              {seleccionada.estado}
            </span>
          </div>
          <p style={{ marginTop: 'var(--space-4)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
            {seleccionada.descripcion}
          </p>
        </div>

        {/* Pruebas */}
        {seleccionada.pruebas?.length > 0 && (
          <section style={{ marginBottom: 'var(--space-6)' }}>
            <h2 style={sectionTitle}>Pruebas ({seleccionada.pruebas.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {seleccionada.pruebas.map((p: any) => (
                <div key={p.id} style={{ padding: 'var(--space-4)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-2)' }}>
                    {p.tipo}
                  </div>
                  {p.tipo === 'imagen' || p.tipo === 'url' ? (
                    <a href={p.valor} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-gold)', fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', wordBreak: 'break-all' }}>
                      {p.valor}
                    </a>
                  ) : (
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>{p.valor}</p>
                  )}
                  {p.descripcion && <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginTop: 'var(--space-2)' }}>{p.descripcion}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Comentarios internos (solo JUEZ/ADMIN) */}
        {esJuezAdmin && (
          <section style={{ marginBottom: 'var(--space-6)' }}>
            <h2 style={sectionTitle}>Notas internas del Juzgado</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              {seleccionada.comentariosInternos?.map((c: any) => (
                <div key={c.id} style={{ padding: 'var(--space-4)', background: 'var(--color-surface-offset)', border: '1px solid var(--color-border-gold)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-gold)', marginBottom: 'var(--space-2)' }}>
                    {c.autor.username} · {new Date(c.createdAt).toLocaleString('es')}
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>{c.contenido}</p>
                </div>
              ))}
              {seleccionada.comentariosInternos?.length === 0 && <p style={muted}>Sin notas internas.</p>}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <input
                className="input-gold" value={comentario}
                onChange={e => setComentario(e.target.value)}
                placeholder="Agregar nota interna…"
                style={{ flex: 1 }}
              />
              <button onClick={enviarComentario} className="btn-primary" disabled={!comentario.trim()} style={{ opacity: !comentario.trim() ? 0.5 : 1 }}>
                Enviar
              </button>
            </div>
          </section>
        )}

        {/* Cambiar estado (JUEZ/ADMIN) */}
        {esJuezAdmin && seleccionada.estado !== 'RESUELTA' && seleccionada.estado !== 'DESESTIMADA' && (
          <section style={{ marginBottom: 'var(--space-6)' }}>
            <h2 style={sectionTitle}>Gestionar estado</h2>
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              {seleccionada.estado === 'ABIERTA' && (
                <button onClick={() => cambiarEstado('EN_REVISION')} className="btn-primary" style={{ fontSize: 12 }}>
                  Tomar caso
                </button>
              )}
              {seleccionada.estado === 'EN_REVISION' && (
                <button onClick={() => cambiarEstado('EN_PROCESO')} className="btn-primary" style={{ fontSize: 12 }}>
                  Notificar al denunciado
                </button>
              )}
              <button onClick={() => cambiarEstado('DESESTIMADA')} className="btn-secondary" style={{ fontSize: 12 }}>
                Desestimar
              </button>
            </div>
          </section>
        )}

        {/* Resolución (JUEZ/ADMIN, caso EN_PROCESO) */}
        {esJuezAdmin && seleccionada.estado === 'EN_PROCESO' && (
          <section>
            <h2 style={sectionTitle}>Resolución oficial</h2>
            <p style={{ ...muted, marginBottom: 'var(--space-4)' }}>Al publicar, se generará automáticamente una noticia en el Juzgado.</p>
            <TiptapEditor content={resolucion} onChange={setResolucion} placeholder="Escribe la resolución oficial…" />
            {msg && <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-gold)', marginTop: 'var(--space-3)' }}>{msg}</p>}
            <button
              onClick={resolverIncidencia} className="btn-primary"
              disabled={!resolucion.trim() || saving}
              style={{ marginTop: 'var(--space-5)', opacity: (!resolucion.trim() || saving) ? 0.5 : 1 }}
            >
              {saving ? 'Publicando…' : 'Publicar resolución'}
            </button>
          </section>
        )}
      </div>
    )
  }

  if (vista === 'nueva') {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: 'var(--space-10) var(--space-6)' }}>
        <button onClick={() => setVista('lista')} className="btn-secondary" style={{ fontSize: 11, padding: '6px 14px', marginBottom: 'var(--space-6)' }}>
          ← Volver
        </button>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 900, color: 'var(--color-gold-bright)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
          Nueva Incidencia
        </h1>
        <p style={{ ...muted, marginBottom: 'var(--space-6)', fontStyle: 'italic' }}>
          Esta denuncia es confidencial. El ejército denunciado no será notificado hasta que los jueces del Concilio decidan actuar.
        </p>
        <GoldLine style={{ marginBottom: 'var(--space-8)' }} />

        <form onSubmit={crearIncidencia} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <Field label="Título" value={form.titulo} onChange={v => setForm(p => ({ ...p, titulo: v }))} placeholder="Título descriptivo del conflicto" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={labelStyle}>Ejército denunciado</label>
            <select className="input-gold" value={form.ejercitoDenunciadoId} onChange={e => setForm(p => ({ ...p, ejercitoDenunciadoId: e.target.value }))} required>
              <option value="">Seleccionar ejército…</option>
              {ejercitos.filter(e => e.id !== sesion.ejercitoId).map(e => (
                <option key={e.id} value={e.id}>{e.sigla} — {e.nombre}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={labelStyle}>Descripción del conflicto</label>
            <textarea className="input-gold" value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} rows={5} required placeholder="Describe los hechos con detalle. Incluye fechas, situaciones y cualquier contexto relevante." style={{ resize: 'vertical' }} />
          </div>

          {/* Pruebas */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <label style={labelStyle}>Pruebas (capturas, URLs, texto)</label>
              <button type="button" onClick={agregarPrueba} className="btn-secondary" style={{ fontSize: 10, padding: '4px 10px' }}>+ Agregar</button>
            </div>
            {pruebas.map((p, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                <select className="input-gold" value={p.tipo} onChange={e => editarPrueba(i, 'tipo', e.target.value)} style={{ padding: '6px 8px' }}>
                  <option value="url">URL</option>
                  <option value="imagen">Imagen</option>
                  <option value="texto">Texto</option>
                </select>
                <input className="input-gold" value={p.valor} onChange={e => editarPrueba(i, 'valor', e.target.value)} placeholder="URL o contenido" />
                <input className="input-gold" value={p.descripcion} onChange={e => editarPrueba(i, 'descripcion', e.target.value)} placeholder="Descripción (opcional)" />
              </div>
            ))}
          </div>

          {msg && <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: msg.includes('registrada') ? '#4a8a3a' : 'var(--color-onair)' }}>{msg}</p>}
          <button type="submit" className="btn-primary" disabled={saving} style={{ opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Enviando…' : 'Registrar incidencia'}
          </button>
        </form>
      </div>
    )
  }

  // Lista
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 'var(--space-10) var(--space-6)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)', opacity: 0.75, marginBottom: 'var(--space-2)' }}>
            Sistema judicial
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 900, color: 'var(--color-gold-bright)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Incidencias
          </h1>
        </div>
        {puedeCrear && (
          <button onClick={() => setVista('nueva')} className="btn-primary">
            + Nueva incidencia
          </button>
        )}
      </div>
      <GoldLine style={{ marginBottom: 'var(--space-8)' }} />

      {incidencias.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-16) 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>⚖️</div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
            No hay incidencias registradas.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {incidencias.map(inc => (
            <button
              key={inc.id}
              onClick={() => verDetalle(inc.id)}
              style={{
                display: 'grid', gridTemplateColumns: '8px 1fr auto',
                alignItems: 'center', gap: 'var(--space-5)',
                padding: 'var(--space-5)', textAlign: 'left',
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                transition: 'border-color var(--transition), box-shadow var(--transition)',
              }}
              className="incidencia-row"
            >
              {/* Barra de estado */}
              <span style={{ display: 'block', height: '100%', background: ESTADO_COLOR[inc.estado], borderRadius: 2 }} />
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-1)' }}>
                  {inc.titulo}
                </div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                  <span><strong style={{ color: 'var(--color-gold)' }}>{inc.ejercitoDenunciante.sigla}</strong> vs <strong style={{ color: 'var(--color-noticias)' }}>{inc.ejercitoDenunciado.sigla}</strong></span>
                  <span>{new Date(inc.createdAt).toLocaleDateString('es')}</span>
                  <span>{inc._count.pruebas} pruebas</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 600, color: ESTADO_COLOR[inc.estado], background: 'var(--color-surface-offset)', border: `1px solid ${ESTADO_COLOR[inc.estado]}`, borderRadius: 'var(--radius-sm)', padding: '2px 8px', whiteSpace: 'nowrap' }}>
                  {inc.estado}
                </span>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--color-text-faint)', marginTop: 4 }}>
                  {ESTADO_LABEL[inc.estado]}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <label style={labelStyle}>{label}</label>
      <input className="input-gold" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required />
    </div>
  )
}

const sectionTitle: React.CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-gold)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }
const labelStyle:   React.CSSProperties = { fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }
const muted:        React.CSSProperties = { fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }
