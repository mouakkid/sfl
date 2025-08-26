import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Chemins publics (accès sans login)
const PUBLIC_STARTS_WITH = [
  '/auth/confirm', // liens email
  '/_next',        // assets Next
  '/favicon',      // favicons
]
const PUBLIC_EXACT = new Set<string>([
  '/',
  '/login',
  '/signup',
  '/orders/export', // export déclenché depuis UI; RLS DB protège les données
])

export function middleware(request: NextRequest) {
  // ✅ Laisse passer toutes les requêtes non-GET (POST des formulaires/route handlers)
  if (request.method !== 'GET') {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  // ✅ Laisse passer les assets et les routes publiques
  if (
    PUBLIC_EXACT.has(pathname) ||
    PUBLIC_STARTS_WITH.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.next()
  }

  if (pathname === '/login') {
  const hasAccess =
    !!request.cookies.get('sb-access-token') ||
    !!request.cookies.get('sb-refresh-token')
  if (hasAccess) {
    const url = request.nextUrl.clone()
    url.pathname = request.nextUrl.searchParams.get('redirect') || '/dashboard'
    return NextResponse.redirect(url)
  }
}

  // ✅ Check cookies Supabase (présence ≈ session active côté client/SSR)
  // Supabase v2 pose `sb-access-token` et `sb-refresh-token`
  const hasAccess =
    !!request.cookies.get('sb-access-token') ||
    !!request.cookies.get('sb:token') ||           // anciens noms potentiels
    !!request.cookies.get('supabase-auth-token')   // fallback très ancien

  if (!hasAccess) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // ✅ Auth OK → continue
  return NextResponse.next()
}

// Match tout sauf les assets statiques gérés par Next
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
