'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

// =============================================
// Tipos
// =============================================
interface Autor {
  id: string; username: string; role: string
  rolEjercito: string | null
  ejercito: { sigla: string } | null
}
interface Mensaje {
  id: string; contenido: string; fijado: boolean
  createdAt: string; autor: Autor
}
interface Canal { id: string; nombre: string; descripcion: string | null }
interface Sesion { userId: string; username: string; role: string; ejercitoId?: string }

interface Props {
  canal:             Canal
  mensajesIniciales: Mensaje[]
  fijados:           Mensaje[]
  sesion:            Sesion
}

// Badge visual del autor
function AutorBadge({ autor, esPropio }: { autor: Autor; esPropio: boolean }) {
  const color =
    autor.role === 'ADMIN'     ? 'var(--color-gold)'      :
    autor.role === 'JUEZ'      ? 'var(--color-juzgado)'   :
    autor.role === 'REPORTERO' ? 'var(--color-noticias)'  :
    autor.ejercito             ? 'var(--color-wireds)'    :
    'var(--color-text-muted)'

  return (
    <span style={{
      fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: 700,
      color, letterSpacing: '0.05em',
    }}>
      {autor.username}
      {autor.ejercito && (
        <span style={{ fontWeight: 400, color: 'var(--color-text-faint)', marginLeft: 4 }}>
          — {autor.ejercito.sigla}
        </span>
      )}
      {autor.role === 'ADMIN' && (
        <span style={{ marginLeft: 6, fontSize: 9, background: 'var(--color-gold-highlight)', border: '1px solid var(--color-border-gold)', borderRadius: 3, padding: '1px 4px', color: 'var(--color-gold)' }}>
          ADMIN
        </span>
      )}
    </span>
  )
}

