import { NextRequest, NextResponse } from 'next/server';
import type { NextMiddlewareResult } from 'next/dist/server/web/types';

export async function middleware(request: NextRequest): Promise<NextMiddlewareResult> {
  const pathname = request.nextUrl.pathname;

  // Check if accessing protected admin routes
  if (pathname.startsWith('/') || pathname.startsWith('/api/protected')) {
    // Check for authentication token in cookies
    const authToken = request.cookies.get('amplifyAuthenticatedUser');
    const accessToken = request.cookies.get('CognitoIdentityServiceProvider.YOUR_APP_CLIENT_ID.accessToken');
    
    // If no token, redirect to signin
    if (!authToken && !accessToken) {
      const signinUrl = new URL('/signin', request.url);
      return NextResponse.redirect(signinUrl);
    }
  }

  // Allow public access to signin/signup and other full-width pages
  if (pathname.startsWith('/signin') || pathname.startsWith('/signup')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Specify which routes to apply middleware to
export const config = {
  matcher: [
    // Protect admin routes
    '/admin/:path*',
    // Protect API routes (optional)
    '/api/protected/:path*',
    // Don't apply to auth routes, static files, etc.
  ],
};
