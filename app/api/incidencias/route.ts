import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      
    const userRole = (session.user as any).role
    const userEjercitoId = (session.user as any).ejercitoId

    let whereClause = {}

    // Si es Juez o Admin, ve todo
    if (userRole === 'JUEZ' || userRole === 'ADMIN') {
      whereClause = {}
    } else if (userEjercitoId) {
      // Si es parte de un ejército, ve las incidencias donde participa
      whereClause = {
        OR: [
          { ejercitoDenuncianteId: userEjercitoId },
          { ejercitoDenunciadoId: userEjercitoId }
        ]
      }
    } else {
      // Usuario sin ejército y sin rol especial no puede ver incidencias
      return NextResponse.json({ data: [] })
    }

    const incidencias = await prisma.incidencia.findMany({
      where: whereClause,
      include: {
        ejercitoDenunciante: { select: { nombre: true, sigla: true, escudo: true } },
        ejercitoDenunciado: { select: { nombre: true, sigla: true, escudo: true } },
        denunciante: { select: { username: true } },
        juez: { select: { username: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ 
      data: incidencias,
      meta: {
        userId: (session.user as any).id,
        userRole: userRole
      }
    })

  } catch (error: any) {
    console.error('Error fetching incidencias:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userEjercitoId = (session.user as any).ejercitoId
    if (!userEjercitoId) {
      return NextResponse.json({ error: 'Debes pertenecer a un ejército para crear incidencias' }, { status: 403 })
    }

    const { titulo, descripcion, ejercitoDenunciadoId, miembrosMencionados } = await req.json()

    if (!titulo || !descripcion || !ejercitoDenunciadoId) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    if (ejercitoDenunciadoId === userEjercitoId) {
      return NextResponse.json({ error: 'No puedes denunciar a tu propio ejército' }, { status: 400 })
    }

    const newIncidencia = await prisma.incidencia.create({
      data: {
        titulo,
        descripcion,
        denuncianteId: (session.user as any).id,
        ejercitoDenuncianteId: userEjercitoId,
        ejercitoDenunciadoId,
        miembrosMencionados: miembrosMencionados || []
      }
    })

    return NextResponse.json({ data: newIncidencia }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating incidencia:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
