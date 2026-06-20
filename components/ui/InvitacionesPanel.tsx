'use client'

import { useEffect, useState } from 'react'

interface Codigo {
  id: string; codigo: string; usosActuales: number; usoMaximo: number
  activo: boolean; expiresAt: string | null; createdAt: string
  ejercito: { sigla: string; nombre: string } | null
  _count: { usuarios: number }
}

interface InvitacionesPanelProps {
  /** Si se pasa, se usa como ejercitoId al crear (para COMANDANTE) */
  ejercitoId?: string | null
  /** Si es true, muestra el campo ejercitoId (para ADMIN) */
  esAdmin?: boolean
}

export default function InvitacionesPanel({ ejercitoId, esAdmin = false }: InvitacionesPanelProps) {
  const [codigos, setCodigos]   = useState<Codigo[]>([])
  const [loading, setLoading]   = useState(true)
  const [creating, setCreating] = useState(false)
  const [msg, setMsg]           = useState<string | null>(null)
  const [copied, setCopied]     = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    fetch('/api/invitaciones').then(r => r.json()).then(d => setCodigos(d.data ?? [])).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const crear = async () => {
    setCreating(true)
    setMsg(null)
    const res = await fetch('/api/invitaciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ejercitoId: ejercitoId ?? undefined }),
    })
    const data = await res.json()
    if (res.ok) { setMsg(`Código creado: ${data.codigo}`); load() }
    else setMsg(data.error)
    setCreating(false)
  }

  const copiar = (codigo: string) => {
    navigator.clipboard.writeText(codigo)
    setCopied(codigo)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        <button onClick={crear} className="btn-primary" disabled={creating} style={{ opacity: creating ? 0.6 : 1 }}>
          {creating ? 'Generando…' : '+ Generar código'}
        </button>
        {msg && <span style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-gold)' }}>{msg}</span>}
      </div>

      {loading ? (
        <p style={muted}>Cargando…</p>
      ) : codigos.length === 0 ? (
        <p style={muted}>No hay códigos generados aún.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {codigos.map(c => (
            <div key={c.id} style={{
              display: 'grid', gridTemplateColumns: 'auto 1fr auto',
              gap: 'var(--space-5)', alignItems: 'center',
              padding: 'var(--space-4) var(--space-5)',
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              opacity: c.activo ? 1 : 0.5,
            }}>
              {/* Código */}
              <div style={{
                fontFamily: 'monospace', fontSize: 'var(--text-sm)', fontWeight: 700,
                color: 'var(--color-gold)', letterSpacing: '0.15em',
                background: 'var(--color-gold-highlight)', padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border-gold)',
              }}>
                {c.codigo}
              </div>

              {/* Info */}
              <div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>
                  {c.usosActuales} / {c.usoMaximo} usos
                  {c.ejercito && <span style={{ color: 'var(--color-text-faint)', marginLeft: 'var(--space-3)' }}>· {c.ejercito.sigla}</span>}
                </div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginTop: 2 }}>
                  Creado {new Date(c.createdAt).toLocaleDateString('es')}
                  {c.expiresAt && ` · Expira ${new Date(c.expiresAt).toLocaleDateString('es')}`}
                  {!c.activo && ' · Inactivo'}
                </div>
              </div>

              {/* Acciones */}
              <button
                onClick={() => copiar(c.codigo)}
                style={{
                  fontFamily: 'var(--font-ui)', fontSize: 10, padding: '4px 12px',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
                  color: copied === c.codigo ? '#4a8a3a' : 'var(--color-text-muted)',
                  background: 'transparent', cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'color var(--transition)',
                }}
              >
                {copied === c.codigo ? '✓ Copiado' : 'Copiar'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const muted: React.CSSProperties = { fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }
