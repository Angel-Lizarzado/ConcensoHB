'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { siglaToSlug } from '@/lib/slugify'
import ComandanteIncidencias from './sections/ComandanteIncidencias'

const TiptapEditor = dynamic(() => import('../reportero/TiptapEditor'), { ssr: false, loading: () => <div style={{ padding: 'var(--space-8)', color: 'var(--color-text-faint)', fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)' }}>Cargando editor…</div> })

const ROL_LABEL: Record<string, string> = { COMANDANTE: 'Comandante', OFICIAL: 'Oficial', EMBAJADOR: 'Embajador', SOLDADO: 'Soldado' }
const ROLES_E = ['COMANDANTE', 'OFICIAL', 'EMBAJADOR', 'SOLDADO']

interface Miembro { id: string; username: string; rolEjercito: string | null; email: string }
interface Ejercito {
  id: string; sigla: string; nombre: string; descripcion: string | null
  descripcionRich: string | null; escudo: string | null; banner: string | null
  puntos: number; activo: boolean; _count: { miembros: number }
  miembros: Miembro[]
  actividades: { id: string; descripcion: string; puntos: number; createdAt: string }[]
}

interface Props { username: string; ejercito: Ejercito | null; rankingActual: number | null }

export default function ComandanteDashboardClient({ username, ejercito, rankingActual }: Props) {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const tab          = (searchParams.get('tab') as 'ficha' | 'miembros' | 'editar' | 'incidencias') ?? 'ficha'
  const setTab       = (t: string) => router.push(`/dashboard/comandante${t !== 'ficha' ? `?tab=${t}` : ''}`, { scroll: false })

  const [desc, setDesc]           = useState(ejercito?.descripcion ?? '')
  const [descRich, setDescRich]   = useState(ejercito?.descripcionRich ?? '')
  const [escudo, setEscudo]       = useState(ejercito?.escudo ?? '')
  const [banner, setBanner]       = useState(ejercito?.banner ?? '')
  const [saving, setSaving]       = useState(false)
  const [msg, setMsg]             = useState<string | null>(null)
  const [rolEdit, setRolEdit]     = useState<Record<string, string>>({})

  if (!ejercito) {
    return (
      <div style={{ padding: 'var(--space-8)' }}>
        <h1 style={h1}>Panel Comandante</h1>
        <p style={muted}>Tu cuenta no tiene un ejército asignado. Contacta al Administrador.</p>
      </div>
    )
  }

  const slug = siglaToSlug(ejercito.sigla)

  const guardarFicha = async () => {
    setSaving(true)
    setMsg(null)
    const res = await fetch(`/api/ejercitos/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ descripcion: desc, descripcionRich: descRich, escudo, banner }),
    })
    setMsg(res.ok ? 'Ficha actualizada' : 'Error al guardar')
    setSaving(false)
  }

  const cambiarRol = async (userId: string, rolEjercito: string) => {
    await fetch('/api/usuarios', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, rolEjercito }),
    })
  }

  return (
    <div style={{ padding: 'var(--space-8)' }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={h1}>Panel Comandante</h1>
        <p style={muted}>Bienvenido, <strong style={{ color: 'var(--color-gold)' }}>{username}</strong></p>
      </div>

      {/* Stats rápidas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-8)', maxWidth: 500 }}>
        {[
          { label: 'Puntos',   value: ejercito.puntos.toLocaleString(), color: 'var(--color-gold)'    },
          { label: 'Miembros', value: ejercito._count.miembros,          color: 'var(--color-wireds)'  },
          { label: 'Ranking',  value: rankingActual ? `#${rankingActual}` : '—', color: 'var(--color-text)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Título de sección — sin tabs duplicados */}
      <div style={{ marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border-gold)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-gold-bright)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {tab === 'ficha' ? 'Mi Ejército' : tab === 'miembros' ? 'Miembros' : tab === 'incidencias' ? '' : 'Editar Ficha'}
        </h2>
      </div>

      {/* Ficha */}
      {tab === 'ficha' && (
        <div>
          <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'flex-start', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
            {ejercito.escudo && <img src={ejercito.escudo} alt="Escudo" style={{ width: 80, height: 80, objectFit: 'contain', border: '1px solid var(--color-border-gold)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-2)' }} />}
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 900, color: 'var(--color-gold)' }}>{ejercito.sigla}</div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-lg)', color: 'var(--color-text)' }}>{ejercito.nombre}</div>
            </div>
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: 'var(--space-6)', maxWidth: '72ch' }}>
            {ejercito.descripcion ?? 'Sin descripción. Editá la ficha para agregar una.'}
          </p>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-4)' }}>
            Últimas Actividades
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {ejercito.actividades.map(a => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>{a.descripcion}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', fontWeight: 700, color: a.puntos >= 0 ? 'var(--color-gold)' : 'var(--color-onair)', whiteSpace: 'nowrap' }}>
                  {a.puntos >= 0 ? '+' : ''}{a.puntos} pts
                </span>
              </div>
            ))}
            {ejercito.actividades.length === 0 && <p style={muted}>Sin actividades registradas.</p>}
          </div>
        </div>
      )}

      {/* Miembros */}
      {tab === 'miembros' && (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {ejercito.miembros.map(m => (
              <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--space-4)', alignItems: 'center', padding: 'var(--space-4) var(--space-5)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
                    {m.username} {m.rolEjercito && <span style={{ color: 'var(--color-gold)', fontWeight: 400, fontSize: 'var(--text-xs)' }}>— {ROL_LABEL[m.rolEjercito]}</span>}
                  </div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>{m.email}</div>
                </div>
                <select
                  value={rolEdit[m.id] ?? m.rolEjercito ?? ''}
                  onChange={async e => { setRolEdit(p => ({ ...p, [m.id]: e.target.value })); await cambiarRol(m.id, e.target.value) }}
                  className="input-gold"
                  style={{ padding: '4px 8px', width: 'auto', fontSize: 11 }}
                >
                  <option value="">Sin rol</option>
                  {ROLES_E.map(r => <option key={r} value={r}>{ROL_LABEL[r]}</option>)}
                </select>
              </div>
            ))}
            {ejercito.miembros.length === 0 && <p style={muted}>No hay miembros con rol asignado aún.</p>}
          </div>
        </div>
      )}

      {/* Editar ficha */}
      {tab === 'editar' && (
        <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={labelStyle}>Descripción corta (portada)</label>
            <textarea className="input-gold" value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="Descripción breve que aparece en la lista de ejércitos…" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={labelStyle}>Descripción completa (ficha pública)</label>
            <TiptapEditor content={descRich} onChange={setDescRich} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={labelStyle}>URL del escudo</label>
            <input className="input-gold" value={escudo} onChange={e => setEscudo(e.target.value)} placeholder="https://…/escudo.png" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={labelStyle}>URL del banner (imagen de portada)</label>
            <input className="input-gold" value={banner} onChange={e => setBanner(e.target.value)} placeholder="https://…/banner.jpg" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <button onClick={guardarFicha} className="btn-primary" disabled={saving} style={{ opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Guardando…' : 'Guardar Ficha'}
            </button>
            {msg && <span style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-gold)' }}>{msg}</span>}
          </div>
        </div>
      )}

      {/* Incidencias */}
      {tab === 'incidencias' && (
        <ComandanteIncidencias ejercitoId={ejercito.id} />
      )}
    </div>
  )
}

const h1: React.CSSProperties      = { fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-gold-bright)', marginBottom: 'var(--space-2)' }
const muted: React.CSSProperties   = { fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }
const labelStyle: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }
