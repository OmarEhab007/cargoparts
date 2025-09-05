import { unstable_cache } from 'next/cache';
import { logger } from './logger';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  revalidate?: number; // Revalidate time in seconds
}

export interface CacheKeyOptions {
  userId?: string;
  sellerId?: string;
  filters?: Record<string, any>;
  page?: number;
  limit?: number;
}

/**
 * In-memory cache for development
 * In production, consider using Redis or similar
 */
class MemoryCache {
  private cache = new Map<string, { data: any; expires: number }>();
  private tags = new Map<string, Set<string>>(); // tag -> keys mapping

  set(key: string, value: any, ttl: number, tags?: string[]): void {
    const expires = Date.now() + (ttl * 1000);
    this.cache.set(key, { data: value, expires });
    
    // Track tags
    if (tags) {
      tags.forEach(tag => {
        if (!this.tags.has(tag)) {
          this.tags.set(tag, new Set());
        }
        this.tags.get(tag)!.add(key);
      });
    }
    
    logger.logCache('set', key, { ttl, tags });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      logger.logCache('miss', key);
      return null;
    }
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      logger.logCache('miss', key, { reason: 'expired' });
      return null;
    }
    
    logger.logCache('hit', key);
    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
    
    // Remove from tags
    this.tags.forEach(keys => keys.delete(key));
    
    logger.logCache('delete', key);
  }

  invalidateTag(tag: string): void {
    const keys = this.tags.get(tag);
    if (keys) {
      keys.forEach(key => this.cache.delete(key));
      this.tags.delete(tag);
      logger.logCache('delete', `tag:${tag}`, { keysInvalidated: keys.size });
    }
  }

  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.tags.clear();
    logger.logCache('delete', 'all', { keysCleared: size });
  }

  // Periodic cleanup of expired entries
  startCleanup(intervalMs: number = 60000): void {
    setInterval(() => {
      const now = Date.now();
      let cleaned = 0;
      
      this.cache.forEach((entry, key) => {
        if (now > entry.expires) {
          this.cache.delete(key);
          this.tags.forEach(keys => keys.delete(key));
          cleaned++;
        }
      });
      
      if (cleaned > 0) {
        logger.debug(`Cache cleanup: removed ${cleaned} expired entries`);
      }
    }, intervalMs);
  }
}

// Create singleton cache instance
const memoryCache = new MemoryCache();
memoryCache.startCleanup();

/**
 * Cache key generators for different resources
 */
export const CacheKeys = {
  // Seller cache keys
  seller: {
    dashboard: (sellerId: string, period: string) => 
      `seller:dashboard:${sellerId}:${period}`,
    
    inventory: (sellerId: string, options?: CacheKeyOptions) => 
      `seller:inventory:${sellerId}:${JSON.stringify(options || {})}`,
    
    orders: (sellerId: string, options?: CacheKeyOptions) =>
      `seller:orders:${sellerId}:${JSON.stringify(options || {})}`,
    
    analytics: (sellerId: string, period: string) =>
      `seller:analytics:${sellerId}:${period}`,
    
    settings: (sellerId: string) =>
      `seller:settings:${sellerId}`,
    
    profile: (sellerId: string) =>
      `seller:profile:${sellerId}`,
  },

  // Listing cache keys
  listing: {
    detail: (listingId: string) =>
      `listing:detail:${listingId}`,
    
    search: (filters: Record<string, any>, page: number, limit: number) =>
      `listing:search:${JSON.stringify(filters)}:${page}:${limit}`,
    
    featured: () =>
      `listing:featured`,
    
    byCategory: (category: string, page: number) =>
      `listing:category:${category}:${page}`,
  },

  // Order cache keys
  order: {
    detail: (orderId: string) =>
      `order:detail:${orderId}`,
    
    userOrders: (userId: string, page: number) =>
      `order:user:${userId}:${page}`,
  },

  // User cache keys
  user: {
    profile: (userId: string) =>
      `user:profile:${userId}`,
    
    cart: (userId: string) =>
      `user:cart:${userId}`,
  },
};

/**
 * Cache tags for invalidation
 */
export const CacheTags = {
  seller: (sellerId: string) => `seller:${sellerId}`,
  listing: (listingId: string) => `listing:${listingId}`,
  order: (orderId: string) => `order:${orderId}`,
  user: (userId: string) => `user:${userId}`,
  inventory: (sellerId: string) => `inventory:${sellerId}`,
  analytics: (sellerId: string) => `analytics:${sellerId}`,
};

/**
 * Default TTL values (in seconds)
 */
