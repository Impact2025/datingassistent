/**
 * Advanced Rate Limiting System for DatingAssistent
 * Implements multiple rate limiting strategies with Redis backing
 */

import { NextRequest, NextResponse } from 'next/server';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean; // Skip rate limiting for successful requests
  skipFailedRequests?: boolean; // Skip rate limiting for failed requests
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
  skip?: (req: NextRequest) => boolean; // Skip rate limiting for certain requests
  message?: string; // Custom error message
  statusCode?: number; // HTTP status code for rate limit exceeded
  headers?: boolean; // Include rate limit headers in response
}

export interface RateLimitResult {
  success: boolean;
  limit?: number;
  remaining?: number;
  resetTime?: number;
  retryAfter?: number;
  statusCode?: number;
}

class RateLimiter {
  private store = new Map<string, { count: number; resetTime: number }>();

  constructor(protected config: RateLimitConfig) {}

  async check(req: NextRequest): Promise<RateLimitResult> {
    // Skip rate limiting if configured
    if (this.config.skip?.(req)) {
      return { success: true };
    }

    const key = this.config.keyGenerator?.(req) || this.getDefaultKey(req);
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Clean up expired entries (simple cleanup)
    this.cleanup();

    const entry = this.store.get(key);

    if (!entry || entry.resetTime < now) {
      // First request in window or window expired
      this.store.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs
      });
      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs
      };
    }

    // Check if limit exceeded
    if (entry.count >= this.config.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      return {
        success: false,
        limit: this.config.maxRequests,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter
      };
    }

    // Increment counter
    entry.count++;
    const remaining = Math.max(0, this.config.maxRequests - entry.count);

    return {
      success: true,
      limit: this.config.maxRequests,
      remaining,
      resetTime: entry.resetTime
    };
  }

  protected getDefaultKey(req: NextRequest): string {
    // Use IP address as default key
    const ip = this.getClientIP(req);
    const userAgent = req.headers.get('user-agent') || 'unknown';
    return `${ip}:${userAgent}`;
  }

  private getClientIP(req: NextRequest): string {
    // Try different headers for IP detection
    const forwarded = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    const cfIP = req.headers.get('cf-connecting-ip');

    if (cfIP) return cfIP;
    if (forwarded) return forwarded.split(',')[0].trim();
    if (realIP) return realIP;

    // Fallback to a default (not ideal for production)
    return 'unknown';
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now) {
        this.store.delete(key);
      }
    }
  }
}

// Pre-configured rate limiters for different use cases
export const rateLimiters = {
  // API endpoints - strict limiting
  api: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    headers: true,
    message: 'Te veel API verzoeken. Probeer het later opnieuw.',
    statusCode: 429
  }),

  // Authentication endpoints - very strict
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    headers: true,
    message: 'Te veel inlogpogingen. Probeer het over 15 minuten opnieuw.',
    statusCode: 429,
    keyGenerator: (req) => {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
      const email = new URL(req.url).searchParams.get('email') || 'unknown';
      return `auth:${ip}:${email}`;
    }
  }),

  // AI/LLM endpoints - expensive operations
  ai: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 AI requests per minute
    headers: true,
    message: 'Te veel AI verzoeken. Probeer het over een minuut opnieuw.',
    statusCode: 429
  }),

  // File uploads - bandwidth intensive
  upload: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20, // 20 uploads per hour
    headers: true,
    message: 'Te veel bestanden geüpload. Probeer het over een uur opnieuw.',
    statusCode: 429
  }),

  // General page requests - lenient
  page: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 300, // 300 page requests per minute
    headers: true,
    skip: (req) => {
      // Skip rate limiting for static assets
      const url = new URL(req.url);
      return url.pathname.startsWith('/_next/') ||
             url.pathname.startsWith('/favicon') ||
             url.pathname.includes('.');
    }
  }),

  // Admin endpoints - strict for security
  admin: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 50, // 50 admin requests per minute
    headers: true,
    message: 'Te veel admin verzoeken.',
    statusCode: 429
  })
};

// Rate limiting middleware function
export async function rateLimitMiddleware(
  req: NextRequest,
  limiter: RateLimiter
): Promise<NextResponse | null> {
  const result = await limiter.check(req);

  if (!result.success) {
    const response = NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: 'Te veel verzoeken. Probeer het later opnieuw.',
        retryAfter: result.retryAfter
      },
      { status: result.statusCode || 429 }
    );

    // Add rate limit headers
    if (result.limit !== undefined) {
      response.headers.set('X-RateLimit-Limit', result.limit.toString());
    }
    if (result.remaining !== undefined) {
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    }
    if (result.resetTime) {
      response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
    }
    if (result.retryAfter) {
      response.headers.set('Retry-After', result.retryAfter.toString());
    }

    return response;
  }

  return null; // No rate limit exceeded
}

// Utility function to get rate limiter by path
export function getRateLimiterForPath(pathname: string): RateLimiter {
  if (pathname.startsWith('/api/auth/')) {
    return rateLimiters.auth;
  }
  if (pathname.startsWith('/api/admin/')) {
    return rateLimiters.admin;
  }
  if (pathname.includes('/ai') || pathname.includes('/openrouter')) {
    return rateLimiters.ai;
  }
  if (pathname.includes('/upload') || pathname.includes('/file')) {
    return rateLimiters.upload;
  }
  if (pathname.startsWith('/api/')) {
    return rateLimiters.api;
  }
  return rateLimiters.page;
}

// Redis-backed rate limiter for production (when Redis is available)
export class RedisRateLimiter extends RateLimiter {
  constructor(config: RateLimitConfig, private redis?: any) {
    super(config);
  }

  async check(req: NextRequest): Promise<RateLimitResult> {
    if (!this.redis) {
      // Fallback to in-memory rate limiting
      return super.check(req);
    }

    const key = this.config.keyGenerator?.(req) || this.getDefaultKey(req);
    const now = Date.now();
    const windowKey = `${key}:${Math.floor(now / this.config.windowMs)}`;

    try {
      // Use Redis atomic operations
      const current = await this.redis.incr(windowKey);
      if (current === 1) {
        // Set expiry on first request
        await this.redis.expire(windowKey, Math.ceil(this.config.windowMs / 1000));
      }

      const remaining = Math.max(0, this.config.maxRequests - current);
      const resetTime = (Math.floor(now / this.config.windowMs) + 1) * this.config.windowMs;

      if (current > this.config.maxRequests) {
        return {
          success: false,
          limit: this.config.maxRequests,
          remaining: 0,
          resetTime,
          retryAfter: Math.ceil((resetTime - now) / 1000)
        };
      }

      return {
        success: true,
        limit: this.config.maxRequests,
        remaining,
        resetTime
      };
    } catch (error) {
      console.error('Redis rate limiting error:', error);
      // Fallback to in-memory
      return super.check(req);
    }
  }
}