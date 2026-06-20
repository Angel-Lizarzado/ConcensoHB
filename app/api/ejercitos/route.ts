import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { siglaToSlug } from '@/lib/slugify'

// GET /api/ejercitos — listar (público)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const activoParam = searchParams.get('activo')
    let whereClause = {}
    if (activoParam === 'true') whereClause = { activo: true }
    else if (activoParam === 'false') whereClause = { activo: false }
    // if 'all' or not provided, return only active by default for public, but admin needs all.
    // wait, existing public might rely on no param returning true.
    if (!activoParam) whereClause = { activo: true }

    const ejercitos = await prisma.ejercito.findMany({
      where: whereClause,
      orderBy: { puntos: 'desc' },
      select: {
        id: true, sigla: true, nombre: true, descripcion: true,
        escudo: true, banner: true, activo: true, puntos: true, ranking: true,
        createdAt: true,
        _count: { select: { miembros: true } },
      },
    })

    const data = ejercitos.map(e => ({ ...e, slug: siglaToSlug(e.sigla) }))
    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Error al obtener ejércitos' }, { status: 500 })
  }
}

// POST /api/ejercitos — crear ejército (ADMIN)
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await req.json()
    const { sigla, nombre, descripcion, fundador, escudo } = body

    if (!sigla || !nombre || !fundador) {
      return NextResponse.json({ error: 'sigla, nombre y fundador son requeridos' }, { status: 400 })
    }

    const ejercito = await prisma.ejercito.create({
      data: {
        sigla:      sigla.trim().toUpperCase(),
        nombre:     nombre.trim(),
        descripcion: descripcion?.trim() ?? null,
        fundador:   fundador.trim(),
        escudo:     escudo ?? null,
      },
    })

    return NextResponse.json(ejercito, { status: 201 })
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un ejército con esa sigla' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Error al crear ejército' }, { status: 500 })
  }
}
