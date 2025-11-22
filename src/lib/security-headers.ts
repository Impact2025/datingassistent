/**
 * SECURITY HEADERS MIDDLEWARE
 * OWASP compliant security headers for Next.js
 * Created: 2025-11-21
 * Author: Security Specialist
 */

import { NextRequest, NextResponse } from 'next/server';

export interface SecurityHeadersConfig {
  // Content Security Policy
  csp?: {
    enabled: boolean;
    defaultSrc?: string[];
    scriptSrc?: string[];
    styleSrc?: string[];
    imgSrc?: string[];
    fontSrc?: string[];
    connectSrc?: string[];
    mediaSrc?: string[];
    objectSrc?: string[];
    frameSrc?: string[];
    frameAncestors?: string[];
    reportUri?: string;
  };

  // Other security headers
  hsts?: {
    enabled: boolean;
    maxAge?: number;
    includeSubDomains?: boolean;
    preload?: boolean;
  };

  noSniff?: boolean;
  frameOptions?: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';
  xssProtection?: boolean;
  referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
  permissionsPolicy?: Record<string, string[]>;
  crossOriginEmbedderPolicy?: 'unsafe-none' | 'require-corp' | 'credentialless';
  crossOriginOpenerPolicy?: 'unsafe-none' | 'same-origin-allow-popups' | 'same-origin';
  crossOriginResourcePolicy?: 'same-site' | 'same-origin' | 'cross-origin';
}

const DEFAULT_SECURITY_CONFIG: SecurityHeadersConfig = {
  csp: {
    enabled: true,
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      "https://www.google.com",
      "https://www.gstatic.com"
    ], // Allow Next.js + reCAPTCHA
    styleSrc: ["'self'", "'unsafe-inline'"], // Allow styled-components
    imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
    fontSrc: ["'self'", 'data:', 'https:'],
    connectSrc: [
      "'self'",
      'https:',
      'wss:',
      'https://*.neon.tech', // Neon Database
      'https://www.google.com',
      'https://api.openrouter.ai'
    ],
    mediaSrc: ["'self'", 'https:', 'blob:'],
    objectSrc: ["'none'"],
    frameSrc: [
      "'self'",
      "https://www.google.com",
      "https://www.gstatic.com"
    ], // Allow reCAPTCHA frames
    frameAncestors: ["'none'"],
    reportUri: '/api/security/csp-report'
  },

  hsts: {
    enabled: true,
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: false
  },

  noSniff: true,
  frameOptions: 'DENY',
  xssProtection: true,
  referrerPolicy: 'strict-origin-when-cross-origin',

  permissionsPolicy: {
    camera: [],
    microphone: [],
    geolocation: [],
    payment: ['self'],
    usb: []
  },

  crossOriginEmbedderPolicy: 'unsafe-none',
  crossOriginOpenerPolicy: 'same-origin',
  crossOriginResourcePolicy: 'same-site'
};

/**
 * Generate Content Security Policy header
 */
function generateCSP(config: SecurityHeadersConfig['csp']): string {
  if (!config?.enabled) return '';

  const directives: string[] = [];

  if (config.defaultSrc) {
    directives.push(`default-src ${config.defaultSrc.join(' ')}`);
  }

  if (config.scriptSrc) {
    directives.push(`script-src ${config.scriptSrc.join(' ')}`);
  }

  if (config.styleSrc) {
    directives.push(`style-src ${config.styleSrc.join(' ')}`);
  }

  if (config.imgSrc) {
    directives.push(`img-src ${config.imgSrc.join(' ')}`);
  }

  if (config.fontSrc) {
    directives.push(`font-src ${config.fontSrc.join(' ')}`);
  }

  if (config.connectSrc) {
    directives.push(`connect-src ${config.connectSrc.join(' ')}`);
  }

  if (config.mediaSrc) {
    directives.push(`media-src ${config.mediaSrc.join(' ')}`);
  }

  if (config.objectSrc) {
    directives.push(`object-src ${config.objectSrc.join(' ')}`);
  }

  if (config.frameSrc) {
    directives.push(`frame-src ${config.frameSrc.join(' ')}`);
  }

  if (config.frameAncestors) {
    directives.push(`frame-ancestors ${config.frameAncestors.join(' ')}`);
  }

  if (config.reportUri) {
    directives.push(`report-uri ${config.reportUri}`);
  }

  return directives.join('; ');
}

/**
 * Generate HSTS header
 */
function generateHSTS(config: SecurityHeadersConfig['hsts']): string {
  if (!config?.enabled) return '';

  let hsts = `max-age=${config.maxAge || 31536000}`;

  if (config.includeSubDomains) {
    hsts += '; includeSubDomains';
  }

  if (config.preload) {
    hsts += '; preload';
  }

  return hsts;
}

/**
 * Generate Permissions Policy header
 */
