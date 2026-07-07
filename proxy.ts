import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export const config = {
  matcher: ['/dashboard/:path*', '/chat/:path*', '/incidencias/:path*'],
}

export async function proxy(request: NextRequest) {
  const session = await auth()

  if (!session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }
}
