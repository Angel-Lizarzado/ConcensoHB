import type { Metadata } from 'next'
import { Cinzel, Crimson_Pro, Inter } from 'next/font/google'
import './globals.css'

import RadioProvider from '@/components/radio/RadioProvider'
import SessionProvider from '@/components/SessionProvider'
import GlobalChatWidget from '@/components/chat/GlobalChatWidget'
import { prisma } from '@/lib/prisma'

const cinzel = Cinzel({
  subsets: ['latin'], variable: '--font-display',
  weight: ['400', '600', '700', '900'], display: 'swap',
})
const crimsonPro = Crimson_Pro({
  subsets: ['latin'], variable: '--font-body',
  weight: ['300', '400', '600'], style: ['normal', 'italic'], display: 'swap',
})
const inter = Inter({
  subsets: ['latin'], variable: '--font-ui',
  weight: ['300', '400', '500', '600'], display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  try {
    const config = await prisma.siteConfig.findFirst()
    return {
      title:       config?.siteName        ?? 'Concilio General de Ejércitos',
      description: config?.siteDescription ?? 'Organismo independiente y neutral de los ejércitos de Habbo en habla hispana.',
      keywords:    config?.metaKeywords    ?? 'habbo, ejércitos, concilio, hispano',
    }
  } catch {
    return { title: 'Concilio General de Ejércitos' }
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let siteConfig  = null
  let radioConfig = null

  try {
    ;[radioConfig, siteConfig] = await Promise.all([
      prisma.radioConfig.findFirst(),
      prisma.siteConfig.findFirst(),
    ])
  } catch { /* DB no disponible — usar defaults */ }

  // Colores de departamento como CSS vars en runtime
  const deptColors = {
    '--color-noticias': siteConfig?.colorNoticias ?? '#d46b8a',
    '--color-wireds':   siteConfig?.colorWireds   ?? '#5bb8d4',
    '--color-juzgado':  siteConfig?.colorJuzgado  ?? '#C9A84C',
    '--color-oficial':  siteConfig?.colorOficial  ?? '#7A5C18',
  } as React.CSSProperties

  return (
    <html
      lang="es"
      className={`${cinzel.variable} ${crimsonPro.variable} ${inter.variable}`}
      style={deptColors}
    >
      <body suppressHydrationWarning>
        <SessionProvider>
          <RadioProvider initialConfig={radioConfig}>
            {children}
            <GlobalChatWidget />
          </RadioProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
