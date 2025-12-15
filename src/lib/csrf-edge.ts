/**
 * EDGE-COMPATIBLE CSRF PROTECTION
 * Cross-Site Request Forgery protection for Next.js Edge Runtime
 * Uses Web Crypto API instead of Node.js crypto
 * Created: 2025-11-22
 */

import { NextRequest, NextResponse } from 'next/server';

export interface CSRFConfig {
  enabled: boolean;
  tokenLength?: number;
  cookieName?: string;
  headerName?: string;
  maxAge?: number; // in seconds
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  excludePaths?: string[];
  excludeMethods?: string[];
}

const DEFAULT_CSRF_CONFIG: CSRFConfig = {
  enabled: true,
  tokenLength: 32,
  cookieName: 'csrf-token',
  headerName: 'x-csrf-token',
  maxAge: 3600, // 1 hour
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  sameSite: 'strict',
  excludePaths: ['/api/auth/*', '/api/health', '/api/email/verify'],
  excludeMethods: ['GET', 'HEAD', 'OPTIONS']
};

/**
 * Generate random bytes using Web Crypto API (Edge-compatible)
 */
async function generateRandomBytes(length: number): Promise<Uint8Array> {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

/**
 * Convert bytes to hex string
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * SHA-256 hash using Web Crypto API (Edge-compatible)
 */
async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  return bytesToHex(new Uint8Array(hashBuffer));
}

/**
 * Generate a cryptographically secure CSRF token (Edge-compatible)
 */
export async function generateCSRFToken(length: number = DEFAULT_CSRF_CONFIG.tokenLength!): Promise<string> {
  const bytes = await generateRandomBytes(length);
  return bytesToHex(bytes);
}

/**
 * Create a double-submit cookie CSRF token (Edge-compatible)
 */
export async function createCSRFTokenPair(): Promise<{ token: string; cookieValue: string }> {
  const token = await generateCSRFToken();
  const secret = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production';

  // Create HMAC-like hash for cookie value to prevent tampering
  const cookieValue = await sha256(token + secret);

  return { token, cookieValue };
}

/**
 * Verify CSRF token from request (Edge-compatible)
 */
export async function verifyCSRFToken(
  token: string | null,
  cookieValue: string | null,
  config: CSRFConfig = DEFAULT_CSRF_CONFIG
): Promise<boolean> {
  if (!config.enabled) return true;
  if (!token || !cookieValue) return false;

  const secret = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production';
  const expectedCookieValue = await sha256(token + secret);

  // Use constant-time comparison to prevent timing attacks
  return constantTimeEquals(cookieValue, expectedCookieValue);
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Check if path should be excluded from CSRF protection
 */
function shouldExcludePath(pathname: string, config: CSRFConfig): boolean {
  if (!config.excludePaths) return false;

  return config.excludePaths.some(excludePath => {
    if (excludePath.endsWith('*')) {
      // Wildcard matching
      const prefix = excludePath.slice(0, -1);
      return pathname.startsWith(prefix);
    }
    return pathname === excludePath;
  });
}

/**
 * Check if method should be excluded from CSRF protection
 */
function shouldExcludeMethod(method: string, config: CSRFConfig): boolean {
  if (!config.excludeMethods) return false;
  return config.excludeMethods.includes(method);
}

/**
 * CSRF protection middleware for Next.js Edge Runtime
 */
export async function csrfProtectionMiddleware(
  request: NextRequest,
  config: CSRFConfig = DEFAULT_CSRF_CONFIG
): Promise<NextResponse | null> {
  if (!config.enabled) return null;

  const { pathname } = request.nextUrl;
  const method = request.method;

  // Skip CSRF protection for excluded paths and methods
  if (shouldExcludePath(pathname, config) || shouldExcludeMethod(method, config)) {
    return null;
  }

  // For state-changing methods, verify CSRF token
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const token = request.headers.get(config.headerName!);
    const cookieValue = request.cookies.get(config.cookieName!)?.value;

    const isValid = await verifyCSRFToken(token || null, cookieValue || null, config);

    if (!isValid) {
      console.warn(`🚨 CSRF token verification failed for ${method} ${pathname}`);

      return NextResponse.json(
        { error: 'CSRF token verification failed' },
        { status: 403 }
      );
    }
  }

  return null; // Continue with request
}

/**
 * Set CSRF token cookie in response (Edge-compatible)
 */
export async function setCSRFTokenCookie(
  response: NextResponse,
  config: CSRFConfig = DEFAULT_CSRF_CONFIG
): Promise<NextResponse> {
  if (!config.enabled) return response;

  const { token, cookieValue } = await createCSRFTokenPair();

  response.cookies.set(config.cookieName!, cookieValue, {
    httpOnly: config.httpOnly,
    secure: config.secure,
    sameSite: config.sameSite,
    maxAge: config.maxAge,
    path: '/'
  });

  // Also set the token in a non-httpOnly cookie for JavaScript access
  response.cookies.set('csrf-token-public', token, {
    httpOnly: false,
    secure: config.secure,
    sameSite: config.sameSite,
    maxAge: config.maxAge,
    path: '/'
  });

  return response;
}

/**
 * Get CSRF token for client-side use
 */
export function getCSRFToken(request: NextRequest, config: CSRFConfig = DEFAULT_CSRF_CONFIG): string | null {
  if (!config.enabled) return null;

  const cookieValue = request.cookies.get('csrf-token-public')?.value;
  return cookieValue || null;
}

/**
 * Get CSRF configuration based on environment
 */
export function getCSRFConfig(): CSRFConfig {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    ...DEFAULT_CSRF_CONFIG,
    // CSRF enabled in production for security
    enabled: isProduction,
    secure: isProduction,
    excludePaths: [
      // Always exclude auth endpoints from CSRF protection
      '/api/auth/*',
      '/api/health',
      '/api/email/verify',
      // Add development-only exclusions
      ...(isProduction ? [] : ['/api/test*', '/api/db/*'])
    ]
  };
}

/**
 * Get client IP address from request headers
 */
export function getClientIP(request: NextRequest): string {
  // Try various headers for IP detection
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfIP = request.headers.get('cf-connecting-ip');

  return forwarded?.split(',')[0]?.trim() ||
         realIP ||
         cfIP ||
         'unknown';
}

/**
 * Verify CSRF protection for a request
 * Convenience function that extracts token/cookie from request
 */
export async function verifyCSRF(
  request: NextRequest | Request,
  config: CSRFConfig = DEFAULT_CSRF_CONFIG
): Promise<boolean> {
  if (!config.enabled) return true;

  const nextRequest = request as NextRequest;
  const token = nextRequest.headers.get(config.headerName!);
  const cookieValue = nextRequest.cookies?.get(config.cookieName!)?.value;

  return verifyCSRFToken(token || null, cookieValue || null, config);
}
