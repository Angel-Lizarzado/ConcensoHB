'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import LogoCGE from '@/components/ui/LogoCGE'

type Paso = 'formulario' | 'exito'

export default function RegistroEjercitoPage() {
  const router = useRouter()
  const [paso, setPaso] = useState<Paso>('formulario')
  const [form, setForm] = useState({ username: '', password: '', confirmar: '', nombreEjercito: '', sigla: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (form.password !== form.confirmar) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if (form.sigla.length > 5) {
      setError('La sigla no puede exceder 5 caracteres')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/registro/ejercito', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password,
          nombreEjercito: form.nombreEjercito.trim(),
          sigla: form.sigla.trim().toUpperCase(),
        }),
      })

      const data = await res.json()
      if (!res.ok) { setError(data.error); return }

      // Auto-login después del registro
      const loginResult = await signIn('credentials', {
        username: form.username.trim(),
        password: form.password,
        redirect: false,
      })

      if (loginResult?.ok) {
        setPaso('exito')
        setTimeout(() => router.push('/dashboard'), 3000)
      } else {
        setPaso('exito')
      }
    } catch {
      setError('Error de conexión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const f = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }))

  if (paso === 'exito') {
    return (
      <div style={centerWrap}>
        <div style={card}>
          <div style={{ textAlign: 'center' }}>
            <LogoCGE size={56} />
            <div style={{ fontSize: '2rem', margin: 'var(--space-5) 0 var(--space-3)' }}>✅</div>
            <h1 style={titleStyle}>¡Solicitud Enviada!</h1>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', lineHeight: 1.6, marginTop: 'var(--space-4)' }}>
              Tu ejército ha sido registrado y está pendiente de aprobación por el Concilio General. 
            </p>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', fontStyle: 'italic', marginTop: 'var(--space-3)' }}>
              Redirigiendo al panel…
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={centerWrap}>
      <div style={card}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
          <LogoCGE size={52} />
          <h1 style={{ ...titleStyle, marginTop: 'var(--space-4)' }}>Fundar Ejército</h1>
          <p style={subtitle}>Registra un nuevo ejército en el CGE</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', padding: 'var(--space-4)', border: '1px dashed var(--color-border-gold)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-gold)' }}>Datos del Ejército</h3>
            <Field id="nombreEjercito" label="Nombre Completo" type="text" value={form.nombreEjercito} onChange={f('nombreEjercito')} placeholder="Nombre completo de la institución" />
            <Field id="sigla" label="Sigla Oficial" type="text" value={form.sigla} onChange={f('sigla')} placeholder="Siglas (Máx 5 letras)" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--color-surface-offset)', borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text)' }}>Datos del Fundador</h3>
            <Field id="username" label="Nombre de usuario" type="text"     value={form.username}  onChange={f('username')}  placeholder="Tu alias en Habbo" autoComplete="username" />
            <Field id="password" label="Contraseña"         type="password" value={form.password}  onChange={f('password')}  placeholder="Mínimo 8 caracteres" autoComplete="new-password" />
            <Field id="confirmar" label="Confirmar contraseña" type="password" value={form.confirmar} onChange={f('confirmar')} placeholder="Repetí tu contraseña"  autoComplete="new-password" />
          </div>

          {error && (
            <p role="alert" style={errorStyle}>{error}</p>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', opacity: loading ? 0.6 : 1, marginTop: 'var(--space-2)' }}
          >
            {loading ? 'Enviando solicitud…' : 'Enviar Solicitud al Concilio'}
          </button>

          <p style={{ textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
            ¿Eres miembro de un ejército ya creado?{' '}
            <Link href="/registro" style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>
              Usa tu código aquí
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

function Field({ id, label, type, value, onChange, placeholder, autoComplete }: {
  id: string; label: string; type: string; value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string; autoComplete?: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <label htmlFor={id} style={labelStyle}>{label}</label>
      <input id={id} type={type} value={value} onChange={onChange}
        placeholder={placeholder} autoComplete={autoComplete}
        required className="input-gold" style={{ textTransform: id === 'sigla' ? 'uppercase' : 'none' }} />
    </div>
  )
}

const centerWrap: React.CSSProperties = {
  minHeight: '100vh', display: 'flex', alignItems: 'center',
  justifyContent: 'center', padding: 'var(--space-6)',
  background: 'var(--color-bg)',
}
const card: React.CSSProperties = {
  width: '100%', maxWidth: 440,
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border-gold)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-10)',
}
const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)',
  fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
  color: 'var(--color-gold-bright)', textAlign: 'center',
}
const subtitle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)',
  color: 'var(--color-text-muted)', marginTop: 'var(--space-2)',
  letterSpacing: '0.1em', textTransform: 'uppercase',
}
const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: 500,
  letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)',
}
const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)',
  color: 'var(--color-onair)', background: 'oklch(0.4 0.1 0 / 0.15)',
  border: '1px solid oklch(0.4 0.1 0 / 0.3)', borderRadius: 'var(--radius-md)',
  padding: 'var(--space-3) var(--space-4)',
}
