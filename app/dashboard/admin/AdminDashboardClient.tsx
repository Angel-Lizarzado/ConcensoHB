'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import AdminStats from './sections/AdminStats'
import AdminEjercitos from './sections/AdminEjercitos'
import AdminUsuarios from './sections/AdminUsuarios'
import AdminActividades from './sections/AdminActividades'
import AdminMediaciones from './sections/AdminMediaciones'
import AdminRadio from './sections/AdminRadio'
import AdminConfiguracion from './sections/AdminConfiguracion'
import AdminInvitaciones from './sections/AdminInvitaciones'
import AdminIncidencias from './sections/AdminIncidencias'
import AdminCalendario from './sections/AdminCalendario'
import AdminChat from './sections/AdminChat'

type Tab = 'resumen' | 'ejercitos' | 'usuarios' | 'actividades' | 'mediaciones' | 'incidencias' | 'calendario' | 'chat' | 'radio' | 'configuracion' | 'invitaciones'

const TABS: { key: Tab; label: string }[] = [
  { key: 'resumen',        label: 'Resumen'       },
  { key: 'ejercitos',      label: 'Ejércitos'     },
  { key: 'usuarios',       label: 'Usuarios'      },
  { key: 'actividades',    label: 'Actividades'   },
  { key: 'mediaciones',    label: 'Mediaciones'   },
  { key: 'incidencias',    label: 'Incidencias'   },
  { key: 'calendario',     label: 'Calendario'    },
  { key: 'chat',           label: 'Canales de Chat' },
  { key: 'invitaciones',   label: 'Invitaciones'  },
  { key: 'radio',          label: 'Radio'         },
  { key: 'configuracion',  label: 'Configuración' },
]

export default function AdminDashboardClient({ username }: { username: string }) {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const tab          = (searchParams.get('tab') as Tab) ?? 'resumen'

  const setTab = (t: Tab) => {
    router.push(t === 'resumen' ? '/dashboard/admin' : `/dashboard/admin?tab=${t}`, { scroll: false })
  }

  return (
    <div style={{ padding: 'var(--space-8)' }}>
      {/* Header de sección — sin tabs duplicados, el sidebar es la navegación */}
      <div style={{ marginBottom: 'var(--space-8)', paddingBottom: 'var(--space-6)', borderBottom: '1px solid var(--color-border-gold)' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)',
          fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase',
          color: 'var(--color-gold-bright)', marginBottom: 'var(--space-2)',
        }}>
          {TABS.find(t => t.key === tab)?.label ?? 'Resumen'}
        </h1>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          Panel de Administración · <strong style={{ color: 'var(--color-gold)' }}>{username}</strong>
        </p>
      </div>

      {/* Contenido según tab activo */}
      {tab === 'resumen'       && <AdminStats />}
      {tab === 'ejercitos'     && <AdminEjercitos />}
      {tab === 'usuarios'      && <AdminUsuarios />}
      {tab === 'actividades'   && <AdminActividades />}
      {tab === 'mediaciones'   && <AdminMediaciones />}
      {tab === 'incidencias'  && <AdminIncidencias />}
      {tab === 'calendario'    && <AdminCalendario />}
      {tab === 'chat'          && <AdminChat />}
      {tab === 'invitaciones'  && <AdminInvitaciones />}
      {tab === 'radio'         && <AdminRadio />}
      {tab === 'configuracion' && <AdminConfiguracion />}
    </div>
  )
}
