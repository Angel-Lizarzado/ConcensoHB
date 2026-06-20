import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/chat/[canalId]/messages — historial (últimos 50, paginable)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ canalId: string }> }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { canalId } = await params
    const before  = req.nextUrl.searchParams.get('before') // cursor para paginación
    const limit   = 50

    const mensajes = await prisma.mensajeChat.findMany({
      where: {
        canalId,
        eliminado: false,
        ...(before ? { createdAt: { lt: new Date(before) } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take:    limit,
      include: {
        autor: {
          select: {
            id: true, username: true, role: true, rolEjercito: true,
            ejercito: { select: { sigla: true } },
          },
        },
      },
    })

    // Buscar mensajes fijados (sin límite de paginación o un límite razonable)
    const pinned = await prisma.mensajeChat.findMany({
      where: {
        canalId,
        eliminado: false,
        fijado: true
      },
      orderBy: { createdAt: 'desc' },
      include: {
        autor: {
          select: {
            id: true, username: true, role: true, rolEjercito: true,
            ejercito: { select: { sigla: true } },
          },
        },
      },
    })

    // Devolver en orden ascendente para renderizar correctamente
    return NextResponse.json({ data: mensajes.reverse(), pinned })
  } catch {
    return NextResponse.json({ error: 'Error al obtener mensajes' }, { status: 500 })
  }
}

// POST /api/chat/[canalId]/messages — enviar mensaje
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ canalId: string }> }
) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { canalId } = await params
    const body        = await req.json()
    const { contenido } = body

    if (!contenido?.trim()) {
      return NextResponse.json({ error: 'El mensaje no puede estar vacío' }, { status: 400 })
    }
    if (contenido.length > 2000) {
      return NextResponse.json({ error: 'Mensaje demasiado largo (máx. 2000 caracteres)' }, { status: 400 })
    }

    // Verificar que el canal exista
    const canal = await prisma.canalChat.findUnique({ where: { id: canalId } })
    if (!canal) return NextResponse.json({ error: 'Canal no encontrado' }, { status: 404 })

    const mensaje = await prisma.mensajeChat.create({
      data: {
        contenido: contenido.trim(),
        autorId:   session.user.id,
        canalId,
      },
      include: {
        autor: {
          select: {
            id: true, username: true, role: true, rolEjercito: true,
            ejercito: { select: { sigla: true } },
          },
        },
      },
    })

    // Notificar a los suscriptores SSE de este canal
    notifyChannel(canalId, mensaje)

    return NextResponse.json(mensaje, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error al enviar mensaje' }, { status: 500 })
  }
}

// =============================================
// SSE in-memory pub/sub
// Map: canalId → Set<ReadableStreamDefaultController>
// =============================================
export const channelSubscribers = new Map<string, Set<ReadableStreamDefaultController>>()

export function notifyChannel(canalId: string, data: any) {
  const subs = channelSubscribers.get(canalId)
  if (!subs) return
  const payload = `data: ${JSON.stringify(data)}\n\n`
  for (const ctrl of subs) {
    try { ctrl.enqueue(payload) } catch { subs.delete(ctrl) }
  }
}
