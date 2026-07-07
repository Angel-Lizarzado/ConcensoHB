import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { siglaToSlug } from '@/lib/slugify'
import DOMPurify from 'isomorphic-dompurify'

// PATCH /api/ejercitos/[slug] — actualizar (COMANDANTE propio o ADMIN)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { slug } = await params

    // Encontrar el ejército por slug
    const ejercitos = await prisma.ejercito.findMany({ select: { id: true, sigla: true } })
    const ejercito  = ejercitos.find(e => siglaToSlug(e.sigla) === slug)
    if (!ejercito) return NextResponse.json({ error: 'Ejército no encontrado' }, { status: 404 })

    const esAdmin = session.user.role === 'ADMIN'
    const esComandantePropio = session.user.role === 'COMANDANTE' && session.user.ejercitoId === ejercito.id
    if (!esAdmin && !esComandantePropio) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await req.json()
    const { descripcion, descripcionRich, escudo, banner, activo, puntos } = body

    const data: any = {}
    if (descripcion     !== undefined) data.descripcion     = descripcion
    if (descripcionRich !== undefined) data.descripcionRich = DOMPurify.sanitize(descripcionRich)
    if (escudo          !== undefined) data.escudo          = escudo
    if (banner          !== undefined) data.banner          = banner

    // Solo ADMIN puede cambiar activo y puntos directamente
    if (esAdmin) {
      if (activo !== undefined) data.activo = activo
      if (puntos !== undefined) data.puntos = parseInt(puntos)
    }

    const actualizado = await prisma.ejercito.update({ where: { id: ejercito.id }, data })
    return NextResponse.json(actualizado)
  } catch {
    return NextResponse.json({ error: 'Error al actualizar ejército' }, { status: 500 })
  }
}

// DELETE /api/ejercitos/[slug] — Eliminar (Solo ADMIN)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { slug } = await params
    const ejercitos = await prisma.ejercito.findMany({ select: { id: true, sigla: true } })
    const ejercito  = ejercitos.find(e => siglaToSlug(e.sigla) === slug)
    
    if (!ejercito) return NextResponse.json({ error: 'Ejército no encontrado' }, { status: 404 })

    // Para evitar errores de integridad con los usuarios vinculados a este ejército
    // Primero, si esto es para rechazar solicitudes, eliminamos también a los usuarios de este ejército
    await prisma.$transaction([
      prisma.user.deleteMany({ where: { ejercitoId: ejercito.id } }),
      prisma.ejercito.delete({ where: { id: ejercito.id } })
    ])

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error al eliminar ejército:', error)
    return NextResponse.json({ error: 'Error al eliminar ejército' }, { status: 500 })
  }
}
