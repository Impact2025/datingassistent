import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// TEMPORARY: Simplified middleware without security headers to diagnose issue
// TODO: Re-enable security headers after confirming middleware works

// Routes that require journey completion
const PROTECTED_ROUTES = [
  '/dashboard',
  '/dashboard/subscription',
  '/dashboard/settings',
  '/dashboard/community',
  '/dashboard/starter',
  '/courses',
  '/community/forum',
  '/profile-analysis',
];

// Routes that are always allowed (public or auth)
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/select-package',
  '/checkout',
  '/payment',
  '/payment/success',
  '/register/profile',
  '/blog',
  '/contact',
  '/privacy',
  '/terms',
];

// Admin routes
const ADMIN_ROUTES = ['/admin'];

// Onboarding route - always allowed
const ONBOARDING_ROUTE = '/onboarding';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow API routes - explicit check first
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Allow static files and public assets (no security headers needed)
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/videos/') ||
    pathname.includes('.') // files with extensions
  ) {
    return NextResponse.next();
  }

  // Allow public routes (with security headers)
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  // Allow onboarding route (with security headers)
  if (pathname === ONBOARDING_ROUTE || pathname.startsWith(ONBOARDING_ROUTE + '/')) {
    return NextResponse.next();
  }

  // Allow admin routes for now (admin check happens in admin layout)
  if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(
    route => pathname === route || pathname.startsWith(route + '/')
  );

  if (!isProtectedRoute) {
    // Not a protected route, allow access (with security headers)
    return NextResponse.next();
  }

  // Protected route - TEMPORARY: Let client-side handle all auth
  // This is a simplified middleware to diagnose deployment issues
  return NextResponse.next();
}

// Journey completion check removed - handled client-side in UserProvider
// This prevents middleware loops and allows localStorage-based auth to work

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, files with extensions
     */
    '/((?!api/|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
