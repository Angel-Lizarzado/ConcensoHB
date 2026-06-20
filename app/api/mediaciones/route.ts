import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/mediaciones — listar según rol
export async function GET() {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const role = session.user.role
    if (!['ADMIN', 'JUEZ', 'COMANDANTE'].includes(role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    // ADMIN y JUEZ ven todas; COMANDANTE solo las propias (por sigla de su ejército)
    let mediaciones
    if (role === 'ADMIN' || role === 'JUEZ') {
      mediaciones = await prisma.mediacion.findMany({ orderBy: { createdAt: 'desc' } })
    } else {
      // COMANDANTE — busca su ejército y filtra por nombre
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { ejercito: true },
      })
      const sigla = user?.ejercito?.sigla ?? ''
      mediaciones = await prisma.mediacion.findMany({
        where: { OR: [{ ejercito1: { contains: sigla } }, { ejercito2: { contains: sigla } }] },
        orderBy: { createdAt: 'desc' },
      })
    }

    return NextResponse.json({ data: mediaciones })
  } catch {
    return NextResponse.json({ error: 'Error al obtener mediaciones' }, { status: 500 })
  }
}
