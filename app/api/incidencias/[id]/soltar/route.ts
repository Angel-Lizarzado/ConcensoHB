import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { id } = await params
    const userRole = (session.user as any).role
    
    const incidencia = await prisma.incidencia.findUnique({ where: { id } })
    if (!incidencia) return NextResponse.json({ error: 'Incidencia no encontrada' }, { status: 404 })
    
    // Solo puede soltar el juez asignado o un admin
    if (userRole !== 'ADMIN' && incidencia.juezId !== (session.user as any).id) {
      return NextResponse.json({ error: 'No tienes permiso para soltar este caso' }, { status: 403 })
    }

    const updated = await prisma.incidencia.update({
      where: { id },
      data: { 
        juezId: null,
        estado: 'ABIERTA',
        fechaJuicio: null
      }
    })

    return NextResponse.json({ data: updated })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
