import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { channelSubscribers } from '../messages/route'

// GET /api/chat/[canalId]/stream — SSE stream de mensajes nuevos
// El cliente mantiene esta conexión abierta con EventSource
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ canalId: string }> }
) {
  const session = await auth()
  if (!session) {
    return new Response('No autorizado', { status: 401 })
  }

  const { canalId } = await params

  let controller: ReadableStreamDefaultController

  const stream = new ReadableStream({
    start(ctrl) {
      controller = ctrl

      // Registrar suscriptor
      if (!channelSubscribers.has(canalId)) {
        channelSubscribers.set(canalId, new Set())
      }
      channelSubscribers.get(canalId)!.add(ctrl)

      // Heartbeat cada 25 segundos para mantener la conexión viva
      const heartbeat = setInterval(() => {
        try { ctrl.enqueue(': heartbeat\n\n') } catch { clearInterval(heartbeat) }
      }, 25_000)

      // Limpiar al cerrar
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        channelSubscribers.get(canalId)?.delete(ctrl)
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
