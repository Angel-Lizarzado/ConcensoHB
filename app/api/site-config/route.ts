import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const SITE_DEFAULTS = {
  id: 'singleton-site',
  siteName: 'Concilio General de Ejércitos',
  siteSubtitle: 'Organismo Conciliador · Habbo.es',
  siteSlogan: '⚔ UNIDAD · HONOR · ORDEN ⚔',
  siteDescription: 'Organismo independiente y neutral de los ejércitos de Habbo en habla hispana.',
  logoSvg: null, faviconUrl: null,
  metaKeywords: 'habbo, ejércitos, concilio, hispano',
  footerText: 'Organismo independiente, neutral y conciliador de la comunidad de ejércitos de Habbo. Fundado en 2026.',
  foundedYear: 2026, primaryColor: '#C9A84C',
  colorNoticias: '#d46b8a', colorWireds: '#5bb8d4',
  colorJuzgado: '#C9A84C', colorOficial: '#7A5C18',
  registroAbierto: false, maxEmbajadoresPorCodigo: 1,
  updatedAt: new Date(),
}

// GET /api/site-config — público
export async function GET() {
  try {
    const config = await prisma.siteConfig.findFirst()
    return NextResponse.json(config ?? SITE_DEFAULTS)
  } catch {
    return NextResponse.json(SITE_DEFAULTS)
  }
}

// PATCH /api/site-config — actualizar configuración del sitio (ADMIN)
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await req.json()

    const config = await prisma.siteConfig.upsert({
      where:  { id: 'singleton-site' },
      update: body,
      create: { id: 'singleton-site', ...body },
    })

    revalidatePath('/', 'layout')
    return NextResponse.json(config)
  } catch {
    return NextResponse.json({ error: 'Error al actualizar configuración' }, { status: 500 })
  }
}
