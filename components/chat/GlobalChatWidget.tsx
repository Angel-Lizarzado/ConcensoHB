'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'

import { habboAvatarHead } from '@/lib/habbo'

interface Canal {
  id: string
  nombre: string
  privado: boolean
}

interface Mensaje {
  id: string
  contenido: string
  fijado?: boolean
  _type?: string
  createdAt: string
  canalId: string
  autor: {
    username: string
    role: string
    rolEjercito: string | null
    ejercito: { sigla: string } | null
  }
}

export default function GlobalChatWidget() {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [canales, setCanales] = useState<Canal[]>([])
  const [activeTab, setActiveTab] = useState<string | null>(null)
  
  const [mensajes, setMensajes] = useState<Record<string, Mensaje[]>>({})
  const [pinnedMensajes, setPinnedMensajes] = useState<Record<string, Mensaje[]>>({})
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Autoscroll
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [mensajes, activeTab, isOpen])

  // Fetch canales on mount if authenticated
  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/chat/canales')
      .then(r => r.json())
      .then(d => {
        if (d.data && d.data.length > 0) {
          setCanales(d.data)
          setActiveTab(d.data[0].id)
          // Fetch initial messages for each channel
          d.data.forEach((canal: Canal) => {
            fetch(`/api/chat/${canal.id}/messages`)
              .then(r => r.json())
              .then(res => {
                if (res.data) {
                  setMensajes(prev => ({ ...prev, [canal.id]: res.data }))
                  if (res.pinned) {
                    setPinnedMensajes(prev => ({ ...prev, [canal.id]: res.pinned }))
                  }
                }
              })
          })
        }
      })
  }, [status])

  // SSE Global Connection
  useEffect(() => {
    if (status !== 'authenticated' || canales.length === 0) return

    const es = new EventSource('/api/chat/stream')
    
    es.onmessage = (event) => {
      const data = event.data
      if (data === ': heartbeat') return

      try {
        const msg = JSON.parse(data) as Mensaje
        
        if (msg._type === 'UPDATE') {
          // Actualizamos en la lista principal
          setMensajes(prev => {
            const current = prev[msg.canalId] || []
            return { ...prev, [msg.canalId]: current.map(m => m.id === msg.id ? msg : m) }
          })
          // Actualizamos en la lista de fijados
          setPinnedMensajes(prev => {
            const current = prev[msg.canalId] || []
            if (msg.fijado) {
              if (!current.some(m => m.id === msg.id)) {
                return { ...prev, [msg.canalId]: [msg, ...current] }
              }
              return prev
            } else {
              return { ...prev, [msg.canalId]: current.filter(m => m.id !== msg.id) }
            }
          })
          return
        }
        
        setMensajes(prev => {
          const current = prev[msg.canalId] || []
          // Evitar duplicados
          if (current.some(m => m.id === msg.id)) return prev
          return { ...prev, [msg.canalId]: [...current, msg] }
        })

        // Unread counts
        if (!isOpen || activeTab !== msg.canalId) {
          setUnreadCounts(prev => ({
            ...prev,
            [msg.canalId]: (prev[msg.canalId] || 0) + 1
          }))
        }
      } catch (e) {
        // Ignorar parse errors
      }
    }

    return () => es.close()
  }, [status, canales.length, isOpen, activeTab])

  // Limpiar unread count al cambiar de tab o abrir
  useEffect(() => {
    if (isOpen && activeTab) {
      setUnreadCounts(prev => {
        if (!prev[activeTab]) return prev
        return { ...prev, [activeTab]: 0 }
      })
    }
  }, [isOpen, activeTab])

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !activeTab || sending) return
    
    const text = input.trim()
    setInput('')
    setSending(true)

    try {
      const res = await fetch(`/api/chat/${activeTab}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenido: text })
      })
      if (!res.ok) throw new Error('Failed')
      
      const newMsg = await res.json()
      
      // Añadir directamente al estado local para no depender del SSE en Vercel Serverless
      setMensajes(prev => {
        const current = prev[activeTab] || []
        if (current.some(m => m.id === newMsg.id)) return prev
        return { ...prev, [activeTab]: [...current, newMsg] }
      })

      // Scrollear al fondo
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch {
      // Si falla, podríamos mostrar un error o restaurar el input
      alert('Error al enviar el mensaje')
      setInput(text)
    } finally {
      setSending(false)
    }
  }

  const togglePin = async (msg: Mensaje) => {
    try {
      await fetch(`/api/chat/messages/${msg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fijado: !msg.fijado })
      })
    } catch {
      alert('Error al fijar mensaje')
    }
  }

  if (status !== 'authenticated') return null

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      
      {/* Ventana de Chat Flotante */}
      {isOpen && (
        <div className="bg-surface/95 backdrop-blur-xl w-[350px] sm:w-[400px] h-[500px] mb-4 rounded-xl border border-border-gold shadow-gold flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right">
          
          {/* Header con Pestañas */}
          <div className="bg-surface-offset border-b border-border-gold px-2 pt-2 flex overflow-x-auto custom-scrollbar">
            {canales.map(canal => (
              <button
                key={canal.id}
                onClick={() => setActiveTab(canal.id)}
                className={`relative px-4 py-2 font-ui text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap
                  ${activeTab === canal.id ? 'text-gold border-b-2 border-gold' : 'text-text-muted hover:text-text'}`}
              >
                #{canal.nombre}
                {unreadCounts[canal.id] > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-onair"></span>
                )}
              </button>
            ))}
          </div>

          {/* Banner de Mensaje Fijado */}
          {activeTab && pinnedMensajes[activeTab] && pinnedMensajes[activeTab].length > 0 && (
            <div className="bg-surface-offset border-b border-border-gold p-2 px-3 text-xs font-ui text-text flex items-start gap-2 shadow-[0_2px_10px_rgba(201,168,76,0.1)] z-10">
              <span className="text-gold mt-0.5" title="Mensaje Fijado">📌</span>
              <div className="flex-1 flex flex-col min-w-0">
                <span className="font-bold text-[10px] text-gold uppercase tracking-wider">
                  {pinnedMensajes[activeTab][0].autor.username} fijó:
                </span>
                <span className="truncate text-text-muted">{pinnedMensajes[activeTab][0].contenido}</span>
              </div>
            </div>
          )}

          {/* Área de Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
            {activeTab && mensajes[activeTab]?.length > 0 ? (
              (() => {
                let lastDateStr = ''
                // Deduplicamos por ID para evitar bugs visuales de StrictMode o SSE duplicado
                const uniqueMsgs = mensajes[activeTab].filter((m, index, self) => 
                  index === self.findIndex((t) => t.id === m.id)
                )

                const today = new Date()
                const yesterday = new Date(today)
                yesterday.setDate(yesterday.getDate() - 1)

                return uniqueMsgs.map(msg => {
                  const isMe = msg.autor.username === (session?.user as any)?.username
                  const msgDate = new Date(msg.createdAt)
                  
                  let dateStr = msgDate.toLocaleDateString()
                  if (msgDate.toDateString() === today.toDateString()) {
                    dateStr = 'Hoy'
                  } else if (msgDate.toDateString() === yesterday.toDateString()) {
                    dateStr = 'Ayer'
                  }
                  
                  const timeStr = msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  const showDivider = dateStr !== lastDateStr
                  lastDateStr = dateStr

                  return (
                    <div key={msg.id} className="flex flex-col gap-4">
                      {showDivider && (
                        <div className="w-full text-center mt-1 mb-1">
                          <span className="font-ui text-[9px] text-text-faint uppercase bg-surface-offset px-3 py-1 rounded-full border border-border tracking-widest shadow-sm">
                            {dateStr}
                          </span>
                        </div>
                      )}
                      <div className={`flex gap-2 max-w-[90%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}>
                        
                        {/* Avatar */}
                        <div className="flex-shrink-0 mt-auto mb-1">
                          <div className={`w-8 h-8 rounded-full overflow-hidden border ${isMe ? 'border-gold bg-surface-offset' : 'border-border bg-surface'} flex items-center justify-center`}>
                            <img 
                              src={habboAvatarHead(msg.autor.username)} 
                              alt={msg.autor.username}
                              className="w-10 h-10 object-cover object-top -mt-2 drop-shadow-md"
                              style={{ imageRendering: 'pixelated' }}
                            />
                          </div>
                        </div>

                        {/* Mensaje Content */}
                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%]`}>
                          <span className="font-ui text-[9px] text-text-muted mb-1 px-1 uppercase tracking-wider flex items-center gap-1 group/header cursor-default relative">
                            {isMe ? 'Tú' : msg.autor.username} • {msg.autor.role}
                            <span className="opacity-50">· {timeStr}</span>
                            
                            {/* Botón Fijar (Solo Admins) */}
                            {(session?.user as any)?.role === 'ADMIN' && (
                              <button 
                                onClick={() => togglePin(msg)}
                                className={`ml-2 opacity-0 group-hover/header:opacity-100 transition-opacity ${msg.fijado ? 'text-gold opacity-100' : 'text-text-faint hover:text-gold'}`}
                                title={msg.fijado ? "Desfijar mensaje" : "Fijar mensaje"}
                              >
                                📌
                              </button>
                            )}
                          </span>
                          <div className={`px-3 py-2 rounded-xl text-sm font-ui leading-relaxed shadow-sm break-words
                            ${msg.fijado ? 'ring-1 ring-gold bg-gold/10 text-gold-bright' : (isMe ? 'bg-gold-dark text-white rounded-br-none border border-gold/30' : 'bg-surface-offset border border-border rounded-bl-none text-text')}
                          `}>
                            {msg.fijado && !isMe && <span className="block text-[10px] text-gold uppercase mb-1 font-bold">📌 Fijado</span>}
                            {msg.contenido}
                          </div>
                        </div>

                      </div>
                    </div>
                  )
                })
              })()
            ) : (
              <div className="m-auto text-center font-ui text-sm text-text-faint">
                No hay mensajes aún en este canal.
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input de Mensaje */}
          <div className="p-3 bg-surface-offset border-t border-border">
            <form onSubmit={handleSend} className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-surface border border-border rounded-full px-4 py-2 font-ui text-sm text-text focus:outline-none focus:border-gold transition-colors"
                disabled={sending}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || sending}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gold text-surface-offset hover:bg-gold-bright transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Botón Flotante (Toggle) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-14 h-14 bg-gold rounded-full flex items-center justify-center text-surface-offset shadow-gold hover:bg-gold-bright hover:-translate-y-1 transition-all duration-300 group"
      >
        {totalUnread > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 bg-onair text-white font-ui text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-bg z-10 animate-pulse">
            {totalUnread}
          </span>
        )}
        
        {/* Glow de fondo animado cuando hay mensajes */}
        {totalUnread > 0 && !isOpen && (
          <div className="absolute inset-0 bg-gold rounded-full animate-ping opacity-30"></div>
        )}

        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        )}
      </button>
    </div>
  )
}
