/**
 * ENTERPRISE CACHING LAYER
 * Redis-backed caching with in-memory fallback
 * 
 * PERFORMANCE: Reduces database load and improves response times
 */

import { kv } from '@vercel/kv';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  tags?: string[];
}

// In-memory fallback cache (when Redis unavailable)
const memoryCache = new Map<string, CacheEntry<any>>();

// Check if Redis is available
const isRedisAvailable = !!process.env.KV_URL;

/**
 * Get value from cache
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    if (isRedisAvailable) {
      const value = await kv.get<CacheEntry<T>>(key);
      return value?.data || null;
    }

    // Fallback to memory cache
    const entry = memoryCache.get(key);
    if (!entry) return null;

    // Check if expired
    const now = Date.now();
    if (entry.timestamp && now > entry.timestamp) {
      memoryCache.delete(key);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

/**
 * Set value in cache
 */
export async function setCache<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<void> {
  const { ttl = 3600, tags } = options; // Default 1 hour

  try {
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now() + ttl * 1000,
      tags,
    };

    if (isRedisAvailable) {
      await kv.set(key, entry, { ex: ttl });

      // Store tag mappings for invalidation
      if (tags && tags.length > 0) {
        for (const tag of tags) {
          const tagKey = `tag:${tag}`;
          await kv.sadd(tagKey, key);
          await kv.expire(tagKey, ttl);
        }
      }
    } else {
      // Fallback to memory cache
      memoryCache.set(key, entry);

      // Cleanup old entries periodically
      if (memoryCache.size > 1000) {
        cleanupMemoryCache();
      }
    }
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

/**
 * Delete value from cache
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    if (isRedisAvailable) {
      await kv.del(key);
    } else {
      memoryCache.delete(key);
    }
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

/**
 * Invalidate cache by tag
 */
export async function invalidateCacheByTag(tag: string): Promise<void> {
  try {
    if (isRedisAvailable) {
      const tagKey = `tag:${tag}`;
      const keys = await kv.smembers(tagKey);

      if (keys && keys.length > 0) {
        await kv.del(...keys);
        await kv.del(tagKey);
      }
    } else {
      // Memory cache: iterate and delete matching tags
      for (const [key, entry] of memoryCache.entries()) {
        if (entry.tags?.includes(tag)) {
          memoryCache.delete(key);
        }
      }
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

/**
 * Get or compute cached value
 */
export async function getCachedOrCompute<T>(
  key: string,
  compute: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Try to get from cache
  const cached = await getCache<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Compute value
  const value = await compute();

  // Store in cache
  await setCache(key, value, options);

  return value;
}

/**
 * Cleanup expired entries in memory cache
 */
function cleanupMemoryCache(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  for (const [key, entry] of memoryCache.entries()) {
    if (entry.timestamp && now > entry.timestamp) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((key) => memoryCache.delete(key));
}

/**
 * User-specific cache helpers
 */
export const UserCache = {
  async getProfile(userId: number) {
    return getCache(`user:${userId}:profile`);
  },

  async setProfile(userId: number, profile: any, ttl = 3600) {
    return setCache(`user:${userId}:profile`, profile, {
      ttl,
      tags: [`user:${userId}`],
    });
  },

  async getEnrollments(userId: number) {
    return getCache(`user:${userId}:enrollments`);
  },

  async setEnrollments(userId: number, enrollments: any[], ttl = 1800) {
    return setCache(`user:${userId}:enrollments`, enrollments, {
      ttl,
      tags: [`user:${userId}`, 'enrollments'],
    });
  },

  async invalidate(userId: number) {
    return invalidateCacheByTag(`user:${userId}`);
  },
};

/**
 * Program-specific cache helpers
 */
export const ProgramCache = {
  async getContent(slug: string) {
    return getCache(`program:${slug}:content`);
  },

  async setContent(slug: string, content: any, ttl = 7200) {
    return setCache(`program:${slug}:content`, content, {
      ttl,
      tags: [`program:${slug}`],
    });
  },

  async invalidate(slug: string) {
    return invalidateCacheByTag(`program:${slug}`);
  },
};

// Periodic cleanup for memory cache
if (!isRedisAvailable) {
  setInterval(cleanupMemoryCache, 5 * 60 * 1000); // Every 5 minutes
}
