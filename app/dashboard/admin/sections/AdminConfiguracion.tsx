'use client'

import { useEffect, useState } from 'react'

export default function AdminConfiguracion() {
  const [form, setForm] = useState({
    siteName: '', siteSubtitle: '', siteSlogan: '', siteDescription: '',
    footerText: '', foundedYear: 2026, primaryColor: '#C9A84C',
    colorNoticias: '#d46b8a', colorWireds: '#5bb8d4',
    colorJuzgado: '#C9A84C', colorOficial: '#7A5C18',
    registroAbierto: false, maxEmbajadoresPorCodigo: 1,
    faviconUrl: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [msg, setMsg]         = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/site-config').then(r => r.json()).then(d => {
      if (d) setForm({
        siteName:    d.siteName    ?? '', siteSubtitle: d.siteSubtitle ?? '',
        siteSlogan:  d.siteSlogan  ?? '', siteDescription: d.siteDescription ?? '',
        footerText:  d.footerText  ?? '', foundedYear: d.foundedYear ?? 2026,
        primaryColor: d.primaryColor ?? '#C9A84C',
        colorNoticias: d.colorNoticias ?? '#d46b8a',
        colorWireds:   d.colorWireds   ?? '#5bb8d4',
        colorJuzgado:  d.colorJuzgado  ?? '#C9A84C',
        colorOficial:  d.colorOficial  ?? '#7A5C18',
        registroAbierto: d.registroAbierto ?? false,
        maxEmbajadoresPorCodigo: d.maxEmbajadoresPorCodigo ?? 1,
        faviconUrl: d.faviconUrl ?? '',
      })
    }).finally(() => setLoading(false))
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
    const res = await fetch('/api/site-config', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setMsg(res.ok ? 'Configuración guardada' : 'Error al guardar')
    setSaving(false)
  }

  const txt  = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [key]: e.target.value }))
  const num  = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [key]: parseInt(e.target.value) || 0 }))
  const bool = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [key]: e.target.checked }))

  return (
    <div>
      <h2 style={sectionTitle}>Configuración del Sitio</h2>
      {loading ? <p style={muted}>Cargando…</p> : (
        <form onSubmit={handleSave} style={{ maxWidth: 640 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

            {/* Identidad */}
            <fieldset style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <legend style={{ ...labelStyle, padding: '0 var(--space-2)', color: 'var(--color-gold)' }}>Identidad del sitio</legend>
              <Field label="Nombre del sitio"  value={form.siteName}        onChange={txt('siteName')}    placeholder="Concilio General de Ejércitos" />
              <Field label="Subtítulo"         value={form.siteSubtitle}    onChange={txt('siteSubtitle')} placeholder="Organismo Conciliador · Habbo.es" />
              <Field label="Lema"              value={form.siteSlogan}      onChange={txt('siteSlogan')}  placeholder="⚔ UNIDAD · HONOR · ORDEN ⚔" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <label style={labelStyle}>Descripción (meta SEO)</label>
                <textarea className="input-gold" value={form.siteDescription} onChange={txt('siteDescription')} rows={3} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <label style={labelStyle}>Texto del footer</label>
                <textarea className="input-gold" value={form.footerText} onChange={txt('footerText')} rows={2} />
              </div>
              <Field label="Año de fundación" value={String(form.foundedYear)} onChange={(e) => setForm(p => ({ ...p, foundedYear: parseInt(e.target.value) || 2026 }))} type="number" />
              <Field label="URL del favicon"  value={form.faviconUrl}   onChange={txt('faviconUrl')}   placeholder="https://…/favicon.ico" />
            </fieldset>

            {/* Colores */}
            <fieldset style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
              <legend style={{ ...labelStyle, padding: '0 var(--space-2)', color: 'var(--color-gold)' }}>Colores de departamento</legend>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                {[
                  { key: 'colorNoticias', label: 'Noticias' },
                  { key: 'colorWireds',   label: 'Wireds'   },
                  { key: 'colorJuzgado',  label: 'Juzgado'  },
                  { key: 'colorOficial',  label: 'Oficial'  },
                ].map(({ key, label }) => (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <label style={labelStyle}>{label}</label>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                      <input type="color" value={(form as any)[key]} onChange={txt(key)} style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', cursor: 'pointer', background: 'none', padding: 2 }} />
                      <input className="input-gold" value={(form as any)[key]} onChange={txt(key)} style={{ fontFamily: 'monospace', flex: 1 }} />
                      <div style={{ width: 24, height: 24, borderRadius: 'var(--radius-sm)', background: (form as any)[key], border: '1px solid var(--color-border)', flexShrink: 0 }} />
                    </div>
                  </div>
                ))}
              </div>
            </fieldset>

            {/* Registro */}
            <fieldset style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
              <legend style={{ ...labelStyle, padding: '0 var(--space-2)', color: 'var(--color-gold)' }}>Control de registro</legend>
              <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.registroAbierto} onChange={bool('registroAbierto')} />
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    Registro abierto (sin código de invitación)
                  </span>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  <label style={labelStyle}>Máx. embajadores por código</label>
                  <input type="number" min={1} className="input-gold" value={form.maxEmbajadoresPorCodigo} onChange={num('maxEmbajadoresPorCodigo')} style={{ maxWidth: 120 }} />
                </div>
              </div>
            </fieldset>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <button type="submit" className="btn-primary" disabled={saving} style={{ opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Guardando…' : 'Guardar Configuración'}
              </button>
              {msg && <span style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-gold)' }}>{msg}</span>}
            </div>
          </div>
        </form>
      )}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <label style={labelStyle}>{label}</label>
      <input type={type} className="input-gold" value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  )
}

const sectionTitle: React.CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-gold-bright)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 'var(--space-6)' }
const labelStyle: React.CSSProperties   = { fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }
const muted: React.CSSProperties        = { fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }
