import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Genera un código legible estilo "CGE-FAM-X7K2"
function generarCodigo(sigla?: string): string {
  const prefix = sigla
    ? `CGE-${sigla.replace(/\./g, '').toUpperCase().slice(0, 4)}`
    : 'CGE'
  const chars  = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const rand   = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `${prefix}-${rand}`
}

// GET /api/invitaciones — listar códigos del usuario o todos (ADMIN)
export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const where = session.user.role === 'ADMIN'
      ? {}
      : { creadoPorId: session.user.id }

    const codigos = await prisma.codigoInvitacion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        ejercito:  { select: { sigla: true, nombre: true } },
        creadoPor: { select: { username: true } },
        _count:    { select: { usuarios: true } },
      },
    })

    return NextResponse.json({ data: codigos })
  } catch {
    return NextResponse.json({ error: 'Error al obtener códigos' }, { status: 500 })
  }
}

// POST /api/invitaciones — crear código (ADMIN o COMANDANTE)
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const role = session.user.role
    if (!['ADMIN', 'COMANDANTE'].includes(role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await req.json()
    const { ejercitoId, usoMaximo, expiresAt, rolOtorgado } = body

    // COMANDANTE solo puede crear códigos para su propio ejército
    const targetEjercitoId = role === 'COMANDANTE'
      ? session.user.ejercitoId ?? null
      : ejercitoId ?? null

    // Leer límite configurado en SiteConfig
    const siteConfig = await prisma.siteConfig.findFirst()
    const limite     = siteConfig?.maxEmbajadoresPorCodigo ?? 1

    // Obtener sigla para el código si hay ejército
    let sigla: string | undefined
    if (targetEjercitoId) {
      const ej = await prisma.ejercito.findUnique({ where: { id: targetEjercitoId }, select: { sigla: true } })
      sigla = ej?.sigla
    }

    // Asegurar unicidad del código
    let codigo = generarCodigo(sigla)
    while (await prisma.codigoInvitacion.findUnique({ where: { codigo } })) {
      codigo = generarCodigo(sigla)
    }

    const invitacion = await prisma.codigoInvitacion.create({
      data: {
        codigo,
        creadoPorId: session.user.id,
        ejercitoId:  targetEjercitoId,
        usoMaximo:   usoMaximo ?? limite,
        expiresAt:   expiresAt ? new Date(expiresAt) : null,
        rolOtorgado: role === 'ADMIN' ? rolOtorgado : null,
      },
    })

    return NextResponse.json(invitacion, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error al crear código' }, { status: 500 })
  }
}
