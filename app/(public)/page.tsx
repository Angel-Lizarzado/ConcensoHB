// Portada — Server Component
// Resumen de la plataforma: últimas noticias, top ejércitos, próximos eventos
// Fiel al mockup HTML

import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import LogoCGE from '@/components/ui/LogoCGE'
import GoldLine from '@/components/ui/GoldLine'
import Ornament from '@/components/ui/Ornament'
import StatCounter from '@/components/ui/StatCounter'
import NewsCardFeatured from '@/components/noticias/NewsCardFeatured'
import NewsFeed from '@/components/noticias/NewsFeed'
import RankingWidget from '@/components/widgets/RankingWidget'
import AffiliatesWidget from '@/components/widgets/AffiliatesWidget'
import EventsWidget from '@/components/widgets/EventsWidget'
import DeptLegend from '@/components/widgets/DeptLegend'
import ComunicadoWidget from '@/components/widgets/ComunicadoWidget'

export const revalidate = 60

export default async function HomePage() {
  const [noticiaDestacada, ultimasNoticias, topEjercitos, proximosEventos, stats] =
    await Promise.all([
      prisma.noticia.findFirst({
        where: { publicada: true, destacada: true },
        orderBy: { createdAt: 'desc' },
        include: { autor: { select: { id: true, username: true } } },
      }),
      prisma.noticia.findMany({
        where: { publicada: true },
        orderBy: { createdAt: 'desc' },
        take: 4,
        select: {
          id: true, titulo: true, slug: true, extracto: true,
          imagenUrl: true, departamento: true, createdAt: true,
          autor: { select: { id: true, username: true } },
        },
      }),
      prisma.ejercito.findMany({
        where: { activo: true },
        orderBy: { puntos: 'desc' },
        take: 4,
        select: { id: true, sigla: true, nombre: true, escudo: true, puntos: true, ranking: true },
      }),
      prisma.evento.findMany({
        where: { fecha: { gte: new Date() } },
        orderBy: { fecha: 'asc' },
        take: 3,
      }),
      Promise.all([
        prisma.ejercito.count({ where: { activo: true } }),
        prisma.evento.count(),
        prisma.mediacion.count({ where: { estado: 'RESUELTO' } }),
        prisma.user.count({ where: { role: 'REPORTERO' } }),
      ]),
    ])

  const [totalEjercitos, totalEventos, totalMediaciones, totalReporteros] = stats

  return (
    <>
      {/* HERO */}
      <section
        aria-label="Portada"
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: 'clamp(var(--space-16), 10vw, var(--space-20)) var(--space-6)',
          textAlign: 'center',
          background: 'radial-gradient(ellipse 70% 55% at 50% 0%, oklch(0.55 0.1 75 / 0.07) 0%, transparent 60%), var(--color-bg)',
        }}
      >
        {/* Grid decorativo */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(oklch(0.75 0.12 75 / 0.03) 1px, transparent 1px), linear-gradient(90deg, oklch(0.75 0.12 75 / 0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 'var(--content-default)', margin: '0 auto', position: 'relative' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
            fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: 400,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            padding: 'var(--space-2) var(--space-5)',
            marginBottom: 'var(--space-8)',
            borderTop: '1px solid var(--color-border)',
            borderBottom: '1px solid var(--color-border)',
          }}>
            <span style={{ color: 'var(--color-gold)', opacity: 0.7 }}>Fundado 2026</span>
            &nbsp;·&nbsp; Habbo.es &nbsp;·&nbsp;
            <span style={{ color: 'var(--color-gold)', opacity: 0.7 }}>Organismo Neutral</span>
          </div>

          {/* Logo grande */}
          <div style={{
            width: 110, height: 120,
            margin: '0 auto var(--space-8)',
            filter: 'drop-shadow(0 0 32px oklch(0.75 0.12 75 / 0.35))',
          }}>
            <LogoCGE size={110} />
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)',
            fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase',
            color: 'var(--color-gold-bright)', marginBottom: 'var(--space-3)',
            textShadow: '0 0 80px oklch(0.75 0.12 75 / 0.18)',
          }}>
            Concilio General<br />de Ejércitos
          </h1>

          <p style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(0.75rem, 0.6rem + 0.7vw, 1rem)',
            fontWeight: 400, letterSpacing: '0.3em', textTransform: 'uppercase',
            color: 'var(--color-text-muted)', marginBottom: 'var(--space-6)',
            marginRight: '-0.3em',
          }}>
            ⚔ &nbsp;Unidad&nbsp; · &nbsp;Honor&nbsp; · &nbsp;Orden&nbsp; ⚔
          </p>

          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', fontStyle: 'italic',
            color: 'var(--color-text-muted)', maxWidth: 560, margin: '0 auto var(--space-10)',
            lineHeight: 1.7,
          }}>
            Organismo independiente y neutral de los ejércitos de Habbo.
            Armonía, arbitraje y representación para toda la comunidad militar.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <Link href="/ejercitos" className="btn-primary">Ver Ejércitos Afiliados</Link>
            <Link href="/mediacion" className="btn-secondary">Solicitar Mediación</Link>
          </div>
        </div>
      </section>

      {/* ESTADÍSTICAS */}
      <div style={{
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border-gold)',
        borderBottom: '1px solid var(--color-border-gold)',
        padding: 'var(--space-5) var(--space-6)',
      }}>
        <div style={{
          maxWidth: 'var(--content-wide)', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        }}>
          {[
            { target: totalEjercitos,   label: 'Ejércitos Afiliados'  },
            { target: totalEventos,     label: 'Eventos Realizados'   },
            { target: totalMediaciones, label: 'Mediaciones Exitosas' },
            { target: totalReporteros,  label: 'Reporteros Activos'   },
          ].map((stat, i) => (
            <div key={i} style={{
              borderRight: i < 3 ? '1px solid var(--color-border)' : 'none',
            }}>
              <StatCounter target={stat.target} label={stat.label} />
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT: noticias + sidebar */}
      <div style={{
        maxWidth: 'var(--content-wide)', margin: '0 auto',
        padding: 'var(--space-12) var(--space-6)',
        display: 'grid', gridTemplateColumns: '1fr 340px',
        gap: 'var(--space-10)', alignItems: 'start',
      }}>
        {/* NOTICIAS */}
        <main>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 'var(--space-8)', paddingBottom: 'var(--space-4)',
            borderBottom: '1px solid var(--color-border-gold)',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-gold-bright)',
              display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                <path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z" />
              </svg>
              Últimas Noticias
            </h2>
            <Link href="/noticias" style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
              Ver todas →
            </Link>
          </div>

          {/* Noticia destacada */}
          {noticiaDestacada && (
            <NewsCardFeatured noticia={noticiaDestacada} />
          )}

          {/* Lista de noticias recientes */}
          <NewsFeed noticias={ultimasNoticias} />
        </main>

        {/* SIDEBAR */}
        <aside role="complementary" aria-label="Panel lateral" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <ComunicadoWidget />
          <AffiliatesWidget ejercitos={topEjercitos} />
          <RankingWidget ejercitos={topEjercitos} />
          <DeptLegend />
          <EventsWidget eventos={proximosEventos} />
        </aside>
      </div>

      {/* MISIÓN */}
      <section
        aria-label="Misión del Concilio"
        style={{
          background: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border-gold)',
          borderBottom: '1px solid var(--color-border-gold)',
          padding: 'clamp(var(--space-10), 6vw, var(--space-16)) var(--space-6)',
          textAlign: 'center',
          position: 'relative', overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 80% at 50% 50%, oklch(0.55 0.1 75 / 0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 'var(--content-narrow)', margin: '0 auto', position: 'relative' }}>
          <Ornament>
            <LogoCGE size={18} />
          </Ornament>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-xs)', fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: 'var(--space-5)', marginTop: 'var(--space-5)', opacity: 0.75 }}>
            Nuestra Misión
          </p>
          <blockquote style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 400, letterSpacing: '0.04em', color: 'var(--color-text)', lineHeight: 1.45, marginBottom: 'var(--space-8)' }}>
            &ldquo;No somos un ejército más.<br />Somos el acuerdo que todos necesitaban.&rdquo;
          </blockquote>
          <GoldLine />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-5)', marginTop: 'var(--space-10)', textAlign: 'left' }}>
            {[
              { icon: '⚖️', titulo: 'Mediación',      desc: 'Intervenimos en conflictos entre ejércitos antes de que escalen a guerras públicas o drama comunitario.' },
              { icon: '🏆', titulo: 'Eventos',         desc: 'Organizamos torneos, desfiles y asambleas que reúnen a toda la escena militar hispana en espíritu de competencia sana.' },
              { icon: '📰', titulo: 'Prensa Oficial',  desc: 'Nuestros reporteros cubren la actualidad de la comunidad con objetividad, sin favorecer a ningún ejército afiliado.' },
            ].map(p => (
              <div key={p.titulo} style={{
                padding: 'var(--space-6)',
                background: 'var(--color-surface-offset)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                borderTop: '2px solid var(--color-gold-dark)',
              }}>
                <span aria-hidden="true" style={{ fontSize: '1.6rem', marginBottom: 'var(--space-4)', display: 'block' }}>{p.icon}</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: 'var(--space-3)' }}>
                  {p.titulo}
                </h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
