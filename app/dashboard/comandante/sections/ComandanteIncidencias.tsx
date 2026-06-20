'use client'

import { useState, useEffect } from 'react'

interface Incidencia {
  id: string
  titulo: string
  descripcion: string
  estado: string
  createdAt: string
  ejercitoDenuncianteId: string
  ejercitoDenunciadoId: string
  ejercitoDenunciante: { nombre: string; sigla: string }
  ejercitoDenunciado: { nombre: string; sigla: string }
}

export default function ComandanteIncidencias({ ejercitoId }: { ejercitoId: string }) {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([])
  const [loading, setLoading] = useState(true)
  
  // Create form state
  const [showCreate, setShowCreate] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [ejercitoDenunciadoId, setEjercitoDenunciadoId] = useState('')
  const [ejercitos, setEjercitos] = useState<{ id: string; sigla: string; nombre: string }[]>([])
  const [submitting, setSubmitting] = useState(false)

  // View state
  const [viewId, setViewId] = useState<string | null>(null)
  const [incidenciaDetails, setIncidenciaDetails] = useState<any>(null)

  const [pruebaUrl, setPruebaUrl] = useState('')
  const [pruebaDesc, setPruebaDesc] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchIncidencias()
    fetchEjercitos()
  }, [])

  const fetchIncidencias = async () => {
    setLoading(true)
    const res = await fetch('/api/incidencias')
    if (res.ok) {
      const data = await res.json()
      setIncidencias(data.data || [])
    }
    setLoading(false)
  }

  const fetchEjercitos = async () => {
    const res = await fetch('/api/ejercitos')
    if (res.ok) {
      const data = await res.json()
      setEjercitos((data.data || []).filter((e: any) => e.id !== ejercitoId))
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const res = await fetch('/api/incidencias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, descripcion, ejercitoDenunciadoId })
    })
    if (res.ok) {
      setShowCreate(false)
      setTitulo('')
      setDescripcion('')
      setEjercitoDenunciadoId('')
      fetchIncidencias()
    } else {
      alert('Error al crear la incidencia')
    }
    setSubmitting(false)
  }

  const handleView = async (id: string) => {
    setViewId(id)
    setIncidenciaDetails(null)
    const res = await fetch(`/api/incidencias/${id}`)
    if (res.ok) {
      const data = await res.json()
      setIncidenciaDetails(data.data)
    }
  }

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    const file = e.target.files[0]
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('departamento', 'JUZGADO')

    setUploading(true)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    if (res.ok) {
      const data = await res.json()
      setPruebaUrl(data.url)
    } else {
      alert('Error al subir la imagen')
    }
    setUploading(false)
  }

  const handleSubmitPrueba = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pruebaUrl || !viewId) return
    setSubmitting(true)
    const res = await fetch(`/api/incidencias/${viewId}/pruebas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urlArchivo: pruebaUrl, descripcion: pruebaDesc })
    })
    if (res.ok) {
      setPruebaUrl('')
      setPruebaDesc('')
      handleView(viewId) // Refresh
    } else {
      alert('Error al adjuntar prueba')
    }
    setSubmitting(false)
  }

  if (viewId) {
    return (
      <div className="flex flex-col gap-6">
        <button onClick={() => setViewId(null)} className="text-gold hover:text-gold-bright font-ui text-sm self-start">
          ← Volver al listado
        </button>

        {!incidenciaDetails ? (
          <p className="font-ui text-text-muted">Cargando detalles...</p>
        ) : (
          <div className="bg-surface border border-border p-6 rounded-xl flex flex-col gap-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-display text-xl text-gold-bright uppercase tracking-wider">{incidenciaDetails.titulo}</h3>
                <p className="font-ui text-sm text-text-muted mt-1">
                  Demandante: {incidenciaDetails.ejercitoDenunciante.sigla} | Demandado: {incidenciaDetails.ejercitoDenunciado.sigla}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                incidenciaDetails.estado === 'ABIERTA' ? 'bg-surface-offset text-text' : 
                incidenciaDetails.estado === 'EN_PROCESO' ? 'bg-gold/20 text-gold' : 'bg-onair/20 text-onair'
              }`}>
                {incidenciaDetails.estado}
              </span>
            </div>

            <p className="font-ui text-text text-sm bg-surface-offset p-4 rounded-lg">{incidenciaDetails.descripcion}</p>

            {incidenciaDetails.resolucion && (
              <div className="bg-gold-highlight border border-border-gold p-4 rounded-lg">
                <h4 className="font-display text-sm text-gold uppercase mb-2">Veredicto del Juez</h4>
                <p className="font-ui text-sm text-text">{incidenciaDetails.resolucion}</p>
              </div>
            )}

            <div className="border-t border-border pt-6">
              <h4 className="font-display text-lg text-gold mb-4 uppercase">Bóveda de Pruebas</h4>
              <p className="font-ui text-xs text-text-muted mb-4">
                Aquí puedes ver las pruebas que tu ejército ha subido. El bando contrario ha adjuntado <strong className="text-onair">{incidenciaDetails._count?.pruebasRival || 0}</strong> pruebas (ocultas).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {incidenciaDetails.pruebas?.map((p: any) => (
                  <div key={p.id} className="border border-border rounded-lg p-2 bg-surface-offset flex gap-4 items-center">
                    <img src={p.valor} alt="Prueba" className="w-24 h-24 object-cover rounded bg-surface" />
                    <p className="font-ui text-sm text-text flex-1">{p.descripcion || 'Sin descripción'}</p>
                  </div>
                ))}
              </div>

              {incidenciaDetails.estado !== 'RESUELTA' && incidenciaDetails.estado !== 'DESESTIMADA' && (
                <form onSubmit={handleSubmitPrueba} className="bg-surface-offset border border-border p-4 rounded-lg flex flex-col gap-4">
                  <h5 className="font-ui text-sm font-bold text-text uppercase">Adjuntar nueva prueba</h5>
                  
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <input type="file" accept="image/*" onChange={handleUploadFile} className="font-ui text-sm text-text-muted mb-2 w-full" disabled={uploading || submitting} />
                      {uploading && <p className="text-xs text-gold">Subiendo imagen...</p>}
                      {pruebaUrl && <img src={pruebaUrl} alt="Preview" className="h-20 rounded border border-border mt-2" />}
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <input 
                        type="text" 
                        value={pruebaDesc} 
                        onChange={e => setPruebaDesc(e.target.value)} 
                        placeholder="Descripción breve..." 
                        className="bg-surface border border-border rounded px-3 py-2 font-ui text-sm text-text focus:border-gold outline-none"
                        disabled={uploading || submitting}
                      />
                      <button 
                        type="submit" 
                        disabled={!pruebaUrl || submitting || uploading}
                        className="bg-gold text-surface-offset font-bold py-2 rounded font-ui text-sm disabled:opacity-50"
                      >
                        {submitting ? 'Adjuntando...' : 'Adjuntar Prueba'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

          </div>
        )}
      </div>
    )
  }

  if (showCreate) {
    return (
      <div className="flex flex-col gap-6 max-w-xl">
        <button onClick={() => setShowCreate(false)} className="text-gold hover:text-gold-bright font-ui text-sm self-start">
          ← Cancelar
        </button>
        <div className="bg-surface border border-border p-6 rounded-xl">
          <h2 className="font-display text-2xl text-gold uppercase mb-6">Crear Incidencia</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-ui text-xs text-text-muted uppercase tracking-wider">Ejército Implicado</label>
              <select required value={ejercitoDenunciadoId} onChange={e => setEjercitoDenunciadoId(e.target.value)} className="bg-surface-offset border border-border text-text text-sm rounded-lg px-4 py-3 focus:border-gold outline-none">
                <option value="">Seleccione un ejército</option>
                {ejercitos.map(e => <option key={e.id} value={e.id}>{e.nombre} ({e.sigla})</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-ui text-xs text-text-muted uppercase tracking-wider">Asunto / Título</label>
              <input required type="text" value={titulo} onChange={e => setTitulo(e.target.value)} className="bg-surface-offset border border-border text-text text-sm rounded-lg px-4 py-3 focus:border-gold outline-none" placeholder="Ej: Ataque no provocado en sala X" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-ui text-xs text-text-muted uppercase tracking-wider">Descripción Inicial</label>
              <textarea required value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={4} className="bg-surface-offset border border-border text-text text-sm rounded-lg px-4 py-3 focus:border-gold outline-none" placeholder="Describe brevemente lo ocurrido. Podrás adjuntar capturas luego." />
            </div>
            <button type="submit" disabled={submitting} className="bg-gold text-surface-offset font-bold uppercase tracking-wider py-3 rounded-lg mt-4 disabled:opacity-50">
              {submitting ? 'Creando...' : 'Crear Incidencia'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-surface border border-border p-6 rounded-xl">
        <div>
          <h2 className="font-display text-2xl text-gold uppercase mb-1">Bóveda de Pruebas</h2>
          <p className="font-ui text-text-muted text-sm">Gestiona los conflictos y evidencias de tu ejército.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="bg-gold text-surface-offset px-6 py-2 rounded-lg font-ui font-bold text-sm uppercase tracking-wider hover:bg-gold-bright transition-colors">
          + Nueva Incidencia
        </button>
      </div>

      {loading ? (
        <p className="font-ui text-text-muted">Cargando incidencias...</p>
      ) : incidencias.length === 0 ? (
        <p className="font-ui text-text-muted text-center py-8 bg-surface-offset rounded-xl border border-border">No hay incidencias registradas.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {incidencias.map(inc => (
            <div key={inc.id} className="bg-surface border border-border p-5 rounded-lg flex items-center justify-between hover:border-border-gold transition-colors">
              <div>
                <h3 className="font-display text-lg text-text uppercase tracking-wide">{inc.titulo}</h3>
                <p className="font-ui text-xs text-text-muted mt-1">
                  Vs: {inc.ejercitoDenuncianteId === ejercitoId ? inc.ejercitoDenunciado.sigla : inc.ejercitoDenunciante.sigla} • 
                  Creada: {new Date(inc.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  inc.estado === 'ABIERTA' ? 'bg-surface-offset text-text' : 
                  inc.estado === 'EN_PROCESO' ? 'bg-gold/20 text-gold' : 'bg-onair/20 text-onair'
                }`}>
                  {inc.estado}
                </span>
                <button onClick={() => handleView(inc.id)} className="text-gold font-ui text-sm hover:underline">Ver Caso →</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
