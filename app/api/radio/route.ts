import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const RADIO_DEFAULTS = {
  id: 'singleton-radio',
  enabled: false, streamUrl: '', radioName: 'CGE Radio',
  djName: 'DJ', djAvatarUrl: '', currentTrack: 'En vivo',
  updatedAt: new Date(),
}

// GET /api/radio — config actual (público)
export async function GET() {
  try {
    const config = await prisma.radioConfig.findFirst()
    return NextResponse.json(config ?? RADIO_DEFAULTS)
  } catch {
    return NextResponse.json(RADIO_DEFAULTS)
  }
}

// PATCH /api/radio — actualizar config (ADMIN)
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const body = await req.json()
    const { enabled, streamUrl, radioName, djName, djAvatarUrl, currentTrack } = body

    const config = await prisma.radioConfig.upsert({
      where:  { id: 'singleton-radio' },
      update: {
        ...(enabled      !== undefined && { enabled }),
        ...(streamUrl    !== undefined && { streamUrl }),
        ...(radioName    !== undefined && { radioName }),
        ...(djName       !== undefined && { djName }),
        ...(djAvatarUrl  !== undefined && { djAvatarUrl }),
        ...(currentTrack !== undefined && { currentTrack }),
      },
      create: {
        id: 'singleton-radio',
        enabled:      enabled      ?? false,
        streamUrl:    streamUrl    ?? '',
        radioName:    radioName    ?? 'CGE Radio',
        djName:       djName       ?? 'DJ',
        djAvatarUrl:  djAvatarUrl  ?? '',
        currentTrack: currentTrack ?? 'En vivo',
      },
    })

    revalidatePath('/', 'layout')
    return NextResponse.json(config)
  } catch {
    return NextResponse.json({ error: 'Error al actualizar radio' }, { status: 500 })
  }
}
