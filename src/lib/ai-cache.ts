/**
 * AI Response Caching Layer
 *
 * Caches AI responses to reduce costs and improve performance.
 * Uses Vercel KV for production caching with in-memory fallback for development.
 *
 * @updated 2024-12-25 - Integrated with centralized connection manager
 */

import { kv } from '@vercel/kv';
import { redisManager } from './redis/connection-manager';

interface CacheEntry {
  response: string;
  timestamp: number;
  ttl: number;
}

class AICache {
  private memoryCache: Map<string, CacheEntry> = new Map();

  /**
   * Check if Redis should be used (delegated to connection manager)
   */
  private shouldUseRedis(): boolean {
    return redisManager.isRedisHealthy();
  }

  /**
   * Generate cache key from request parameters
   */
  private generateKey(
    messages: Array<{ role: string; content: string }>,
    model: string,
    temperature?: number,
    maxTokens?: number
  ): string {
    // Create a deterministic hash of the request
    const content = JSON.stringify({
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      model,
      temperature: temperature || 0.7,
      maxTokens: maxTokens || 2048
    });

    // Simple hash function for cache key
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return `ai_cache:${Math.abs(hash)}`;
  }

  /**
   * Get cached response if available and not expired
   */
  async get(
    messages: Array<{ role: string; content: string }>,
    model: string,
    temperature?: number,
    maxTokens?: number
  ): Promise<string | null> {
    const key = this.generateKey(messages, model, temperature, maxTokens);
    const now = Date.now();

    try {
      if (this.shouldUseRedis()) {
        const result = await redisManager.execute(async () => {
          return kv.get(key) as Promise<CacheEntry | null>;
        }, 'read');

        if (result.success && result.data) {
          const cached = result.data;
          if ((now - cached.timestamp) < cached.ttl) {
            redisManager.recordCacheHit();
            return cached.response;
          }
          // Remove expired entry
          await redisManager.execute(() => kv.del(key), 'write');
        }
        redisManager.recordCacheMiss();
      } else {
        // In-memory cache for development/fallback
        const cached = this.memoryCache.get(key);
        if (cached && (now - cached.timestamp) < cached.ttl) {
          redisManager.recordCacheHit();
          return cached.response;
        }
        if (cached) {
          this.memoryCache.delete(key);
        }
        redisManager.recordCacheMiss();
      }
    } catch (error) {
      console.error('Cache read error:', error);
      redisManager.recordCacheMiss();
    }

    return null;
  }

  /**
   * Store response in cache
   */
  async set(
    messages: Array<{ role: string; content: string }>,
    model: string,
    response: string,
    temperature?: number,
    maxTokens?: number,
    ttlMs: number = 24 * 60 * 60 * 1000 // 24 hours default
  ): Promise<void> {
    const key = this.generateKey(messages, model, temperature, maxTokens);
    const entry: CacheEntry = {
      response,
      timestamp: Date.now(),
      ttl: ttlMs
    };

    try {
      if (this.shouldUseRedis()) {
        await redisManager.execute(async () => {
          await kv.set(key, entry, { ex: Math.floor(ttlMs / 1000) });
        }, 'write');
      } else {
        // In-memory cache with cleanup
        this.memoryCache.set(key, entry);

        // Clean up old entries periodically
        if (this.memoryCache.size > 1000) {
          const now = Date.now();
          for (const [k, v] of this.memoryCache.entries()) {
            if ((now - v.timestamp) >= v.ttl) {
              this.memoryCache.delete(k);
            }
          }
        }
      }
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }

  /**
   * Clear all cached responses (useful for development)
   */
  async clear(): Promise<void> {
    try {
      if (this.shouldUseRedis()) {
        // Note: This would require scanning all keys with ai_cache: prefix
        // For now, we'll skip this in production
        console.log('[AI Cache] Clearing not implemented for Redis');
      } else {
        this.memoryCache.clear();
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  /**
   * Get cache statistics (now uses centralized metrics)
   */
  async getStats(): Promise<{ hits: number; misses: number; size: number; hitRatio: string }> {
    const metrics = redisManager.getMetrics();
    return {
      hits: metrics.cacheHits,
      misses: metrics.cacheMisses,
      size: this.memoryCache.size,
      hitRatio: (redisManager.getCacheHitRatio() * 100).toFixed(1) + '%',
    };
  }
}

// Global cache instance
export const aiCache = new AICache();

/**
 * Cached version of chatCompletion that automatically caches responses
 */
export async function cachedChatCompletion(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  options?: {
    provider?: 'openrouter';
    model?: string;
    maxTokens?: number;
    temperature?: number;
    skipCache?: boolean;
  }
): Promise<string> {
  const { chatCompletion } = await import('./ai-service');

  // Skip caching for certain cases
  if (options?.skipCache ||
      options?.temperature && options.temperature > 0.8 || // High creativity requests
      messages.length > 10 || // Very long conversations
      messages.some(m => m.content.length > 2000) // Very long messages
  ) {
    return chatCompletion(messages, options);
  }

  // Try to get from cache first
  const cached = await aiCache.get(
    messages,
    options?.model || 'claude-3.5-haiku',
    options?.temperature,
    options?.maxTokens
  );

  if (cached) {
    return cached;
  }

  // Get fresh response
  const response = await chatCompletion(messages, options);

  // Cache the response (don't await to avoid blocking)
  aiCache.set(
    messages,
    options?.model || 'claude-3.5-haiku',
    response,
    options?.temperature,
    options?.maxTokens
  ).catch(error => console.error('Cache write failed:', error));

  return response;
}