function generatePermissionsPolicy(config: SecurityHeadersConfig['permissionsPolicy']): string {
  if (!config) return '';

  const directives: string[] = [];

  for (const [permission, origins] of Object.entries(config)) {
    if (origins.length === 0) {
      directives.push(`${permission}=()`);
    } else {
      directives.push(`${permission}=(${origins.join(' ')})`);
    }
  }

  return directives.join(', ');
}

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(
  response: NextResponse,
  config: SecurityHeadersConfig = DEFAULT_SECURITY_CONFIG
): NextResponse {
  // Content Security Policy
  const csp = generateCSP(config.csp);
  if (csp) {
    response.headers.set('Content-Security-Policy', csp);
  }

  // HSTS
  const hsts = generateHSTS(config.hsts);
  if (hsts) {
    response.headers.set('Strict-Transport-Security', hsts);
  }

  // X-Content-Type-Options
  if (config.noSniff) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
  }

  // X-Frame-Options
  if (config.frameOptions) {
    response.headers.set('X-Frame-Options', config.frameOptions);
  }

  // X-XSS-Protection
  if (config.xssProtection) {
    response.headers.set('X-XSS-Protection', '1; mode=block');
  }

  // Referrer-Policy
  if (config.referrerPolicy) {
    response.headers.set('Referrer-Policy', config.referrerPolicy);
  }

  // Permissions-Policy
  const permissionsPolicy = generatePermissionsPolicy(config.permissionsPolicy);
  if (permissionsPolicy) {
    response.headers.set('Permissions-Policy', permissionsPolicy);
  }

  // Cross-Origin Embedder Policy
  if (config.crossOriginEmbedderPolicy) {
    response.headers.set('Cross-Origin-Embedder-Policy', config.crossOriginEmbedderPolicy);
  }

  // Cross-Origin Opener Policy
  if (config.crossOriginOpenerPolicy) {
    response.headers.set('Cross-Origin-Opener-Policy', config.crossOriginOpenerPolicy);
  }

  // Cross-Origin Resource Policy
  if (config.crossOriginResourcePolicy) {
    response.headers.set('Cross-Origin-Resource-Policy', config.crossOriginResourcePolicy);
  }

  // Additional security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Download-Options', 'noopen');

  return response;
}

/**
 * Next.js middleware for security headers
 */
export function securityHeadersMiddleware(
  request: NextRequest,
  config: SecurityHeadersConfig = DEFAULT_SECURITY_CONFIG
) {
  // Clone the response
  const response = NextResponse.next();

  // Apply security headers
  return applySecurityHeaders(response, config);
}

/**
 * Development vs Production configuration
 */
export function getSecurityConfig(): SecurityHeadersConfig {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Relaxed config for development
    return {
      ...DEFAULT_SECURITY_CONFIG,
      csp: {
        ...DEFAULT_SECURITY_CONFIG.csp,
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'localhost:*', '127.0.0.1:*'],
        connectSrc: ["'self'", 'localhost:*', '127.0.0.1:*', 'ws:', 'wss:']
      },
      hsts: {
        ...DEFAULT_SECURITY_CONFIG.hsts,
        enabled: false // Disable HSTS in development
      }
    };
  }

  return DEFAULT_SECURITY_CONFIG;
}

/**
 * API-specific security headers
 */
export function applyAPISecurityHeaders(response: NextResponse): NextResponse {
  // API-specific headers
  response.headers.set('X-API-Version', '1.0.0');
  response.headers.set('X-Request-ID', crypto.randomUUID());

  // CORS headers (adjust based on your needs)
  response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || 'http://localhost:3000');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours

  return applySecurityHeaders(response, {
    ...DEFAULT_SECURITY_CONFIG,
    // Stricter CSP for API endpoints
    csp: {
      ...DEFAULT_SECURITY_CONFIG.csp,
      enabled: true,
      defaultSrc: ["'none'"],
      frameAncestors: ["'none'"]
    }
  });
}

/**
 * Admin-specific security headers
 */
export function applyAdminSecurityHeaders(response: NextResponse): NextResponse {
  // Admin-specific additional headers
  response.headers.set('X-Admin-Access', 'granted');
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  return applySecurityHeaders(response, {
    ...DEFAULT_SECURITY_CONFIG,
    // Even stricter for admin
    frameOptions: 'DENY',
    referrerPolicy: 'no-referrer',
    permissionsPolicy: {
      camera: [],
      microphone: [],
      geolocation: [],
      payment: [],
      usb: []
    }
  });
}

/**
 * CSP violation reporting endpoint helper
 */
export async function handleCSPViolation(request: NextRequest): Promise<NextResponse> {
  try {
    const violation = await request.json();

    console.warn('CSP Violation:', {
      documentUri: violation['document-uri'],
      violatedDirective: violation['violated-directive'],
      originalPolicy: violation['original-policy'],
      blockedUri: violation['blocked-uri'],
      sourceFile: violation['source-file'],
      lineNumber: violation['line-number'],
      columnNumber: violation['column-number'],
      timestamp: new Date().toISOString()
    });

    // In production, you might want to log this to a monitoring service
    // await logSecurityEvent('csp_violation', 'medium', null, request.ip, request.headers.get('user-agent'), violation);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('CSP violation handling error:', error);
    return NextResponse.json({ error: 'Failed to process CSP violation' }, { status: 500 });
  }
}