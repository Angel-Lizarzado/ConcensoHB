import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userEjercitoId = (session.user as any).ejercitoId
    if (!userEjercitoId) return NextResponse.json({ error: 'Debes pertenecer a un ejército' }, { status: 403 })

    const incidencia = await prisma.incidencia.findUnique({ where: { id } })
    if (!incidencia) return NextResponse.json({ error: 'Incidencia no encontrada' }, { status: 404 })

    if (incidencia.estado === 'RESUELTA' || incidencia.estado === 'DESESTIMADA') {
      return NextResponse.json({ error: 'El caso ya está cerrado' }, { status: 400 })
    }

    const { urlArchivo, descripcion } = await req.json()
    if (!urlArchivo) return NextResponse.json({ error: 'Falta la URL del archivo' }, { status: 400 })

    const prueba = await prisma.pruebaIncidencia.create({
      data: {
        incidenciaId: id,
        tipo: 'imagen',
        valor: urlArchivo,
        descripcion: descripcion || '',
        subidoPor: (session.user as any).id
      }
    })

    if (incidencia.estado === 'ABIERTA') {
      return NextResponse.json({ error: 'La incidencia aún no ha sido tomada por un juez' }, { status: 400 })
    }

    return NextResponse.json({ data: prueba }, { status: 201 })
  } catch (error: any) {
    console.error('Error uploading prueba:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
