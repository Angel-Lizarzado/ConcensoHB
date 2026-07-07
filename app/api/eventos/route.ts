import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    
    // Si mandan month y year, buscamos por mes. Si no, usamos upcoming.
    const monthStr = searchParams.get('month')
    const yearStr = searchParams.get('year')
    const upcoming = searchParams.get('upcoming') !== 'false'

    let where: any = {}

    if (monthStr && yearStr) {
      const month = parseInt(monthStr)
      const year = parseInt(yearStr)
      const startDate = new Date(year, month, 1)
      const endDate = new Date(year, month + 1, 0, 23, 59, 59)
      where.fecha = { gte: startDate, lte: endDate }
    } else if (upcoming) {
      where.fecha = { gte: new Date() }
    }

    const session = await auth()
    
    if (!session) {
      where.visibilidad = 'PUBLICO'
    } else {
      const { role, ejercitoId } = session.user
      if (role !== 'ADMIN') {
        where.OR = [
          { visibilidad: 'PUBLICO' },
          { visibilidad: 'PRIVADO' },
          { visibilidad: 'EJERCITO', ejercitoVisibilidadId: ejercitoId }
        ]
      }
    }

    const eventos = await prisma.evento.findMany({
      where,
      orderBy: { fecha: 'asc' },
      include: {
        ejercitoVisibilidad: { select: { nombre: true, sigla: true } }
      }
    })

    return NextResponse.json({ data: eventos })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al obtener eventos' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'COMANDANTE')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const body = await req.json()
    const { nombre, descripcion, fecha, hora, tipo, visibilidad, ejercitoId, puntos } = body
    
    const dateObj = new Date(fecha)
    const [h, m] = hora.split(':')
    dateObj.setHours(parseInt(h), parseInt(m), 0, 0)

    if (session.user.role === 'COMANDANTE') {
      if (visibilidad === 'ADMIN' || visibilidad === 'PUBLICO') {
        return NextResponse.json({ error: 'Comandantes no pueden crear eventos públicos o internos' }, { status: 403 })
      }
      if (visibilidad === 'EJERCITO' && ejercitoId !== session.user.ejercitoId) {
        return NextResponse.json({ error: 'Solo puedes crear eventos para tu propio ejército' }, { status: 403 })
      }
    }

    const nuevo = await prisma.evento.create({
      data: {
        nombre,
        descripcion,
        fecha: dateObj,
        tipo,
        puntos: parseInt(puntos) || 0,
        visibilidad,
        ejercitoVisibilidadId: visibilidad === 'EJERCITO' ? ejercitoId : null,
        slug: nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now()
      }
    })

    return NextResponse.json({ data: nuevo }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
