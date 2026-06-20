'use client'

// /mediacion — Formulario público de solicitud de mediación
import { useState } from 'react'
import GoldLine from '@/components/ui/GoldLine'

type Estado = 'idle' | 'loading' | 'success' | 'error'

export default function MediacionPage() {
  const [form, setForm] = useState({ solicitante: '', ejercito1: '', ejercito2: '', descripcion: '' })
  const [estado, setEstado] = useState<Estado>('idle')
  const [error, setError]   = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEstado('loading')
    setError(null)

    try {
      const res = await fetch('/api/mediaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Error al enviar la solicitud')
      }

      setEstado('success')
      setForm({ solicitante: '', ejercito1: '', ejercito2: '', descripcion: '' })
    } catch (err: any) {
      setEstado('error')
      setError(err.message)
    }
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: 'var(--space-12) var(--space-6)' }}>
      <div style={{ marginBottom: 'var(--space-10)' }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)', opacity: 0.75, marginBottom: 'var(--space-3)' }}>
          Solicitud formal
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-gold-bright)', marginBottom: 'var(--space-4)' }}>
          Mediación
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontStyle: 'italic', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
          Solicite la intervención del Concilio para resolver conflictos entre ejércitos de manera neutral y transparente.
        </p>
        <GoldLine />
      </div>

      {estado === 'success' ? (
        <div style={{
          background: 'oklch(0.4 0.08 155 / 0.1)',
          border: '1px solid oklch(0.5 0.1 155 / 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-8)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: 'var(--space-4)' }}>⚖️</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-gold)', marginBottom: 'var(--space-3)' }}>
            Solicitud recibida
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            El Concilio revisará su solicitud y tomará acción en la brevedad.
          </p>
          <button
            onClick={() => setEstado('idle')}
            className="btn-secondary"
            style={{ marginTop: 'var(--space-6)' }}
          >
            Nueva solicitud
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <Field label="Nombre del solicitante" name="solicitante" value={form.solicitante} onChange={handleChange} placeholder="Tu nombre o alias en Habbo" required />
          <Field label="Ejército 1" name="ejercito1" value={form.ejercito1} onChange={handleChange} placeholder="Nombre o sigla del primer ejército" required />
          <Field label="Ejército 2" name="ejercito2" value={form.ejercito2} onChange={handleChange} placeholder="Nombre o sigla del segundo ejército" required />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={labelStyle} htmlFor="descripcion">Descripción del conflicto</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              required
              rows={6}
              placeholder="Describe detalladamente el conflicto y los hechos relevantes..."
              className="input-gold"
              style={{ resize: 'vertical', minHeight: 120 }}
            />
          </div>

          {error && (
            <p role="alert" style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-onair)', background: 'oklch(0.4 0.1 0 / 0.15)', border: '1px solid oklch(0.4 0.1 0 / 0.3)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={estado === 'loading'}
            className="btn-primary"
            style={{ opacity: estado === 'loading' ? 0.6 : 1 }}
          >
            {estado === 'loading' ? 'Enviando…' : 'Enviar Solicitud'}
          </button>
        </form>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: 500,
  letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)',
}

function Field({ label, name, value, onChange, placeholder, required }: {
  label: string; name: string; value: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
  placeholder?: string; required?: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <label htmlFor={name} style={labelStyle}>{label}</label>
      <input
        id={name} name={name} value={value} onChange={onChange}
        placeholder={placeholder} required={required}
        className="input-gold"
      />
    </div>
  )
}
