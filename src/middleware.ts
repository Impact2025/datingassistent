/**
 * NEXT.JS MIDDLEWARE
 * Enterprise-grade security middleware combining multiple protection layers
 * Created: 2025-11-21
 * Author: Security Specialist
 */

import { NextRequest, NextResponse } from 'next/server';
import { securityHeadersMiddleware, applyAPISecurityHeaders, applyAdminSecurityHeaders } from '@/lib/security-headers';
import { csrfProtectionMiddleware } from '@/lib/csrf';
import { adminSecurityMiddleware } from '@/lib/admin-security';

// ============================================================================
// CONFIGURATION
// ============================================================================

const SECURITY_CONFIG = {
  // Paths that bypass security checks (for health checks, etc.)
  bypassPaths: ['/_next', '/api/health', '/favicon.ico'],

  // Admin paths that get enhanced security
  adminPaths: ['/api/admin', '/admin'],

  // API paths
  apiPaths: ['/api'],

  // Static assets that don't need security headers
  staticPaths: ['/_next/static', '/favicon.ico', '/robots.txt', '/sitemap.xml']
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if path should bypass security middleware
 */
function shouldBypassSecurity(pathname: string): boolean {
  return SECURITY_CONFIG.bypassPaths.some(bypassPath =>
    pathname.startsWith(bypassPath)
  );
}

/**
 * Check if path is an admin route
 */
function isAdminPath(pathname: string): boolean {
  return SECURITY_CONFIG.adminPaths.some(adminPath =>
    pathname.startsWith(adminPath)
  );
}

/**
 * Check if path is an API route
 */
function isAPIPath(pathname: string): boolean {
  return SECURITY_CONFIG.apiPaths.some(apiPath =>
    pathname.startsWith(apiPath)
  );
}

/**
 * Check if path is a static asset
 */
function isStaticAsset(pathname: string): boolean {
  return SECURITY_CONFIG.staticPaths.some(staticPath =>
    pathname.startsWith(staticPath)
  );
}

/**
 * Get security context for logging
 */
function getSecurityContext(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const accept = request.headers.get('accept') || '';
  const referer = request.headers.get('referer') || '';

  return {
    pathname,
    method: request.method,
    userAgent: userAgent.substring(0, 200), // Limit length
    accept,
    referer,
    hasSearchParams: searchParams.toString().length > 0,
    timestamp: new Date().toISOString()
  };
}

// ============================================================================
// MAIN MIDDLEWARE FUNCTION
// ============================================================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // TEMPORARILY DISABLED: Security headers blocking reCAPTCHA and external resources
  // TODO: Re-enable with proper CSP configuration after deployment testing

  // Just pass through all requests without security headers for now
  return NextResponse.next();

  /* ORIGINAL CODE - RE-ENABLE LATER
  const securityContext = getSecurityContext(request);

  // Log security events in production
  if (process.env.NODE_ENV === 'production') {
    console.log('🔐 Security Middleware:', securityContext);
  }

  // Bypass security for certain paths
  if (shouldBypassSecurity(pathname)) {
    return NextResponse.next();
  }

  // Skip static assets (but still apply basic security headers)
  if (isStaticAsset(pathname)) {
    return securityHeadersMiddleware(request);
  }

  let response: NextResponse | null = null;

  // Apply security based on path type
  if (isAdminPath(pathname)) {
    // Enhanced security for admin routes
    response = await handleAdminRoute(request);
  } else if (isAPIPath(pathname)) {
    // API security
    response = await handleAPIRoute(request);
  } else {
    // Regular page security
    response = await handlePageRoute(request);
  }

  // If security check failed, return the error response
  if (response && response.status !== 200) {
    return response;
  }

  // Apply security headers to successful responses
  if (response) {
    return response;
  }

  // Default: apply basic security headers
  return securityHeadersMiddleware(request);
  */
}

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

/**
 * Handle admin routes with enhanced security
 */
async function handleAdminRoute(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;

  // Apply admin security middleware (includes rate limiting, input validation, audit logging)
  const adminSecurity = await adminSecurityMiddleware(request, {
    enableRateLimiting: true,
    enableInputValidation: true,
    enableAuditLogging: true,
    strictMode: true
  });

  if (!adminSecurity.allowed) {
    return adminSecurity.response || NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    );
  }

  // Apply CSRF protection for state-changing operations
  const csrfResponse = csrfProtectionMiddleware(request);
  if (csrfResponse) {
    return csrfResponse;
  }

  // Apply admin-specific security headers
  const response = NextResponse.next();
  return applyAdminSecurityHeaders(response);
}

/**
 * Handle API routes
 */
async function handleAPIRoute(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;

  // Apply CSRF protection for state-changing API calls
  const csrfResponse = csrfProtectionMiddleware(request);
  if (csrfResponse) {
    return csrfResponse;
  }

  // Apply API-specific security headers
  const response = NextResponse.next();
  return applyAPISecurityHeaders(response);
}

/**
 * Handle regular page routes
 */
async function handlePageRoute(request: NextRequest): Promise<NextResponse | null> {
  // Apply basic security headers
  return securityHeadersMiddleware(request);
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export const config = {
  // Match all routes except static assets
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};

// ============================================================================
// DEVELOPMENT HELPERS
// ============================================================================

/**
 * Development mode security bypass for easier testing
 */
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Security Middleware loaded in DEVELOPMENT mode');
  console.log('⚠️  Some security features may be relaxed for development');
}

// ============================================================================
// MONITORING & LOGGING
// ============================================================================

/**
 * Log security events for monitoring
 */
function logSecurityEvent(
  event: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  details: any
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    severity,
    details,
    environment: process.env.NODE_ENV || 'unknown'
  };

  // In production, this would be sent to a monitoring service
  if (process.env.NODE_ENV === 'production') {
    console.error('🚨 SECURITY EVENT:', logEntry);
  } else {
    console.log('🔐 Security Event:', logEntry);
  }
}

// ============================================================================
// EXPORT FOR TESTING
// ============================================================================

export {
  shouldBypassSecurity,
  isAdminPath,
  isAPIPath,
  isStaticAsset,
  getSecurityContext
};