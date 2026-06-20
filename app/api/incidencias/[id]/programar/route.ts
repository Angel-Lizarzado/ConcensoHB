import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { id } = await params
    const { fechaJuicio } = await req.json()

    if (!fechaJuicio) {
      return NextResponse.json({ error: 'Falta la fecha del juicio' }, { status: 400 })
    }

    const incidencia = await prisma.incidencia.findUnique({ where: { id }, include: { ejercitoDenunciado: true, ejercitoDenunciante: true } })
    if (!incidencia) return NextResponse.json({ error: 'Incidencia no encontrada' }, { status: 404 })
    
    // Solo puede programar el juez asignado o un admin
    if ((session.user as any).role !== 'ADMIN' && incidencia.juezId !== (session.user as any).id) {
      return NextResponse.json({ error: 'No tienes permiso para programar este juicio' }, { status: 403 })
    }

    const updated = await prisma.incidencia.update({
      where: { id },
      data: { 
        fechaJuicio: new Date(fechaJuicio),
        estado: 'EN_PROCESO'
      }
    })

    // Crear un evento en el calendario (Anónimo)
    await prisma.evento.create({
      data: {
        nombre: `Audiencia de Juicio Reservada`,
        slug: `juicio-${id}`,
        descripcion: `Sesión de juzgado en sala. El acceso es restringido a las partes involucradas.`,
        fecha: new Date(fechaJuicio),
        tipo: 'JUICIO',
        puntos: 0
      }
    })

    return NextResponse.json({ data: updated })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
