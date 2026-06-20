import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/actividades — historial (ADMIN)
export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const actividades = await prisma.actividadEjercito.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        ejercito: { select: { id: true, sigla: true, nombre: true } },
        evento:   { select: { id: true, nombre: true } },
      },
    })

    return NextResponse.json({ data: actividades })
  } catch {
    return NextResponse.json({ error: 'Error al obtener actividades' }, { status: 500 })
  }
}

// POST /api/actividades — registrar actividad y sumar puntos (ADMIN)
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await req.json()
    const { ejercitoId, eventoId, descripcion, puntos } = body

    if (!ejercitoId || !descripcion || puntos === undefined) {
      return NextResponse.json({ error: 'ejercitoId, descripcion y puntos son requeridos' }, { status: 400 })
    }

    // Registrar actividad y actualizar puntos del ejército en una transacción
    const [actividad] = await prisma.$transaction([
      prisma.actividadEjercito.create({
        data: {
          ejercitoId,
          eventoId:     eventoId    ?? null,
          descripcion:  descripcion.trim(),
          puntos:       parseInt(puntos),
          registradoPor: session.user.id,
        },
      }),
      prisma.ejercito.update({
        where: { id: ejercitoId },
        data:  { puntos: { increment: parseInt(puntos) } },
      }),
    ])

    return NextResponse.json(actividad, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error al registrar actividad' }, { status: 500 })
  }
}
