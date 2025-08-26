import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const cookie = req.cookies.get('sb-access-token'); // Supabase sets this if using PKCE
  const isAuth = !!cookie;
  const isLogin = req.nextUrl.pathname.startsWith('/login');
  const isPublic = isLogin || req.nextUrl.pathname.startsWith('/api');

  if (!isAuth && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.jpg).*)'],
};
