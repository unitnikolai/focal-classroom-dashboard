import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/signin', '/signup', '/reset-password', '/api/'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Let public paths through unconditionally
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const accessToken = req.cookies.get('accessToken')?.value;
  const refreshToken = req.cookies.get('refreshToken')?.value;

  // No tokens at all → hard redirect to signin
  if (!accessToken && !refreshToken) {
    return NextResponse.redirect(new URL('/signin', req.url));
  }

  // Has a refresh token but access token is missing/expired →
  // let the request through, AuthGuard will handle the refresh client-side
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/).*)'],
};