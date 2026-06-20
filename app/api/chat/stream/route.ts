import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { channelSubscribers } from '../[canalId]/messages/route'

export const dynamic = 'force-dynamic'

// GET /api/chat/stream — SSE stream GLOBAL de mensajes nuevos
// El cliente mantiene esta conexión abierta con EventSource y recibe los mensajes de todos sus canales
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return new Response('No autorizado', { status: 401 })
  }

  // Obtener canales a los que el usuario tiene acceso
  const canales = await prisma.canalChat.findMany()
  const role = session.user.role
  const accesibles = canales.filter(c => {
    if (!c.privado) return true
    if (c.rolesPermitidos.length === 0) return true
    return c.rolesPermitidos.includes(role as any)
  }).map(c => c.id)

  let controller: ReadableStreamDefaultController

  const stream = new ReadableStream({
    start(ctrl) {
      controller = ctrl

      // Registrar suscriptor en cada canal accesible
      for (const canalId of accesibles) {
        if (!channelSubscribers.has(canalId)) {
          channelSubscribers.set(canalId, new Set())
        }
        channelSubscribers.get(canalId)!.add(ctrl)
      }

      // Heartbeat cada 25 segundos para mantener la conexión viva
      const heartbeat = setInterval(() => {
        try { ctrl.enqueue(': heartbeat\n\n') } catch { clearInterval(heartbeat) }
      }, 25_000)

      // Limpiar al cerrar
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        for (const canalId of accesibles) {
          channelSubscribers.get(canalId)?.delete(ctrl)
        }
        try { ctrl.close() } catch {}
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection':    'keep-alive',
      'X-Accel-Buffering': 'no', // Para Nginx/proxies
    },
  })
}
