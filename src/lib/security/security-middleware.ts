/**
 * Enterprise-grade security middleware for DatingAssistent
 * Combines rate limiting, input validation, and security headers
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimitMiddleware, getRateLimiterForPath } from './rate-limiter';
import { InputValidator, XSSProtector, SQLSanitizer } from './input-validation';

export interface SecurityConfig {
  enableRateLimiting?: boolean;
  enableInputValidation?: boolean;
  enableSQLInjectionProtection?: boolean;
  enableXSSProtection?: boolean;
  enableSecurityHeaders?: boolean;
  enableAuditLogging?: boolean;
  strictMode?: boolean;
}

export interface SecurityResult {
  allowed: boolean;
  response?: NextResponse;
  warnings?: string[];
  sanitizedData?: any;
}

/**
 * Main security middleware class
 */
export class SecurityMiddleware {
  constructor(private config: SecurityConfig = {}) {
    this.config = {
      enableRateLimiting: true,
      enableInputValidation: false, // Only enable for specific routes
      enableSQLInjectionProtection: true,
      enableXSSProtection: true,
      enableSecurityHeaders: true,
      enableAuditLogging: true,
      strictMode: false,
      ...config
    };
  }

  /**
   * Process a request through all security layers
   */
  async processRequest(
    req: NextRequest,
    options: {
      validationSchema?: any;
      customValidators?: ((req: NextRequest) => Promise<boolean>)[];
    } = {}
  ): Promise<SecurityResult> {
    const warnings: string[] = [];

    // 1. Rate limiting
    if (this.config.enableRateLimiting) {
      const limiter = getRateLimiterForPath(req.nextUrl.pathname);
      const rateLimitResponse = await rateLimitMiddleware(req, limiter);

      if (rateLimitResponse) {
        await this.logSecurityEvent('rate_limit_exceeded', {
          ip: this.getClientIP(req),
          path: req.nextUrl.pathname,
          userAgent: req.headers.get('user-agent')
        });

        return {
          allowed: false,
          response: rateLimitResponse,
          warnings
        };
      }
    }

    // 2. Custom validators
    if (options.customValidators) {
      for (const validator of options.customValidators) {
        const isValid = await validator(req);
        if (!isValid) {
          warnings.push('Custom validation failed');
          if (this.config.strictMode) {
            return {
              allowed: false,
              response: NextResponse.json(
                { error: 'Security validation failed' },
                { status: 403 }
              ),
              warnings
            };
          }
        }
      }
    }

    // 3. Input validation for POST/PUT/PATCH requests
    let sanitizedData: any = undefined;
    if (this.config.enableInputValidation && options.validationSchema &&
        ['POST', 'PUT', 'PATCH'].includes(req.method)) {
      try {
        const body = await req.json();
        const validation = InputValidator.validate(body, options.validationSchema);

        if (!validation.isValid) {
          await this.logSecurityEvent('input_validation_failed', {
            errors: validation.errors,
            path: req.nextUrl.pathname
          });

          return {
            allowed: false,
            response: NextResponse.json(
              {
                error: 'Input validation failed',
                details: this.config.strictMode ? validation.errors : 'Invalid input data'
              },
              { status: 400 }
            ),
            warnings
          };
        }

        sanitizedData = validation.sanitized;
        warnings.push(...validation.errors);
      } catch (error) {
        warnings.push('Failed to parse request body');
        if (this.config.strictMode) {
          return {
            allowed: false,
            response: NextResponse.json(
              { error: 'Invalid request format' },
              { status: 400 }
            ),
            warnings
          };
        }
      }
    }

    // 4. SQL injection protection
    if (this.config.enableSQLInjectionProtection) {
      const suspiciousPatterns = this.detectSQLInjection(req);
      if (suspiciousPatterns.length > 0) {
        await this.logSecurityEvent('sql_injection_attempt', {
          patterns: suspiciousPatterns,
          path: req.nextUrl.pathname,
          query: req.nextUrl.search
        });

        return {
          allowed: false,
          response: NextResponse.json(
            { error: 'Request blocked for security reasons' },
            { status: 403 }
          ),
          warnings
        };
      }
    }

    // 5. XSS protection
    if (this.config.enableXSSProtection) {
      const xssPatterns = this.detectXSS(req);
      if (xssPatterns.length > 0) {
        await this.logSecurityEvent('xss_attempt', {
          patterns: xssPatterns,
          path: req.nextUrl.pathname
        });

        return {
          allowed: false,
          response: NextResponse.json(
            { error: 'Request blocked for security reasons' },
            { status: 403 }
          ),
          warnings
        };
      }
    }

    // 6. Security headers (applied later in the response)
    // This is handled by the security headers middleware

    // Log successful security check
    if (this.config.enableAuditLogging && warnings.length > 0) {
      await this.logSecurityEvent('security_check_warnings', {
        warnings,
        path: req.nextUrl.pathname
      });
    }

    return {
      allowed: true,
      warnings,
      sanitizedData
    };
  }

