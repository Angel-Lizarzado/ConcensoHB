import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userRole = (session.user as any).role
    if (userRole !== 'JUEZ' && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Solo los Jueces pueden dictar veredictos' }, { status: 403 })
    }

    const { resolucion, desestimar } = await req.json()
    if (!resolucion) return NextResponse.json({ error: 'Falta la resolución' }, { status: 400 })

    const incidencia = await prisma.incidencia.findUnique({
      where: { id }, })
    if (!incidencia) return NextResponse.json({ error: 'Incidencia no encontrada' }, { status: 404 })

    const updateData = await prisma.incidencia.update({
      where: { id },
      data: {
        resolucion,
        estado: desestimar ? 'DESESTIMADA' : 'RESUELTA',
        juezId: (session.user as any).id
      }
    })

    // Aquí podríamos crear automáticamente una noticia en el departamento JUZGADO con el veredicto
    // (A implementar más adelante si se desea publicarlo a todos)

    return NextResponse.json({ data: updateData })
  } catch (error: any) {
    console.error('Error closing incidencia:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
