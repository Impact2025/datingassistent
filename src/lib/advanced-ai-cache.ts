/**
 * ADVANCED AI CACHE LAYER
 * Intelligent caching for AI responses with performance optimization
 * Created: 2025-11-21
 * Author: AI Architecture Specialist
 */

interface CacheEntry {
  key: string;
  response: any;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  metadata: {
    userId?: string;
    toolId?: string;
    model?: string;
    tokensUsed?: number;
    responseTime?: number;
  };
}

interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  averageResponseTime: number;
  cacheEfficiency: number;
}

export class AdvancedAICache {
  private static instance: AdvancedAICache;
  private cache = new Map<string, CacheEntry>();
  private maxSize = 1000; // Maximum cache entries
  private defaultTTL = 30 * 60 * 1000; // 30 minutes default
  private stats = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    totalResponseTime: 0
  };

  // ============================================================================
  // SINGLETON PATTERN
  // ============================================================================

  public static getInstance(): AdvancedAICache {
    if (!AdvancedAICache.instance) {
      AdvancedAICache.instance = new AdvancedAICache();
    }
    return AdvancedAICache.instance;
  }

  // ============================================================================
  // CACHE OPERATIONS
  // ============================================================================

  async get(key: string): Promise<any | null> {
    this.stats.totalRequests++;

    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    this.stats.hits++;
    return entry.response;
  }

  async set(
    key: string,
    response: any,
    options: {
      ttl?: number;
      metadata?: CacheEntry['metadata'];
    } = {}
  ): Promise<void> {
    const entry: CacheEntry = {
      key,
      response,
      timestamp: Date.now(),
      ttl: options.ttl || this.defaultTTL,
      accessCount: 0,
      lastAccessed: Date.now(),
      metadata: options.metadata || {}
    };

    // Evict if cache is full (LRU strategy)
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
  }

  // ============================================================================
  // INTELLIGENT CACHE KEYS
  // ============================================================================

  generateCacheKey(
    messages: Array<{ role: string; content: string }>,
    options: {
      provider?: string;
      model?: string;
      temperature?: number;
      maxTokens?: number;
      userId?: string;
      toolId?: string;
    } = {}
  ): string {
    // Create content fingerprint
    const contentHash = this.createContentHash(messages);

    // Include relevant options in key
    const keyComponents = [
      contentHash,
      options.provider || 'default',
      options.model || 'default',
      options.temperature?.toString() || 'default',
      options.maxTokens?.toString() || 'default',
      options.userId || 'anonymous',
      options.toolId || 'general'
    ];

    return keyComponents.join('|');
  }

  private createContentHash(messages: Array<{ role: string; content: string }>): string {
    // Simple hash of message content (for cache key generation)
    const content = messages.map(m => `${m.role}:${m.content}`).join('');
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // ============================================================================
  // CACHE OPTIMIZATION
  // ============================================================================

  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  // ============================================================================
  // CACHE WARMING & PREFETCHING
  // ============================================================================

  async warmCache(
    commonQueries: Array<{
      messages: Array<{ role: string; content: string }>;
      options?: any;
    }>
  ): Promise<void> {
    console.log(`Warming cache with ${commonQueries.length} common queries...`);

    // This would typically call the AI service to pre-populate cache
    // For now, we'll just log the intent
    for (const query of commonQueries) {
      const key = this.generateCacheKey(query.messages, query.options);
      console.log(`Would warm cache for key: ${key}`);
    }
  }

  // ============================================================================
  // CACHE ANALYTICS & MONITORING
  // ============================================================================

  getCacheStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const totalSize = entries.reduce((size, entry) => {
      return size + JSON.stringify(entry).length;
    }, 0);

    const hitRate = this.stats.totalRequests > 0
      ? this.stats.hits / this.stats.totalRequests
      : 0;

    const averageResponseTime = this.stats.totalRequests > 0
      ? this.stats.totalResponseTime / this.stats.totalRequests
      : 0;

    // Cache efficiency: balance between hit rate and memory usage
    const cacheEfficiency = (hitRate * 0.7) + ((1 - (entries.length / this.maxSize)) * 0.3);

    return {
      totalEntries: entries.length,
      totalSize,
      hitRate,
      averageResponseTime,
      cacheEfficiency
    };
  }

  // ============================================================================
  // CACHE MAINTENANCE
  // ============================================================================

  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));

    console.log(`Cache cleanup: removed ${keysToDelete.length} expired entries`);
  }

  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      totalResponseTime: 0
    };
    console.log('Cache cleared');
  }

  // ============================================================================
  // ADAPTIVE TTL MANAGEMENT
  // ============================================================================

  adaptTTL(key: string, wasHit: boolean): void {
    const entry = this.cache.get(key);
    if (!entry) return;

    // Adaptive TTL based on access patterns
    if (wasHit && entry.accessCount > 5) {
      // Frequently accessed - increase TTL
      entry.ttl = Math.min(entry.ttl * 1.5, this.defaultTTL * 4);
    } else if (!wasHit && entry.accessCount < 2) {
      // Rarely accessed - decrease TTL
      entry.ttl = Math.max(entry.ttl * 0.8, this.defaultTTL * 0.5);
    }
  }

  // ============================================================================
  // CACHE PREDICTION & PREFETCHING
  // ============================================================================

  async predictAndPrefetch(userId: string, recentQueries: string[]): Promise<void> {
    // Analyze patterns in recent queries to predict next likely queries
    const patterns = this.analyzeQueryPatterns(recentQueries);

    for (const pattern of patterns) {
      // Prefetch likely next queries
      console.log(`Would prefetch pattern: ${pattern}`);
    }
  }

  private analyzeQueryPatterns(queries: string[]): string[] {
    // Simple pattern analysis - in production this would be more sophisticated
    const patterns: string[] = [];

    // Look for common prefixes/suffixes that indicate sequential usage
    const commonPatterns = queries
      .map(q => q.split('|').slice(0, -2)) // Remove user/tool specific parts
      .filter((pattern, index, arr) =>
        arr.filter(p => JSON.stringify(p) === JSON.stringify(pattern)).length > 1
      );

    return [...new Set(commonPatterns.map(p => JSON.stringify(p)))];
  }
}

