/**
 * EDGE-COMPATIBLE RATE LIMITING
 * In-memory rate limiting for Next.js Edge Runtime
 * Falls back from Vercel KV when not available
 * Created: 2025-11-22
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (automatically cleared by edge runtime on cold starts)
const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  enabled: boolean;
  maxRequests: number;
  windowMs: number; // Time window in milliseconds
  keyPrefix?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  enabled: true,
  maxRequests: 100, // 100 requests
  windowMs: 60000, // per 1 minute
  keyPrefix: 'rl:',
  skipSuccessfulRequests: false,
  skipFailedRequests: false
};

/**
 * Get client identifier for rate limiting
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfIP = request.headers.get('cf-connecting-ip');

  const ip = forwarded?.split(',')[0]?.trim() || realIP || cfIP || 'unknown';

  // Combine IP with user agent for better identification
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const hash = simpleHash(ip + userAgent);

  return hash;
}

/**
 * Simple hash function for client identification
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Clean up expired entries (called periodically)
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now >= entry.resetAt) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key => rateLimitStore.delete(key));
}

/**
 * Check rate limit for a request
 */
export async function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT_CONFIG
): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt: number;
  total: number;
}> {
  if (!config.enabled) {
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: Date.now() + config.windowMs,
      total: config.maxRequests
    };
  }

  // Cleanup expired entries occasionally (10% chance)
  if (Math.random() < 0.1) {
    cleanupExpiredEntries();
  }

  const clientId = getClientIdentifier(request);
  const key = `${config.keyPrefix}${clientId}:${request.nextUrl.pathname}`;
  const now = Date.now();

  let entry = rateLimitStore.get(key);

  // Create new entry if doesn't exist or expired
  if (!entry || now >= entry.resetAt) {
    entry = {
      count: 0,
      resetAt: now + config.windowMs
    };
    rateLimitStore.set(key, entry);
  }

  // Increment counter
  entry.count++;

  const allowed = entry.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);

  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
    total: config.maxRequests
  };
}

/**
 * Rate limiting middleware
 */
export async function rateLimitMiddleware(
  request: NextRequest,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT_CONFIG
): Promise<NextResponse | null> {
  const result = await checkRateLimit(request, config);

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);

    console.warn(`🚨 Rate limit exceeded for ${request.nextUrl.pathname}`);

    return NextResponse.json(
      {
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': result.total.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': new Date(result.resetAt).toISOString()
        }
      }
    );
  }

  return null; // Allow request to continue
}

/**
 * Apply rate limit headers to response
 */
export function applyRateLimitHeaders(
  response: NextResponse,
  result: {
    remaining: number;
    resetAt: number;
    total: number;
  }
): NextResponse {
  response.headers.set('X-RateLimit-Limit', result.total.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', new Date(result.resetAt).toISOString());
  return response;
}

/**
 * Different rate limits for different endpoints
 */
export const RATE_LIMIT_CONFIGS = {
  // Strict limits for authentication endpoints
  auth: {
    enabled: true,
    maxRequests: 5,
    windowMs: 60000, // 5 requests per minute
    keyPrefix: 'rl:auth:'
  },

  // Moderate limits for API endpoints
  api: {
    enabled: true,
    maxRequests: 60,
    windowMs: 60000, // 60 requests per minute
    keyPrefix: 'rl:api:'
  },

  // Strict limits for admin endpoints
  admin: {
    enabled: true,
    maxRequests: 30,
    windowMs: 60000, // 30 requests per minute
    keyPrefix: 'rl:admin:'
  },

  // Lenient limits for static pages
  page: {
    enabled: true,
    maxRequests: 120,
    windowMs: 60000, // 120 requests per minute
    keyPrefix: 'rl:page:'
  }
};

/**
 * Get rate limit config based on path
 */
export function getRateLimitConfigForPath(pathname: string): RateLimitConfig {
  if (pathname.startsWith('/api/auth')) {
    return RATE_LIMIT_CONFIGS.auth;
  }

  if (pathname.startsWith('/api/admin') || pathname.startsWith('/admin')) {
    return RATE_LIMIT_CONFIGS.admin;
  }

  if (pathname.startsWith('/api')) {
    return RATE_LIMIT_CONFIGS.api;
  }

  return RATE_LIMIT_CONFIGS.page;
}

/**
 * Get rate limiter stats (for monitoring)
 */
export function getRateLimiterStats(): {
  totalKeys: number;
  memoryUsage: string;
} {
  return {
    totalKeys: rateLimitStore.size,
    memoryUsage: `${(rateLimitStore.size * 50 / 1024).toFixed(2)} KB (estimated)`
  };
}
