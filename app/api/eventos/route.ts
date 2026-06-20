import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET /api/eventos
// Parámetros: upcoming (default true), limit
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const upcoming = searchParams.get('upcoming') !== 'false'
    const limit    = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))

    const session = await auth()
    const isLoggedIn = !!session?.user

    const where: any = upcoming ? { fecha: { gte: new Date() } } : {}
    if (!isLoggedIn) {
      where.tipo = { not: 'JUICIO' }
    }

    const eventos = await prisma.evento.findMany({
      where,
      orderBy: { fecha: 'asc' },
      take: limit,
    })

    return NextResponse.json({ data: eventos })
  } catch {
    return NextResponse.json({ error: 'Error al obtener eventos' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { nombre, slug, descripcion, fecha, tipo, puntos } = await req.json()
    if (!nombre || !slug || !descripcion || !fecha || !tipo) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const nuevo = await prisma.evento.create({
      data: {
        nombre, slug, descripcion, tipo,
        fecha: new Date(fecha),
        puntos: parseInt(puntos) || 0
      }
    })

    return NextResponse.json({ data: nuevo }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
