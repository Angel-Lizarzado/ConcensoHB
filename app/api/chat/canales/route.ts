import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/chat/canales — listar canales accesibles para el usuario
export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const canales = await prisma.canalChat.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        _count: { select: { mensajes: true } },
        mensajes: {
          where:   { eliminado: false },
          orderBy: { createdAt: 'desc' },
          take:    1,
          select:  { contenido: true, createdAt: true, autor: { select: { username: true } } },
        },
      },
    })

    // Filtrar canales privados según rol
    const role    = session.user.role
    const accesibles = canales.filter(c => {
      if (!c.privado) return true
      if (c.rolesPermitidos.length === 0) return true
      return c.rolesPermitidos.includes(role as any)
    })

    return NextResponse.json({ data: accesibles })
  } catch {
    return NextResponse.json({ error: 'Error al obtener canales' }, { status: 500 })
  }
}

// POST /api/chat/canales — crear canal (ADMIN)
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await req.json()
    const { nombre, descripcion, privado, rolesPermitidos } = body

    if (!nombre) return NextResponse.json({ error: 'nombre es requerido' }, { status: 400 })

    const canal = await prisma.canalChat.create({
      data: {
        nombre:          nombre.trim().toLowerCase().replace(/\s+/g, '-'),
        descripcion:     descripcion ?? null,
        privado:         privado ?? false,
        rolesPermitidos: rolesPermitidos ?? [],
        creadoPor:       session.user.id,
      },
    })

    return NextResponse.json(canal, { status: 201 })
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un canal con ese nombre' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Error al crear canal' }, { status: 500 })
  }
}
