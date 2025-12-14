/**
 * CSRF PROTECTION MIDDLEWARE
 * Cross-Site Request Forgery protection for Next.js
 * Created: 2025-11-21
 * Author: Security Specialist
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

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
  excludePaths: ['/api/auth/login', '/api/auth/register', '/api/auth/logout'],
  excludeMethods: ['GET', 'HEAD', 'OPTIONS']
};

/**
 * Get client IP address from request headers
 */
function getClientIP(request: NextRequest): string {
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
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(length: number = DEFAULT_CSRF_CONFIG.tokenLength!): string {
  return createHash('sha256')
    .update(crypto.getRandomValues(new Uint8Array(length)))
    .digest('hex');
}

/**
 * Create a double-submit cookie CSRF token
 */
export function createCSRFTokenPair(): { token: string; cookieValue: string } {
  const token = generateCSRFToken();
  const secret = process.env.CSRF_SECRET;

  if (!secret) {
    throw new Error('CRITICAL SECURITY ERROR: CSRF_SECRET environment variable is not set. Application cannot start without this.');
  }

  // Create HMAC for cookie value to prevent tampering
  const cookieValue = createHash('sha256')
    .update(token + secret)
    .digest('hex');

  return { token, cookieValue };
}

/**
 * Verify CSRF token from request
 */
export function verifyCSRFToken(
  token: string | null,
  cookieValue: string | null,
  config: CSRFConfig = DEFAULT_CSRF_CONFIG
): boolean {
  if (!config.enabled) return true;
  if (!token || !cookieValue) return false;

  const secret = process.env.CSRF_SECRET;

  if (!secret) {
    throw new Error('CRITICAL SECURITY ERROR: CSRF_SECRET environment variable is not set. Application cannot start without this.');
  }

  const expectedCookieValue = createHash('sha256')
    .update(token + secret)
    .digest('hex');

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
 * CSRF protection middleware for Next.js
 */
export function csrfProtectionMiddleware(
  request: NextRequest,
  config: CSRFConfig = DEFAULT_CSRF_CONFIG
): NextResponse | null {
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

    if (!verifyCSRFToken(token || null, cookieValue || null, config)) {
      console.warn(`CSRF token verification failed for ${method} ${pathname}`);

      return NextResponse.json(
        { error: 'CSRF token verification failed' },
        { status: 403 }
      );
    }
  }

  return null; // Continue with request
}

/**
 * Set CSRF token cookie in response
 */
export function setCSRFTokenCookie(response: NextResponse, config: CSRFConfig = DEFAULT_CSRF_CONFIG): NextResponse {
  if (!config.enabled) return response;

  const { token, cookieValue } = createCSRFTokenPair();

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
 * CSRF protection for API routes
 */
export async function protectAPIRoute(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
  config: CSRFConfig = DEFAULT_CSRF_CONFIG
): Promise<NextResponse> {
  // Check CSRF protection
  const csrfResponse = csrfProtectionMiddleware(request, config);
  if (csrfResponse) {
    return csrfResponse;
  }

  // Execute handler
  return await handler();
}

/**
 * Generate CSRF token for forms/pages
 */
export function generateCSRFTokenForForm(request: NextRequest, config: CSRFConfig = DEFAULT_CSRF_CONFIG): string {
  if (!config.enabled) return '';

  const { token } = createCSRFTokenPair();
  return token;
}

/**
 * Validate CSRF token for form submissions
 */
export function validateFormCSRF(
  formData: FormData | URLSearchParams,
  request: NextRequest,
  config: CSRFConfig = DEFAULT_CSRF_CONFIG
): boolean {
  if (!config.enabled) return true;

  const token = formData.get('csrf_token') as string;
  const cookieValue = request.cookies.get(config.cookieName!)?.value;

  return verifyCSRFToken(token || null, cookieValue || null, config);
}

/**
 * CSRF protection for server actions (Next.js 13+)
 */
export async function protectServerAction(
  request: NextRequest,
  action: () => Promise<any>,
  config: CSRFConfig = DEFAULT_CSRF_CONFIG
): Promise<any> {
  // Check CSRF protection
  const csrfResponse = csrfProtectionMiddleware(request, config);
  if (csrfResponse) {
    throw new Error('CSRF token verification failed');
  }

  // Execute action
  return await action();
}

/**
 * Middleware for Next.js app directory
 */
export function createCSRFForApp(config: CSRFConfig = DEFAULT_CSRF_CONFIG) {
  return function csrfMiddleware(request: NextRequest) {
    return csrfProtectionMiddleware(request, config);
  };
}

/**
 * Utility to add CSRF token to HTML forms
 */
export function createCSRFInput(token: string): string {
  return `<input type="hidden" name="csrf_token" value="${token}" />`;
}

/**
 * React hook for CSRF token management (client-side)
 */
export function useCSRFToken() {
  // This would be implemented in a React component
  // For now, return a placeholder
  return {
    token: null,
    isLoading: false,
    error: null
  };
}

/**
 * Security monitoring for CSRF events
 */
export async function logCSRFEvent(
  eventType: 'token_missing' | 'token_invalid' | 'token_expired',
  request: NextRequest,
  details?: any
): Promise<void> {
  console.warn(`CSRF Event [${eventType}]:`, {
    path: request.nextUrl.pathname,
    method: request.method,
    ip: getClientIP(request),
    userAgent: request.headers.get('user-agent'),
    timestamp: new Date().toISOString(),
    details
  });

  // In production, log to monitoring service
  // await logSecurityEvent('csrf_attempt', 'medium', null, request.ip, request.headers.get('user-agent'), {
  //   eventType,
  //   path: request.nextUrl.pathname,
  //   method: request.method,
  //   ...details
  // });
}

/**
 * Configuration validation
 */
export function validateCSRFConfig(config: CSRFConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.tokenLength && (config.tokenLength < 16 || config.tokenLength > 64)) {
    errors.push('Token length must be between 16 and 64 characters');
  }

  if (config.maxAge && config.maxAge < 300) {
    errors.push('Max age must be at least 300 seconds (5 minutes)');
  }

  if (config.cookieName && !/^[a-zA-Z0-9_-]+$/.test(config.cookieName)) {
    errors.push('Cookie name must contain only alphanumeric characters, hyphens, and underscores');
  }

  if (config.headerName && !/^[a-zA-Z0-9_-]+$/.test(config.headerName)) {
    errors.push('Header name must contain only alphanumeric characters, hyphens, and underscores');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get CSRF configuration based on environment
 */
export function getCSRFConfig(): CSRFConfig {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    ...DEFAULT_CSRF_CONFIG,
    enabled: isProduction, // Disable in development for easier testing
    secure: isProduction,
    excludePaths: isProduction
      ? DEFAULT_CSRF_CONFIG.excludePaths
      : [...(DEFAULT_CSRF_CONFIG.excludePaths || []), '/api/test'] // Add test endpoints in dev
  };
}