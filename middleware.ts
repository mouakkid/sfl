import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()

  // ✅ Laisse passer les POST (server actions / routes)
  if (request.method !== 'GET') return res

  const { pathname } = request.nextUrl

  // Routes publiques + assets
  const isPublic =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname.startsWith('/auth/confirm') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/orders/export') // export CSV accessible une fois loggé (RLS côté DB)

  if (isPublic) return res

  // Check session Supabase pour protéger le reste
  const supabase = createMiddlewareClient({ req: request, res })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
