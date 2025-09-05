import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { logger } from './logger';

/**
 * Query optimization utilities for Prisma
 */

/**
 * Batch loader for avoiding N+1 queries
 */
export class BatchLoader<K, V> {
  private batch: Map<K, Promise<V>> = new Map();
  private loader: (keys: K[]) => Promise<Map<K, V>>;
  private batchTimeout: number;
  private maxBatchSize: number;
  private currentBatch: K[] = [];
  private batchPromise: Promise<void> | null = null;

  constructor(
    loader: (keys: K[]) => Promise<Map<K, V>>,
    options: { batchTimeout?: number; maxBatchSize?: number } = {}
  ) {
    this.loader = loader;
    this.batchTimeout = options.batchTimeout ?? 10;
    this.maxBatchSize = options.maxBatchSize ?? 100;
  }

  async load(key: K): Promise<V | undefined> {
    if (!this.batch.has(key)) {
      this.batch.set(key, this.scheduleBatch(key));
    }
    return this.batch.get(key)!;
  }

  private async scheduleBatch(key: K): Promise<V> {
    this.currentBatch.push(key);

    if (this.currentBatch.length >= this.maxBatchSize) {
      return this.executeBatch(key);
    }

    if (!this.batchPromise) {
      this.batchPromise = new Promise(resolve => {
        setTimeout(() => {
          this.executeBatch(key).then(() => resolve());
        }, this.batchTimeout);
      });
    }

    await this.batchPromise;
    return this.batch.get(key)! as Promise<V>;
  }

  private async executeBatch(requestedKey: K): Promise<V> {
    const keys = [...this.currentBatch];
    this.currentBatch = [];
    this.batchPromise = null;

    const results = await this.loader(keys);
    
    keys.forEach(k => {
      if (!this.batch.has(k)) {
        this.batch.set(k, Promise.resolve(results.get(k)!));
      }
    });

    return results.get(requestedKey)!;
  }

  clear(): void {
    this.batch.clear();
    this.currentBatch = [];
    this.batchPromise = null;
  }
}

/**
 * Query result transformer for consistent API responses
 */
export class QueryTransformer {
  /**
   * Transform Prisma decimal to number
   */
  static decimal(value: Prisma.Decimal | null): number | null {
    return value ? Number(value) : null;
  }

  /**
   * Transform price from smallest unit (halalas) to SAR
   */
  static price(halalas: number | Prisma.Decimal): number {
    const value = typeof halalas === 'number' ? halalas : Number(halalas);
    return value / 100;
  }

  /**
   * Transform dates to ISO string
   */
  static date(date: Date | null): string | null {
    return date ? date.toISOString() : null;
  }

  /**
   * Transform listing for API response
   */
  static listing(listing: any): any {
    return {
      ...listing,
      priceSar: this.price(listing.priceSar),
      createdAt: this.date(listing.createdAt),
      updatedAt: this.date(listing.updatedAt),
      publishedAt: this.date(listing.publishedAt),
    };
  }

  /**
   * Transform order for API response
   */
  static order(order: any): any {
    return {
      ...order,
      totalAmount: this.price(order.totalAmount),
      subtotal: this.price(order.subtotal),
      shippingCost: this.price(order.shippingCost),
      tax: this.price(order.tax),
      discount: this.price(order.discount),
      createdAt: this.date(order.createdAt),
      updatedAt: this.date(order.updatedAt),
    };
  }
}

/**
 * Optimized query builders
 */
export class QueryBuilder {
  /**
   * Build pagination options
   */
  static pagination(page: number = 1, limit: number = 20): {
    skip: number;
    take: number;
  } {
    return {
      skip: (page - 1) * limit,
      take: limit,
    };
  }

  /**
   * Build date range filter
   */
  static dateRange(startDate?: Date, endDate?: Date): Prisma.DateTimeFilter | undefined {
    if (!startDate && !endDate) return undefined;
    
    const filter: Prisma.DateTimeFilter = {};
    if (startDate) filter.gte = startDate;
    if (endDate) filter.lte = endDate;
    
    return filter;
  }

  /**
   * Build text search filter
   */
  static textSearch(search: string, fields: string[]): any {
    if (!search || !fields.length) return undefined;
    
    return {
      OR: fields.map(field => ({
        [field]: {
          contains: search,
          mode: 'insensitive',
        },
      })),
    };
  }

  /**
   * Build sorting options
   */
  static sorting(
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): any {
    return {
      [sortBy]: sortOrder,
    };
  }
}

/**
 * Connection pool monitoring
 */
export class ConnectionMonitor {
  private static instance: ConnectionMonitor;
  private metricsInterval: NodeJS.Timer | null = null;

