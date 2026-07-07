'use client'

import { useEffect, useState } from 'react'

const ROLES  = ['ADMIN', 'REPORTERO', 'COMANDANTE', 'JUEZ', 'VISITANTE']
const DEPTS  = ['NOTICIAS', 'WIREDS', 'JUZGADO', 'OFICIAL']
const ROLES_E = ['COMANDANTE', 'EMBAJADOR']

interface Usuario {
  id: string; username: string; role: string
  departamento: string | null; rolEjercito: string | null
  ejercito: { sigla: string; nombre: string } | null
  invitadoPor: { username: string } | null
  createdAt: string
}

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading]   = useState(true)
  const [editId, setEditId]     = useState<string | null>(null)
  const [editData, setEditData] = useState<any>({})
  const [saving, setSaving]     = useState(false)

  const load = () => {
    setLoading(true)
    fetch('/api/usuarios').then(r => r.json()).then(d => setUsuarios(d.data ?? [])).finally(() => setLoading(false))
  }

  const resetPassword = async (userId: string) => {
    if (!confirm('¿Estás seguro de resetear la contraseña de este usuario? Se generará una nueva y deberás entregársela.')) return
    try {
      const res = await fetch(`/api/usuarios/${userId}/reset`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        alert(`La nueva contraseña es: ${data.newPassword}\n\nCópiala y envíasela al usuario.`)
      } else {
        alert(data.error || 'Error al resetear contraseña')
      }
    } catch {
      alert('Error de conexión')
    }
  }

  const deleteUser = async (userId: string, username: string) => {
    if (!confirm(`¿Estás TOTALMENTE seguro de eliminar al usuario "${username}"?\nEsta acción no se puede deshacer y borrará todos sus datos.`)) return
    try {
      const res = await fetch(`/api/usuarios?userId=${userId}`, { method: 'DELETE' })
      if (res.ok) {
        alert('Usuario eliminado correctamente.')
        load()
      } else {
        const data = await res.json()
        alert(data.error || 'Error al eliminar usuario')
      }
    } catch {
      alert('Error de conexión al intentar eliminar.')
    }
  }

  useEffect(load, [])

  const startEdit = (u: Usuario) => {
    setEditId(u.id)
    setEditData({ role: u.role, departamento: u.departamento ?? '', rolEjercito: u.rolEjercito ?? '' })
  }

  const saveEdit = async () => {
    setSaving(true)
    await fetch('/api/usuarios', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: editId,
        role: editData.role,
        departamento: editData.departamento === '' ? null : editData.departamento,
        rolEjercito: editData.rolEjercito === '' ? null : editData.rolEjercito,
      }),
    })
    setEditId(null)
    load()
    setSaving(false)
  }

  return (
    <div>
      <h2 style={sectionTitle}>Gestión de Usuarios</h2>
      {loading ? <p style={muted}>Cargando…</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border-gold)' }}>
                {['Usuario', 'Rol CGE', 'Departamento', 'Rol Ejército', 'Ejército', 'Invitado por', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'left', color: 'var(--color-gold)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)', background: editId === u.id ? 'var(--color-surface-offset)' : 'transparent' }}>
                  <td style={td}><strong style={{ color: 'var(--color-text)' }}>{u.username}</strong></td>
                  <td style={td}>
                    {editId === u.id ? (
                      <select value={editData.role} onChange={e => setEditData((p: any) => ({ ...p, role: e.target.value }))} className="input-gold" style={{ padding: '2px 6px', width: 'auto' }}>
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    ) : (
                      <span style={{ color: u.role === 'ADMIN' ? 'var(--color-gold)' : 'var(--color-text-muted)' }}>{u.role}</span>
                    )}
                  </td>
                  <td style={td}>
                    {editId === u.id ? (
                      <select value={editData.departamento} onChange={e => setEditData((p: any) => ({ ...p, departamento: e.target.value }))} className="input-gold" style={{ padding: '2px 6px', width: 'auto' }}>
                        <option value="">—</option>
                        {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    ) : (
                      <span style={{ color: 'var(--color-text-faint)' }}>{u.departamento ?? '—'}</span>
                    )}
                  </td>
                  <td style={td}>
                    {editId === u.id ? (
                      <select value={editData.rolEjercito} onChange={e => setEditData((p: any) => ({ ...p, rolEjercito: e.target.value }))} className="input-gold" style={{ padding: '2px 6px', width: 'auto' }}>
                        <option value="">—</option>
                        {ROLES_E.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    ) : (
                      <span style={{ color: 'var(--color-text-faint)' }}>{u.rolEjercito ?? '—'}</span>
                    )}
                  </td>
                  <td style={td}>{u.ejercito ? `${u.ejercito.sigla}` : '—'}</td>
                  <td style={td}>{u.invitadoPor?.username ?? '—'}</td>
                  <td style={td}>
                    {editId === u.id ? (
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button onClick={saveEdit} disabled={saving} className="btn-primary" style={{ fontSize: 10, padding: '4px 10px' }}>
                          {saving ? '…' : 'Guardar'}
                        </button>
                        <button onClick={() => setEditId(null)} className="btn-secondary" style={{ fontSize: 10, padding: '4px 10px' }}>
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button onClick={() => startEdit(u)} className="btn-secondary" style={{ fontSize: 10, padding: '4px 10px' }}>
                          Editar
                        </button>
                        <button onClick={() => resetPassword(u.id)} className="btn-secondary" style={{ fontSize: 10, padding: '4px 10px' }}>
                          Reset Clave
                        </button>
                        <button onClick={() => deleteUser(u.id, u.username)} className="btn-secondary" style={{ fontSize: 10, padding: '4px 10px', color: '#ff6b6b', borderColor: '#ff6b6b' }}>
                          Eliminar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const sectionTitle: React.CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-gold-bright)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 'var(--space-6)' }
const muted: React.CSSProperties        = { fontFamily: 'var(--font-ui)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }
const td: React.CSSProperties           = { padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-muted)', verticalAlign: 'middle' }
