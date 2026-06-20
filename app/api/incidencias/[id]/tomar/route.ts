import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { id } = await params
    const userRole = (session.user as any).role
    
    if (userRole !== 'JUEZ' && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Solo jueces pueden tomar casos' }, { status: 403 })
    }

    const incidencia = await prisma.incidencia.findUnique({ where: { id } })
    if (!incidencia) return NextResponse.json({ error: 'Incidencia no encontrada' }, { status: 404 })
    
    if (incidencia.juezId && incidencia.juezId !== (session.user as any).id) {
      return NextResponse.json({ error: 'El caso ya fue tomado por otro juez' }, { status: 400 })
    }

    const updated = await prisma.incidencia.update({
      where: { id },
      data: { 
        juezId: (session.user as any).id,
        estado: 'EN_REVISION'
      }
    })

    return NextResponse.json({ data: updated })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
