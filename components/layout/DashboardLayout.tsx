// DashboardLayout — shell compartido para todos los dashboards
// Sidebar de navegación por rol + header con usuario

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useSearchParams } from 'next/navigation'
import { signOut } from 'next-auth/react'
import LogoCGE from '@/components/ui/LogoCGE'
import { habboAvatarFull } from '@/lib/habbo'

type Role = 'ADMIN' | 'REPORTERO' | 'COMANDANTE' | 'JUEZ' | 'VISITANTE'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  highlight?: boolean
}

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  ADMIN: [
    { href: '/dashboard/admin',                          label: 'Resumen',        icon: <IconGrid /> },
    { href: '/dashboard/admin?tab=actividades',           label: 'Actividades',    icon: <IconTrophy /> },
    { href: '/dashboard/admin?tab=mediaciones',           label: 'Mediaciones',    icon: <IconScale /> },
    { href: '/dashboard/admin?tab=ejercitos',             label: 'Ejércitos',      icon: <IconShield /> },
    { href: '/dashboard/admin?tab=usuarios',              label: 'Usuarios',       icon: <IconUsers /> },
    { href: '/dashboard/admin?tab=incidencias',           label: 'Incidencias',    icon: <IconAlert />, highlight: true },
    { href: '/dashboard/admin?tab=calendario',            label: 'Calendario',     icon: <IconCalendar /> },
    { href: '/dashboard/admin?tab=chat',                  label: 'Canales de Chat',icon: <IconChat /> },
    { href: '/dashboard/admin?tab=invitaciones',          label: 'Invitaciones',   icon: <IconKey /> },
    { href: '/dashboard/admin?tab=radio',                 label: 'Radio',          icon: <IconRadio /> },
    { href: '/dashboard/admin?tab=configuracion',         label: 'Configuración',  icon: <IconSettings /> },
  ],
  REPORTERO: [
    { href: '/dashboard/reportero',              label: 'Mis Noticias',   icon: <IconNews /> },
    { href: '/dashboard/reportero?vista=nueva',  label: 'Nueva Noticia',  icon: <IconPlus /> },
    { href: '/chat',                             label: 'Chat',           icon: <IconChat /> },
  ],
  COMANDANTE: [
    { href: '/dashboard/comandante',                      label: 'Mi Ejército',    icon: <IconShield /> },
    { href: '/dashboard/comandante?tab=miembros',         label: 'Miembros',       icon: <IconUsers /> },
    { href: '/dashboard/comandante/invitaciones',         label: 'Invitaciones',   icon: <IconKey /> },
    { href: '/dashboard/comandante?tab=mediaciones',      label: 'Mediaciones',    icon: <IconScale /> },
    { href: '/dashboard/comandante?tab=incidencias',      label: 'Incidencias',    icon: <IconAlert /> },
    { href: '/chat',                                      label: 'Chat',           icon: <IconChat /> },
  ],
  JUEZ: [
    { href: '/dashboard/juez',                   label: 'Casos',          icon: <IconScale /> },
    { href: '/chat',                             label: 'Chat',           icon: <IconChat /> },
  ],
  VISITANTE: [],
}

interface DashboardLayoutProps {
  children: React.ReactNode
  username: string
  role: Role
}