export const CacheTTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 900, // 15 minutes
  HOUR: 3600, // 1 hour
  DAY: 86400, // 24 hours
};

/**
 * Cache wrapper for async functions
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const { ttl = CacheTTL.MEDIUM, tags } = options;
  
  // Check cache first
  const cached = memoryCache.get(key);
  if (cached !== null) {
    return cached;
  }
  
  // Execute function and cache result
  try {
    const result = await fn();
    memoryCache.set(key, result, ttl, tags);
    return result;
  } catch (error) {
    // Don't cache errors
    throw error;
  }
}

/**
 * Invalidate cache by key or tag
 */
export function invalidateCache(keyOrTag: string, isTag: boolean = false): void {
  if (isTag) {
    memoryCache.invalidateTag(keyOrTag);
  } else {
    memoryCache.delete(keyOrTag);
  }
}

/**
 * Clear all cache
 */
export function clearAllCache(): void {
  memoryCache.clear();
}

/**
 * Next.js unstable_cache wrapper with proper typing
 * Use this for server-side caching with Next.js integration
 */
export function nextCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyParts: string[],
  options?: {
    revalidate?: number | false;
    tags?: string[];
  }
): T {
  return unstable_cache(
    fn,
    keyParts,
    {
      revalidate: options?.revalidate ?? 60,
      tags: options?.tags,
    }
  ) as T;
}

/**
 * Cache decorator for class methods
 * Usage: @cached({ ttl: 300, tags: ['seller'] })
 */
export function cached(options: CacheOptions = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const key = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;
      return withCache(key, () => originalMethod.apply(this, args), options);
    };
    
    return descriptor;
  };
}

/**
 * Cache invalidation helpers for common operations
 */
export const CacheInvalidation = {
  // Invalidate all seller-related caches
  invalidateSeller(sellerId: string): void {
    invalidateCache(CacheTags.seller(sellerId), true);
    invalidateCache(CacheTags.inventory(sellerId), true);
    invalidateCache(CacheTags.analytics(sellerId), true);
  },

  // Invalidate listing and related seller inventory
  invalidateListing(listingId: string, sellerId: string): void {
    invalidateCache(CacheTags.listing(listingId), true);
    invalidateCache(CacheTags.inventory(sellerId), true);
  },

  // Invalidate order and related caches
  invalidateOrder(orderId: string, userId: string, sellerId: string): void {
    invalidateCache(CacheTags.order(orderId), true);
    invalidateCache(CacheTags.user(userId), true);
    invalidateCache(CacheTags.analytics(sellerId), true);
  },

  // Invalidate user-related caches
  invalidateUser(userId: string): void {
    invalidateCache(CacheTags.user(userId), true);
  },
};

/**
 * Response caching middleware for API routes
 */
export function cacheableResponse<T>(
  handler: () => Promise<T>,
  key: string,
  options: CacheOptions = {}
): Promise<T> {
  // Skip caching in development for easier debugging
  if (process.env.NODE_ENV === 'development' && !process.env.ENABLE_DEV_CACHE) {
    return handler();
  }
  
  return withCache(key, handler, options);
}

/**
 * Conditional caching based on response
 */
export async function conditionalCache<T>(
  key: string,
  fn: () => Promise<T>,
  shouldCache: (result: T) => boolean,
  options: CacheOptions = {}
): Promise<T> {
  // Check cache first
  const cached = memoryCache.get(key);
  if (cached !== null) {
    return cached;
  }
  
  // Execute function
  const result = await fn();
  
  // Only cache if condition is met
  if (shouldCache(result)) {
    memoryCache.set(key, result, options.ttl || CacheTTL.MEDIUM, options.tags);
  }
  
  return result;
}

/**
 * Stale-while-revalidate pattern
 */
export async function staleWhileRevalidate<T>(
  key: string,
  fn: () => Promise<T>,
  options: { ttl?: number; staleTtl?: number; tags?: string[] } = {}
): Promise<T> {
  const { ttl = CacheTTL.MEDIUM, staleTtl = ttl * 2, tags } = options;
  
  const cached = memoryCache.get(key);
  
  if (cached !== null) {
    // Return stale data immediately
    return cached;
  }
  
  // No cache, fetch fresh data
  try {
    const fresh = await fn();
    memoryCache.set(key, fresh, staleTtl, tags);
    return fresh;
  } catch (error) {
    // If fetch fails and we have stale data, return it
    if (cached !== null) {
      logger.warn('Using stale cache due to fetch error', { key, error });
      return cached;
    }
    throw error;
  }
}