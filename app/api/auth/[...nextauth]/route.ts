import { handlers } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    return await handlers.GET(req)
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ error: error.message, stack: error.stack }), { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    return await handlers.POST(req)
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ error: error.message, stack: error.stack }), { status: 500 })
  }
}
