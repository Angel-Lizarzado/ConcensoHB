'use client'

import { useState, useRef, useEffect } from 'react'

interface Autor {
  id: string
  username: string
  role: string
  ejercitoId?: string
}

interface Comentario {
  id: string
  contenido: string
  createdAt: string
  autor: Autor
}

interface Props {
  incidenciaId: string
  comentarios: Comentario[]
  estado: string
  onCommentAdded: () => void
  currentUserId: string
  ejercitoDenuncianteId: string
  ejercitoDenunciadoId: string
}

export default function IncidenciaChat({ incidenciaId, comentarios, estado, onCommentAdded, currentUserId, ejercitoDenuncianteId, ejercitoDenunciadoId }: Props) {
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [comentarios])

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mensaje.trim()) return

    setEnviando(true)
    const res = await fetch(`/api/incidencias/${incidenciaId}/comentarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contenido: mensaje })
    })
    
    if (res.ok) {
      setMensaje('')
      onCommentAdded()
    } else {
      alert('Error al enviar mensaje')
    }
    setEnviando(false)
  }

  const isClosed = estado === 'RESUELTA' || estado === 'DESESTIMADA'

  return (
    <div className="flex flex-col border border-border bg-surface-offset rounded-xl overflow-hidden mt-4" style={{ height: '400px' }}>
      <div className="bg-surface border-b border-border p-3">
        <h4 className="font-display text-sm text-gold uppercase">Sala de Mediación</h4>
        <p className="font-ui text-xs text-text-muted">Conversación oficial del caso</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4" ref={scrollRef}>
        {comentarios.length === 0 ? (
          <div className="m-auto text-center font-ui text-text-muted text-sm italic">
            No hay mensajes aún. Comienza la mediación.
          </div>
        ) : (
          comentarios.map(c => {
            const isMe = c.autor.id === currentUserId
            const isJuez = c.autor.role === 'JUEZ' || c.autor.role === 'ADMIN'
            const isDemandante = c.autor.ejercitoId === ejercitoDenuncianteId
            
            return (
              <div key={c.id} className={`flex flex-col max-w-[85%] ${isMe ? 'self-end' : 'self-start'}`}>
                <div className={`flex items-baseline gap-2 mb-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <span className="font-ui text-xs font-bold" style={{ color: isJuez ? 'var(--color-gold)' : isDemandante ? 'var(--color-noticias)' : 'var(--color-wireds)' }}>
                    {c.autor.username}
                  </span>
                  <span className="font-ui text-[10px] text-text-muted">
                    {isJuez ? 'Juez' : isDemandante ? 'Demandante' : 'Demandado'}
                  </span>
                  <span className="font-ui text-[10px] text-text-muted opacity-50">
                    {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={`p-3 rounded-xl font-ui text-sm text-text ${isMe ? 'bg-gold/10 border border-gold/20 rounded-tr-none' : 'bg-surface border border-border rounded-tl-none'}`}>
                  {c.contenido}
                </div>
              </div>
            )
          })
        )}
      </div>

      {!isClosed ? (
        <form onSubmit={handleEnviar} className="bg-surface border-t border-border p-3 flex gap-2">
          <input 
            type="text" 
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-1 bg-surface-offset border border-border rounded-lg px-4 py-2 font-ui text-sm text-text outline-none focus:border-gold"
            disabled={enviando}
          />
          <button 
            type="submit" 
            disabled={!mensaje.trim() || enviando}
            className="bg-gold text-surface-offset font-bold font-ui px-4 py-2 rounded-lg text-sm disabled:opacity-50"
          >
            Enviar
          </button>
        </form>
      ) : (
        <div className="bg-surface border-t border-border p-3 text-center font-ui text-xs text-text-muted italic">
          El caso está cerrado. No se admiten más mensajes.
        </div>
      )}
    </div>
  )
}
