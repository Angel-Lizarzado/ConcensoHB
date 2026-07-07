import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

// POST /api/incidencias/[id]/comentarios — solo JUEZ/ADMIN (internos)
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const { id }      = await params
    const { contenido } = await req.json()
    if (!contenido?.trim()) return NextResponse.json({ error: 'Contenido requerido' }, { status: 400 })

    const incidencia = await prisma.incidencia.findUnique({ where: { id } })
    if (!incidencia) return NextResponse.json({ error: 'Incidencia no encontrada' }, { status: 404 })

    const role = session.user.role
    const ejercitoId = session.user.ejercitoId
    
    if (role === 'COMANDANTE') {
      if (incidencia.ejercitoDenuncianteId !== ejercitoId && incidencia.ejercitoDenunciadoId !== ejercitoId) {
        return NextResponse.json({ error: 'No participas en este caso' }, { status: 403 })
      }
    } else if (role === 'JUEZ' && incidencia.juezId !== session.user.id) {
      return NextResponse.json({ error: 'Solo el juez asignado puede comentar' }, { status: 403 })
    }

    const comentario = await prisma.comentarioIncidencia.create({
      data: { incidenciaId: id, autorId: session.user.id, contenido: contenido.trim() },
      include: { autor: { select: { id: true, username: true, role: true } } },
    })
    return NextResponse.json(comentario, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error al comentar' }, { status: 500 })
  }
}
