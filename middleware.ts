import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // Laisse passer les routes publiques
  const isPublic =
    pathname === '/login' ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname === '/favicon.ico' ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.webp')

  // on crée une réponse mutable
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // IMPORTANT: avec @supabase/ssr on doit utiliser getAll / setAll
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookies) {
          cookies.forEach((cookie) => res.cookies.set(cookie.name, cookie.value, cookie.options))
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Si déjà connecté et on est sur /login -> redirige vers dashboard (ou vers redirect=?)
  if (session && pathname === '/login') {
    const params = new URLSearchParams(search)
    const to = params.get('redirect') || '/dashboard'
    return NextResponse.redirect(new URL(to, request.url))
  }

  // Si non connecté et route protégée -> envoie vers /login
  if (!session && !isPublic) {
    const url = new URL('/login', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  return res
}

// Matcher: on laisse passer les assets et images
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
