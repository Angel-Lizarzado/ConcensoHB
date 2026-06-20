// Layout para rutas públicas — incluye Header + Footer del sitio
// Las rutas de dashboard NO usan este layout (tienen el suyo propio)

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { prisma } from '@/lib/prisma'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  let siteConfig = null
  try {
    siteConfig = await prisma.siteConfig.findFirst()
  } catch { /* DB no disponible */ }

  const siteName     = siteConfig?.siteName     ?? 'Concilio General de Ejércitos'
  const siteSubtitle = siteConfig?.siteSubtitle ?? 'Organismo Conciliador · Habbo.es'
  const siteSlogan   = siteConfig?.siteSlogan   ?? '⚔ UNIDAD · HONOR · ORDEN ⚔'
  const footerText   = siteConfig?.footerText   ?? 'Organismo independiente, neutral y conciliador de la comunidad de ejércitos de Habbo. Fundado en 2026.'
  const foundedYear  = siteConfig?.foundedYear  ?? 2026

  return (
    <>
      <Header
        siteName={siteName}
        siteSubtitle={siteSubtitle}
        siteSlogan={siteSlogan}
      />
      <main role="main">
        {children}
      </main>
      <Footer
        siteName={siteName}
        siteSubtitle={siteSubtitle}
        siteSlogan={siteSlogan}
        footerText={footerText}
        foundedYear={foundedYear}
      />
    </>
  )
}