  static getInstance(): ConnectionMonitor {
    if (!ConnectionMonitor.instance) {
      ConnectionMonitor.instance = new ConnectionMonitor();
    }
    return ConnectionMonitor.instance;
  }

  startMonitoring(intervalMs: number = 60000): void {
    if (this.metricsInterval) return;

    this.metricsInterval = setInterval(async () => {
      try {
        const metrics = await prisma.$metrics.json();
        logger.debug('Database connection metrics', { metrics });
      } catch (error) {
        logger.error('Failed to get database metrics', error);
      }
    }, intervalMs);
  }

  stopMonitoring(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
  }
}

/**
 * Query performance tracker
 */
export class QueryPerformanceTracker {
  private static queries: Map<string, { count: number; totalTime: number; avgTime: number }> = new Map();

  static track(queryName: string, duration: number): void {
    const existing = this.queries.get(queryName) || { count: 0, totalTime: 0, avgTime: 0 };
    
    existing.count++;
    existing.totalTime += duration;
    existing.avgTime = existing.totalTime / existing.count;
    
    this.queries.set(queryName, existing);
    
    // Log slow queries
    if (duration > 1000) {
      logger.warn(`Slow query detected: ${queryName}`, {
        duration,
        avgTime: existing.avgTime,
        count: existing.count,
      });
    }
  }

  static getMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {};
    
    this.queries.forEach((value, key) => {
      metrics[key] = value;
    });
    
    return metrics;
  }

  static reset(): void {
    this.queries.clear();
  }
}

/**
 * Optimized query executor with performance tracking
 */
export async function executeQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await queryFn();
    const duration = Date.now() - startTime;
    
    QueryPerformanceTracker.track(queryName, duration);
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error(`Query failed: ${queryName}`, error, { duration });
    throw error;
  }
}

/**
 * Transaction helper with retry logic
 */
export async function withTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  options: {
    maxRetries?: number;
    timeout?: number;
  } = {}
): Promise<T> {
  const { maxRetries = 3, timeout = 5000 } = options;
  
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await prisma.$transaction(fn, {
        timeout,
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      });
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on validation errors
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw error;
      }
      
      // Retry on deadlock or timeout
      if (
        error.code === 'P2034' || // Deadlock
        error.code === 'P2024' || // Timeout
        error.code === 'P2028'    // Transaction error
      ) {
        logger.warn(`Transaction retry ${i + 1}/${maxRetries}`, { error: error.code });
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 100));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
}

/**
 * Bulk operations helper
 */
export class BulkOperations {
  /**
   * Bulk insert with chunking
   */
  static async bulkInsert<T>(
    model: any,
    data: T[],
    chunkSize: number = 1000
  ): Promise<void> {
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      await model.createMany({ data: chunk });
      
      logger.debug(`Bulk insert progress: ${i + chunk.length}/${data.length}`);
    }
  }

  /**
   * Bulk update with batching
   */
  static async bulkUpdate<T extends { id: string }>(
    model: any,
    updates: T[],
    batchSize: number = 100
  ): Promise<void> {
    const batches = [];
    
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      batches.push(
        Promise.all(
          batch.map(item => 
            model.update({
              where: { id: item.id },
              data: item,
            })
          )
        )
      );
    }
    
    await Promise.all(batches);
  }

  /**
   * Bulk delete with soft delete option
   */
  static async bulkDelete(
    model: any,
    ids: string[],
    softDelete: boolean = false
  ): Promise<void> {
    if (softDelete) {
      await model.updateMany({
        where: { id: { in: ids } },
        data: { deletedAt: new Date() },
      });
    } else {
      await model.deleteMany({
        where: { id: { in: ids } },
      });
    }
  }
}

/**
 * Cursor-based pagination helper
 */
export class CursorPagination {
  static buildQuery<T>(
    cursor?: string,
    limit: number = 20,
    orderBy: string = 'id'
  ): any {
    const query: any = {
      take: limit + 1, // Take one extra to check if there's more
      orderBy: { [orderBy]: 'asc' },
    };
    
    if (cursor) {
      query.cursor = { [orderBy]: cursor };
      query.skip = 1; // Skip the cursor
    }
    
    return query;
  }

  static formatResponse<T extends { id: string }>(
    items: T[],
    limit: number
  ): {
    items: T[];
    hasMore: boolean;
    nextCursor: string | null;
  } {
    const hasMore = items.length > limit;
    const resultItems = hasMore ? items.slice(0, -1) : items;
    const nextCursor = hasMore ? resultItems[resultItems.length - 1].id : null;
    
    return {
      items: resultItems,
      hasMore,
      nextCursor,
    };
  }
}