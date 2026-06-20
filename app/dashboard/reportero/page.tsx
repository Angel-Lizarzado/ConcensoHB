import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ReporteroDashboardClient from './ReporteroDashboardClient'

export const dynamic = 'force-dynamic'

export default async function ReporteroDashboard() {
  const session = await auth()
  if (!session || session.user.role !== 'REPORTERO') redirect('/dashboard')

  // Cargar departamento y noticias del reportero
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { departamento: true },
  })

  const noticias = await prisma.noticia.findMany({
    where: { autorId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: { id: true, titulo: true, slug: true, departamento: true, publicada: true, createdAt: true },
  })

  return (
    <ReporteroDashboardClient
      username={session.user.username}
      departamento={user?.departamento ?? null}
      noticias={noticias}
    />
  )
}
