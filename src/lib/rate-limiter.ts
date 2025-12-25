/**
 * API RATE LIMITING UTILITY
 * Prevents abuse and ensures fair usage
 * Created: 2025-11-22
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (request: NextRequest) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Only count failed requests
  skipFailedRequests?: boolean; // Only count successful requests
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (use Redis in production for multi-instance deployments)
const rateLimitStore: RateLimitStore = {};

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach(key => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key];
    }
  });
}, 10 * 60 * 1000);

/**
 * Default key generator - uses IP address
 */
function defaultKeyGenerator(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded ? forwarded.split(',')[0] : realIp || 'unknown';
  const pathname = request.nextUrl.pathname;
  return pathname + ':' + ip;
}

/**
 * Rate limiter middleware
 */
export function rateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    keyGenerator = defaultKeyGenerator,
  } = config;

  return async (request: NextRequest): Promise<NextResponse | null> => {
    const key = keyGenerator(request);
    const now = Date.now();

    // Get or create rate limit entry
    if (!rateLimitStore[key] || rateLimitStore[key].resetTime < now) {
      rateLimitStore[key] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    const limitInfo = rateLimitStore[key];

    // Increment count
    limitInfo.count++;

    // Check if limit exceeded
    if (limitInfo.count > maxRequests) {
      const retryAfter = Math.ceil((limitInfo.resetTime - now) / 1000);

      return NextResponse.json(
        {
          error: 'Te veel verzoeken',
          message: 'Je hebt de limiet bereikt. Probeer het later opnieuw.',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(limitInfo.resetTime).toISOString(),
          },
        }
      );
    }

    // Add rate limit headers to response
    const remaining = maxRequests - limitInfo.count;

    return null; // Allow request to proceed
  };
}

/**
 * Preset rate limit configurations
 */
export const RateLimitPresets = {
  // Strict limits for auth endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },

  // Moderate limits for API endpoints
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
  },

  // Generous limits for public endpoints
  public: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },

  // Strict limits for expensive AI operations
  ai: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
  },

  // Very strict for payment endpoints
  payment: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
  },
};

/**
 * Rate limit by user ID (requires authentication)
 */
export function rateLimitByUser(userId: number, config: RateLimitConfig) {
  return rateLimit({
    ...config,
    keyGenerator: (request) => {
      const pathname = request.nextUrl.pathname;
      return pathname + ':user:' + userId;
    },
  });
}

/**
 * Rate limit by API key
 */
export function rateLimitByAPIKey(config: RateLimitConfig) {
  return rateLimit({
    ...config,
    keyGenerator: (request) => {
      const apiKey = request.headers.get('x-api-key') || 'no-key';
      const pathname = request.nextUrl.pathname;
      return pathname + ':apikey:' + apiKey;
    },
  });
}

/**
 * Simple rate limiter for API routes
 * Usage in API route:
 * 
 * export async function POST(request: NextRequest) {
 *   const rateLimitResponse = await applyRateLimit(request, RateLimitPresets.api);
 *   if (rateLimitResponse) return rateLimitResponse;
 *   
 *   // ... your API logic
 * }
 */
export async function applyRateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<NextResponse | null> {
  const limiter = rateLimit(config);
  return limiter(request);
}

/**
 * Get rate limit info for a key
 */
export function getRateLimitInfo(key: string) {
  const info = rateLimitStore[key];
  if (!info) return null;

  const now = Date.now();
  if (info.resetTime < now) return null;

  return {
    count: info.count,
    resetTime: info.resetTime,
    remaining: Math.max(0, info.resetTime - now),
  };
}

/**
 * Reset rate limit for a specific key (admin function)
 */
export function resetRateLimit(key: string): boolean {
  if (rateLimitStore[key]) {
    delete rateLimitStore[key];
    return true;
  }
  return false;
}

/**
 * Clear all rate limits (admin function - use with caution!)
 */
export function clearAllRateLimits(): void {
  Object.keys(rateLimitStore).forEach(key => {
    delete rateLimitStore[key];
  });
}
