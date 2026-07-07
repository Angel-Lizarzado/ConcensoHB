import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { oldPassword, newPassword } = await req.json()

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'La nueva contraseña debe tener al menos 8 caracteres' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

    const valid = await bcrypt.compare(oldPassword, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'La contraseña actual es incorrecta' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed }
    })

    return NextResponse.json({ ok: true, message: 'Contraseña actualizada' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al cambiar contraseña' }, { status: 500 })
  }
}
