import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { join } from 'path'
import { writeFile, mkdir } from 'fs/promises'
import sharp from 'sharp'
import { existsSync } from 'fs'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    
    // Solo permitimos a los que puedan redactar o administrar
    if (!['REPORTERO', 'ADMIN', 'JUEZ', 'COMANDANTE', 'OFICIAL'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sin permisos para subir imágenes' }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    
    if (!file) {
      return NextResponse.json({ error: 'No se envió ninguna imagen' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'El archivo debe ser una imagen' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Comprimir con sharp
    const optimized = await sharp(buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer()

    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1000)}.webp`
    const dirPath = join(process.cwd(), 'public', 'uploads')
    
    if (!existsSync(dirPath)) {
      await mkdir(dirPath, { recursive: true })
    }

    const filePath = join(dirPath, uniqueName)
    await writeFile(filePath, optimized)

    return NextResponse.json({ url: `/uploads/${uniqueName}` }, { status: 201 })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json({ error: 'Error al procesar la imagen' }, { status: 500 })
  }
}
