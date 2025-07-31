import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './src/i18n/config';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip middleware for API routes, static files and images
  if (pathname.startsWith('/api/') || 
      pathname.includes('/_next/') || 
      pathname.includes('/favicon.ico') ||
      pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp)$/)) {
    
    // Only protect specific business management APIs
    if (pathname.startsWith('/api/business/services')) {
      const token = await getToken({ req: request })
      if (!token || token.role !== 'BUSINESS_OWNER') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }
    return NextResponse.next()
  }

  // Handle internationalization
  const response = intlMiddleware(request);
  
  // If intl middleware returns a response (redirect), we need to continue with auth checks
  if (response.status === 307 || response.status === 302) {
    return response;
  }

  // Extract locale from pathname for auth logic
  const localeMatch = pathname.match(/^\/([a-z]{2})(?:\/|$)/);
  const locale = localeMatch ? localeMatch[1] : defaultLocale;
  const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '') || '/';

  // List of public routes that don't require authentication (without locale prefix)
  const publicRoutes = [
    '/',
    '/search',
    '/login',
    '/signup',
  ]

  // Check if it's a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathnameWithoutLocale === route || pathnameWithoutLocale.startsWith(route)
  )

  // Business profile pages are public (e.g., /business/curls-coils-beauty-bar)
  // But business management pages are not (e.g., /business/dashboard)
  const isBusinessProfilePage = pathnameWithoutLocale.match(/^\/business\/[^\/]+$/)
  const isBusinessManagementPage = 
    pathnameWithoutLocale.startsWith('/business/dashboard') ||
    pathnameWithoutLocale.startsWith('/business/services') ||
    pathnameWithoutLocale.startsWith('/business/bookings') ||
    pathnameWithoutLocale.startsWith('/business/availability') ||
    pathnameWithoutLocale.startsWith('/business/profile') ||
    pathnameWithoutLocale.startsWith('/business/reviews') ||
    pathnameWithoutLocale.startsWith('/business/settings')

  // If it's a business profile page (not management), it's public
  if (isBusinessProfilePage && !isBusinessManagementPage) {
    return response
  }

  // If it's a public route, allow access
  if (isPublicRoute) {
    const token = await getToken({ req: request })
    const isAuth = !!token
    
    // If user is logged in and trying to access login/signup, redirect to dashboard
    if (isAuth && (pathnameWithoutLocale.startsWith('/login') || pathnameWithoutLocale.startsWith('/signup'))) {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
    }
    return response
  }

  // For all other routes, check authentication
  const token = await getToken({ req: request })
  const isAuth = !!token

  // If not authenticated, redirect to login
  if (!isAuth) {
    const from = pathname + request.nextUrl.search
    return NextResponse.redirect(
      new URL(`/${locale}/login?from=${encodeURIComponent(from)}`, request.url)
    )
  }

  // Check business owner only routes
  if (isBusinessManagementPage) {
    if (token?.role !== 'BUSINESS_OWNER') {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
    }
  }

  return response
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