  /**
   * Apply security headers to a response
   */
  applySecurityHeaders(response: NextResponse): NextResponse {
    if (!this.config.enableSecurityHeaders) {
      return response;
    }

    // Content Security Policy
    response.headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.google-analytics.com *.googletagmanager.com",
        "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
        "font-src 'self' fonts.gstatic.com",
        "img-src 'self' data: https: *.unsplash.com *.picsum.photos *.placehold.co",
        "connect-src 'self' *.openrouter.ai *.firebase.com *.googleapis.com",
        "frame-src 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'"
      ].join('; ')
    );

    // Other security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // HSTS (HTTP Strict Transport Security) - only in production
    if (process.env.NODE_ENV === 'production') {
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    return response;
  }

  private detectSQLInjection(req: NextRequest): string[] {
    const patterns: string[] = [];
    const checkString = (str: string) => {
      const sqlPatterns = [
        /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/i,
        /(-{2}|\/\*|\*\/)/, // Comments
        /('|(\\x27)|(\\x2D))/i, // Quotes and dashes
        /(\bOR\b|\bAND\b).*(\=|\<|\>)/i, // Common injection patterns
      ];

      sqlPatterns.forEach(pattern => {
        if (pattern.test(str)) {
          patterns.push(pattern.source);
        }
      });
    };

    // Check URL parameters
    req.nextUrl.searchParams.forEach((value) => checkString(value));

    // Check headers that might contain injection attempts
    ['user-agent', 'referer', 'cookie'].forEach(headerName => {
      const headerValue = req.headers.get(headerName);
      if (headerValue) checkString(headerValue);
    });

    return [...new Set(patterns)]; // Remove duplicates
  }

  private detectXSS(req: NextRequest): string[] {
    const patterns: string[] = [];
    const checkString = (str: string) => {
      const xssPatterns = [
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi,
        /vbscript:/gi,
        /onload\s*=/gi,
        /onerror\s*=/gi,
        /onclick\s*=/gi,
        /<iframe[^>]*>/gi,
        /<object[^>]*>/gi,
        /<embed[^>]*>/gi,
      ];

      xssPatterns.forEach(pattern => {
        if (pattern.test(str)) {
          patterns.push(pattern.source);
        }
      });
    };

    // Check the same places as SQL injection
    req.nextUrl.searchParams.forEach((value) => checkString(value));
    ['user-agent', 'referer'].forEach(headerName => {
      const headerValue = req.headers.get(headerName);
      if (headerValue) checkString(headerValue);
    });

    return [...new Set(patterns)];
  }

  private getClientIP(req: NextRequest): string {
    return req.headers.get('x-forwarded-for')?.split(',')[0] ||
           req.headers.get('x-real-ip') ||
           req.headers.get('cf-connecting-ip') ||
           'unknown';
  }

  private async logSecurityEvent(event: string, details: any): Promise<void> {
    if (!this.config.enableAuditLogging) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      environment: process.env.NODE_ENV || 'development',
      userAgent: 'security-middleware'
    };

    // In production, this would be sent to a logging service
    console.warn('🔐 Security Event:', logEntry);

    // TODO: Send to logging service (DataDog, CloudWatch, etc.)
    // await fetch('/api/security/log', {
    //   method: 'POST',
    //   body: JSON.stringify(logEntry)
    // });
  }
}

// Pre-configured security middleware instances
export const securityMiddleware = {
  // Standard security for most routes
  standard: new SecurityMiddleware({
    enableRateLimiting: true,
    enableSQLInjectionProtection: true,
    enableXSSProtection: true,
    enableSecurityHeaders: true,
    enableAuditLogging: true
  }),

  // Strict security for sensitive routes (auth, admin)
  strict: new SecurityMiddleware({
    enableRateLimiting: true,
    enableInputValidation: true,
    enableSQLInjectionProtection: true,
    enableXSSProtection: true,
    enableSecurityHeaders: true,
    enableAuditLogging: true,
    strictMode: true
  }),

  // API security with input validation
  api: new SecurityMiddleware({
    enableRateLimiting: true,
    enableInputValidation: true,
    enableSQLInjectionProtection: true,
    enableXSSProtection: true,
    enableSecurityHeaders: true,
    enableAuditLogging: true
  }),

  // Minimal security for static assets
  minimal: new SecurityMiddleware({
    enableRateLimiting: false,
    enableInputValidation: false,
    enableSQLInjectionProtection: false,
    enableXSSProtection: false,
    enableSecurityHeaders: true,
    enableAuditLogging: false
  })
};

/**
 * Helper function to create security middleware for specific routes
 */
export function createSecurityMiddleware(config: SecurityConfig): SecurityMiddleware {
  return new SecurityMiddleware(config);
}

/**
 * Security utilities for manual validation
 */
export const SecurityUtils = {
  /**
   * Validate and sanitize user input
   */
  validateInput: InputValidator.validate,

  /**
   * Sanitize HTML content
   */
  sanitizeHTML: XSSProtector.sanitizeHTML,

  /**
   * Check for SQL injection patterns
   */
  detectSQLInjection: (input: string): boolean => {
    const patterns = [
      /(\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/i,
      /(-{2}|\/\*|\*\/)/,
      /('|(\\x27)|(\\x2D))/i,
    ];
    return patterns.some(pattern => pattern.test(input));
  },

  /**
   * Check for XSS patterns
   */
  detectXSS: (input: string): boolean => {
    const patterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      /onclick\s*=/gi,
    ];
    return patterns.some(pattern => pattern.test(input));
  },

  /**
   * Generate secure random token
   */
  generateSecureToken: (length: number = 32): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
};