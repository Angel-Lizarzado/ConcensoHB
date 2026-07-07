import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { mision: true, biografia: true }
  })

  return NextResponse.json({ data: user })
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    // Solo admins deberían poder guardar misión y biografía
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Solo el personal del Concilio puede actualizar estos datos' }, { status: 403 })
    }

    const { mision, biografia } = await req.json()

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        mision: mision?.trim() || null,
        biografia: biografia?.trim() || null,
      },
      select: { mision: true, biografia: true }
    })

    return NextResponse.json({ ok: true, data: user })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al actualizar perfil' }, { status: 500 })
  }
}
