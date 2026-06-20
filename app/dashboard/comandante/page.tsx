import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ComandanteDashboardClient from './ComandanteDashboardClient'

export const dynamic = 'force-dynamic'

export default async function ComandanteDashboard() {
  const session = await auth()
  if (!session || session.user.role !== 'COMANDANTE') redirect('/dashboard')

  const ejercito = session.user.ejercitoId
    ? await prisma.ejercito.findUnique({
        where: { id: session.user.ejercitoId },
        include: {
          miembros: { select: { id: true, username: true, rolEjercito: true, email: true } },
          actividades: { orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, descripcion: true, puntos: true, createdAt: true } },
          _count: { select: { miembros: true } },
        },
      })
    : null

  // Ranking actual
  const ranking = ejercito
    ? await prisma.ejercito.count({ where: { activo: true, puntos: { gt: ejercito.puntos } } }) + 1
    : null

  return (
    <ComandanteDashboardClient
      username={session.user.username}
      ejercito={ejercito as any}
      rankingActual={ranking}
    />
  )
}
