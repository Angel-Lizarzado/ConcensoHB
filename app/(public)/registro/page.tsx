'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import LogoCGE from '@/components/ui/LogoCGE'

type Paso = 'formulario' | 'exito'

export default function RegistroPage() {
  const router   = useRouter()
  const [paso, setPaso]       = useState<Paso>('formulario')
  const [form, setForm]       = useState({ username: '', email: '', password: '', confirmar: '', codigo: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [codigoInfo, setCodigoInfo] = useState<string | null>(null)

  // Validar código en tiempo real (debounce manual)
  const validarCodigo = async (val: string) => {
    if (val.length < 4) { setCodigoInfo(null); return }
    // Solo una indicación visual — la validación real la hace la API
    setCodigoInfo('Verificando…')
    try {
      const res = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: '_check_', email: '_check_@x.com', password: '00000000', codigo: val }),
      })
      const data = await res.json()
      if (data.error?.includes('código')) {
        setCodigoInfo(`❌ ${data.error}`)
      } else if (data.error?.includes('usuario') || data.error?.includes('email')) {
        setCodigoInfo('✅ Código válido')
      } else {
        setCodigoInfo(null)
      }
    } catch {
      setCodigoInfo(null)
    }
  }

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

    setLoading(true)
    try {
      const res = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username.trim(),
          email:    form.email.trim(),
          password: form.password,
          codigo:   form.codigo.trim().toUpperCase() || undefined,
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
        setTimeout(() => router.push('/dashboard'), 2000)
      } else {
        setPaso('exito') // registro OK, login falló — mostrar éxito igual
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
            <h1 style={titleStyle}>¡Bienvenido!</h1>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', fontStyle: 'italic', marginTop: 'var(--space-3)' }}>
              Tu cuenta fue creada. Redirigiendo al panel…
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={centerWrap}>
      <div style={card}>
        {/* Logo + título */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
          <LogoCGE size={52} />
          <h1 style={{ ...titleStyle, marginTop: 'var(--space-4)' }}>Crear Cuenta</h1>
          <p style={subtitle}>Concilio General de Ejércitos</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

          {/* Código de invitación */}
          <div style={{ background: 'var(--color-gold-highlight)', border: '1px solid var(--color-border-gold)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)' }}>
            <label style={labelStyle} htmlFor="codigo">
              Código de invitación
            </label>
            <input
              id="codigo"
              type="text"
              value={form.codigo}
              onChange={e => { f('codigo')(e); validarCodigo(e.target.value) }}
              placeholder="CGE-FAM-XXXX (opcional si el registro está abierto)"
              className="input-gold"
              style={{ marginTop: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}
              autoComplete="off"
            />
            {codigoInfo && (
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-2)', color: codigoInfo.startsWith('✅') ? '#4a8a3a' : 'var(--color-onair)' }}>
                {codigoInfo}
              </p>
            )}
          </div>

          <Field id="username" label="Nombre de usuario" type="text"     value={form.username}  onChange={f('username')}  placeholder="Tu alias en Habbo" autoComplete="username" />
          <Field id="email"    label="Email"              type="email"    value={form.email}     onChange={f('email')}     placeholder="tu@email.com"      autoComplete="email" />
          <Field id="password" label="Contraseña"         type="password" value={form.password}  onChange={f('password')}  placeholder="Mínimo 8 caracteres" autoComplete="new-password" />
          <Field id="confirmar" label="Confirmar contraseña" type="password" value={form.confirmar} onChange={f('confirmar')} placeholder="Repetí tu contraseña"  autoComplete="new-password" />

          {error && (
            <p role="alert" style={errorStyle}>{error}</p>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>

          <p style={{ textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" style={{ color: 'var(--color-gold)', textDecoration: 'none' }}>
              Iniciar sesión
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
        required className="input-gold" />
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
