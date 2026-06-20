import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slugify'
import DOMPurify from 'isomorphic-dompurify'

// PATCH /api/mediaciones/[id] — actualizar estado/resolución (JUEZ, ADMIN)
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
    const body   = await req.json()
    const { estado, resolucion, juezId } = body

    const data: any = {}
    if (estado     !== undefined) data.estado    = estado
    if (resolucion !== undefined) data.resolucion = resolucion
    if (juezId     !== undefined) data.juezId    = juezId

    // Si se publica resolución, generar noticia JUZGADO automáticamente
    if (resolucion && estado === 'RESUELTO') {
      const mediacion  = await prisma.mediacion.findUnique({ where: { id } })
      if (mediacion) {
        const titulo = `Resolución: ${mediacion.ejercito1} vs ${mediacion.ejercito2}`
        let slug     = slugify(titulo)
        const exists = await prisma.noticia.findUnique({ where: { slug } })
        if (exists) slug = `${slug}-${Date.now()}`

        const noticia = await prisma.noticia.create({
          data: {
            titulo,
            slug,
            extracto:    `Resolución oficial del Juzgado en el caso ${mediacion.ejercito1} vs ${mediacion.ejercito2}.`,
            contenido:   DOMPurify.sanitize(resolucion),
            departamento: 'JUZGADO',
            publicada:   true,
            autorId:     session.user.id,
          },
        })
        data.noticiaId = noticia.id
      }
    }

    const mediacion = await prisma.mediacion.update({ where: { id }, data })
    return NextResponse.json(mediacion)
  } catch {
    return NextResponse.json({ error: 'Error al actualizar mediación' }, { status: 500 })
  }
}
