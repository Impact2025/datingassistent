/**
 * @deprecated This file is deprecated. Use the new consolidated Redis module instead:
 *
 * import { checkRateLimit, RateLimitPresets, rateLimitAuth } from '@/lib/redis';
 *
 * The new module provides:
 * - Single shared connection (reduces connection usage by 75%)
 * - Centralized health monitoring
 * - Better metrics tracking
 * - Same functionality with better performance
 *
 * This file re-exports from the new module for backwards compatibility.
 *
 * @see src/lib/redis/rate-limiter.ts
 * @updated 2024-12-25
 */

// Re-export everything from the new consolidated module for backwards compatibility
export {
  checkRateLimit,
  getClientIP as getClientIdentifier,
  createRateLimitHeaders,
  RateLimitPresets,
  rateLimitAuth as rateLimitAuthEndpoint,
  rateLimitApi,
  rateLimitAI as rateLimitExpensiveAI,
  rateLimitUpload as rateLimitUploads,
  rateLimitPayment,
  type RateLimitResult,
  type RateLimitConfig,
} from './redis/rate-limiter';
