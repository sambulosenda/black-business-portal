import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip middleware for API routes (except business management APIs)
  if (pathname.startsWith('/api/')) {
    // Only protect specific business management APIs
    if (pathname.startsWith('/api/business/services')) {
      const token = await getToken({ req: request })
      if (!token || token.role !== 'BUSINESS_OWNER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }
    return NextResponse.next()
  }

  // Skip middleware for static files and images
  if (pathname.includes('/_next/') || pathname.includes('/favicon.ico')) {
    return NextResponse.next()
  }

  // List of public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/search',
    '/login',
    '/signup',
  ]

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  )

  // Business profile pages are public (e.g., /business/curls-coils-beauty-bar)
  // But business management pages are not (e.g., /business/dashboard)
  const isBusinessProfilePage = pathname.match(/^\/business\/[^\/]+$/)
  const isBusinessManagementPage = 
    pathname.startsWith('/business/dashboard') ||
    pathname.startsWith('/business/services') ||
    pathname.startsWith('/business/bookings') ||
    pathname.startsWith('/business/availability') ||
    pathname.startsWith('/business/profile') ||
    pathname.startsWith('/business/reviews') ||
    pathname.startsWith('/business/settings')

  // If it's a business profile page (not management), it's public
  if (isBusinessProfilePage && !isBusinessManagementPage) {
    console.log('Business profile page - allowing public access:', pathname)
    return NextResponse.next()
  }

  // If it's a public route, allow access
  if (isPublicRoute) {
    const token = await getToken({ req: request })
    const isAuth = !!token
    
    // If user is logged in and trying to access login/signup, redirect to dashboard
    if (isAuth && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // For all other routes, check authentication
  const token = await getToken({ req: request })
  const isAuth = !!token

  // If not authenticated, redirect to login
  if (!isAuth) {
    console.log('Not authenticated, redirecting to login from:', pathname)
    const from = pathname + request.nextUrl.search
    return NextResponse.redirect(
      new URL(`/login?from=${encodeURIComponent(from)}`, request.url)
    )
  }

  // Check business owner only routes
  if (isBusinessManagementPage) {
    if (token?.role !== 'BUSINESS_OWNER') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)  
     * - favicon.ico (favicon file)
     * - files with extensions (e.g. .css, .js, .png)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
}