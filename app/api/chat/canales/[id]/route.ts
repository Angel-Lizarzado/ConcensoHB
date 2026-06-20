import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const { id } = await params
    
    // Validar que no sea el canal #general u otro esencial si existiera tal regla, pero por ahora permitimos eliminar
    await prisma.canalChat.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Canal no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Error al eliminar canal' }, { status: 500 })
  }
}
