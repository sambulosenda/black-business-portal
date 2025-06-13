import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuth = !!token
  const pathname = request.nextUrl.pathname

  // Public routes - anyone can access
  const isPublicRoute = 
    pathname === '/' ||
    pathname.startsWith('/search') ||
    pathname.startsWith('/business/') && !pathname.includes('/dashboard') && !pathname.includes('/services') && !pathname.includes('/bookings') && !pathname.includes('/availability') && !pathname.includes('/profile') ||
    pathname.startsWith('/api/search') ||
    pathname.startsWith('/api/auth')

  // Auth pages - redirect to dashboard if already logged in
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup')

  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Protected routes - require authentication
  if (!isAuth) {
    const from = pathname + request.nextUrl.search
    return NextResponse.redirect(
      new URL(`/login?from=${encodeURIComponent(from)}`, request.url)
    )
  }

  // Business owner only routes
  const isBusinessOwnerRoute = 
    pathname.startsWith('/business/dashboard') ||
    pathname.startsWith('/business/services') ||
    pathname.startsWith('/business/bookings') ||
    pathname.startsWith('/business/availability') ||
    pathname.startsWith('/business/profile')

  if (isBusinessOwnerRoute && token?.role !== 'BUSINESS_OWNER') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}