export default function ChatClient({ canal, mensajesIniciales, fijados, sesion }: Props) {
  const [mensajes, setMensajes] = useState<Mensaje[]>(mensajesIniciales)
  const [input, setInput]       = useState('')
  const [enviando, setEnviando] = useState(false)
  const [conectado, setConectado] = useState(false)
  const bottomRef   = useRef<HTMLDivElement>(null)
  const inputRef    = useRef<HTMLTextAreaElement>(null)
  const esAdmin     = sesion.role === 'ADMIN'
  const esJuez      = sesion.role === 'JUEZ'

  // Scroll al último mensaje
  const scrollBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollBottom() }, [mensajes, scrollBottom])

  // SSE — suscripción al stream del canal
  useEffect(() => {
    const es = new EventSource(`/api/chat/${canal.id}/stream`)

    es.onopen    = () => setConectado(true)
    es.onerror   = () => setConectado(false)
    es.onmessage = (e) => {
      try {
        const nuevo: Mensaje = JSON.parse(e.data)
        setMensajes(prev => {
          // Evitar duplicados si ya lo tenemos por optimistic update
          if (prev.some(m => m.id === nuevo.id)) return prev
          return [...prev, nuevo]
        })
      } catch {}
    }

    return () => es.close()
  }, [canal.id])

  const enviar = async () => {
    const texto = input.trim()
    if (!texto || enviando) return

    setInput('')
    setEnviando(true)

    // Optimistic update
    const optimista: Mensaje = {
      id:        `temp-${Date.now()}`,
      contenido: texto,
      fijado:    false,
      createdAt: new Date().toISOString(),
      autor: {
        id:          sesion.userId,
        username:    sesion.username,
        role:        sesion.role,
        rolEjercito: null,
        ejercito:    null,
      },
    }
    setMensajes(prev => [...prev, optimista])

    try {
      await fetch(`/api/chat/${canal.id}/messages`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ contenido: texto }),
      })
    } catch {
      // Revertir optimistic update en error
      setMensajes(prev => prev.filter(m => m.id !== optimista.id))
      setInput(texto)
    } finally {
      setEnviando(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviar()
    }
  }

  const eliminar = async (id: string) => {
    await fetch(`/api/chat/messages/${id}`, { method: 'DELETE' })
    setMensajes(prev => prev.filter(m => m.id !== id))
  }

  const fijar = async (id: string, fijado: boolean) => {
    await fetch(`/api/chat/messages/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ fijado: !fijado }),
    })
    setMensajes(prev => prev.map(m => m.id === id ? { ...m, fijado: !fijado } : m))
  }

  const timeFormat = (iso: string) =>
    new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--color-bg)' }}>

      {/* Header del canal */}
      <div style={{
        padding: 'var(--space-4) var(--space-6)',
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border-gold)',
        display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
        flexShrink: 0,
      }}>
        <Link href="/chat" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)' }}>
          ← Canales
        </Link>
        <div style={{ width: 1, height: 20, background: 'var(--color-border)', flexShrink: 0 }} />
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-gold)', opacity: 0.7 }}>#</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '0.04em' }}>
          {canal.nombre}
        </span>
        {canal.descripcion && (
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
            — {canal.descripcion}
          </span>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: conectado ? '#4a8a3a' : 'var(--color-text-faint)',
            boxShadow: conectado ? '0 0 6px #4a8a3a' : 'none',
            transition: 'all 0.3s',
          }} />
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: conectado ? '#4a8a3a' : 'var(--color-text-faint)' }}>
            {conectado ? 'En vivo' : 'Reconectando…'}
          </span>
        </div>
      </div>

      {/* Mensajes fijados */}
      {fijados.length > 0 && (
        <div style={{
          padding: 'var(--space-3) var(--space-6)',
          background: 'var(--color-gold-highlight)',
          borderBottom: '1px solid var(--color-border-gold)',
          flexShrink: 0,
        }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--color-gold)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
            📌 Mensajes fijados
          </div>
          {fijados.map(m => (
            <div key={m.id} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
              <strong style={{ fontStyle: 'normal', color: 'var(--color-gold)' }}>{m.autor.username}:</strong> {m.contenido.slice(0, 120)}{m.contenido.length > 120 ? '…' : ''}
            </div>
          ))}
        </div>
      )}

      {/* Lista de mensajes */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4) var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {mensajes.map((m, i) => {
          const esPropio     = m.autor.id === sesion.userId
          const anterior     = mensajes[i - 1]
          const mismoAutor   = anterior?.autor.id === m.autor.id &&
            (new Date(m.createdAt).getTime() - new Date(anterior.createdAt).getTime()) < 5 * 60 * 1000

          return (
            <div
              key={m.id}
              style={{
                display:        'flex',
                flexDirection:  esPropio ? 'row-reverse' : 'row',
                gap:            'var(--space-3)',
                alignItems:     'flex-end',
                marginTop:      mismoAutor ? 2 : 'var(--space-2)',
              }}
              className="mensaje-row"
            >
              {/* Avatar */}
              {!mismoAutor && (
                <div style={{
                  width: 32, height: 32, flexShrink: 0, borderRadius: '50%',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border-gold)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: 12,
                  fontWeight: 700, color: 'var(--color-gold)',
                }}>
                  {m.autor.username[0].toUpperCase()}
                </div>
              )}
              {mismoAutor && <div style={{ width: 32, flexShrink: 0 }} />}

              {/* Burbuja */}
              <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: esPropio ? 'flex-end' : 'flex-start' }}>
                {!mismoAutor && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 3 }}>
                    <AutorBadge autor={m.autor} esPropio={esPropio} />
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--color-text-faint)' }}>
                      {timeFormat(m.createdAt)}
                    </span>
                    {m.fijado && <span style={{ fontSize: 10 }}>📌</span>}
                  </div>
                )}
                <div
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    borderRadius: esPropio
                      ? 'var(--radius-lg) var(--radius-sm) var(--radius-lg) var(--radius-lg)'
                      : 'var(--radius-sm) var(--radius-lg) var(--radius-lg) var(--radius-lg)',
                    background: esPropio
                      ? 'var(--color-gold-highlight)'
                      : 'var(--color-surface)',
                    border: `1px solid ${esPropio ? 'var(--color-border-gold)' : 'var(--color-border)'}`,
                    fontFamily:   'var(--font-body)',
                    fontSize:     'var(--text-base)',
                    color:        'var(--color-text)',
                    lineHeight:   1.5,
                    wordBreak:    'break-word',
                    whiteSpace:   'pre-wrap',
                  }}
                >
                  {m.contenido}
                </div>
                {/* Acciones */}
                {(esPropio || esAdmin || esJuez) && (
                  <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 3, opacity: 0 }} className="mensaje-acciones">
                    {(esAdmin || esJuez) && (
                      <button
                        onClick={() => fijar(m.id, m.fijado)}
                        style={accionBtn}
                        title={m.fijado ? 'Desfijar' : 'Fijar'}
                      >
                        📌
                      </button>
                    )}
                    {(esPropio || esAdmin) && (
                      <button onClick={() => eliminar(m.id)} style={{ ...accionBtn, color: 'var(--color-onair)' }} title="Eliminar">
                        ✕
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: 'var(--space-4) var(--space-6)',
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Mensaje en #${canal.nombre} — Enter para enviar, Shift+Enter para nueva línea`}
            rows={1}
            style={{
              flex: 1, resize: 'none',
              fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)',
              background: 'var(--color-surface-offset)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-3) var(--space-4)',
              color: 'var(--color-text)', outline: 'none',
              maxHeight: 200, overflowY: 'auto',
              transition: 'border-color var(--transition)',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--color-border-gold)'}
            onBlur={e => e.target.style.borderColor  = 'var(--color-border)'}
          />
          <button
            onClick={enviar}
            disabled={!input.trim() || enviando}
            style={{
              width: 44, height: 44, borderRadius: '50%',
              background: input.trim() ? 'var(--color-gold)' : 'var(--color-surface-offset)',
              border: '1px solid var(--color-border-gold)',
              color:  input.trim() ? 'var(--color-text-inverse)' : 'var(--color-text-faint)',
              cursor: input.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all var(--transition)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
            </svg>
          </button>
        </div>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--color-text-faint)', marginTop: 'var(--space-2)' }}>
          Enter para enviar · Shift+Enter para nueva línea
        </p>
      </div>
    </div>
  )
}

const accionBtn: React.CSSProperties = {
  fontFamily: 'var(--font-ui)', fontSize: 10,
  padding: '2px 6px', borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)', background: 'transparent',
  color: 'var(--color-text-faint)', cursor: 'pointer',
}
