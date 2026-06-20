// Footer del sitio — Server Component

import Link from 'next/link'
import LogoCGE from '@/components/ui/LogoCGE'
import GoldLine from '@/components/ui/GoldLine'

interface FooterProps {
  siteName?: string
  siteSubtitle?: string
  siteSlogan?: string
  footerText?: string
  foundedYear?: number
}

export default function Footer({
  siteName    = 'Concilio General de Ejércitos',
  siteSubtitle = 'de Ejércitos',
  siteSlogan  = '⚔ UNIDAD · HONOR · ORDEN ⚔',
  footerText  = 'Organismo independiente, neutral y conciliador de la comunidad de ejércitos de Habbo. Fundado en 2026.',
  foundedYear = 2026,
}: FooterProps) {
  return (
    <footer
      role="contentinfo"
      style={{
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border-gold)',
        padding: 'var(--space-12) var(--space-6) var(--space-8)',
      }}
    >
      {/* Main grid */}
      <div
        style={{
          maxWidth: 'var(--content-wide)',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
          gap: 'var(--space-10)',
          marginBottom: 'var(--space-10)',
        }}
      >
        {/* Brand column */}
        <div>
          <Link
            href="/"
            aria-label={siteName}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)',
              textDecoration: 'none',
              color: 'var(--color-text)',
              marginBottom: 'var(--space-4)',
            }}
          >
            <LogoCGE size={32} />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(0.7rem, 0.6rem + 0.5vw, 0.9rem)', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--color-gold-bright)', textTransform: 'uppercase' }}>
                Concilio General
              </span>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: 300, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                {siteSubtitle}
              </span>
            </div>
          </Link>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.7, maxWidth: '32ch' }}>
            {footerText}
          </p>
        </div>

        {/* Organismo */}
        <FooterCol title="Organismo">
          <FooterLink href="#">Acerca del Concilio</FooterLink>
          <FooterLink href="#">Normas y Estatutos</FooterLink>
          <FooterLink href="#">Protocolo de Mediación</FooterLink>
          <FooterLink href="#">Equipo Directivo</FooterLink>
          <FooterLink href="#">Reporteros</FooterLink>
        </FooterCol>

        {/* Comunidad */}
        <FooterCol title="Comunidad">
          <FooterLink href="/ejercitos">Ejércitos Afiliados</FooterLink>
          <FooterLink href="/rankings">Rankings</FooterLink>
          <FooterLink href="/eventos">Eventos</FooterLink>
          <FooterLink href="/mediacion">Afiliar mi Ejército</FooterLink>
        </FooterCol>

        {/* Noticias */}
        <FooterCol title="Noticias">
          <FooterLink href="/noticias">Últimas Noticias</FooterLink>
          <FooterLink href="/noticias?dept=OFICIAL">Comunicados</FooterLink>
          <FooterLink href="/noticias?dept=JUZGADO">Juzgado</FooterLink>
          <FooterLink href="/noticias?dept=WIREDS">Wireds</FooterLink>
          <FooterLink href="/noticias">Archivo</FooterLink>
        </FooterCol>
      </div>

      <GoldLine />

      {/* Bottom bar */}
      <div
        style={{
          maxWidth: 'var(--content-wide)',
          margin: 'var(--space-6) auto 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          fontFamily: 'var(--font-ui)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-faint)',
          letterSpacing: '0.08em',
        }}
      >
        <span>© {foundedYear} {siteName} — Organismo Conciliador · Habbo.es</span>
        <span style={{ color: 'var(--color-gold)', opacity: 0.55, letterSpacing: '0.2em' }}>
          {siteSlogan}
        </span>
      </div>
    </footer>
  )
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-xs)',
        fontWeight: 700,
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        color: 'var(--color-gold)',
        marginBottom: 'var(--space-5)',
      }}>
        {title}
      </h4>
      <ul role="list" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', listStyle: 'none' }}>
        {children}
      </ul>
    </div>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
          textDecoration: 'none',
          letterSpacing: '0.05em',
          transition: 'color var(--transition)',
        }}
      >
        {children}
      </Link>
    </li>
  )
}
