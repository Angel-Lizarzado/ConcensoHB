'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import LogoCGE from '@/components/ui/LogoCGE'
import { habboAvatarHead } from '@/lib/habbo'

interface HeaderProps {
  siteName?:     string
  siteSubtitle?: string
  siteSlogan?:   string
}

// =============================================
// Estructura del menú con dropdowns
// =============================================
const NAV_ITEMS = [
  { label: 'Inicio',     href: '/' },
  {
    label: 'Noticias',
    children: [
      { label: 'Todas las noticias', href: '/noticias',                desc: 'Feed completo' },
      { label: 'Noticias',           href: '/noticias?dept=NOTICIAS',  desc: 'Cobertura general',      dot: 'var(--color-noticias)' },
      { label: 'Wireds',             href: '/noticias?dept=WIREDS',    desc: 'Eventos y torneos',       dot: 'var(--color-wireds)'   },
      { label: 'Juzgado',            href: '/noticias?dept=JUZGADO',   desc: 'Resoluciones oficiales',  dot: 'var(--color-juzgado)'  },
      { label: 'Oficial',            href: '/noticias?dept=OFICIAL',   desc: 'Comunicados del Concilio', dot: 'var(--color-gold)'    },
    ],
  },
  {
    label: 'Comunidad',
    children: [
      { label: 'Ejércitos',  href: '/ejercitos', desc: 'Fuerzas afiliadas al Concilio' },
      { label: 'Rankings',   href: '/rankings',  desc: 'Tabla de posiciones'           },
      { label: 'Eventos',    href: '/eventos',   desc: 'Calendario de actividades'     },
    ],
  },
  {
    label: 'Concilio',
    children: [
      { label: 'Mediación', href: '/mediacion', desc: 'Solicitar intervención neutral' },
    ],
  },
]

// Items solo para usuarios autenticados
const AUTH_NAV_ITEMS = [
  { label: 'Chat',        href: '/chat',        desc: 'Canales de la comunidad' },
  { label: 'Incidencias', href: '/incidencias', desc: 'Registrar una incidencia' },
]

// =============================================
// Dropdown component
// =============================================
interface DropdownItem {
  label: string; href: string; desc?: string; dot?: string
}

function Dropdown({ label, items, isActive }: { label: string; items: DropdownItem[]; isActive: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: 500,
          letterSpacing: '0.1em', textTransform: 'uppercase',
          color: isActive || open ? 'var(--color-gold)' : 'var(--color-text-muted)',
          padding: 'var(--space-2) var(--space-3)',
          borderRadius: 'var(--radius-md)',
          background: open ? 'var(--color-gold-highlight)' : 'transparent',
          border: 'none', cursor: 'pointer',
          transition: 'color var(--transition), background var(--transition)',
        }}
      >
        {label}
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="currentColor"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', opacity: 0.6 }}
        >
          <path d="M1 3L5 7L9 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0,
            minWidth: 220, zIndex: 200,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border-gold)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
            animation: 'dropdown-in 0.12s ease-out',
          }}
        >
          {items.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-5)',
                textDecoration: 'none',
                borderBottom: i < items.length - 1 ? '1px solid var(--color-divider)' : 'none',
                transition: 'background var(--transition)',
              }}
              className="nav-dropdown-item"
            >
              {item.dot && (
                <span style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: item.dot, boxShadow: `0 0 6px ${item.dot}`,
                }} />
              )}
              <div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text)', letterSpacing: '0.05em' }}>
                  {item.label}
                </div>
                {item.desc && (
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--color-text-faint)', marginTop: 1 }}>
                    {item.desc}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// =============================================
// User menu (dropdown del avatar)
// =============================================
function UserMenu({ username }: { username: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          background: open ? 'var(--color-gold-highlight)' : 'var(--color-surface)',
          border: '1px solid var(--color-border-gold)',
          borderRadius: 'var(--radius-full)',
          padding: '3px 10px 3px 3px',
          cursor: 'pointer', transition: 'all var(--transition)',
        }}
      >
        {/* Avatar cabeza Habbo */}
        <div style={{
          width: 32, height: 32, borderRadius: '50%', overflow: 'hidden',
          background: 'var(--color-surface-offset)',
          border: '1px solid var(--color-border-gold)',
          flexShrink: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }}>
          <Image
            src={habboAvatarHead(username)}
            alt={username}
            width={32}
            height={32}
            style={{ objectFit: 'cover', imageRendering: 'pixelated' }}
            unoptimized
          />
        </div>
        <span style={{
          fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: 600,
          color: 'var(--color-gold)', letterSpacing: '0.05em',
        }}>
          {username}
        </span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.5, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M1 3L5 7L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          minWidth: 200, zIndex: 200,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border-gold)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-offset)' }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text)' }}>{username}</div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--color-text-faint)', marginTop: 2 }}>Habbo · CGE</div>
          </div>
          {[
            { label: 'Mi Dashboard',  href: '/dashboard' },
            { label: 'Chat',          href: '/chat'       },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              style={{
                display: 'block', padding: 'var(--space-3) var(--space-5)',
                fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)', textDecoration: 'none',
                borderBottom: '1px solid var(--color-divider)',
                transition: 'background var(--transition)',
              }}
              className="nav-dropdown-item"
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => { setOpen(false); signOut({ callbackUrl: '/' }) }}
            style={{
              width: '100%', display: 'block', padding: 'var(--space-3) var(--space-5)',
              fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)',
              color: 'var(--color-onair)', textAlign: 'left',
              background: 'none', border: 'none', cursor: 'pointer',
              transition: 'background var(--transition)',
            }}
            className="nav-dropdown-item"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}

