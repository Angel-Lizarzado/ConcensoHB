'use client'

import { useEffect, useState } from 'react'

interface Canal {
  id: string
  nombre: string
  descripcion: string | null
  privado: boolean
  rolesPermitidos: string[]
  createdAt: string
  _count: { mensajes: number }
}

export default function AdminChat() {
  const [canales, setCanales] = useState<Canal[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm]       = useState({ nombre: '', descripcion: '', privado: false, rolesPermitidos: [] as string[] })
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const fetchCanales = () => {
    fetch('/api/chat/canales').then(r => r.json()).then(d => setCanales(d.data || [])).finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchCanales()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    
    try {
      const res = await fetch('/api/chat/canales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      
      if (!res.ok) {
        let err;
        try { err = await res.json() } catch { err = {} }
        setError(err.error || 'Error al crear canal')
      } else {
        setForm({ nombre: '', descripcion: '', privado: false, rolesPermitidos: [] })
        fetchCanales()
      }
    } catch (error) {
      setError('Error de conexión al servidor')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar el canal #${nombre}? Esto borrará todos sus mensajes.`)) return
    
    const res = await fetch(`/api/chat/canales/${id}`, { method: 'DELETE' })
    if (res.ok) fetchCanales()
    else alert('Error al eliminar canal')
  }

  const toggleRole = (role: string) => {
    setForm(p => ({
      ...p,
      rolesPermitidos: p.rolesPermitidos.includes(role) 
        ? p.rolesPermitidos.filter(r => r !== role)
        : [...p.rolesPermitidos, role]
    }))
  }

  return (
    <div>
      <h2 className="font-display text-lg font-bold text-gold-bright tracking-wider uppercase mb-6">
        Gestión de Canales de Chat
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
        
        {/* Lista de Canales */}
        <div className="flex flex-col gap-4">
          {loading ? <p className="font-ui text-sm text-text-muted animate-pulse">Cargando canales…</p> : canales.map(canal => (
            <div key={canal.id} className="bg-surface-offset p-4 rounded-md border border-border flex justify-between items-center hover:-translate-y-1 hover:border-border-gold hover:shadow-lg transition-all duration-300">
              <div>
                <h3 className="font-ui text-base font-bold text-gold">
                  #{canal.nombre}
                </h3>
                <p className="font-ui text-sm text-text-muted mt-1">
                  {canal.descripcion || 'Sin descripción'}
                </p>
                <div className="flex gap-2 mt-3">
                  <span className="font-ui text-[10px] font-semibold text-text-faint border border-border rounded-full px-2 py-[2px] uppercase">
                    Mensajes: {canal._count.mensajes}
                  </span>
                  {canal.privado && (
                    <span className="font-ui text-[10px] font-semibold text-white bg-onair rounded-full px-2 py-[2px] uppercase border-none">
                      Privado
                    </span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => handleDelete(canal.id, canal.nombre)}
                className="font-ui text-xs text-text-faint uppercase hover:text-onair transition-colors"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>

        {/* Formulario Nuevo Canal */}
        <div className="bg-surface-offset p-5 rounded-lg border border-border-gold shadow-gold hover:-translate-y-1 transition-transform duration-300">
          <h3 className="font-ui text-sm font-bold uppercase text-text mb-4">
            Nuevo Canal
          </h3>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-ui text-xs font-medium tracking-widest uppercase text-text-muted">Nombre</label>
              <input className="input-gold" required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="anuncios" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-ui text-xs font-medium tracking-widest uppercase text-text-muted">Descripción</label>
              <input className="input-gold" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder="Noticias y comunicados" />
            </div>
            
            <label className="flex items-center gap-3 cursor-pointer mt-2">
              <input type="checkbox" checked={form.privado} onChange={e => setForm({...form, privado: e.target.checked})} />
              <span className="font-ui text-sm text-text-muted">Canal Privado</span>
            </label>

            {form.privado && (
              <div className="flex flex-col gap-2 p-3 bg-surface rounded-sm">
                <label className="font-ui text-xs font-medium tracking-widest uppercase text-text-muted">Roles permitidos</label>
                {['ADMIN', 'JUEZ', 'COMANDANTE', 'REPORTERO', 'VISITANTE'].map(r => (
                  <label key={r} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.rolesPermitidos.includes(r)} onChange={() => toggleRole(r)} />
                    <span className="font-ui text-xs text-text">{r}</span>
                  </label>
                ))}
              </div>
            )}

            <button type="submit" className="btn-primary mt-2" disabled={saving || !form.nombre}>
              {saving ? 'Creando…' : 'Crear Canal'}
            </button>
            {error && <p className="text-onair text-xs font-ui mt-1">{error}</p>}
          </form>
        </div>

      </div>
    </div>
  )
}