// ============================================================================
// ENHANCED CHAT COMPLETION WITH CACHING
// ============================================================================

export async function cachedChatCompletion(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  options: {
    provider?: string;
    model?: string;
    maxTokens?: number;
    temperature?: number;
    skipCache?: boolean;
    userId?: string;
    toolId?: string;
  } = {}
): Promise<string> {
  const cache = AdvancedAICache.getInstance();

  // Generate cache key
  const cacheKey = cache.generateCacheKey(messages, options);

  // Try cache first (unless explicitly skipped)
  if (!options.skipCache) {
    const cachedResponse = await cache.get(cacheKey);
    if (cachedResponse) {
      console.log('🎯 Cache hit for AI request');
      return cachedResponse;
    }
  }

  // Cache miss - make actual API call
  console.log('🔄 Cache miss - calling AI API');
  const startTime = Date.now();

  const { chatCompletion } = await import('./ai-service');
  const response = await chatCompletion(messages, {
    provider: options.provider as 'openrouter' | undefined,
    model: options.model,
    maxTokens: options.maxTokens,
    temperature: options.temperature
  });

  const responseTime = Date.now() - startTime;

  // Cache the response
  await cache.set(cacheKey, response, {
    ttl: options.toolId === 'chat-coach' ? 15 * 60 * 1000 : 30 * 60 * 1000, // 15min for chat, 30min for others
    metadata: {
      userId: options.userId,
      toolId: options.toolId,
      model: options.model,
      tokensUsed: Math.ceil(response.length / 4), // Rough estimate
      responseTime
    }
  });

  return response;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const advancedAICache = AdvancedAICache.getInstance();

// Auto-cleanup every 5 minutes
setInterval(() => {
  advancedAICache.cleanup();
}, 5 * 60 * 1000);