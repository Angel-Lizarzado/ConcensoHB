'use client'

import { useEffect, useState } from 'react'
import IncidenciaChat from '../../components/IncidenciaChat'

interface Incidencia {
  id: string; titulo: string; descripcion: string; estado: string; createdAt: string
  ejercitoDenunciante: { sigla: string; nombre: string; escudo: string }
  ejercitoDenunciado:  { sigla: string; nombre: string; escudo: string }
  ejercitoDenuncianteId: string
  ejercitoDenunciadoId: string
  juezId: string | null
  juez: { username: string } | null
  fechaJuicio: string | null
  _count: { pruebas: number; comentariosInternos: number }
  pruebas?: any[]
  comentarios?: any[]
  resolucion?: string
}

const ESTADO_COLOR: Record<string, string> = {
  ABIERTA:           'text-gold',
  EN_REVISION:       'text-wireds',
  EN_PROCESO:        'text-onair',
  RESUELTA:          'text-green-500',
  DESESTIMADA:       'text-text-muted',
}

type Tab = 'solicitudes' | 'mis_casos' | 'todos'

export default function AdminIncidencias() {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([])
  const [loading, setLoading]         = useState(true)
  const [viewId, setViewId]           = useState<string | null>(null)
  const [details, setDetails]         = useState<Incidencia | null>(null)
  const [userId, setUserId]           = useState<string | null>(null)
  const [userRole, setUserRole]       = useState<string | null>(null)

  const [tab, setTab]                 = useState<Tab>('solicitudes')

  const [veredicto, setVeredicto]     = useState('')
  const [desestimar, setDesestimar]   = useState(false)
  const [submitting, setSubmitting]   = useState(false)
  
  const [fechaJuicioInput, setFechaJuicioInput] = useState('')

  const load = () => {
    setLoading(true)
    fetch('/api/incidencias').then(r => r.json())
      .then(d => {
        setIncidencias(d.data ?? [])
        if (d.meta) {
          setUserId(d.meta.userId)
          setUserRole(d.meta.userRole)
        }
      })
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const loadDetails = async (id: string) => {
    setViewId(id)
    setDetails(null)
    const res = await fetch(`/api/incidencias/${id}`)
    if (res.ok) {
      const data = await res.json()
      setDetails(data.data)
      setVeredicto(data.data.resolucion || '')
    }
  }

  const handleTomarCaso = async () => {
    if (!viewId) return
    setSubmitting(true)
    const res = await fetch(`/api/incidencias/${viewId}/tomar`, { method: 'PATCH' })
    if (res.ok) {
      alert('Caso tomado exitosamente.')
      load()
      loadDetails(viewId)
    } else {
      const d = await res.json()
      alert(d.error || 'Error al tomar el caso')
    }
    setSubmitting(false)
  }

  const handleSoltarCaso = async () => {
    if (!viewId) return
    setSubmitting(true)
    const res = await fetch(`/api/incidencias/${viewId}/soltar`, { method: 'PATCH' })
    if (res.ok) {
      alert('Caso devuelto a Solicitudes.')
      load()
      loadDetails(viewId)
    } else {
      const d = await res.json()
      alert(d.error || 'Error al soltar el caso')
    }
    setSubmitting(false)
  }

  const handleProgramarJuicio = async () => {
    if (!viewId || !fechaJuicioInput) return
    setSubmitting(true)
    const res = await fetch(`/api/incidencias/${viewId}/programar`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fechaJuicio: fechaJuicioInput })
    })
    if (res.ok) {
      alert('Juicio programado exitosamente.')
      load()
      loadDetails(viewId)
    } else {
      const d = await res.json()
      alert(d.error || 'Error al programar juicio')
    }
    setSubmitting(false)
  }

  const handleVeredicto = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!viewId || !veredicto) return
    setSubmitting(true)
    const res = await fetch(`/api/incidencias/${viewId}/veredicto`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolucion: veredicto, desestimar })
    })
    if (res.ok) {
      alert('Caso cerrado')
      load()
      setViewId(null)
    } else {
      alert('Error al cerrar el caso')
    }
    setSubmitting(false)
  }

  if (viewId) {
    const isMiCaso = details?.juezId === userId || userRole === 'ADMIN'
    const canInteract = isMiCaso && details?.estado !== 'RESUELTA' && details?.estado !== 'DESESTIMADA'

    return (
      <div className="flex flex-col gap-6">
        <button onClick={() => setViewId(null)} className="text-gold hover:text-gold-bright font-ui text-sm self-start">
          ← Volver al listado
        </button>

        {!details ? (
          <p className="font-ui text-text-muted">Cargando caso...</p>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Header del Caso */}
            <div className="bg-surface border border-border p-6 rounded-xl flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-display text-2xl text-gold uppercase">{details.titulo}</h2>
                  <p className="font-ui text-sm text-text-muted mt-1">Creado el {new Date(details.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`font-bold font-ui uppercase ${ESTADO_COLOR[details.estado]}`}>
                    {details.estado.replace('_', ' ')}
                  </span>
                  {details.juez && <span className="font-ui text-xs text-text-muted border border-border rounded px-2 py-1">Juez: {details.juez.username}</span>}
                </div>
              </div>
              <p className="font-ui text-text text-sm bg-surface-offset p-4 rounded-lg">{details.descripcion}</p>
              
              {/* Controles de Estado de Juez */}
              <div className="flex flex-wrap gap-4 mt-2">
                {details.estado === 'ABIERTA' && (userRole === 'JUEZ' || userRole === 'ADMIN') && (
                  <button onClick={handleTomarCaso} disabled={submitting} className="bg-gold text-surface-offset px-6 py-2 rounded font-ui font-bold uppercase text-sm hover:bg-gold-bright">
                    Tomar Caso
                  </button>
                )}

                {canInteract && details.estado !== 'ABIERTA' && (
                  <button onClick={handleSoltarCaso} disabled={submitting} className="border border-onair text-onair px-6 py-2 rounded font-ui font-bold uppercase text-sm hover:bg-onair/10">
                    Soltar Caso
                  </button>
                )}
              </div>
            </div>

            {/* Panel de Juicio */}
            {details.estado !== 'ABIERTA' && (
              <div className="bg-surface-offset border border-border rounded-xl p-6">
                <h3 className="font-display text-xl text-gold uppercase mb-4">Audiencia (Habbo)</h3>
                
                {details.fechaJuicio ? (
                  <div className="flex flex-col gap-2">
                    <p className="font-ui text-text">El juicio está programado para el:</p>
                    <p className="font-display text-2xl text-gold">{new Date(details.fechaJuicio).toLocaleString()}</p>
                  </div>
                ) : (
                  canInteract && (
                    <div className="flex flex-col gap-3">
                      <p className="font-ui text-sm text-text-muted">Aún no has fijado una fecha para el juicio en la sala del hotel. El caso está en revisión.</p>
                      <div className="flex gap-4 items-end">
                        <div className="flex flex-col gap-1">
                          <label className="font-ui text-xs text-text-muted uppercase">Fecha y Hora</label>
                          <input 
                            type="datetime-local" 
                            value={fechaJuicioInput} 
                            onChange={e => setFechaJuicioInput(e.target.value)} 
                            className="bg-surface border border-border text-text text-sm rounded px-3 py-2 focus:border-gold outline-none"
                          />
                        </div>
                        <button onClick={handleProgramarJuicio} disabled={submitting || !fechaJuicioInput} className="bg-wireds text-surface-offset px-6 py-2 rounded font-ui font-bold uppercase text-sm hover:bg-wireds/80 disabled:opacity-50">
                          Fijar y Aprobar Caso
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Cara a Cara (Bóveda de Pruebas) */}
            <h3 className="font-display text-xl text-gold uppercase mt-2">Bóveda de Pruebas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Columna Demandante */}
              <div className="bg-surface border border-border rounded-xl flex flex-col overflow-hidden">
                <div className="bg-surface-offset border-b border-border p-4 flex items-center justify-center gap-3">
                  {details.ejercitoDenunciante.escudo && <img src={details.ejercitoDenunciante.escudo} alt="Escudo" className="w-8 h-8 object-contain" />}
                  <h4 className="font-display text-lg text-text uppercase">Demandante: {details.ejercitoDenunciante.sigla}</h4>
                </div>
                <div className="p-4 flex flex-col gap-4 h-[400px] overflow-y-auto custom-scrollbar">
                  {details.pruebas?.filter(p => p.uploader?.ejercitoId === details.ejercitoDenuncianteId).map(p => (
                    <div key={p.id} className="border border-border rounded-lg bg-surface-offset overflow-hidden">
                      <a href={p.valor} target="_blank" rel="noreferrer">
                        <img src={p.valor} alt="Prueba Demandante" className="w-full h-40 object-cover hover:opacity-80 transition-opacity" />
                      </a>
                      <p className="font-ui text-xs text-text p-2">{p.descripcion || 'Sin descripción'}</p>
                      <p className="font-ui text-[10px] text-text-faint p-2 pt-0">Subido por: {p.uploader?.username}</p>
                    </div>
                  ))}
                  {details.pruebas?.filter(p => p.uploader?.ejercitoId === details.ejercitoDenuncianteId).length === 0 && (
                    <p className="text-center font-ui text-text-muted mt-10">No hay pruebas adjuntas.</p>
                  )}
                </div>
              </div>

              {/* Columna Demandado */}
              <div className="bg-surface border border-onair/30 rounded-xl flex flex-col overflow-hidden shadow-[0_0_15px_rgba(212,107,138,0.1)]">
                <div className="bg-surface-offset border-b border-onair/30 p-4 flex items-center justify-center gap-3">
                  {details.ejercitoDenunciado.escudo && <img src={details.ejercitoDenunciado.escudo} alt="Escudo" className="w-8 h-8 object-contain" />}
                  <h4 className="font-display text-lg text-onair uppercase">Demandado: {details.ejercitoDenunciado.sigla}</h4>
                </div>
                <div className="p-4 flex flex-col gap-4 h-[400px] overflow-y-auto custom-scrollbar">
                  {details.pruebas?.filter(p => p.uploader?.ejercitoId === details.ejercitoDenunciadoId).map(p => (
                    <div key={p.id} className="border border-border rounded-lg bg-surface-offset overflow-hidden">
                      <a href={p.valor} target="_blank" rel="noreferrer">
                        <img src={p.valor} alt="Prueba Demandado" className="w-full h-40 object-cover hover:opacity-80 transition-opacity" />
                      </a>
                      <p className="font-ui text-xs text-text p-2">{p.descripcion || 'Sin descripción'}</p>
                      <p className="font-ui text-[10px] text-text-faint p-2 pt-0">Subido por: {p.uploader?.username}</p>
                    </div>
                  ))}
                  {details.pruebas?.filter(p => p.uploader?.ejercitoId === details.ejercitoDenunciadoId).length === 0 && (
                    <p className="text-center font-ui text-text-muted mt-10">No hay pruebas adjuntas.</p>
                  )}
                </div>
              </div>

            </div>

            <IncidenciaChat 
              incidenciaId={details.id}
              comentarios={details.comentarios || []}
              estado={details.estado}
              onCommentAdded={() => loadDetails(viewId)}
              currentUserId={userId!}
              ejercitoDenuncianteId={details.ejercitoDenuncianteId}
              ejercitoDenunciadoId={details.ejercitoDenunciadoId}
            />

            {/* Dictar Veredicto */}
            {details.estado === 'RESUELTA' || details.estado === 'DESESTIMADA' ? (
              <div className="bg-surface-offset border border-border rounded-xl p-6 mt-4 opacity-75">
                <h3 className="font-display text-xl text-text-muted uppercase mb-4">Veredicto Emitido</h3>
                <p className="font-ui text-sm text-text italic">"{details.resolucion}"</p>
              </div>
            ) : canInteract && details.fechaJuicio ? (
              <div className="bg-gold-highlight border border-border-gold rounded-xl p-6 mt-4">
                <h3 className="font-display text-xl text-gold uppercase mb-4">Dictar Veredicto Final</h3>
                <form onSubmit={handleVeredicto} className="flex flex-col gap-4">
                  <textarea 
                    required 
                    rows={5}
                    value={veredicto}
                    onChange={e => setVeredicto(e.target.value)}
                    placeholder="Escribe la resolución del caso luego del juicio en Habbo. Esto cerrará la incidencia."
                    className="bg-surface-offset border border-border-gold rounded-lg p-4 font-ui text-sm text-text focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 font-ui text-sm text-text-muted cursor-pointer hover:text-text">
                      <input 
                        type="checkbox" 
                        checked={desestimar} 
                        onChange={e => setDesestimar(e.target.checked)} 
                        className="accent-gold"
                      />
                      Desestimar caso (sin sanción / irrelevante)
                    </label>
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="bg-gold text-surface-offset font-bold font-ui text-sm uppercase tracking-wider px-8 py-3 rounded-lg hover:bg-gold-bright transition-colors disabled:opacity-50"
                    >
                      {submitting ? 'Procesando...' : 'Dictar Sentencia'}
                    </button>
                  </div>
                </form>
              </div>
            ) : null}

          </div>
        )}
      </div>
    )
  }

  const renderIncidenciaRow = (inc: Incidencia) => (
    <div key={inc.id} className="bg-surface border border-border p-5 rounded-lg flex items-center justify-between hover:border-gold/50 transition-colors">
      <div className="flex flex-col gap-1">
        <div className="font-display text-lg text-text uppercase tracking-wide">
          {inc.titulo}
        </div>
        <div className="font-ui text-xs text-text-muted flex gap-4">
          <span>Demandante: <strong className="text-gold">{inc.ejercitoDenunciante?.sigla}</strong></span>
          <span>Demandado: <strong className="text-onair">{inc.ejercitoDenunciado?.sigla}</strong></span>
          {inc.juez && <span>Juez: <strong>{inc.juez.username}</strong></span>}
        </div>
      </div>
      <div className="flex items-center gap-6">
        <span className={`font-ui text-xs font-bold uppercase ${ESTADO_COLOR[inc.estado]}`}>
          {inc.estado.replace('_', ' ')}
        </span>
        <button 
          onClick={() => loadDetails(inc.id)}
          className="bg-surface-offset border border-border px-4 py-2 rounded text-gold font-ui text-xs uppercase hover:border-gold transition-colors"
        >
          {inc.estado === 'ABIERTA' && !inc.juezId && (userRole === 'JUEZ' || userRole === 'ADMIN') ? 'Revisar Solicitud' : 'Ver Detalles'}
        </button>
      </div>
    </div>
  )

  const solicitudes = incidencias.filter(i => i.estado === 'ABIERTA')
  const misCasos    = incidencias.filter(i => i.juezId === userId)
  const listToRender = tab === 'solicitudes' ? solicitudes : tab === 'mis_casos' ? misCasos : incidencias

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="font-display text-2xl text-gold uppercase">Incidencias (Juzgado)</h2>
          <p className="font-ui text-sm text-text-muted mt-1">Revisa y dicta veredictos de los conflictos entre ejércitos.</p>
        </div>
      </div>

      <div className="flex border-b border-border gap-6">
        <button 
          onClick={() => setTab('solicitudes')} 
          className={`pb-2 font-display uppercase tracking-wider text-sm transition-colors ${tab === 'solicitudes' ? 'border-b-2 border-gold text-gold' : 'text-text-muted hover:text-text'}`}
        >
          Solicitudes ({solicitudes.length})
        </button>
        <button 
          onClick={() => setTab('mis_casos')} 
          className={`pb-2 font-display uppercase tracking-wider text-sm transition-colors ${tab === 'mis_casos' ? 'border-b-2 border-gold text-gold' : 'text-text-muted hover:text-text'}`}
        >
          Mis Casos ({misCasos.length})
        </button>
        <button 
          onClick={() => setTab('todos')} 
          className={`pb-2 font-display uppercase tracking-wider text-sm transition-colors ${tab === 'todos' ? 'border-b-2 border-gold text-gold' : 'text-text-muted hover:text-text'}`}
        >
          Todos ({incidencias.length})
        </button>
      </div>

      {loading ? (
        <p className="font-ui text-sm text-text-muted">Cargando…</p>
      ) : listToRender.length === 0 ? (
        <p className="font-ui text-sm text-text-muted">No hay incidencias en esta categoría.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {listToRender.map(renderIncidenciaRow)}
        </div>
      )}
    </div>
  )
}
