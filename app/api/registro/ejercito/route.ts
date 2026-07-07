import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, password, nombreEjercito, sigla } = body

    if (!username || !password || !nombreEjercito || !sigla) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 })
    }
    if (sigla.length > 5) {
      return NextResponse.json({ error: 'La sigla no puede exceder 5 caracteres' }, { status: 400 })
    }

    const [existeUsername, existeSigla] = await Promise.all([
      prisma.user.findUnique({ where: { username } }),
      prisma.ejercito.findUnique({ where: { sigla: sigla.toUpperCase() } }),
    ])

    if (existeUsername) return NextResponse.json({ error: 'Ese nombre de usuario ya está en uso' }, { status: 409 })
    if (existeSigla)    return NextResponse.json({ error: 'Esa sigla de ejército ya está registrada' }, { status: 409 })

    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear ejército (inactivo) y usuario comandante en transacción
    const result = await prisma.$transaction(async (tx) => {
      const nuevoEjercito = await tx.ejercito.create({
        data: {
          nombre: nombreEjercito.trim(),
          sigla: sigla.toUpperCase().trim(),
          fundador: username,
          activo: false, // ¡Queda pendiente de aprobación!
        }
      })

      const newUser = await tx.user.create({
        data: {
          username,
          password:     hashedPassword,
          role:         'COMANDANTE',
          rolEjercito:  'COMANDANTE',
          ejercitoId:   nuevoEjercito.id,
        },
        select: { id: true, username: true, role: true },
      })

      return { user: newUser, ejercito: nuevoEjercito }
    })

    return NextResponse.json({ ok: true, data: result }, { status: 201 })
  } catch (error) {
    console.error('Error al registrar ejército:', error)
    return NextResponse.json({ error: 'Error al procesar la solicitud' }, { status: 500 })
  }
}
