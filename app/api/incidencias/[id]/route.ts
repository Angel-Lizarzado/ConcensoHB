import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userRole = (session.user as any).role
    const userEjercitoId = (session.user as any).ejercitoId
    const isJuez = userRole === 'JUEZ' || userRole === 'ADMIN'

    const incidencia = await prisma.incidencia.findUnique({
      where: { id },
      include: {
        ejercitoDenunciante: { select: { id: true, nombre: true, sigla: true, escudo: true } },
        ejercitoDenunciado: { select: { id: true, nombre: true, sigla: true, escudo: true } },
        denunciante: { select: { username: true } },
        juez: { select: { username: true } },
        // Traer pruebas, y hacer un join manual del ejercito del subidor
        pruebas: { orderBy: { createdAt: 'asc' } },
        comentarios: { orderBy: { createdAt: 'asc' }, include: { autor: { select: { id: true, username: true, role: true, ejercitoId: true } } } }
      }
    })

    if (!incidencia) {
      return NextResponse.json({ error: 'Incidencia no encontrada' }, { status: 404 })
    }

    // Autorización
    const isParticipante = userEjercitoId && (userEjercitoId === incidencia.ejercitoDenuncianteId || userEjercitoId === incidencia.ejercitoDenunciadoId)
    if (!isJuez && !isParticipante) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Buscamos los ejercitos de quienes subieron pruebas para poder filtrar
    // Hacemos una única query a la tabla de usuarios
    const uploaderIds = Array.from(new Set(incidencia.pruebas.map(p => p.subidoPor)))
    const uploaders = await prisma.user.findMany({
      where: { id: { in: uploaderIds } },
      select: { id: true, ejercitoId: true, username: true }
    })
    const uploaderMap = new Map(uploaders.map(u => [u.id, u]))

    // Añadir uploader a las pruebas
    const pruebasConUploader = incidencia.pruebas.map(p => ({
      ...p,
      uploader: uploaderMap.get(p.subidoPor)
    }))

    // Bóveda Ciega: Filtrar pruebas si no es juez (y si no está cerrada)
    if (!isJuez && incidencia.estado !== 'RESUELTA' && incidencia.estado !== 'DESESTIMADA') {
      const misPruebas = pruebasConUploader.filter(p => p.uploader?.ejercitoId === userEjercitoId)
      const pruebasRivalCount = pruebasConUploader.filter(p => p.uploader?.ejercitoId !== userEjercitoId).length

      return NextResponse.json({ 
        data: {
          ...incidencia,
          pruebas: misPruebas,
          _count: {
            pruebasRival: pruebasRivalCount
          }
        } 
      })
    }

    // Si es Juez o ya terminó, devuelve todas las pruebas
    return NextResponse.json({ 
      data: {
        ...incidencia,
        pruebas: pruebasConUploader
      } 
    })

  } catch (error: any) {
    console.error('Error fetching incidencia details:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
