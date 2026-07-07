'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Evento {
  id: string
  nombre: string
  descripcion: string
  fecha: string
  tipo: string
  visibilidad: string
  ejercitoVisibilidad?: { nombre: string; sigla: string }
}

const TIPO_COLORS: Record<string, string> = {
  JUICIO:  'bg-gold text-surface-offset',
  OFICIAL: 'bg-wireds text-surface-offset',
  REUNION: 'bg-onair text-surface-offset',
  DEFAULT: 'bg-surface-offset border border-border text-text'
}

export default function CalendarioClient() {
  const { data: session } = useSession()
  const userRole = (session?.user as any)?.role
  const userEjercito = (session?.user as any)?.ejercitoId
  const canCreate = userRole === 'ADMIN' || userRole === 'COMANDANTE'

  const [date, setDate] = useState(new Date())
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)

  // Modal de creación
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  
  const [form, setForm] = useState({
    nombre: '', descripcion: '', hora: '12:00', tipo: 'REUNION', visibilidad: 'PUBLICO'
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const month = date.getMonth()
  const year = date.getFullYear()

  const loadEventos = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/eventos?month=${month}&year=${year}`)
      const json = await res.json()
      setEventos(json.data || [])
    } catch {
      console.error('Error cargando eventos')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadEventos()
  }, [month, year])

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const emptyDays = Array(firstDay === 0 ? 6 : firstDay - 1).fill(null) // Lunes como primer día

  const prevMonth = () => setDate(new Date(year, month - 1, 1))
  const nextMonth = () => setDate(new Date(year, month + 1, 1))

  const handleDayClick = (day: number) => {
    if (!canCreate) return
    setSelectedDate(new Date(year, month, day))
    setModalOpen(true)
    setError(null)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const payload = {
        ...form,
        fecha: selectedDate?.toISOString(),
        ejercitoId: form.visibilidad === 'EJERCITO' ? userEjercito : null
      }
      
      const res = await fetch('/api/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (res.ok) {
        setModalOpen(false)
        loadEventos()
      } else {
        setError(data.error)
      }
    } catch {
      setError('Error al crear evento')
    }
    setSaving(false)
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-6) 0' }}>
      
      {/* Header Calendario */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <button onClick={prevMonth} className="btn-secondary" style={{ padding: 'var(--space-2) var(--space-4)' }}>&laquo; Anterior</button>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-gold-bright)', textTransform: 'capitalize' }}>
          {date.toLocaleString('es', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={nextMonth} className="btn-secondary" style={{ padding: 'var(--space-2) var(--space-4)' }}>Siguiente &raquo;</button>
      </div>

      {/* Días de la semana */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', textAlign: 'center' }}>
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
          <div key={d} style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-gold)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Grilla de Días */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 'var(--space-2)' }}>
        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`} style={{ background: 'oklch(from var(--color-surface) l c h / 0.3)', minHeight: '120px', borderRadius: 'var(--radius-md)' }} />
        ))}
        
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const evs = eventos.filter(e => new Date(e.fecha).getDate() === day)
          
          return (
            <div 
              key={day} 
              onClick={() => handleDayClick(day)}
              style={{ 
                background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', 
                minHeight: '120px', padding: 'var(--space-2)', 
                cursor: canCreate ? 'pointer' : 'default',
                transition: 'border var(--transition)',
              }}
              onMouseEnter={(e) => { if(canCreate) e.currentTarget.style.borderColor = 'var(--color-gold)' }}
              onMouseLeave={(e) => { if(canCreate) e.currentTarget.style.borderColor = 'var(--color-border)' }}
            >
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
                {day}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {evs.map(ev => {
                  const evDate = new Date(ev.fecha)
                  return (
                    <div key={ev.id} style={{ 
                      fontSize: '10px', padding: '2px 4px', borderRadius: '4px', fontFamily: 'var(--font-ui)', 
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      background: 'var(--color-surface-offset)', borderLeft: '2px solid var(--color-gold)'
                    }}>
                      <strong style={{ color: 'var(--color-gold)' }}>{evDate.toLocaleTimeString('es', {hour: '2-digit', minute:'2-digit'})}</strong>
                      {' '}- {ev.nombre}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal Creación Evento */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', padding: 'var(--space-6)' }}>
          <div style={{ background: 'var(--color-surface)', width: '100%', maxWidth: 500, borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-gold)', padding: 'var(--space-6)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-gold)', marginBottom: 'var(--space-4)' }}>
              Crear Evento: {selectedDate?.toLocaleDateString('es')}
            </h3>
            
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={fieldWrap}>
                <label style={labelStyle}>Nombre</label>
                <input required className="input-gold" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Nombre del evento" />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Descripción</label>
                <input required className="input-gold" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder="Breve descripción" />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Hora</label>
                  <input required type="time" className="input-gold" value={form.hora} onChange={e => setForm({...form, hora: e.target.value})} />
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Tipo</label>
                  <select required className="input-gold" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}>
                    <option value="REUNION">Reunión</option>
                    <option value="OFICIAL">Oficial</option>
                    <option value="JUICIO">Juicio</option>
                  </select>
                </div>
              </div>

              <div style={fieldWrap}>
                <label style={labelStyle}>Visibilidad</label>
                <select required className="input-gold" value={form.visibilidad} onChange={e => setForm({...form, visibilidad: e.target.value})}>
                  {userRole === 'ADMIN' && <option value="PUBLICO">Público (Todos)</option>}
                  <option value="PRIVADO">Privado (Solo registrados)</option>
                  <option value="EJERCITO">Específico (Mi Ejército)</option>
                  {userRole === 'ADMIN' && <option value="ADMIN">Interno (Solo Admins)</option>}
                </select>
              </div>

              {error && <p style={{ color: 'var(--color-onair)', fontSize: 'var(--text-xs)' }}>{error}</p>}

              <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1, opacity: saving ? 0.6 : 1 }}>
                  {saving ? 'Guardando...' : 'Crear Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const fieldWrap = { display: 'flex', flexDirection: 'column' as const, gap: 'var(--space-2)' }
const labelStyle = { fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--color-text-muted)' }
