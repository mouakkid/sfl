import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // API moderne: getAll/setAll
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach((cookie) => res.cookies.set(cookie))
        },
      },
    }
  )

  // getUser() côté edge = revalidation fiable
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    const url = new URL('/login', req.url)
    url.searchParams.set('redirect', req.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return res
}

// Protège UNIQUEMENT les pages privées (pas /, pas /login, pas /api)
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/orders/:path*',
    '/settings/:path*',
  ],
}
