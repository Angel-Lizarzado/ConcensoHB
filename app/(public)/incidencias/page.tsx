import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import IncidenciasClient from './IncidenciasClient'

export const dynamic = 'force-dynamic'

export default async function IncidenciasPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const { id: userId, role, ejercitoId } = session.user

  // Cargar datos del usuario (rolEjercito para verificar permisos)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { rolEjercito: true },
  })

  // Cargar ejércitos activos para el formulario de nueva incidencia
  const ejercitos = await prisma.ejercito.findMany({
    where: { activo: true },
    select: { id: true, sigla: true, nombre: true },
    orderBy: { sigla: 'asc' },
  })

  // Cargar incidencias según rol
  let incidencias: any[] = []
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/api/incidencias`, {
      headers: { cookie: '' }, // sin cookie — fetch server-side directo a Prisma
    })
  } catch {}

  // Fetch directo a Prisma (más eficiente que llamar la API desde server)
  if (role === 'ADMIN' || role === 'JUEZ') {
    incidencias = await prisma.incidencia.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        ejercitoDenunciante: { select: { sigla: true, nombre: true } },
        ejercitoDenunciado:  { select: { sigla: true, nombre: true } },
        juez:                { select: { username: true } },
        _count:              { select: { pruebas: true } },
      },
    })
  } else if (ejercitoId) {
    incidencias = await prisma.incidencia.findMany({
      where: {
        OR: [
          { denuncianteId: userId },
          { ejercitoDenunciadoId: ejercitoId, estado: { in: ['EN_PROCESO', 'RESUELTA', 'DESESTIMADA'] } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        ejercitoDenunciante: { select: { sigla: true } },
        ejercitoDenunciado:  { select: { sigla: true } },
        _count:              { select: { pruebas: true } },
      },
    })
  }

  const ROL_PUEDE_CREAR = ['COMANDANTE', 'OFICIAL', 'EMBAJADOR']
  const puedeCrear = role === 'ADMIN' || ROL_PUEDE_CREAR.includes(user?.rolEjercito ?? '')

  return (
    <IncidenciasClient
      sesion={{ userId, username: session.user.username, role, ejercitoId: ejercitoId ?? null }}
      incidenciasIniciales={incidencias}
      ejercitos={ejercitos}
      puedeCrear={puedeCrear}
    />
  )
}
