import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/usuarios — listar usuarios (ADMIN)
export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const usuarios = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, username: true, role: true,
        departamento: true, rolEjercito: true, createdAt: true,
        ejercito: { select: { id: true, sigla: true, nombre: true } },
        invitadoPor: { select: { id: true, username: true } },
      },
    })

    return NextResponse.json({ data: usuarios })
  } catch {
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 })
  }
}

// PATCH /api/usuarios — actualizar rol/departamento de un usuario (ADMIN)
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await req.json()
    const { userId, role, departamento, ejercitoId, rolEjercito } = body

    if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 })

    const data: any = {}
    if (role        !== undefined) data.role        = role
    if (departamento !== undefined) data.departamento = departamento
    if (ejercitoId  !== undefined) data.ejercitoId  = ejercitoId
    if (rolEjercito !== undefined) data.rolEjercito = rolEjercito

    const usuario = await prisma.user.update({ where: { id: userId }, data })
    return NextResponse.json(usuario)
  } catch {
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 })
  }
}

// DELETE /api/usuarios?userId=...
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 })

    await prisma.user.delete({ where: { id: userId } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error al eliminar usuario. Puede que tenga datos vinculados que lo impiden.' }, { status: 500 })
  }
}
