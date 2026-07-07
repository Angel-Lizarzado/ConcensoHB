import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id: targetUserId } = await params

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    })

    if (!targetUser) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

    // Verificación de permisos
    if (session.user.role === 'ADMIN') {
      // Admin puede resetear a cualquiera
    } else if (session.user.role === 'COMANDANTE') {
      // Comandante solo puede resetear a miembros de SU ejército
      if (targetUser.ejercitoId !== session.user.ejercitoId) {
        return NextResponse.json({ error: 'No tienes permisos sobre este usuario' }, { status: 403 })
      }
    } else {
      return NextResponse.json({ error: 'No tienes permisos para resetear contraseñas' }, { status: 403 })
    }

    // Generar contraseña aleatoria de 6 caracteres (alfanumérica)
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let newPassword = ''
    for (let i = 0; i < 6; i++) {
      newPassword += charset.charAt(Math.floor(Math.random() * charset.length))
    }

    const hashed = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: targetUserId },
      data: { password: hashed }
    })

    return NextResponse.json({ ok: true, newPassword })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error al resetear contraseña' }, { status: 500 })
  }
}
