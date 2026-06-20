import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notifyChannel } from '../../[canalId]/messages/route'

// PATCH /api/chat/messages/[id] — fijar/desfijar (ADMIN, JUEZ)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    if (!['ADMIN', 'JUEZ'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const { id } = await params
    const { fijado } = await req.json()

    const mensaje = await prisma.mensajeChat.update({
      where: { id },
      data:  { fijado: !!fijado },
      include: {
        autor: {
          select: {
            id: true, username: true, role: true, rolEjercito: true,
            ejercito: { select: { sigla: true } },
          },
        },
      },
    })
    
    // Notificamos para que se actualice en la UI
    notifyChannel(mensaje.canalId, { ...mensaje, _type: 'UPDATE' })

    return NextResponse.json({ data: mensaje })
  } catch {
    return NextResponse.json({ error: 'Error al actualizar mensaje' }, { status: 500 })
  }
}

// DELETE /api/chat/messages/[id] — soft delete (ADMIN o autor)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id } = await params
    const msg = await prisma.mensajeChat.findUnique({ where: { id } })
    if (!msg) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

    const esAutor = msg.autorId === session.user.id
    const esAdmin = session.user.role === 'ADMIN'
    if (!esAutor && !esAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

    await prisma.mensajeChat.update({ where: { id }, data: { eliminado: true } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error al eliminar mensaje' }, { status: 500 })
  }
}
