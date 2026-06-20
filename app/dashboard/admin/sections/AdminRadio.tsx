'use client'

import { useEffect, useState } from 'react'

interface RadioConfig {
  enabled: boolean; streamUrl: string; radioName: string
  djName: string; djAvatarUrl: string; currentTrack: string
}

export default function AdminRadio() {
  const [form, setForm]     = useState<RadioConfig>({ enabled: false, streamUrl: '', radioName: 'CGE Radio', djName: 'DJ', djAvatarUrl: '', currentTrack: 'En vivo' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [msg, setMsg]         = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/radio').then(r => r.json()).then(d => { if (d) setForm({ enabled: d.enabled, streamUrl: d.streamUrl, radioName: d.radioName, djName: d.djName, djAvatarUrl: d.djAvatarUrl, currentTrack: d.currentTrack }) }).finally(() => setLoading(false))
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg(null)
    const res = await fetch('/api/radio', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setMsg(res.ok ? 'Configuración guardada' : 'Error al guardar')
    setSaving(false)
  }

  const f = (key: keyof RadioConfig) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  return (
    <div>
      <h2 style={sectionTitle}>Configuración de Radio</h2>
      {loading ? <p style={muted}>Cargando…</p> : (
        <form onSubmit={handleSave} style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Toggle ON/OFF */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', cursor: 'pointer' }}>
            <div style={{
              position: 'relative', width: 44, height: 24,
              background: form.enabled ? 'var(--color-gold)' : 'var(--color-surface-offset)',
              borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border-gold)',
              transition: 'background var(--transition)', flexShrink: 0,
            }}>
              <input type="checkbox" checked={form.enabled} onChange={f('enabled')} style={{ opacity: 0, position: 'absolute', width: '100%', height: '100%', cursor: 'pointer', margin: 0 }} />
              <span style={{
                position: 'absolute', top: 2, left: form.enabled ? 22 : 2,
                width: 18, height: 18, borderRadius: '50%',
                background: form.enabled ? 'var(--color-text-inverse)' : 'var(--color-text-faint)',
                transition: 'left var(--transition)',
              }} />
            </div>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)', fontWeight: 600, color: form.enabled ? 'var(--color-gold)' : 'var(--color-text-muted)' }}>
              Radio {form.enabled ? 'ACTIVA' : 'INACTIVA'}
            </span>
          </label>

          {[
            { key: 'streamUrl',    label: 'URL del stream',       placeholder: 'https://stream.example.com/radio' },
            { key: 'radioName',    label: 'Nombre de la radio',   placeholder: 'CGE Radio'                        },
            { key: 'djName',       label: 'Nombre del DJ',        placeholder: 'DJ Keko'                         },
            { key: 'djAvatarUrl',  label: 'Nombre de Habbo del DJ', placeholder: 'ej. Mitsukai'   },
            { key: 'currentTrack', label: 'Track actual',         placeholder: 'En vivo'                         },
          ].map(field => (
            <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label style={labelStyle}>{field.label}</label>
              <input className="input-gold" value={(form as any)[field.key]} onChange={f(field.key as keyof RadioConfig)} placeholder={field.placeholder} />
            </div>
          ))}

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <button type="submit" className="btn-primary" disabled={saving} style={{ opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Guardando…' : 'Guardar Configuración'}
            </button>
            {msg && <span style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-gold)' }}>{msg}</span>}
          </div>
        </form>
      )}
    </div>
  )
}

const sectionTitle: React.CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-gold-bright)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 'var(--space-6)' }
const labelStyle: React.CSSProperties   = { fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }
const muted: React.CSSProperties        = { fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }
