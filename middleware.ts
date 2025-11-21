import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

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

  // Allow static files and public assets
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/videos/') ||
    pathname.includes('.') // files with extensions
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  // Allow onboarding route
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
    // Not a protected route, allow access
    return NextResponse.next();
  }

  // Protected route - SIMPLIFIED: Let client-side handle full auth
  // Middleware only does basic checks to prevent obvious issues
  try {
    // Get auth token from cookie
    const authToken = request.cookies.get('datespark_auth_token')?.value;

    // If no cookie token, allow through - client-side UserProvider will handle redirect
    // This prevents loops when token is in localStorage but not in cookies
    if (!authToken) {
      console.log('⚠️  Middleware: No cookie token, allowing through (client-side will handle auth)');
      return NextResponse.next();
    }

    // Verify token and get user ID
    const userId = await getUserIdFromToken(authToken);

    if (!userId) {
      console.log('🔒 Middleware: Invalid token in cookie, clearing and redirecting');
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('datespark_auth_token');
      return response;
    }

    // Token is valid, allow through
    // Journey status check is handled client-side in UserProvider
    console.log(`✅ Middleware: Valid token for user ${userId}, allowing access to ${pathname}`);
    return NextResponse.next();

  } catch (error) {
    console.error('❌ Middleware error:', error);
    // On error, allow through - client will handle
    return NextResponse.next();
  }
}

async function getUserIdFromToken(token: string): Promise<number | null> {
  try {
    // Verify JWT token using jose (same as auth.ts)
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Handle both old and new token formats
    if (payload.user && typeof payload.user === 'object' && 'id' in payload.user) {
      // New format: { user: { id, email, displayName } }
      return payload.user.id as number;
    } else if (payload.userId) {
      // Old format: { userId, email }
      return payload.userId as number;
    }

    return null;
  } catch {
    return null;
  }
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
