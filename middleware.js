import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('pm_token')?.value;
  const { pathname } = request.nextUrl;

  const isPublicPath = pathname === '/login';

  // Redirect to login if token is missing and accessing protected path
  if (!token && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to dashboard if token exists and accessing login page
  if (token && isPublicPath) {
    const dashboardUrl = new URL('/', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, logo.png (public asset files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo.png|.*\\..*).*)',
  ],
};
