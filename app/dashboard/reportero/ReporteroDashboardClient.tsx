'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import DeptBadge, { type DeptKey } from '@/components/ui/DeptBadge'

// Tiptap cargado dinámicamente sin SSR — usa APIs de browser
const TiptapEditor = dynamic(() => import('./TiptapEditor'), { ssr: false, loading: () => (
  <div style={{ background: 'var(--color-surface-offset)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-8)', color: 'var(--color-text-faint)', fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)', textAlign: 'center' }}>
    Cargando editor…
  </div>
)})

interface Noticia {
  id: string; titulo: string; slug: string; departamento: string; publicada: boolean; createdAt: string | Date
}

interface Props {
  username: string
  departamento: string | null
  noticias: Noticia[]
}

type Vista = 'lista' | 'nueva'

export default function ReporteroDashboardClient({ username, departamento, noticias: initialNoticias }: Props) {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const vistaParam   = searchParams.get('vista')
  const [vistaLocal, setVistaLocal] = useState<Vista>((vistaParam as Vista) ?? 'lista')
  const vista = vistaLocal

  const setVista = (v: Vista) => {
    setVistaLocal(v)
    router.push(v === 'nueva' ? '/dashboard/reportero?vista=nueva' : '/dashboard/reportero', { scroll: false })
  }
  const [noticias, setNoticias] = useState(initialNoticias)
  const [form, setForm]       = useState({ titulo: '', extracto: '', contenido: '', imagenUrl: '', destacada: false })
  const [saving, setSaving]   = useState(false)
  const [msg, setMsg]         = useState<string | null>(null)
  const [filtro, setFiltro]   = useState<'todos' | 'borrador' | 'publicada'>('todos')

  const filtradas = filtro === 'todos' ? noticias : noticias.filter(n => filtro === 'publicada' ? n.publicada : !n.publicada)

  const reload = () => {
    fetch(`/api/noticias?autorId=${username}&limit=50`).then(r => r.json()).then(d => setNoticias(d.data ?? []))
  }

  const handleSave = async (publicar: boolean) => {
    setSaving(true)
    setMsg(null)
    const res = await fetch('/api/noticias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, departamento, publicada: publicar }),
    })
    if (res.ok) {
      setMsg(publicar ? 'Noticia publicada' : 'Borrador guardado')
      setForm({ titulo: '', extracto: '', contenido: '', imagenUrl: '', destacada: false })
      setVista('lista')
      reload()
    } else {
      const d = await res.json()
      setMsg(d.error)
    }
    setSaving(false)
  }

  const togglePublicar = async (slug: string, publicada: boolean) => {
    await fetch(`/api/noticias/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicada: !publicada }),
    })
    reload()
  }

  const eliminar = async (slug: string) => {
    if (!confirm('¿Eliminar esta noticia?')) return
    await fetch(`/api/noticias/${slug}`, { method: 'DELETE' })
    reload()
  }

  return (
    <div style={{ padding: 'var(--space-8)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-gold-bright)' }}>
            Panel Reportero
          </h1>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)', display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <span>Bienvenido, <strong style={{ color: 'var(--color-gold)' }}>{username}</strong></span>
            {departamento && <DeptBadge dept={departamento as DeptKey} size="sm" />}
          </div>
        </div>
        <button
          onClick={() => setVista(vista === 'lista' ? 'nueva' : 'lista')}
          className={vista === 'nueva' ? 'btn-secondary' : 'btn-primary'}
        >
          {vista === 'nueva' ? '← Mis noticias' : '+ Nueva Noticia'}
        </button>
      </div>

      {vista === 'lista' ? (
        <>
          {/* Filtros */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
            {[['todos', 'Todas'], ['borrador', 'Borrador'], ['publicada', 'Publicadas']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFiltro(key as any)}
                style={{
                  fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: filtro === key ? 700 : 400,
                  padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-md)',
                  border: `1px solid ${filtro === key ? 'var(--color-border-gold)' : 'var(--color-border)'}`,
                  background: filtro === key ? 'var(--color-gold-highlight)' : 'transparent',
                  color: filtro === key ? 'var(--color-gold)' : 'var(--color-text-muted)',
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Lista de noticias */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {filtradas.length > 0 ? filtradas.map(n => (
              <div key={n.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--space-4)', alignItems: 'center', padding: 'var(--space-4) var(--space-5)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                <div>
                  <DeptBadge dept={n.departamento as DeptKey} size="sm" />
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', margin: 'var(--space-1) 0' }}>{n.titulo}</div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
                    {new Date(n.createdAt).toLocaleDateString('es')} · {n.publicada ? <span style={{ color: '#4a8a3a' }}>Publicada</span> : <span style={{ color: 'var(--color-gold)' }}>Borrador</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <Link href={`/noticias/${n.slug}`} className="btn-secondary" style={{ fontSize: 10, padding: '4px 10px' }} target="_blank">Ver</Link>
                  <button onClick={() => togglePublicar(n.slug, n.publicada)} className="btn-secondary" style={{ fontSize: 10, padding: '4px 10px' }}>
                    {n.publicada ? 'Despublicar' : 'Publicar'}
                  </button>
                  <button onClick={() => eliminar(n.slug)} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-onair)', color: 'var(--color-onair)', background: 'transparent', cursor: 'pointer' }}>
                    Eliminar
                  </button>
                </div>
              </div>
            )) : (
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-8) 0' }}>
                No hay noticias en esta categoría.
              </p>
            )}
          </div>
        </>
      ) : (
        // Formulario nueva noticia
        <div style={{ maxWidth: 720 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-gold-bright)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 'var(--space-6)' }}>
            Nueva Noticia {departamento && <span style={{ fontSize: '0.7em', color: 'var(--color-text-muted)' }}>— {departamento}</span>}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <Field label="Título" value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} placeholder="Título de la noticia" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={labelStyle}>Extracto (resumen para la portada)</label>
              <textarea className="input-gold" value={form.extracto} onChange={e => setForm(p => ({ ...p, extracto: e.target.value }))} rows={3} placeholder="Breve resumen visible en el feed…" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={labelStyle}>Contenido</label>
              <TiptapEditor content={form.contenido} onChange={html => setForm(p => ({ ...p, contenido: html }))} />
            </div>
            <Field label="URL de imagen (opcional)" value={form.imagenUrl} onChange={e => setForm(p => ({ ...p, imagenUrl: e.target.value }))} placeholder="https://…/imagen.jpg" />
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.destacada} onChange={e => setForm(p => ({ ...p, destacada: e.target.checked }))} />
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Marcar como destacada (portada)</span>
            </label>
            {msg && <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: msg.includes('Error') || msg.includes('Solo') ? 'var(--color-onair)' : 'var(--color-gold)' }}>{msg}</p>}
            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              <button onClick={() => handleSave(false)} className="btn-secondary" disabled={saving}>
                {saving ? '…' : 'Guardar Borrador'}
              </button>
              <button onClick={() => handleSave(true)} className="btn-primary" disabled={saving}>
                {saving ? '…' : 'Publicar Noticia'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <label style={labelStyle}>{label}</label>
      <input className="input-gold" value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  )
}

const labelStyle: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }
