'use client'

import { useEffect, useState } from 'react'

interface Evento {
  id: string; nombre: string; slug: string; descripcion: string; fecha: string; tipo: string; puntos: number
}

const TIPO_COLORS: Record<string, string> = {
  JUICIO: 'bg-gold text-surface-offset',
  OFICIAL: 'bg-wireds text-surface-offset',
  REUNION: 'bg-onair text-surface-offset',
  DEFAULT: 'bg-surface-offset border border-border text-text'
}

export default function AdminCalendario() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    fecha: '',
    tipo: 'OFICIAL',
    puntos: 0
  })
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    fetch('/api/eventos?upcoming=false').then(r => r.json())
      .then(d => setEventos(d.data ?? []))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    // Generar slug
    const slug = form.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4)

    const res = await fetch('/api/eventos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, slug })
    })

    if (res.ok) {
      alert('Evento creado exitosamente')
      setForm({ nombre: '', descripcion: '', fecha: '', tipo: 'OFICIAL', puntos: 0 })
      load()
    } else {
      const data = await res.json()
      alert(data.error || 'Error al crear evento')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este evento?')) return
    const res = await fetch(`/api/eventos/${id}`, { method: 'DELETE' })
    if (res.ok) {
      load()
    } else {
      alert('Error al eliminar evento')
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="font-display text-2xl text-gold uppercase mb-2">Calendario de Actividades</h2>
        <p className="font-ui text-sm text-text-muted">Administra los eventos, juicios y reuniones del Concilio.</p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6">
        <h3 className="font-display text-xl text-gold uppercase mb-4">Programar Nuevo Evento</h3>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-ui text-xs text-text-muted uppercase">Nombre del Evento</label>
            <input required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="bg-surface-offset border border-border text-text text-sm rounded px-3 py-2 focus:border-gold outline-none" />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="font-ui text-xs text-text-muted uppercase">Fecha y Hora</label>
            <input type="datetime-local" required value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} className="bg-surface-offset border border-border text-text text-sm rounded px-3 py-2 focus:border-gold outline-none" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-ui text-xs text-text-muted uppercase">Tipo</label>
            <select required value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} className="bg-surface-offset border border-border text-text text-sm rounded px-3 py-2 focus:border-gold outline-none">
              <option value="OFICIAL">Actividad Oficial</option>
              <option value="REUNION">Reunión de Concilio</option>
              <option value="JUICIO">Juicio Programado</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="font-ui text-xs text-text-muted uppercase">Descripción</label>
            <textarea required value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} rows={2} className="bg-surface-offset border border-border text-text text-sm rounded px-3 py-2 focus:border-gold outline-none" />
          </div>

          <div className="md:col-span-2 mt-2">
            <button type="submit" disabled={saving} className="bg-gold text-surface-offset px-6 py-2 rounded font-ui font-bold uppercase text-sm hover:bg-gold-bright disabled:opacity-50">
              {saving ? 'Creando...' : 'Crear Evento'}
            </button>
          </div>
        </form>
      </div>

      <div>
        <h3 className="font-display text-xl text-gold uppercase mb-4">Eventos Programados</h3>
        {loading ? <p className="font-ui text-text-muted">Cargando...</p> : eventos.length === 0 ? <p className="font-ui text-text-muted">No hay eventos en el calendario.</p> : (
          <div className="flex flex-col gap-3">
            {eventos.map(ev => {
              const colorClass = TIPO_COLORS[ev.tipo] || TIPO_COLORS.DEFAULT
              return (
                <div key={ev.id} className="bg-surface border border-border rounded-lg p-4 flex justify-between items-center">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-ui text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded ${colorClass}`}>{ev.tipo}</span>
                      <span className="font-display text-lg text-text uppercase">{ev.nombre}</span>
                    </div>
                    <p className="font-ui text-xs text-text-muted">{new Date(ev.fecha).toLocaleString()}</p>
                  </div>
                  <button onClick={() => handleDelete(ev.id)} className="text-onair hover:text-onair/80 font-ui text-xs uppercase font-bold">
                    Eliminar
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