// =============================================
// Header principal
// =============================================
export default function Header({
  siteName    = 'Concilio General de Ejércitos',
  siteSubtitle = 'Organismo Conciliador · Habbo.es',
  siteSlogan  = '⚔ UNIDAD · HONOR · ORDEN ⚔',
}: HeaderProps) {
  const pathname       = usePathname()
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'

  const isPathActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href.split('?')[0])
  }

  return (
    <>
      {/* Animación dropdown */}
      <style>{`
        @keyframes dropdown-in {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nav-dropdown-item:hover {
          background: var(--color-gold-highlight) !important;
          color: var(--color-gold) !important;
        }
        .nav-link-plain:hover {
          color: var(--color-gold-bright) !important;
          background: var(--color-gold-highlight) !important;
        }
        @media (max-width: 768px) {
          .site-nav-inner { display: none !important; }
        }
      `}</style>

      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'oklch(from #080807 l c h / 0.97)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--color-border-gold)',
      }}>
        {/* Top bar */}
        <div style={{
          background: 'linear-gradient(90deg, #0e0c07, #1a1508, #0e0c07)',
          borderBottom: '1px solid oklch(0.75 0.12 75 / 0.15)',
          padding: 'var(--space-1) var(--space-6)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-gold)', opacity: 0.7 }}>
            {siteSlogan}
          </span>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-text-faint)' }}>
            {siteSubtitle}
          </span>
        </div>

        {/* Main nav */}
        <div style={{
          maxWidth: 'var(--content-wide)', margin: '0 auto',
          padding: 'var(--space-2) var(--space-6)',
          display: 'flex', alignItems: 'center', gap: 'var(--space-6)',
        }}>
          {/* Logo */}
          <Link href="/" aria-label={`${siteName} — Inicio`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', textDecoration: 'none', flexShrink: 0 }}>
            <LogoCGE size={38} />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(0.65rem, 0.5rem + 0.5vw, 0.85rem)', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--color-gold-bright)', textTransform: 'uppercase' }}>
                {siteName}
              </span>
            </div>
          </Link>

          {/* Nav central */}
          <nav className="site-nav-inner" role="navigation" aria-label="Navegación principal" style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            {/* Inicio */}
            <Link
              href="/"
              className="nav-link-plain"
              style={{
                fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: 500,
                letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none',
                color: pathname === '/' ? 'var(--color-gold)' : 'var(--color-text-muted)',
                padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)',
                transition: 'color var(--transition), background var(--transition)',
                position: 'relative',
              }}
            >
              Inicio
            </Link>

            {/* Dropdowns de NAV_ITEMS (saltamos Inicio) */}
            {NAV_ITEMS.slice(1).map(item => {
              if ('children' in item && item.children) {
                const activeChild = item.children.some(c => isPathActive(c.href))
                return (
                  <Dropdown
                    key={item.label}
                    label={item.label}
                    items={item.children as DropdownItem[]}
                    isActive={activeChild}
                  />
                )
              }
              return null
            })}

            {/* Chat e Incidencias — solo autenticados */}
            {isAuthenticated && AUTH_NAV_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="nav-link-plain"
                style={{
                  fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: 500,
                  letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none',
                  color: isPathActive(item.href) ? 'var(--color-gold)' : 'var(--color-text-muted)',
                  padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)',
                  transition: 'color var(--transition), background var(--transition)',
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Acciones derecha */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexShrink: 0, marginLeft: 'auto' }}>
            {isAuthenticated && session?.user ? (
              <UserMenu username={(session.user as any).username ?? (session.user as any).name ?? 'Usuario'} />
            ) : (
              <>
                <Link href="/login" style={{
                  fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: 500,
                  letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none',
                  color: 'var(--color-text-muted)', padding: 'var(--space-2) var(--space-4)',
                  borderRadius: 'var(--radius-md)', transition: 'color var(--transition)',
                }}>
                  Ingresar
                </Link>
                <Link href="/registro" className="btn-primary" style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-2) var(--space-5)' }}>
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