export default function DashboardLayout({ children, username, role }: DashboardLayoutProps) {
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const navItems     = NAV_BY_ROLE[role] ?? []

  const isActive = (href: string) => {
    const [hrefPath, hrefQuery] = href.split('?')
    if (hrefQuery) {
      const hrefParams = new URLSearchParams(hrefQuery)
      const currentTab = searchParams.get('tab') ?? searchParams.get('vista')
      const hrefTab    = hrefParams.get('tab')   ?? hrefParams.get('vista')
      return pathname === hrefPath && currentTab === hrefTab
    }
    // Rutas raíz de cada dashboard — solo activas cuando no hay query params
    const dashboardRoots = ['/dashboard/admin', '/dashboard/reportero', '/dashboard/comandante', '/dashboard/juez']
    if (dashboardRoots.includes(href)) {
      return pathname === href && !searchParams.get('tab') && !searchParams.get('vista')
    }
    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* Sidebar */}
      <aside 
        className="glass-panel"
        style={{
          width: 240, flexShrink: 0,
          borderRight: '1px solid var(--color-border-gold)',
          display: 'flex', flexDirection: 'column',
          position: 'sticky', top: 0, height: '100vh',
          overflowY: 'auto',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
            padding: 'var(--space-5) var(--space-5)',
            borderBottom: '1px solid var(--color-border)',
            textDecoration: 'none',
          }}
        >
          <LogoCGE size={32} />
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)',
            fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--color-gold-bright)',
          }}>
            CGE
          </span>
        </Link>

        {/* User info — avatar Habbo completo + nombre */}
        <div style={{
          padding: 'var(--space-4) var(--space-5)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'flex-end', gap: 'var(--space-3)',
          background: 'var(--color-surface-offset)',
          overflow: 'hidden', position: 'relative',
        }}>
          {/* Avatar completo Habbo — recortado en la parte inferior */}
          <div style={{
            width: 56, height: 72, flexShrink: 0,
            overflow: 'hidden', position: 'relative',
            borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            border: '1px solid var(--color-border-gold)', borderBottom: 'none',
            background: 'var(--color-surface-2)',
          }}>
            <Image
              src={habboAvatarFull(username)}
              alt={username}
              width={64}
              height={110}
              style={{ objectFit: 'cover', objectPosition: 'top center', imageRendering: 'pixelated', display: 'block' }}
              unoptimized
            />
          </div>
          <div style={{ minWidth: 0, paddingBottom: 'var(--space-2)' }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {username}
            </div>
            <div style={{
              display: 'inline-block', marginTop: 3,
              fontFamily: 'var(--font-ui)', fontSize: 9,
              color: 'var(--color-gold)', letterSpacing: '0.12em', textTransform: 'uppercase',
              background: 'var(--color-gold-highlight)', border: '1px solid var(--color-border-gold)',
              borderRadius: 'var(--radius-sm)', padding: '1px 6px',
            }}>
              {role}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: 'var(--space-4) var(--space-3)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {navItems.map(item => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                    padding: 'var(--space-3) var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    textDecoration: 'none',
                    background: active ? 'var(--color-gold-highlight)' : (item.highlight ? 'color-mix(in oklch, var(--color-onair) 10%, transparent)' : 'transparent'),
                    border: `1px solid ${active ? 'var(--color-border-gold)' : (item.highlight ? 'color-mix(in oklch, var(--color-onair) 30%, transparent)' : 'transparent')}`,
                    color: active ? 'var(--color-gold)' : (item.highlight ? 'var(--color-onair)' : 'var(--color-text-muted)'),
                    fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)',
                    fontWeight: active ? 600 : (item.highlight ? 600 : 400),
                    letterSpacing: '0.05em',
                    transition: 'all var(--transition)',
                  }}
                >
                  <span style={{ flexShrink: 0, opacity: active || item.highlight ? 1 : 0.6 }}>{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Logout */}
        <div style={{ padding: 'var(--space-4) var(--space-3)', borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-3)', borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)',
              color: 'var(--color-text-faint)', cursor: 'pointer',
              transition: 'color var(--transition)',
              background: 'none', border: 'none',
            }}
          >
            <IconLogout />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflowX: 'hidden', background: 'var(--color-bg)' }}>
        {children}
      </main>
    </div>
  )
}

// =============================================
// Iconos inline (SVG mínimos 16x16)
// =============================================
function IconGrid()     { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> }
function IconShield()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> }
function IconUsers()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg> }
function IconTrophy()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/></svg> }
function IconScale()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 6l9 6 9-6"/><path d="M3 12l9 6 9-6"/></svg> }
function IconAlert()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> }
function IconKey()      { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg> }
function IconRadio()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 2l20 4v12l-20 4V2z"/><circle cx="8" cy="12" r="2"/></svg> }
function IconSettings() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> }
function IconNews()     { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z"/></svg> }
function IconPlus()     { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> }
function IconChat()     { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> }
function IconCalendar() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> }
function IconLogout()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> }
