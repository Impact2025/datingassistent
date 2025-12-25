/**
 * REDIS MODULE - CENTRAL EXPORTS
 *
 * This module provides a unified, world-class Redis infrastructure:
 * - Single connection manager (no more connection leaks)
 * - Consolidated rate limiting
 * - Health monitoring and metrics
 *
 * Usage:
 * import { redisManager, checkRateLimit, RateLimitPresets } from '@/lib/redis';
 *
 * @created 2024-12-25
 */

// Connection Manager
export {
  redisManager,
  type ConnectionHealth,
  type RedisMetrics,
} from './connection-manager';

// Rate Limiting
export {
  checkRateLimit,
  getClientIP,
  createRateLimitHeaders,
  RateLimitPresets,
  rateLimitAuth,
  rateLimitApi,
  rateLimitAI,
  rateLimitUpload,
  rateLimitPayment,
  getPresetForPath,
  type RateLimitResult,
  type RateLimitConfig,
} from './rate-limiter';
