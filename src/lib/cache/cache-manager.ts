/**
 * Advanced caching manager for DatingAssistent
 * Implements multiple caching strategies for optimal performance
 */

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
}

interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  enableCompression: boolean;
  enableVersioning: boolean;
}

class CacheManager {
  private cache = new Map<string, CacheEntry>();
  private config: CacheConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxSize: 100,
      enableCompression: false,
      enableVersioning: true,
      ...config
    };

    this.startCleanupInterval();
  }

  /**
   * Set cache entry with optional TTL
   */
  set<T>(key: string, data: T, ttl?: number, version?: string): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      version: version || '1.0'
    };

    this.cache.set(key, entry);
  }

  /**
   * Get cache entry with validation
   */
  get<T>(key: string, version?: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) return null;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Check version if versioning is enabled
    if (this.config.enableVersioning && version && entry.version !== version) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string, version?: string): boolean {
    return this.get(key, version) !== null;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const entries = Array.from(this.cache.values());
    const totalSize = entries.length;
    const expiredEntries = entries.filter(
      entry => Date.now() - entry.timestamp > entry.ttl
    ).length;

    return {
      totalEntries: totalSize,
      validEntries: totalSize - expiredEntries,
      expiredEntries,
      hitRate: 0, // Would need to track hits/misses
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * Warm up cache with frequently accessed data
   */
  async warmup(warmupFn: () => Promise<Array<{ key: string; data: any; ttl?: number }>>): Promise<void> {
    try {
      const warmupData = await warmupFn();

      for (const { key, data, ttl } of warmupData) {
        this.set(key, data, ttl);
      }

      console.log(`Cache warmed up with ${warmupData.length} entries`);
    } catch (error) {
      console.error('Cache warmup failed:', error);
    }
  }

  /**
   * Create namespaced cache instance
   */
  namespace(prefix: string): CacheManager {
    const namespacedCache = new CacheManager(this.config);

    // Override methods to add prefix
    const originalSet = namespacedCache.set.bind(namespacedCache);
    const originalGet = namespacedCache.get.bind(namespacedCache);
    const originalHas = namespacedCache.has.bind(namespacedCache);
    const originalDelete = namespacedCache.delete.bind(namespacedCache);

    namespacedCache.set = (key, data, ttl, version) => {
      originalSet(`${prefix}:${key}`, data, ttl, version);
    };

    namespacedCache.get = (key, version) => {
      return originalGet(`${prefix}:${key}`, version);
    };

    namespacedCache.has = (key, version) => {
      return originalHas(`${prefix}:${key}`, version);
    };

    namespacedCache.delete = (key) => {
      return originalDelete(`${prefix}:${key}`);
    };

    return namespacedCache;
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private estimateMemoryUsage(): number {
    // Rough estimation - in a real implementation you'd use performance.memory
    let size = 0;
    for (const [key, entry] of this.cache.entries()) {
      size += key.length * 2; // Rough string size
      size += JSON.stringify(entry.data).length * 2; // Rough data size
      size += 100; // Overhead per entry
    }
    return size;
  }

  private startCleanupInterval(): void {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > entry.ttl) {
          this.cache.delete(key);
        }
      }
    }, 5 * 60 * 1000);
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

// Create singleton instance
export const cacheManager = new CacheManager({
  defaultTTL: 10 * 60 * 1000, // 10 minutes
  maxSize: 200,
  enableCompression: false,
  enableVersioning: true
});

// Specialized cache instances for different data types
export const userCache = cacheManager.namespace('user');
export const assessmentCache = cacheManager.namespace('assessment');
export const analyticsCache = cacheManager.namespace('analytics');

// Cache utilities
export const CacheKeys = {
  // User-related
  userProfile: (userId: number) => `profile:${userId}`,
  userPreferences: (userId: number) => `preferences:${userId}`,

  // Assessment-related
  assessmentResults: (assessmentId: number) => `results:${assessmentId}`,
  assessmentQuestions: (toolName: string) => `questions:${toolName}`,

  // Analytics
  dashboardStats: (timeRange: string) => `dashboard:${timeRange}`,
  userActivity: (userId: number, date: string) => `activity:${userId}:${date}`,

  // API responses
  apiResponse: (endpoint: string, params: string) => `api:${endpoint}:${params}`
} as const;

export default CacheManager;