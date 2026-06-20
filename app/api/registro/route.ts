import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// POST /api/registro — registrar nuevo usuario con o sin código de invitación
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, email, password, codigo } = body

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'username, email y password son requeridos' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 })
    }

    // Verificar si el registro está abierto
    const siteConfig = await prisma.siteConfig.findFirst()
    const registroAbierto = siteConfig?.registroAbierto ?? false

    let invitacion = null

    if (codigo) {
      // Validar código de invitación
      invitacion = await prisma.codigoInvitacion.findUnique({
        where: { codigo: codigo.trim().toUpperCase() },
      })

      if (!invitacion) {
        return NextResponse.json({ error: 'Código de invitación inválido' }, { status: 400 })
      }
      if (!invitacion.activo) {
        return NextResponse.json({ error: 'Este código ya no está activo' }, { status: 400 })
      }
      if (invitacion.usosActuales >= invitacion.usoMaximo) {
        return NextResponse.json({ error: 'Este código ha alcanzado su límite de usos' }, { status: 400 })
      }
      if (invitacion.expiresAt && invitacion.expiresAt < new Date()) {
        return NextResponse.json({ error: 'Este código ha expirado' }, { status: 400 })
      }
    } else if (!registroAbierto) {
      return NextResponse.json({ error: 'El registro requiere un código de invitación' }, { status: 403 })
    }

    // Verificar que el usuario no exista
    const [existeUsername, existeEmail] = await Promise.all([
      prisma.user.findUnique({ where: { username } }),
      prisma.user.findUnique({ where: { email } }),
    ])

    if (existeUsername) return NextResponse.json({ error: 'Ese nombre de usuario ya está en uso' }, { status: 409 })
    if (existeEmail)    return NextResponse.json({ error: 'Ese email ya está registrado' }, { status: 409 })

    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear usuario y actualizar código en transacción
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          username,
          email,
          password:     hashedPassword,
          role:         'VISITANTE',
          ejercitoId:   invitacion?.ejercitoId ?? null,
          invitadoPorId: invitacion?.creadoPorId ?? null,
          codigoUsadoId: invitacion?.id ?? null,
        },
        select: { id: true, username: true, email: true, role: true },
      })

      if (invitacion) {
        await tx.codigoInvitacion.update({
          where: { id: invitacion.id },
          data:  { usosActuales: { increment: 1 } },
        })
      }

      return newUser
    })

    return NextResponse.json({ ok: true, user }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error al registrar usuario' }, { status: 500 })
  }
}
