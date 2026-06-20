import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slugify'
import DOMPurify from 'isomorphic-dompurify'

// GET /api/noticias — listar publicadas (público)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const dept      = searchParams.get('dept')
    const destacada = searchParams.get('destacada')
    const page      = Math.max(1, parseInt(searchParams.get('page')  ?? '1'))
    const limit     = Math.min(50, parseInt(searchParams.get('limit') ?? '10'))
    const skip      = (page - 1) * limit

    const where: any = { publicada: true }
    if (dept && dept !== 'TODOS') where.departamento = dept
    if (destacada) where.destacada = destacada === 'true'

    const [noticias, total] = await Promise.all([
      prisma.noticia.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip, take: limit,
        select: {
          id: true, titulo: true, slug: true, extracto: true,
          imagenUrl: true, departamento: true, destacada: true, createdAt: true,
          autor: { select: { id: true, username: true } },
        },
      }),
      prisma.noticia.count({ where }),
    ])

    return NextResponse.json({
      data: noticias,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch {
    return NextResponse.json({ error: 'Error al obtener noticias' }, { status: 500 })
  }
}

// POST /api/noticias — crear noticia (REPORTERO, ADMIN)
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    if (!['REPORTERO', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await req.json()
    const { titulo, extracto, contenido, departamento, imagenUrl, imagenKey, destacada } = body

    if (!titulo || !extracto || !contenido || !departamento) {
      return NextResponse.json({ error: 'Campos requeridos: titulo, extracto, contenido, departamento' }, { status: 400 })
    }

    // REPORTERO solo puede publicar en su departamento asignado
    if (session.user.role === 'REPORTERO') {
      const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { departamento: true } })
      if (user?.departamento && user.departamento !== departamento) {
        return NextResponse.json({ error: `Solo podés publicar en el departamento ${user.departamento}` }, { status: 403 })
      }
    }

    // Generar slug único
    let slug = slugify(titulo)
    const existing = await prisma.noticia.findUnique({ where: { slug } })
    if (existing) slug = `${slug}-${Date.now()}`

    const contenidoLimpio = DOMPurify.sanitize(contenido)

    const noticia = await prisma.noticia.create({
      data: {
        titulo: titulo.trim(),
        slug,
        extracto: extracto.trim(),
        contenido: contenidoLimpio,
        departamento,
        imagenUrl:  imagenUrl  ?? null,
        imagenKey:  imagenKey  ?? null,
        destacada:  destacada  ?? false,
        publicada:  false,
        autorId:    session.user.id,
      },
    })

    return NextResponse.json(noticia, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error al crear noticia' }, { status: 500 })
  }
}
