'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const TiptapEditor = dynamic(() => import('../reportero/TiptapEditor'), { ssr: false, loading: () => <div style={{ padding: 'var(--space-8)', color: 'var(--color-text-faint)', fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)' }}>Cargando editor…</div> })

interface Mediacion {
  id: string; solicitante: string; ejercito1: string; ejercito2: string
  estado: string; descripcion: string; resolucion: string | null; juezId: string | null; createdAt: string
}

interface Props {
  username: string; userId: string
  pendientes: Mediacion[]; misCasos: Mediacion[]
}

const ESTADO_COLOR: Record<string, string> = {
  PENDIENTE:   'var(--color-gold)',
  EN_PROCESO:  'var(--color-wireds)',
  RESUELTO:    '#4a8a3a',
  CERRADO:     'var(--color-text-faint)',
  EN_REVISION: 'var(--color-noticias)',
}

export default function JuezDashboardClient({ username, userId, pendientes, misCasos }: Props) {
  const [tab, setTab]             = useState<'pendientes' | 'miscasos'>('pendientes')
  const [casoActivo, setCasoActivo] = useState<Mediacion | null>(null)
  const [resolucion, setResolucion] = useState('')
  const [saving, setSaving]       = useState(false)
  const [msg, setMsg]             = useState<string | null>(null)
  const [listPendientes, setListPendientes] = useState(pendientes)
  const [listMisCasos, setListMisCasos]     = useState(misCasos)

  const reload = async () => {
    const [p, m] = await Promise.all([
      fetch('/api/mediaciones').then(r => r.json()),
      fetch('/api/mediaciones').then(r => r.json()),
    ])
    setListPendientes((p.data ?? []).filter((m: Mediacion) => m.estado === 'PENDIENTE'))
    setListMisCasos((m.data ?? []).filter((m: Mediacion) => m.juezId === userId))
  }

  const tomarCaso = async (id: string) => {
    await fetch(`/api/mediaciones/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'EN_REVISION', juezId: userId }),
    })
    reload()
  }

  const publicarResolucion = async () => {
    if (!casoActivo || !resolucion.trim()) return
    setSaving(true)
    setMsg(null)
    const res = await fetch(`/api/mediaciones/${casoActivo.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'RESUELTO', resolucion, juezId: userId }),
    })
    if (res.ok) {
      setMsg('Resolución publicada. Se generó una noticia en Juzgado automáticamente.')
      setCasoActivo(null)
      setResolucion('')
      reload()
    } else {
      const d = await res.json()
      setMsg(d.error)
    }
    setSaving(false)
  }

  const lista = tab === 'pendientes' ? listPendientes : listMisCasos

  return (
    <div style={{ padding: 'var(--space-8)' }}>
      <div style={{ marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border-gold)' }}>
        <h1 style={h1}>
          {tab === 'pendientes' ? `Casos Pendientes (${listPendientes.length})` : `Mis Casos (${listMisCasos.length})`}
        </h1>
        <p style={muted}>Panel Juez · <strong style={{ color: 'var(--color-gold)' }}>{username}</strong></p>
      </div>

      {/* Selector de vista — compacto, sin tabs grandes */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
        {[['pendientes', 'Pendientes'], ['miscasos', 'Mis Casos']].map(([key, label]) => (
          <button key={key} onClick={() => { setTab(key as any); setCasoActivo(null) }} style={{
            fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: tab === key ? 700 : 400,
            padding: 'var(--space-2) var(--space-4)',
            borderRadius: 'var(--radius-md)',
            background: tab === key ? 'var(--color-gold-highlight)' : 'transparent',
            color: tab === key ? 'var(--color-gold)' : 'var(--color-text-muted)',
            border: `1px solid ${tab === key ? 'var(--color-border-gold)' : 'var(--color-border)'}`,
            cursor: 'pointer', transition: 'all var(--transition)',
          }}>{label}</button>
        ))}
      </div>

      {/* Lista de casos */}
      {!casoActivo ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {lista.map(m => (
            <div key={m.id} style={{ padding: 'var(--space-5)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 'var(--space-1)' }}>
                    {m.ejercito1} <span style={{ color: 'var(--color-gold)' }}>vs</span> {m.ejercito2}
                  </div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginBottom: 'var(--space-3)' }}>
                    Solicitante: {m.solicitante} · {new Date(m.createdAt).toLocaleDateString('es')}
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                    {m.descripcion.length > 200 ? m.descripcion.slice(0, 200) + '…' : m.descripcion}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', alignItems: 'flex-end' }}>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: 600, color: ESTADO_COLOR[m.estado] ?? 'var(--color-text-muted)' }}>
                    {m.estado}
                  </span>
                  {m.estado === 'PENDIENTE' && (
                    <button onClick={() => tomarCaso(m.id)} className="btn-primary" style={{ fontSize: 11, padding: '6px 14px' }}>
                      Tomar Caso
                    </button>
                  )}
                  {(m.estado === 'EN_REVISION' || m.estado === 'EN_PROCESO') && m.juezId === userId && (
                    <button onClick={() => { setCasoActivo(m); setResolucion(m.resolucion ?? '') }} className="btn-primary" style={{ fontSize: 11, padding: '6px 14px' }}>
                      Escribir Resolución
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {lista.length === 0 && <p style={muted}>No hay casos en esta categoría.</p>}
        </div>
      ) : (
        // Editor de resolución
        <div style={{ maxWidth: 720 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <button onClick={() => setCasoActivo(null)} className="btn-secondary" style={{ fontSize: 11, padding: '6px 12px' }}>
              ← Volver
            </button>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-gold-bright)' }}>
                {casoActivo.ejercito1} vs {casoActivo.ejercito2}
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
                Caso en revisión
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-3)' }}>
              Descripción del caso
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', lineHeight: 1.65 }}>
              {casoActivo.descripcion}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <label style={labelStyle}>Resolución oficial</label>
            <TiptapEditor content={resolucion} onChange={setResolucion} placeholder="Escribe la resolución oficial del caso…" />
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
              ℹ Al publicar, esta resolución se generará automáticamente como noticia en el Juzgado.
            </p>
            {msg && <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-gold)' }}>{msg}</p>}
            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <button onClick={publicarResolucion} className="btn-primary" disabled={saving || !resolucion.trim()} style={{ opacity: (!resolucion.trim() || saving) ? 0.5 : 1 }}>
                {saving ? 'Publicando…' : 'Publicar Resolución'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const h1: React.CSSProperties      = { fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-gold-bright)', marginBottom: 'var(--space-2)' }
const muted: React.CSSProperties   = { fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }
const labelStyle: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }
