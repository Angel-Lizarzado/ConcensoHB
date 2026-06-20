import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ChatClient from './ChatClient'

export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ canalId: string }> }

export default async function CanalPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/login')

  const { canalId } = await params

  const canal = await prisma.canalChat.findUnique({ where: { id: canalId } })
  if (!canal) notFound()

  // Verificar acceso
  const role = session.user.role
  if (canal.privado && canal.rolesPermitidos.length > 0 && !canal.rolesPermitidos.includes(role as any)) {
    redirect('/chat')
  }

  // Cargar historial inicial (últimos 50)
  const mensajes = await prisma.mensajeChat.findMany({
    where:   { canalId, eliminado: false },
    orderBy: { createdAt: 'asc' },
    take:    50,
    include: {
      autor: {
        select: {
          id: true, username: true, role: true, rolEjercito: true,
          ejercito: { select: { sigla: true } },
        },
      },
    },
  })

  // Mensajes fijados
  const fijados = await prisma.mensajeChat.findMany({
    where:   { canalId, fijado: true, eliminado: false },
    orderBy: { createdAt: 'desc' },
    take:    5,
    include: { autor: { select: { username: true } } },
  })

  return (
    <ChatClient
      canal={canal as any}
      mensajesIniciales={mensajes as any}
      fijados={fijados as any}
      sesion={{
        userId:    session.user.id,
        username:  session.user.username,
        role:      session.user.role,
        ejercitoId: session.user.ejercitoId,
      }}
    />
  )
}
