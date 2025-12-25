/**
 * CONSOLIDATED RATE LIMITER
 *
 * Single shared rate limiter using the connection manager.
 * Replaces multiple instances with one optimized implementation.
 *
 * Features:
 * - Sliding window algorithm
 * - Automatic fallback to in-memory
 * - Connection-efficient design
 * - Pre-configured rate limit presets
 *
 * @created 2024-12-25
 */

import { kv } from '@vercel/kv';
import { redisManager } from './connection-manager';

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
  retryAfter?: number;
}

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

// In-memory fallback store
const memoryStore = new Map<string, { count: number; resetAt: number }>();

// Periodic cleanup for memory store
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryStore.entries()) {
      if (entry.resetAt < now) {
        memoryStore.delete(key);
      }
    }
  }, 60000); // Cleanup every minute
}

/**
 * Check rate limit using in-memory store (fallback)
 */
function checkMemoryRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const key = `${identifier}:${limit}:${windowMs}`;
  const entry = memoryStore.get(key);

  // Window expired or no entry
  if (!entry || entry.resetAt < now) {
    const resetAt = now + windowMs;
    memoryStore.set(key, { count: 1, resetAt });
    return {
      success: true,
      remaining: limit - 1,
      resetAt,
      limit,
    };
  }

  // Within limit
  if (entry.count < limit) {
    entry.count++;
    return {
      success: true,
      remaining: limit - entry.count,
      resetAt: entry.resetAt,
      limit,
    };
  }

  // Limit exceeded
  const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
  return {
    success: false,
    remaining: 0,
    resetAt: entry.resetAt,
    limit,
    retryAfter,
  };
}

/**
 * Check rate limit using Redis (sliding window)
 */
async function checkRedisRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  const result = await redisManager.execute(async () => {
    const pipeline = kv.pipeline();

    // Remove expired entries
    pipeline.zremrangebyscore(key, 0, windowStart);
    // Count current entries
    pipeline.zcard(key);
    // Add current request
    pipeline.zadd(key, { score: now, member: `${now}:${Math.random()}` });
    // Set expiry
    pipeline.pexpire(key, windowMs * 2);

    return pipeline.exec();
  });

  if (!result.success || !result.data) {
    // Fallback to memory
    return checkMemoryRateLimit(identifier, limit, windowMs);
  }

  const currentCount = (result.data[1] as number) || 0;
  const resetAt = now + windowMs;

  if (currentCount >= limit) {
    const retryAfter = Math.ceil(windowMs / 1000);
    return {
      success: false,
      remaining: 0,
      resetAt,
      limit,
      retryAfter,
    };
  }

  return {
    success: true,
    remaining: Math.max(0, limit - currentCount - 1),
    resetAt,
    limit,
  };
}

/**
 * Main rate limit check function
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { limit, windowMs } = config;

  if (redisManager.isRedisHealthy()) {
    return checkRedisRateLimit(identifier, limit, windowMs);
  }

  return checkMemoryRateLimit(identifier, limit, windowMs);
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
  const headers = request.headers;
  return (
    headers.get('cf-connecting-ip') ||
    headers.get('x-real-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    'unknown'
  );
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(result: RateLimitResult): Headers {
  const headers = new Headers();
  headers.set('X-RateLimit-Limit', result.limit.toString());
  headers.set('X-RateLimit-Remaining', result.remaining.toString());
  headers.set('X-RateLimit-Reset', new Date(result.resetAt).toISOString());
  if (result.retryAfter) {
    headers.set('Retry-After', result.retryAfter.toString());
  }
  return headers;
}

// ============================================
// PRE-CONFIGURED RATE LIMIT PRESETS
// ============================================

export const RateLimitPresets = {
  /**
   * Authentication endpoints - strict
   * 5 attempts per 15 minutes
   */
  auth: {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  },

  /**
   * Login specifically - very strict
   * 3 attempts per 15 minutes
   */
  login: {
    limit: 3,
    windowMs: 15 * 60 * 1000,
  },

  /**
   * Password reset - strict
   * 3 attempts per hour
   */
  passwordReset: {
    limit: 3,
    windowMs: 60 * 60 * 1000,
  },

  /**
   * General API endpoints
   * 100 requests per minute
   */
  api: {
    limit: 100,
    windowMs: 60 * 1000,
  },

  /**
   * AI/LLM endpoints - expensive operations
   * 10 requests per hour
   */
  ai: {
    limit: 10,
    windowMs: 60 * 60 * 1000,
  },

  /**
   * AI chat specifically - moderate
   * 30 messages per hour
   */
  aiChat: {
    limit: 30,
    windowMs: 60 * 60 * 1000,
  },

  /**
   * File uploads - bandwidth intensive
   * 20 uploads per hour
   */
  upload: {
    limit: 20,
    windowMs: 60 * 60 * 1000,
  },

  /**
   * Payment endpoints - strict for security
   * 10 requests per 5 minutes
   */
  payment: {
    limit: 10,
    windowMs: 5 * 60 * 1000,
  },

  /**
   * Admin endpoints
   * 50 requests per minute
   */
  admin: {
    limit: 50,
    windowMs: 60 * 1000,
  },

  /**
   * Public/landing pages - lenient
   * 300 requests per minute
   */
  public: {
    limit: 300,
    windowMs: 60 * 1000,
  },
} as const;

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Rate limit auth endpoints
 */
export function rateLimitAuth(identifier: string): Promise<RateLimitResult> {
  return checkRateLimit(`auth:${identifier}`, RateLimitPresets.auth);
}

/**
 * Rate limit API endpoints
 */
export function rateLimitApi(identifier: string): Promise<RateLimitResult> {
  return checkRateLimit(`api:${identifier}`, RateLimitPresets.api);
}

/**
 * Rate limit AI endpoints
 */
export function rateLimitAI(identifier: string): Promise<RateLimitResult> {
  return checkRateLimit(`ai:${identifier}`, RateLimitPresets.ai);
}

/**
 * Rate limit uploads
 */
export function rateLimitUpload(identifier: string): Promise<RateLimitResult> {
  return checkRateLimit(`upload:${identifier}`, RateLimitPresets.upload);
}

/**
 * Rate limit payment endpoints
 */
export function rateLimitPayment(identifier: string): Promise<RateLimitResult> {
  return checkRateLimit(`payment:${identifier}`, RateLimitPresets.payment);
}

/**
 * Get appropriate rate limit preset for a path
 */
export function getPresetForPath(pathname: string): RateLimitConfig {
  if (pathname.startsWith('/api/auth/login')) return RateLimitPresets.login;
  if (pathname.startsWith('/api/auth/')) return RateLimitPresets.auth;
  if (pathname.startsWith('/api/admin/')) return RateLimitPresets.admin;
  if (pathname.includes('/ai') || pathname.includes('/coach') || pathname.includes('/iris')) {
    return RateLimitPresets.ai;
  }
  if (pathname.includes('/upload')) return RateLimitPresets.upload;
  if (pathname.includes('/payment')) return RateLimitPresets.payment;
  if (pathname.startsWith('/api/')) return RateLimitPresets.api;
  return RateLimitPresets.public;
}
