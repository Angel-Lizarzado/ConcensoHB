'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import LogoCGE from '@/components/ui/LogoCGE'

export default function MiPerfilPage() {
  const { data: session } = useSession()
  const isAdmin = (session?.user as any)?.role === 'ADMIN'

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({ mision: '', biografia: '' })
  const [pass, setPass] = useState({ old: '', new: '', confirm: '' })
  
  const [msgProfile, setMsgProfile] = useState<{ text: string, type: 'ok' | 'error' } | null>(null)
  const [msgPass, setMsgPass] = useState<{ text: string, type: 'ok' | 'error' } | null>(null)

  useEffect(() => {
    if (isAdmin) {
      fetch('/api/perfil')
        .then(res => res.json())
        .then(json => {
          if (json.data) {
            setProfile({ 
              mision: json.data.mision || '', 
              biografia: json.data.biografia || '' 
            })
          }
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [isAdmin])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsgProfile(null)
    try {
      const res = await fetch('/api/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })
      const data = await res.json()
      if (res.ok) setMsgProfile({ text: 'Perfil actualizado correctamente.', type: 'ok' })
      else setMsgProfile({ text: data.error, type: 'error' })
    } catch {
      setMsgProfile({ text: 'Error al actualizar', type: 'error' })
    }
  }

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsgPass(null)
    
    if (pass.new !== pass.confirm) {
      setMsgPass({ text: 'Las contraseñas no coinciden.', type: 'error' })
      return
    }

    try {
      const res = await fetch('/api/perfil/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword: pass.old, newPassword: pass.new })
      })
      const data = await res.json()
      if (res.ok) {
        setMsgPass({ text: 'Contraseña actualizada correctamente.', type: 'ok' })
        setPass({ old: '', new: '', confirm: '' })
      } else {
        setMsgPass({ text: data.error, type: 'error' })
      }
    } catch {
      setMsgPass({ text: 'Error al actualizar', type: 'error' })
    }
  }

  if (loading) return null

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-gold-bright)', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
          Mi Perfil
        </h1>
        <p style={{ fontFamily: 'var(--font-ui)', color: 'var(--color-text-muted)' }}>
          Gestiona tu cuenta y credenciales.
        </p>
      </div>

      {isAdmin && (
        <form onSubmit={handleSaveProfile} className="bg-surface border border-border rounded-xl p-6 md:p-8 flex flex-col gap-6">
          <div>
            <h2 className="font-display text-xl text-gold uppercase tracking-wide">Transparencia del Concilio</h2>
            <p className="font-ui text-sm text-text-muted mt-1">Como administrador, esta información será pública en la sección "Equipo" para fomentar la transparencia.</p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-ui text-xs text-text-muted uppercase tracking-widest font-bold">Misión / Título Oficial</label>
            <input 
              type="text" 
              className="input-gold" 
              placeholder="Ej: CGE General al mando" 
              value={profile.mision}
              onChange={e => setProfile({...profile, mision: e.target.value})}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-ui text-xs text-text-muted uppercase tracking-widest font-bold">Biografía o CV</label>
            <textarea 
              className="input-gold" 
              placeholder="Escribe sobre tu trayectoria, valores y tu rol dentro del Concilio..." 
              rows={6}
              value={profile.biografia}
              onChange={e => setProfile({...profile, biografia: e.target.value})}
            />
          </div>

          {msgProfile && (
            <p className={`font-ui text-sm p-3 rounded-md border ${msgProfile.type === 'ok' ? 'bg-gold/10 text-gold border-gold/30' : 'bg-onair/10 text-onair border-onair/30'}`}>
              {msgProfile.text}
            </p>
          )}

          <div>
            <button type="submit" className="btn-primary">Guardar Perfil</button>
          </div>
        </form>
      )}

      <form onSubmit={handleSavePassword} className="bg-surface border border-border rounded-xl p-6 md:p-8 flex flex-col gap-6">
        <div>
          <h2 className="font-display text-xl text-text uppercase tracking-wide">Cambiar Contraseña</h2>
          <p className="font-ui text-sm text-text-muted mt-1">Asegúrate de usar una contraseña fuerte y no compartirla con nadie.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2 md:col-span-2">
            <label className="font-ui text-xs text-text-muted uppercase tracking-widest font-bold">Contraseña Actual</label>
            <input 
              type="password" 
              required
              className="input-gold max-w-sm" 
              value={pass.old}
              onChange={e => setPass({...pass, old: e.target.value})}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-ui text-xs text-text-muted uppercase tracking-widest font-bold">Nueva Contraseña</label>
            <input 
              type="password" 
              required
              minLength={8}
              className="input-gold" 
              value={pass.new}
              onChange={e => setPass({...pass, new: e.target.value})}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-ui text-xs text-text-muted uppercase tracking-widest font-bold">Confirmar Nueva Contraseña</label>
            <input 
              type="password" 
              required
              className="input-gold" 
              value={pass.confirm}
              onChange={e => setPass({...pass, confirm: e.target.value})}
            />
          </div>
        </div>

        {msgPass && (
          <p className={`font-ui text-sm p-3 rounded-md border max-w-md ${msgPass.type === 'ok' ? 'bg-gold/10 text-gold border-gold/30' : 'bg-onair/10 text-onair border-onair/30'}`}>
            {msgPass.text}
          </p>
        )}

        <div>
          <button type="submit" className="btn-secondary">Actualizar Contraseña</button>
        </div>
      </form>

    </div>
  )
}
