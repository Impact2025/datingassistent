/**
 * Production-Ready Redis Rate Limiter using Vercel KV
 *
 * This rate limiter uses Vercel KV (Redis-compatible) for production-grade rate limiting.
 * Features:
 * - Shared across multiple server instances
 * - Persistent across server restarts
 * - Automatic cleanup of expired entries
 * - Sliding window algorithm
 *
 * Fallback to in-memory for development when KV is not available.
 */

import { kv } from '@vercel/kv';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RedisRateLimiter {
  private isRedisAvailable: boolean = false;

  constructor() {
    // Check if Redis is available (only in production)
    this.isRedisAvailable = !!(process.env.KV_URL && process.env.NODE_ENV === 'production');
    if (!this.isRedisAvailable && process.env.NODE_ENV === 'production') {
      console.warn('⚠️ Vercel KV not configured in production - falling back to in-memory rate limiting');
    }
  }

  private getKey(identifier: string, limit: number, windowMs: number): string {
    return `ratelimit:${identifier}:${limit}:${windowMs}`;
  }

  /**
   * Check if request is allowed using Redis
   */
  private async checkRedis(
    identifier: string,
    limit: number,
    windowMs: number
  ): Promise<{ success: boolean; remaining: number; resetAt: number }> {
    const key = this.getKey(identifier, limit, windowMs);
    const now = Date.now();
    const windowStart = now - windowMs;

    try {
      // Use Redis pipeline for atomic operations
      const pipeline = kv.pipeline();

      // Remove expired entries and count current requests
      pipeline.zremrangebyscore(key, 0, windowStart);
      pipeline.zcard(key);

      // Add current request with score and member
      pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` });

      // Set expiry on the key (cleanup)
      pipeline.pexpire(key, windowMs * 2); // Keep for 2x window to handle edge cases

      const results = await pipeline.exec();

      if (!results || results.length < 3) {
        throw new Error('Redis pipeline failed');
      }

      const currentCount = results[1] as number;
      const resetAt = now + windowMs;

      return {
        success: currentCount <= limit,
        remaining: Math.max(0, limit - currentCount),
        resetAt
      };
    } catch (error) {
      console.error('Redis rate limit check failed:', error);
      // Fallback to in-memory for this request
      return this.fallbackLimiter.check(identifier, limit, windowMs);
    }
  }

  // Fallback in-memory limiter for development or Redis failures
  private fallbackLimiter = new InMemoryRateLimiter();

  /**
   * Check if request is allowed
   * @param identifier Unique identifier (e.g., IP address, user ID)
   * @param limit Maximum requests allowed
   * @param windowMs Time window in milliseconds
   * @returns Object with success status and remaining requests
   */
  async check(
    identifier: string,
    limit: number,
    windowMs: number
  ): Promise<{ success: boolean; remaining: number; resetAt: number }> {
    if (this.isRedisAvailable) {
      return this.checkRedis(identifier, limit, windowMs);
    } else {
      return this.fallbackLimiter.check(identifier, limit, windowMs);
    }
  }

  /**
   * Reset rate limit for a specific identifier
   */
  async reset(identifier: string, limit: number, windowMs: number): Promise<void> {
    const key = this.getKey(identifier, limit, windowMs);
    try {
      if (this.isRedisAvailable) {
        await kv.del(key);
      } else {
        this.fallbackLimiter.reset(identifier);
      }
    } catch (error) {
      console.error('Rate limit reset failed:', error);
      // Fallback
      this.fallbackLimiter.reset(identifier);
    }
  }

  /**
   * Get current status for an identifier
   */
  async getStatus(identifier: string, limit: number, windowMs: number): Promise<{ count: number; resetAt: number } | null> {
    const key = this.getKey(identifier, limit, windowMs);
    try {
      if (this.isRedisAvailable) {
        const now = Date.now();
        const windowStart = now - windowMs;

        const pipeline = kv.pipeline();
        pipeline.zremrangebyscore(key, 0, windowStart);
        pipeline.zcard(key);

        const results = await pipeline.exec();
        if (!results || results.length < 2) return null;

        const count = results[1] as number;
        return { count, resetAt: now + windowMs };
      } else {
        return this.fallbackLimiter.getStatus(identifier);
      }
    } catch (error) {
      console.error('Rate limit status check failed:', error);
      return this.fallbackLimiter.getStatus(identifier);
    }
  }

  /**
   * Cleanup method for compatibility (Redis connections are managed by Vercel KV)
   */
  destroy(): void {
    // Redis connections are managed by Vercel KV, no manual cleanup needed
    // But we can clean up the fallback limiter
    this.fallbackLimiter.destroy();
  }
}

/**
 * Fallback In-Memory Rate Limiter for development
 */
class InMemoryRateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup old entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (entry.resetAt < now) {
        this.requests.delete(key);
      }
    }
  }

  check(
    identifier: string,
    limit: number,
    windowMs: number
  ): { success: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    // No previous requests or window expired
    if (!entry || entry.resetAt < now) {
      const resetAt = now + windowMs;
      this.requests.set(identifier, { count: 1, resetAt });
      return { success: true, remaining: limit - 1, resetAt };
    }

    // Within rate limit
    if (entry.count < limit) {
      entry.count++;
      this.requests.set(identifier, entry);
      return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt };
    }

    // Rate limit exceeded
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  getStatus(identifier: string): { count: number; resetAt: number } | null {
    const entry = this.requests.get(identifier);
    if (!entry) return null;

    const now = Date.now();
    if (entry.resetAt < now) {
      this.requests.delete(identifier);
      return null;
    }

    return { count: entry.count, resetAt: entry.resetAt };
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.requests.clear();
  }
}

// Create global rate limiter instances for different endpoints
const authRateLimiter = new RedisRateLimiter();
const apiRateLimiter = new RedisRateLimiter();
const aiRateLimiter = new RedisRateLimiter();
const uploadRateLimiter = new RedisRateLimiter();

/**
 * Get client identifier from request
 * Uses IP address or fallback to a random identifier
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from various headers (Vercel, Cloudflare, etc.)
  const headers = request.headers;
  const forwardedFor = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');
  const cfConnectingIp = headers.get('cf-connecting-ip');

  const ip = cfConnectingIp || realIp || forwardedFor?.split(',')[0].trim() || 'unknown';

  return ip;
}

/**
 * Rate limit auth endpoints (login, register, password reset)
 * Stricter limits: 5 requests per 15 minutes
 */
export function rateLimitAuthEndpoint(identifier: string) {
  const limit = 5;
  const windowMs = 15 * 60 * 1000; // 15 minutes

  return authRateLimiter.check(identifier, limit, windowMs);
}

/**
 * Rate limit general API endpoints
 * More lenient: 100 requests per minute
 */
export function rateLimitApi(identifier: string) {
  const limit = 100;
  const windowMs = 60 * 1000; // 1 minute

  return apiRateLimiter.check(identifier, limit, windowMs);
}

/**
 * Rate limit payment endpoints
 * Moderate limits: 10 requests per 5 minutes
 */
export function rateLimitPayment(identifier: string) {
  const limit = 10;
  const windowMs = 5 * 60 * 1000; // 5 minutes

  return authRateLimiter.check(identifier, limit, windowMs); // Reuse auth limiter for similar security level
}

/**
 * Rate limit expensive AI endpoints (bio-generator, chat-coach, etc.)
 * Very strict limits: 10 requests per hour to prevent API cost abuse
 * These endpoints use external AI APIs that cost money per request
 */
export function rateLimitExpensiveAI(identifier: string) {
  const limit = 10;
  const windowMs = 60 * 60 * 1000; // 1 hour

  return aiRateLimiter.check(identifier, limit, windowMs);
}

/**
 * Rate limit file upload endpoints
 * Moderate limits: 20 uploads per hour
 */
export function rateLimitUploads(identifier: string) {
  const limit = 20;
  const windowMs = 60 * 60 * 1000; // 1 hour

  return uploadRateLimiter.check(identifier, limit, windowMs);
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(result: {
  remaining: number;
  resetAt: number;
  limit?: number;
}) {
  const headers = new Headers();
  headers.set('X-RateLimit-Remaining', (result.remaining || 0).toString());
  headers.set('X-RateLimit-Reset', new Date(result.resetAt || Date.now() + 60000).toISOString());
  if (result.limit) {
    headers.set('X-RateLimit-Limit', result.limit.toString());
  }
  return headers;
}

// Cleanup on process exit
if (typeof process !== 'undefined') {
  process.on('beforeExit', () => {
    authRateLimiter.destroy();
    apiRateLimiter.destroy();
    aiRateLimiter.destroy();
    uploadRateLimiter.destroy();
  });
}
