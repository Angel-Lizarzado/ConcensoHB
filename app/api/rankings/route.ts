import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/rankings
// Ejércitos ordenados por puntos descendente con historial de actividades
export async function GET() {
  try {
    const ejercitos = await prisma.ejercito.findMany({
      where: { activo: true },
      orderBy: { puntos: 'desc' },
      select: {
        id: true, sigla: true, nombre: true, escudo: true,
        puntos: true, ranking: true,
        _count: { select: { actividades: true } },
      },
    })

    // Asignar posición calculada
    const data = ejercitos.map((e, i) => ({ ...e, posicion: i + 1 }))

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ error: 'Error al obtener rankings' }, { status: 500 })
  }
}
