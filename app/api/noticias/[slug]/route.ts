import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DOMPurify from 'isomorphic-dompurify'

// GET /api/noticias/[slug] — noticia individual (público)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const noticia = await prisma.noticia.findUnique({
      where: { slug, publicada: true },
      include: { autor: { select: { id: true, username: true } } },
    })
    if (!noticia) return NextResponse.json({ error: 'Noticia no encontrada' }, { status: 404 })
    return NextResponse.json(noticia)
  } catch {
    return NextResponse.json({ error: 'Error al obtener noticia' }, { status: 500 })
  }
}

// PATCH /api/noticias/[slug] — actualizar (autor o ADMIN)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { slug } = await params
    const noticia = await prisma.noticia.findUnique({ where: { slug } })
    if (!noticia) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })

    const esAutor  = noticia.autorId === session.user.id
    const esAdmin  = session.user.role === 'ADMIN'
    if (!esAutor && !esAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

    const body = await req.json()
    const { titulo, extracto, contenido, destacada, publicada, imagenUrl, imagenKey } = body

    const data: any = {}
    if (titulo     !== undefined) data.titulo    = titulo.trim()
    if (extracto   !== undefined) data.extracto  = extracto.trim()
    if (contenido  !== undefined) data.contenido = DOMPurify.sanitize(contenido)
    if (destacada  !== undefined) data.destacada = destacada
    if (publicada  !== undefined) data.publicada = publicada
    if (imagenUrl  !== undefined) data.imagenUrl = imagenUrl
    if (imagenKey  !== undefined) data.imagenKey = imagenKey

    const actualizada = await prisma.noticia.update({ where: { slug }, data })
    return NextResponse.json(actualizada)
  } catch {
    return NextResponse.json({ error: 'Error al actualizar noticia' }, { status: 500 })
  }
}

// DELETE /api/noticias/[slug] — eliminar (autor o ADMIN)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { slug } = await params
    const noticia = await prisma.noticia.findUnique({ where: { slug } })
    if (!noticia) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })

    const esAutor = noticia.autorId === session.user.id
    const esAdmin = session.user.role === 'ADMIN'
    if (!esAutor && !esAdmin) return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

    await prisma.noticia.delete({ where: { slug } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error al eliminar noticia' }, { status: 500 })
  }
}
