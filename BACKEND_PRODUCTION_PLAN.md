# CargoParts Backend Production Deployment Plan

## Executive Summary
Comprehensive backend-focused plan to transition CargoParts from MVP to production-ready deployment for the Saudi Arabian automotive parts marketplace.

**Current State**: MVP with Next.js 15, TypeScript, Prisma ORM, PostgreSQL, JWT auth, Tap Payment integration
**Target State**: Production-ready, scalable, secure, PCI-compliant backend with Saudi market optimizations

## Timeline Overview
- **Phase 1 (Weeks 1-2)**: Critical Security & Performance Foundation
- **Phase 2 (Weeks 3-4)**: Database Optimization & Monitoring
- **Phase 3 (Weeks 5-6)**: Payment System Hardening & Background Jobs
- **Phase 4 (Weeks 7-8)**: Saudi Market Features & Compliance
- **Phase 5 (Week 9)**: Final Testing & Deployment

---

## 1. API Architecture & Performance

### 1.1 API Route Optimization

#### Current Issues Identified
- No connection pooling configuration
- Missing rate limiting on critical endpoints
- In-memory cache not suitable for production
- No API versioning strategy

#### Implementation Plan

**Week 1: Core API Infrastructure**

```typescript
// lib/api/middleware/api-versioning.ts
import { NextRequest } from 'next/server';

export interface VersionConfig {
  default: string;
  supported: string[];
  deprecated: string[];
}

export class ApiVersioning {
  private static config: VersionConfig = {
    default: 'v1',
    supported: ['v1'],
    deprecated: []
  };

  static extractVersion(req: NextRequest): string {
    // Check header first
    const headerVersion = req.headers.get('api-version');
    if (headerVersion && this.config.supported.includes(headerVersion)) {
      return headerVersion;
    }

    // Check URL path
    const pathMatch = req.nextUrl.pathname.match(/\/api\/(v\d+)\//);
    if (pathMatch && this.config.supported.includes(pathMatch[1])) {
      return pathMatch[1];
    }

    return this.config.default;
  }

  static isDeprecated(version: string): boolean {
    return this.config.deprecated.includes(version);
  }
}
```

**Redis Cache Integration**

```typescript
// lib/cache/redis-cache.ts
import { Redis } from 'ioredis';
import { logger } from '@/lib/api/logger';

export class RedisCache {
  private client: Redis;
  private subscriber: Redis;
  private publisher: Redis;

  constructor() {
    const config = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
      enableReadyCheck: true,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      enableOfflineQueue: false
    };

    this.client = new Redis(config);
    this.subscriber = new Redis(config);
    this.publisher = new Redis(config);

    this.setupErrorHandlers();
  }

  private setupErrorHandlers(): void {
    [this.client, this.subscriber, this.publisher].forEach(redis => {
      redis.on('error', (error) => {
        logger.error('Redis error', { error });
      });
      
      redis.on('ready', () => {
        logger.info('Redis connection established');
      });
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Redis get error', { key, error });
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.client.setex(key, ttl, serialized);
      } else {
        await this.client.set(key, serialized);
      }
      return true;
    } catch (error) {
      logger.error('Redis set error', { key, error });
      return false;
    }
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  // Distributed locking for critical operations
  async acquireLock(key: string, ttl: number = 30): Promise<string | null> {
    const lockId = `${Date.now()}-${Math.random()}`;
    const result = await this.client.set(
      `lock:${key}`,
      lockId,
      'EX', ttl,
      'NX'
    );
    return result === 'OK' ? lockId : null;
  }

  async releaseLock(key: string, lockId: string): Promise<boolean> {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    const result = await this.client.eval(script, 1, `lock:${key}`, lockId);
    return result === 1;
  }
}

export const redisCache = new RedisCache();
```

**Enhanced Rate Limiting**

```typescript
// lib/api/middleware/enhanced-rate-limiter.ts
import { Redis } from 'ioredis';
import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: NextRequest) => string;
  handler?: (req: NextRequest) => NextResponse;
}

export class EnhancedRateLimiter {
  private redis: Redis;
  private configs: Map<string, RateLimitConfig> = new Map();

  constructor(redis: Redis) {
    this.redis = redis;
    this.setupDefaultConfigs();
  }

  private setupDefaultConfigs(): void {
    // Auth endpoints - stricter limits
    this.configs.set('auth:login', {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 attempts per 15 minutes
      skipSuccessfulRequests: true
    });

    this.configs.set('auth:register', {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3 // 3 registrations per hour per IP
    });

    // Payment endpoints - very strict
    this.configs.set('payments:create', {
      windowMs: 60 * 1000, // 1 minute
      max: 2 // 2 payment attempts per minute
    });

    // API endpoints - standard limits
    this.configs.set('api:standard', {
      windowMs: 60 * 1000, // 1 minute
      max: 60 // 60 requests per minute
    });

    // Search endpoints - higher limits
    this.configs.set('api:search', {
      windowMs: 60 * 1000,
      max: 100 // 100 searches per minute
    });
  }

  async limit(
    req: NextRequest,
    configKey: string = 'api:standard'
  ): Promise<{ allowed: boolean; remaining: number; reset: Date }> {
    const config = this.configs.get(configKey) || this.configs.get('api:standard')!;
    const key = this.generateKey(req, config);
    
    const multi = this.redis.multi();
    const now = Date.now();
    const window = now - config.windowMs;

    // Remove old entries
    multi.zremrangebyscore(key, '-inf', window);
    
    // Count requests in current window
    multi.zcard(key);
    
    // Add current request
    multi.zadd(key, now, `${now}-${Math.random()}`);
    
    // Set expiry
    multi.expire(key, Math.ceil(config.windowMs / 1000));
    
    const results = await multi.exec();
    const count = results?.[1]?.[1] as number || 0;
    
    const allowed = count < config.max;
    const remaining = Math.max(0, config.max - count - 1);
    const reset = new Date(now + config.windowMs);

    return { allowed, remaining, reset };
  }

  private generateKey(req: NextRequest, config: RateLimitConfig): string {
    if (config.keyGenerator) {
      return config.keyGenerator(req);
    }

    // Default: Use IP + user ID if authenticated
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';
    
    const userId = (req as any).userId; // Set by auth middleware
    
    return userId 
      ? `rate_limit:user:${userId}` 
      : `rate_limit:ip:${ip}`;
  }
}
```

### 1.2 Database Query Optimization

**Week 2: Query Optimization Implementation**

```typescript
// lib/db/query-optimizer.ts
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/api/logger';

export class QueryOptimizer {
  private prisma: PrismaClient;
  private slowQueryThreshold = 1000; // 1 second

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.setupQueryLogging();
  }

  private setupQueryLogging(): void {
    this.prisma.$use(async (params, next) => {
      const before = Date.now();
      const result = await next(params);
      const after = Date.now();
      const duration = after - before;

      if (duration > this.slowQueryThreshold) {
        logger.warn('Slow query detected', {
          model: params.model,
          action: params.action,
          duration,
          args: params.args
        });
      }

      return result;
    });
  }

  // Batch similar queries
  async batchFind<T>(
    model: string,
    ids: string[],
    options?: any
  ): Promise<Map<string, T>> {
    const results = await (this.prisma as any)[model].findMany({
      where: { id: { in: ids } },
      ...options
    });

    return new Map(results.map((r: any) => [r.id, r]));
  }

  // Cursor-based pagination for large datasets
  async *cursorPaginate<T>(
    model: string,
    options: {
      where?: any;
      orderBy?: any;
      include?: any;
      pageSize?: number;
    }
  ): AsyncGenerator<T[], void, unknown> {
    const pageSize = options.pageSize || 100;
    let cursor: string | undefined;

    while (true) {
      const results = await (this.prisma as any)[model].findMany({
        take: pageSize + 1,
        cursor: cursor ? { id: cursor } : undefined,
        ...options
      });

      if (results.length === 0) break;

      const hasMore = results.length > pageSize;
      const items = hasMore ? results.slice(0, -1) : results;

      yield items;

      if (!hasMore) break;
      cursor = items[items.length - 1].id;
    }
  }
}
```

**Connection Pooling Configuration**

```typescript
// lib/db/prisma-production.ts
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/api/logger';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: [
      { level: 'error', emit: 'event' },
      { level: 'warn', emit: 'event' },
      { level: 'info', emit: 'event' },
    ],
  });

  // Production connection pool configuration
  if (process.env.NODE_ENV === 'production') {
    // These are set in the connection string:
    // ?connection_limit=50&pool_timeout=20&connect_timeout=10&statement_cache_size=1000
  }

  // Event listeners for monitoring
  (client.$on as any)('error', (e: any) => {
    logger.error('Prisma error', { error: e });
  });

  (client.$on as any)('warn', (e: any) => {
    logger.warn('Prisma warning', { warning: e });
  });

  return client;
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

---

## 2. Database Production Setup

### 2.1 Indexing Strategy

**Week 3: Database Indexes**

```sql
-- migrations/add_production_indexes.sql

-- User authentication and sessions
CREATE INDEX CONCURRENTLY idx_users_email_status ON users(email, status) WHERE status = 'ACTIVE';
CREATE INDEX CONCURRENTLY idx_users_phone_verified ON users(phone, phone_verified) WHERE phone_verified IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_sessions_user_expires ON sessions(user_id, expires_at) WHERE expires_at > NOW();

-- Orders and transactions
CREATE INDEX CONCURRENTLY idx_orders_buyer_status_created ON orders(buyer_id, status, created_at DESC);
CREATE INDEX CONCURRENTLY idx_orders_seller_status ON orders(seller_id, status) WHERE status IN ('PENDING', 'PROCESSING');
CREATE INDEX CONCURRENTLY idx_orders_created_at_desc ON orders(created_at DESC);
CREATE INDEX CONCURRENTLY idx_order_items_listing ON order_items(listing_id);

-- Listings and search
CREATE INDEX CONCURRENTLY idx_listings_seller_status ON listings(seller_id, status) WHERE status = 'ACTIVE';
CREATE INDEX CONCURRENTLY idx_listings_category_status ON listings(category, status) WHERE status = 'ACTIVE';
CREATE INDEX CONCURRENTLY idx_listings_search ON listings USING gin(to_tsvector('arabic', title_ar || ' ' || COALESCE(description_ar, '')));
CREATE INDEX CONCURRENTLY idx_listings_price_range ON listings(price) WHERE status = 'ACTIVE';

-- Payments
CREATE INDEX CONCURRENTLY idx_payments_order ON payments(order_id);
CREATE INDEX CONCURRENTLY idx_payments_status_created ON payments(status, created_at DESC);
CREATE INDEX CONCURRENTLY idx_payments_provider_external ON payments(provider, external_id);

-- Analytics queries
CREATE INDEX CONCURRENTLY idx_activity_logs_user_created ON activity_logs(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY idx_seller_analytics_date ON seller_analytics(seller_id, date DESC);

-- Partial indexes for common queries
CREATE INDEX CONCURRENTLY idx_listings_featured ON listings(featured_until) WHERE featured_until > NOW();
CREATE INDEX CONCURRENTLY idx_notifications_unread ON notifications(user_id, created_at DESC) WHERE read = false;
```

### 2.2 Database Monitoring

```typescript
// lib/monitoring/db-monitor.ts
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/api/logger';
import * as Sentry from '@sentry/nextjs';

export class DatabaseMonitor {
  private prisma: PrismaClient;
  private metrics: Map<string, any> = new Map();

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.startMonitoring();
  }

  private async startMonitoring(): Promise<void> {
    // Monitor connection pool
    setInterval(async () => {
      try {
        const poolStats = await this.getPoolStats();
        this.metrics.set('pool', poolStats);
        
        if (poolStats.idle < 5) {
          logger.warn('Low idle connections in pool', poolStats);
        }
      } catch (error) {
        logger.error('Failed to get pool stats', { error });
      }
    }, 30000); // Every 30 seconds

    // Monitor slow queries
    setInterval(async () => {
      try {
        const slowQueries = await this.getSlowQueries();
        if (slowQueries.length > 0) {
          logger.warn('Slow queries detected', { queries: slowQueries });
          Sentry.captureMessage('Slow queries detected', 'warning');
        }
      } catch (error) {
        logger.error('Failed to check slow queries', { error });
      }
    }, 60000); // Every minute

    // Monitor table sizes
    setInterval(async () => {
      try {
        const tableSizes = await this.getTableSizes();
        this.metrics.set('tableSizes', tableSizes);
      } catch (error) {
        logger.error('Failed to get table sizes', { error });
      }
    }, 3600000); // Every hour
  }

  private async getPoolStats(): Promise<any> {
    const result = await this.prisma.$queryRaw`
      SELECT 
        numbackends as active,
        (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') - numbackends as idle
      FROM pg_stat_database 
      WHERE datname = current_database()
    `;
    return result[0];
  }

  private async getSlowQueries(): Promise<any[]> {
    return await this.prisma.$queryRaw`
      SELECT 
        query,
        calls,
        mean_exec_time,
        total_exec_time
      FROM pg_stat_statements
      WHERE mean_exec_time > 1000
      ORDER BY mean_exec_time DESC
      LIMIT 10
    `;
  }

  private async getTableSizes(): Promise<any[]> {
    return await this.prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `;
  }

  async healthCheck(): Promise<{
    healthy: boolean;
    details: any;
  }> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      
      return {
        healthy: true,
        details: {
          pool: this.metrics.get('pool'),
          tableSizes: this.metrics.get('tableSizes')
        }
      };
    } catch (error) {
      return {
        healthy: false,
        details: { error: error.message }
      };
    }
  }
}
```

---

## 3. Security Hardening

### 3.1 Enhanced Authentication

**Week 4: Security Implementation**

```typescript
// lib/auth/security-enhanced.ts
import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';

const scryptAsync = promisify(scrypt);

export class EnhancedSecurity {
  // Password hashing with scrypt (more secure than bcrypt for new systems)
  static async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const buf = await scryptAsync(password, salt, 64) as Buffer;
    return `${buf.toString('hex')}.${salt}`;
  }

  static async verifyPassword(
    storedPassword: string,
    suppliedPassword: string
  ): Promise<boolean> {
    const [hashedPassword, salt] = storedPassword.split('.');
    const hashedPasswordBuf = Buffer.from(hashedPassword, 'hex');
    const suppliedPasswordBuf = await scryptAsync(suppliedPassword, salt, 64) as Buffer;
    return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
  }

  // Two-factor authentication
  static generateTOTPSecret(): {
    secret: string;
    qrCode: string;
    backup: string[];
  } {
    const secret = speakeasy.generateSecret({
      name: 'CargoParts',
      length: 32
    });

    const backupCodes = Array(10).fill(null).map(() => 
      randomBytes(4).toString('hex').toUpperCase()
    );

    return {
      secret: secret.base32,
      qrCode: secret.otpauth_url!,
      backup: backupCodes
    };
  }

  static verifyTOTP(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2 // Allow 2 time steps for clock skew
    });
  }

  // Request signing for critical operations
  static signRequest(
    payload: any,
    secret: string,
    expiresIn: string = '5m'
  ): string {
    return jwt.sign(payload, secret, {
      expiresIn,
      issuer: 'cargoparts-api',
      algorithm: 'HS512'
    });
  }

  static verifyRequestSignature(
    token: string,
    secret: string
  ): any {
    try {
      return jwt.verify(token, secret, {
        issuer: 'cargoparts-api',
        algorithms: ['HS512']
      });
    } catch {
      return null;
    }
  }

  // API key management for seller integrations
  static generateApiKey(): {
    key: string;
    hashedKey: string;
  } {
    const key = `cp_${randomBytes(32).toString('hex')}`;
    const hashedKey = this.hashApiKey(key);
    
    return { key, hashedKey };
  }

  static hashApiKey(key: string): string {
    const hash = createHash('sha256');
    hash.update(key);
    return hash.digest('hex');
  }
}
```

### 3.2 Input Validation & Sanitization

```typescript
// lib/security/input-validator.ts
import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

export class InputValidator {
  // Saudi phone number validation
  static saudiPhoneSchema = z.string().regex(
    /^(?:\+966|966|0)?5[0-9]{8}$/,
    'Invalid Saudi phone number'
  ).transform(val => {
    // Normalize to international format
    const cleaned = val.replace(/^\+?966|^0/, '');
    return `+966${cleaned}`;
  });

  // Arabic text validation
  static arabicTextSchema = z.string()
    .min(1)
    .max(5000)
    .refine(val => {
      // Check for SQL injection patterns
      const sqlPatterns = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE)\b|--|;|\*|\/\*|\*\/)/gi;
      return !sqlPatterns.test(val);
    }, 'Invalid characters detected')
    .transform(val => DOMPurify.sanitize(val));

  // Price validation for SAR
  static priceSchema = z.number()
    .positive()
    .max(9999999.99)
    .transform(val => Math.round(val * 100) / 100); // Round to 2 decimal places

  // National ID validation (Saudi)
  static nationalIdSchema = z.string().regex(
    /^[12]\d{9}$/,
    'Invalid Saudi national ID'
  );

  // Commercial Registration validation
  static commercialRegSchema = z.string().regex(
    /^\d{10}$/,
    'Invalid commercial registration number'
  );

  // VAT number validation
  static vatNumberSchema = z.string().regex(
    /^3\d{14}$/,
    'Invalid VAT number'
  );

  // File upload validation
  static fileUploadSchema = z.object({
    filename: z.string().max(255),
    mimetype: z.enum([
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf'
    ]),
    size: z.number().max(10 * 1024 * 1024) // 10MB max
  });

  // Sanitize HTML content
  static sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'p', 'br', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: []
    });
  }

  // Validate and sanitize search queries
  static sanitizeSearchQuery(query: string): string {
    // Remove special characters that could break search
    return query
      .replace(/[<>'"]/g, '')
      .trim()
      .substring(0, 100);
  }
}
```

---

## 4. Payment System Enhancement

### 4.1 PCI Compliance Implementation

**Week 5: Payment Security**

```typescript
// lib/payments/pci-compliance.ts
import crypto from 'crypto';
import { logger } from '@/lib/api/logger';

export class PCICompliance {
  private encryptionKey: Buffer;
  
  constructor() {
    const key = process.env.PAYMENT_ENCRYPTION_KEY;
    if (!key || key.length !== 64) {
      throw new Error('Invalid payment encryption key');
    }
    this.encryptionKey = Buffer.from(key, 'hex');
  }

  // Tokenize sensitive card data
  tokenizeCardData(cardNumber: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(cardNumber + process.env.PAYMENT_SALT);
    const token = `tok_${hash.digest('hex')}`;
    
    // Store mapping in secure vault (not in main DB)
    this.storeTokenMapping(token, cardNumber);
    
    return token;
  }

  // Encrypt sensitive data for storage
  encrypt(data: string): {
    encrypted: string;
    iv: string;
    tag: string;
  } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      this.encryptionKey,
      iv
    );
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  // Decrypt sensitive data
  decrypt(encryptedData: {
    encrypted: string;
    iv: string;
    tag: string;
  }): string {
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      this.encryptionKey,
      Buffer.from(encryptedData.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Mask card numbers for display
  maskCardNumber(cardNumber: string): string {
    if (cardNumber.length < 8) return '****';
    return `****-****-****-${cardNumber.slice(-4)}`;
  }

  // Audit trail for payment operations
  async auditPaymentOperation(
    operation: string,
    userId: string,
    details: any
  ): Promise<void> {
    const audit = {
      timestamp: new Date().toISOString(),
      operation,
      userId,
      ip: details.ip,
      userAgent: details.userAgent,
      result: details.result,
      // Never log full card numbers or CVV
      sanitizedDetails: this.sanitizePaymentDetails(details)
    };
    
    await this.storeAuditLog(audit);
    
    // Alert on suspicious patterns
    if (this.isSuspicious(operation, details)) {
      await this.alertSecurityTeam(audit);
    }
  }

  private sanitizePaymentDetails(details: any): any {
    const sanitized = { ...details };
    
    // Remove sensitive fields
    delete sanitized.cardNumber;
    delete sanitized.cvv;
    delete sanitized.pin;
    
    // Mask partial card numbers
    if (sanitized.lastFourDigits) {
      sanitized.maskedCard = `****-${sanitized.lastFourDigits}`;
      delete sanitized.lastFourDigits;
    }
    
    return sanitized;
  }

  private isSuspicious(operation: string, details: any): boolean {
    // Check for suspicious patterns
    if (details.amount > 50000) return true; // High value transaction
    if (details.failedAttempts > 3) return true; // Multiple failures
    if (details.unusualLocation) return true; // Geo-anomaly
    
    return false;
  }

  private async storeTokenMapping(token: string, data: string): Promise<void> {
    // Store in secure vault service (e.g., HashiCorp Vault)
    // This is a placeholder - implement actual vault integration
    logger.info('Token mapping stored securely', { token });
  }

  private async storeAuditLog(audit: any): Promise<void> {
    // Store in tamper-proof audit log
    await prisma.paymentAuditLog.create({
      data: {
        ...audit,
        checksum: this.generateChecksum(audit)
      }
    });
  }

  private generateChecksum(data: any): string {
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(data) + process.env.AUDIT_SALT);
    return hash.digest('hex');
  }

  private async alertSecurityTeam(audit: any): Promise<void> {
    // Send alert to security team
    logger.error('SECURITY ALERT: Suspicious payment activity', audit);
    // Implement actual alerting (email, Slack, PagerDuty, etc.)
  }
}
```

### 4.2 Webhook Security

```typescript
// lib/payments/webhook-handler.ts
import crypto from 'crypto';
import { logger } from '@/lib/api/logger';

export class WebhookHandler {
  // Verify webhook signatures
  static verifyTapWebhook(
    payload: string,
    signature: string
  ): boolean {
    const secret = process.env.TAP_WEBHOOK_SECRET!;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  static verifyHyperPayWebhook(
    payload: any,
    signature: string
  ): boolean {
    const secret = process.env.HYPERPAY_WEBHOOK_SECRET!;
    const message = `${payload.id}.${payload.paymentType}.${payload.amount}.${payload.currency}`;
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(message)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  // Idempotency handling
  static async handleWebhook(
    eventId: string,
    handler: () => Promise<void>
  ): Promise<void> {
    // Check if already processed
    const processed = await prisma.webhookEvent.findUnique({
      where: { eventId }
    });
    
    if (processed) {
      logger.info('Webhook already processed', { eventId });
      return;
    }
    
    try {
      // Process webhook
      await handler();
      
      // Mark as processed
      await prisma.webhookEvent.create({
        data: {
          eventId,
          processedAt: new Date(),
          status: 'SUCCESS'
        }
      });
    } catch (error) {
      // Log failure
      await prisma.webhookEvent.create({
        data: {
          eventId,
          processedAt: new Date(),
          status: 'FAILED',
          error: error.message
        }
      });
      
      throw error;
    }
  }

  // Retry mechanism for failed webhooks
  static async retryFailedWebhooks(): Promise<void> {
    const failed = await prisma.webhookEvent.findMany({
      where: {
        status: 'FAILED',
        retryCount: { lt: 3 },
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    });
    
    for (const webhook of failed) {
      try {
        // Reprocess webhook
        await this.reprocessWebhook(webhook);
        
        // Update status
        await prisma.webhookEvent.update({
          where: { id: webhook.id },
          data: {
            status: 'SUCCESS',
            retryCount: { increment: 1 }
          }
        });
      } catch (error) {
        // Increment retry count
        await prisma.webhookEvent.update({
          where: { id: webhook.id },
          data: {
            retryCount: { increment: 1 },
            lastError: error.message
          }
        });
      }
    }
  }

  private static async reprocessWebhook(webhook: any): Promise<void> {
    // Implement reprocessing logic based on webhook type
    logger.info('Reprocessing webhook', { webhookId: webhook.id });
  }
}
```

---

## 5. Background Jobs & Processing

### 5.1 Queue System Implementation

**Week 6: Background Jobs**

```typescript
// lib/jobs/queue-manager.ts
import Bull from 'bull';
import { logger } from '@/lib/api/logger';

export class QueueManager {
  private queues: Map<string, Bull.Queue> = new Map();
  
  constructor() {
    this.initializeQueues();
  }

  private initializeQueues(): void {
    const redisConfig = {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD
    };

    // Email queue
    this.createQueue('email', redisConfig, {
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        },
        removeOnComplete: 100,
        removeOnFail: 500
      }
    });

    // SMS queue for Saudi market
    this.createQueue('sms', redisConfig, {
      defaultJobOptions: {
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 1000
        },
        priority: 1 // Higher priority for OTPs
      }
    });

    // Order processing
    this.createQueue('orders', redisConfig, {
      defaultJobOptions: {
        attempts: 3,
        timeout: 30000
      }
    });

    // Analytics processing
    this.createQueue('analytics', redisConfig, {
      defaultJobOptions: {
        attempts: 2,
        delay: 5000 // Process after 5 seconds
      }
    });

    // Scheduled tasks
    this.createQueue('scheduled', redisConfig);
  }

  private createQueue(
    name: string,
    redisConfig: any,
    options?: Bull.QueueOptions
  ): Bull.Queue {
    const queue = new Bull(name, {
      redis: redisConfig,
      ...options
    });

    // Add event listeners
    queue.on('completed', (job) => {
      logger.info(`Job completed: ${name}`, { jobId: job.id });
    });

    queue.on('failed', (job, err) => {
      logger.error(`Job failed: ${name}`, { jobId: job.id, error: err });
    });

    queue.on('stalled', (job) => {
      logger.warn(`Job stalled: ${name}`, { jobId: job.id });
    });

    this.queues.set(name, queue);
    return queue;
  }

  async addJob(
    queueName: string,
    jobName: string,
    data: any,
    options?: Bull.JobOptions
  ): Promise<Bull.Job> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    return queue.add(jobName, data, options);
  }

  // Schedule recurring jobs
  async scheduleRecurring(
    queueName: string,
    jobName: string,
    cronPattern: string,
    data: any
  ): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    await queue.add(jobName, data, {
      repeat: { cron: cronPattern }
    });
  }

  // Get queue metrics
  async getQueueMetrics(queueName: string): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount()
    ]);

    return { waiting, active, completed, failed, delayed };
  }
}

export const queueManager = new QueueManager();
```

### 5.2 Saudi-Specific Communication Services

```typescript
// lib/communication/saudi-sms-service.ts
import axios from 'axios';
import { logger } from '@/lib/api/logger';

export class SaudiSMSService {
  private providers = {
    unifonic: {
      endpoint: 'https://el.cloud.unifonic.com/rest/SMS/messages/Send',
      apiKey: process.env.UNIFONIC_API_KEY!,
      senderId: process.env.UNIFONIC_SENDER_ID || 'CargoParts'
    },
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID!,
      authToken: process.env.TWILIO_AUTH_TOKEN!,
      fromNumber: process.env.TWILIO_PHONE_NUMBER!
    }
  };

  async sendSMS(
    phone: string,
    message: string,
    options: {
      provider?: 'unifonic' | 'twilio';
      priority?: 'high' | 'normal';
      isOTP?: boolean;
    } = {}
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const provider = options.provider || 'unifonic';
    
    // Format phone for Saudi Arabia
    const formattedPhone = this.formatSaudiPhone(phone);
    
    try {
      if (provider === 'unifonic') {
        return await this.sendViaUnifonic(formattedPhone, message, options);
      } else {
        return await this.sendViaTwilio(formattedPhone, message, options);
      }
    } catch (error) {
      logger.error('SMS send failed', { provider, phone: formattedPhone, error });
      
      // Fallback to alternative provider
      if (provider === 'unifonic') {
        return await this.sendViaTwilio(formattedPhone, message, options);
      }
      
      throw error;
    }
  }

  private formatSaudiPhone(phone: string): string {
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Handle different formats
    if (cleaned.startsWith('966')) {
      return cleaned;
    } else if (cleaned.startsWith('0')) {
      return '966' + cleaned.substring(1);
    } else if (cleaned.startsWith('5')) {
      return '966' + cleaned;
    } else {
      return cleaned;
    }
  }

  private async sendViaUnifonic(
    phone: string,
    message: string,
    options: any
  ): Promise<any> {
    const response = await axios.post(
      this.providers.unifonic.endpoint,
      {
        AppSid: this.providers.unifonic.apiKey,
        SenderID: this.providers.unifonic.senderId,
        Recipient: phone,
        Body: message,
        Priority: options.priority === 'high' ? 'High' : 'Normal'
      }
    );

    if (response.data.success) {
      return {
        success: true,
        messageId: response.data.data.MessageID
      };
    }

    return {
      success: false,
      error: response.data.errorCode
    };
  }

  private async sendViaTwilio(
    phone: string,
    message: string,
    options: any
  ): Promise<any> {
    const twilio = require('twilio')(
      this.providers.twilio.accountSid,
      this.providers.twilio.authToken
    );

    const result = await twilio.messages.create({
      body: message,
      from: this.providers.twilio.fromNumber,
      to: `+${phone}`
    });

    return {
      success: true,
      messageId: result.sid
    };
  }

  // OTP-specific methods
  async sendOTP(
    phone: string,
    code: string,
    language: 'ar' | 'en' = 'ar'
  ): Promise<void> {
    const messages = {
      ar: `رمز التحقق الخاص بك في CargoParts هو: ${code}. صالح لمدة 5 دقائق.`,
      en: `Your CargoParts verification code is: ${code}. Valid for 5 minutes.`
    };

    await this.sendSMS(phone, messages[language], {
      priority: 'high',
      isOTP: true
    });
  }

  // Order notification templates
  async sendOrderNotification(
    phone: string,
    orderId: string,
    status: string,
    language: 'ar' | 'en' = 'ar'
  ): Promise<void> {
    const templates = {
      ar: {
        confirmed: `تم تأكيد طلبك #${orderId} في CargoParts. سيتم التواصل معك قريباً.`,
        shipped: `تم شحن طلبك #${orderId}. يمكنك تتبعه من خلال حسابك.`,
        delivered: `تم تسليم طلبك #${orderId}. شكراً لتسوقك من CargoParts.`
      },
      en: {
        confirmed: `Your order #${orderId} has been confirmed at CargoParts.`,
        shipped: `Your order #${orderId} has been shipped. Track it in your account.`,
        delivered: `Your order #${orderId} has been delivered. Thank you for shopping with CargoParts.`
      }
    };

    const message = templates[language][status];
    if (message) {
      await this.sendSMS(phone, message);
    }
  }
}
```

---

## 6. Monitoring & Logging

### 6.1 Application Performance Monitoring

**Week 7: Monitoring Setup**

```typescript
// lib/monitoring/apm.ts
import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/api/logger';

export class APM {
  static initialize(): void {
    // Sentry configuration
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Prisma({ client: prisma })
      ],
      beforeSend(event, hint) {
        // Sanitize sensitive data
        if (event.request) {
          delete event.request.cookies;
          delete event.request.headers?.authorization;
        }
        return event;
      }
    });

    // Custom performance monitoring
    this.setupPerformanceMonitoring();
  }

  private static setupPerformanceMonitoring(): void {
    // API endpoint monitoring
    if (typeof window === 'undefined') {
      const { performance } = require('perf_hooks');
      
      // Track API response times
      process.on('request', (req: any) => {
        const start = performance.now();
        
        req.on('end', () => {
          const duration = performance.now() - start;
          
          logger.info('API Request', {
            method: req.method,
            path: req.url,
            duration,
            statusCode: req.statusCode
          });
          
          // Alert on slow requests
          if (duration > 1000) {
            Sentry.captureMessage(`Slow API request: ${req.url}`, 'warning');
          }
        });
      });
    }
  }

  // Custom metrics
  static trackMetric(
    name: string,
    value: number,
    tags?: Record<string, string>
  ): void {
    logger.info('Metric', { name, value, tags });
    
    // Send to metrics service (DataDog, CloudWatch, etc.)
    if (process.env.DATADOG_API_KEY) {
      this.sendToDataDog(name, value, tags);
    }
  }

  private static sendToDataDog(
    metric: string,
    value: number,
    tags?: Record<string, string>
  ): void {
    // DataDog integration
    const StatsD = require('node-dogstatsd').StatsD;
    const dogstatsd = new StatsD();
    
    dogstatsd.gauge(metric, value, tags);
  }

  // Business metrics tracking
  static trackBusinessMetric(
    event: string,
    properties: Record<string, any>
  ): void {
    // Track important business events
    const businessEvents = [
      'order_created',
      'payment_completed',
      'user_registered',
      'seller_onboarded',
      'listing_created'
    ];
    
    if (businessEvents.includes(event)) {
      logger.info('Business Event', { event, properties });
      
      // Send to analytics service
      if (process.env.MIXPANEL_TOKEN) {
        this.sendToMixpanel(event, properties);
      }
    }
  }

  private static sendToMixpanel(
    event: string,
    properties: Record<string, any>
  ): void {
    const Mixpanel = require('mixpanel');
    const mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN);
    
    mixpanel.track(event, {
      ...properties,
      environment: process.env.NODE_ENV,
      timestamp: new Date()
    });
  }
}
```

### 6.2 Comprehensive Logging System

```typescript
// lib/monitoring/logger-enhanced.ts
import winston from 'winston';
import 'winston-daily-rotate-file';

export class EnhancedLogger {
  private logger: winston.Logger;
  
  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: {
        service: 'cargoparts-api',
        environment: process.env.NODE_ENV
      },
      transports: this.getTransports()
    });
  }

  private getTransports(): winston.transport[] {
    const transports: winston.transport[] = [];
    
    // Console transport for development
    if (process.env.NODE_ENV !== 'production') {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      );
    }
    
    // File transports for production
    if (process.env.NODE_ENV === 'production') {
      // General logs
      transports.push(
        new winston.transports.DailyRotateFile({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          level: 'info'
        })
      );
      
      // Error logs
      transports.push(
        new winston.transports.DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '30d',
          level: 'error'
        })
      );
      
      // Audit logs
      transports.push(
        new winston.transports.DailyRotateFile({
          filename: 'logs/audit-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '50m',
          maxFiles: '90d',
          level: 'info',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          )
        })
      );
    }
    
    // CloudWatch integration for AWS
    if (process.env.AWS_REGION) {
      const CloudWatchTransport = require('winston-cloudwatch');
      transports.push(
        new CloudWatchTransport({
          logGroupName: 'cargoparts-api',
          logStreamName: process.env.NODE_ENV,
          awsRegion: process.env.AWS_REGION,
          jsonMessage: true
        })
      );
    }
    
    return transports;
  }

  // Structured logging methods
  logApiRequest(req: any, res: any, duration: number): void {
    this.logger.info('API Request', {
      type: 'api_request',
      method: req.method,
      path: req.url,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.userId
    });
  }

  logDatabaseQuery(query: string, duration: number, params?: any): void {
    this.logger.debug('Database Query', {
      type: 'db_query',
      query: query.substring(0, 500), // Truncate long queries
      duration,
      params: this.sanitizeParams(params)
    });
  }

  logPaymentEvent(event: string, details: any): void {
    this.logger.info('Payment Event', {
      type: 'payment',
      event,
      ...this.sanitizePaymentDetails(details)
    });
  }

  logSecurityEvent(event: string, details: any): void {
    this.logger.warn('Security Event', {
      type: 'security',
      event,
      ...details
    });
  }

  logBusinessEvent(event: string, details: any): void {
    this.logger.info('Business Event', {
      type: 'business',
      event,
      ...details
    });
  }

  private sanitizeParams(params: any): any {
    if (!params) return params;
    
    const sanitized = { ...params };
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'cvv'];
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }

  private sanitizePaymentDetails(details: any): any {
    const sanitized = { ...details };
    
    // Redact sensitive payment information
    if (sanitized.cardNumber) {
      sanitized.cardNumber = `****-${sanitized.cardNumber.slice(-4)}`;
    }
    
    delete sanitized.cvv;
    delete sanitized.pin;
    
    return sanitized;
  }
}

export const enhancedLogger = new EnhancedLogger();
```

---

## 7. Deployment Strategy

### 7.1 Environment Configuration

**Week 8: Deployment Setup**

```typescript
// lib/config/environment.ts
import { z } from 'zod';

const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'staging', 'production']),
  APP_URL: z.string().url(),
  API_URL: z.string().url(),
  
  // Database
  DATABASE_URL: z.string(),
  DATABASE_POOL_MIN: z.string().transform(Number).default('2'),
  DATABASE_POOL_MAX: z.string().transform(Number).default('10'),
  
  // Redis
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string().transform(Number),
  REDIS_PASSWORD: z.string().optional(),
  
  // Authentication
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  SESSION_SECRET: z.string().min(32),
  
  // Payment Providers
  TAP_SECRET_KEY: z.string(),
  TAP_PUBLIC_KEY: z.string(),
  TAP_WEBHOOK_SECRET: z.string(),
  HYPERPAY_ACCESS_TOKEN: z.string(),
  HYPERPAY_ENTITY_ID: z.string(),
  HYPERPAY_WEBHOOK_SECRET: z.string(),
  
  // SMS Providers
  UNIFONIC_API_KEY: z.string(),
  UNIFONIC_SENDER_ID: z.string(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  
  // Email
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string().transform(Number),
  SMTP_USER: z.string(),
  SMTP_PASSWORD: z.string(),
  EMAIL_FROM: z.string().email(),
  
  // Monitoring
  SENTRY_DSN: z.string().optional(),
  DATADOG_API_KEY: z.string().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  
  // Security
  PAYMENT_ENCRYPTION_KEY: z.string().length(64),
  PAYMENT_SALT: z.string().min(16),
  AUDIT_SALT: z.string().min(16),
  
  // Saudi-specific
  DEFAULT_CURRENCY: z.literal('SAR'),
  DEFAULT_LOCALE: z.enum(['ar', 'en']).default('ar'),
  VAT_RATE: z.string().transform(Number).default('15'),
  
  // Feature flags
  ENABLE_2FA: z.boolean().default(false),
  ENABLE_API_KEYS: z.boolean().default(false),
  ENABLE_WEBHOOKS: z.boolean().default(true)
});

export type Environment = z.infer<typeof envSchema>;

export function validateEnvironment(): Environment {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('Invalid environment variables:', error);
    process.exit(1);
  }
}

export const env = validateEnvironment();
```

### 7.2 Health Checks

```typescript
// app/api/health/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { redisCache } from '@/lib/cache/redis-cache';
import { logger } from '@/lib/api/logger';

export async function GET(req: NextRequest) {
  const detailed = req.nextUrl.searchParams.get('detailed') === 'true';
  
  const checks = {
    app: true,
    database: false,
    redis: false,
    timestamp: new Date().toISOString()
  };
  
  let status = 200;
  
  // Database health check
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    logger.error('Database health check failed', { error });
    status = 503;
  }
  
  // Redis health check
  try {
    await redisCache.get('health_check');
    checks.redis = true;
  } catch (error) {
    logger.error('Redis health check failed', { error });
    status = 503;
  }
  
  const response: any = {
    status: status === 200 ? 'healthy' : 'unhealthy',
    checks
  };
  
  if (detailed) {
    // Add detailed metrics for internal monitoring
    response.metrics = {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      version: process.env.npm_package_version,
      environment: process.env.NODE_ENV
    };
  }
  
  return NextResponse.json(response, { status });
}

// Readiness probe for Kubernetes
export async function HEAD() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}
```

### 7.3 Deployment Scripts

```bash
#!/bin/bash
# scripts/deploy-production.sh

set -e

echo "Starting production deployment..."

# 1. Run pre-deployment checks
echo "Running pre-deployment checks..."
npm run test:unit
npm run test:integration
npm run lint
npm run type-check

# 2. Build application
echo "Building application..."
npm run build

# 3. Database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# 4. Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# 5. Verify health check
echo "Verifying health check..."
curl -f http://localhost:3000/api/health || exit 1

# 6. Deploy with zero-downtime
echo "Deploying with zero-downtime..."
pm2 reload ecosystem.config.js --update-env

# 7. Clear caches
echo "Clearing caches..."
npm run cache:clear

# 8. Warm up application
echo "Warming up application..."
npm run warmup

# 9. Run post-deployment tests
echo "Running post-deployment tests..."
npm run test:smoke

echo "Deployment completed successfully!"
```

---

## 8. Saudi Market Specific Requirements

### 8.1 Compliance Implementation

```typescript
// lib/compliance/saudi-compliance.ts
export class SaudiCompliance {
  // VAT calculation
  static calculateVAT(amount: number): {
    subtotal: number;
    vat: number;
    total: number;
  } {
    const VAT_RATE = 0.15; // 15% VAT in Saudi Arabia
    const subtotal = amount;
    const vat = subtotal * VAT_RATE;
    const total = subtotal + vat;
    
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      vat: Math.round(vat * 100) / 100,
      total: Math.round(total * 100) / 100
    };
  }

  // Generate tax invoice
  static generateTaxInvoice(order: any): {
    invoiceNumber: string;
    qrCode: string;
    vatNumber: string;
  } {
    const invoiceNumber = `INV-${Date.now()}-${order.id}`;
    
    // Generate QR code for ZATCA compliance
    const qrData = this.generateZATCAQRCode({
      sellerName: order.seller.businessName,
      vatNumber: order.seller.vatNumber,
      timestamp: new Date().toISOString(),
      total: order.total,
      vat: order.vatAmount
    });
    
    return {
      invoiceNumber,
      qrCode: qrData,
      vatNumber: order.seller.vatNumber
    };
  }

  private static generateZATCAQRCode(data: any): string {
    // ZATCA (Zakat, Tax and Customs Authority) QR code format
    const tlvData = [
      { tag: 1, value: data.sellerName },
      { tag: 2, value: data.vatNumber },
      { tag: 3, value: data.timestamp },
      { tag: 4, value: data.total.toString() },
      { tag: 5, value: data.vat.toString() }
    ];
    
    // Convert to base64 TLV format
    const buffer = Buffer.concat(
      tlvData.map(item => {
        const value = Buffer.from(item.value, 'utf8');
        return Buffer.concat([
          Buffer.from([item.tag]),
          Buffer.from([value.length]),
          value
        ]);
      })
    );
    
    return buffer.toString('base64');
  }

  // Validate Saudi business documents
  static validateCommercialRegistration(cr: string): boolean {
    return /^\d{10}$/.test(cr);
  }

  static validateVATNumber(vat: string): boolean {
    return /^3\d{14}$/.test(vat);
  }

  static validateNationalId(id: string): boolean {
    return /^[12]\d{9}$/.test(id);
  }

  static validateIBAN(iban: string): boolean {
    // Saudi IBAN format: SA + 2 check digits + 2 bank code + 18 account number
    return /^SA\d{2}[0-9]{2}[0-9A-Z]{18}$/.test(iban);
  }
}
```

---

## 9. Testing Strategy

### 9.1 Comprehensive Testing Suite

```typescript
// __tests__/api/integration/payment-flow.test.ts
describe('Payment Flow Integration', () => {
  it('should complete full payment cycle', async () => {
    // 1. Create order
    const order = await createTestOrder();
    
    // 2. Initialize payment
    const payment = await initializePayment(order.id, {
      provider: 'tap',
      amount: order.total
    });
    
    // 3. Simulate webhook
    const webhookResponse = await simulateWebhook({
      eventType: 'payment.success',
      paymentId: payment.id
    });
    
    // 4. Verify order status
    const updatedOrder = await getOrder(order.id);
    expect(updatedOrder.status).toBe('PAID');
    
    // 5. Verify audit trail
    const auditLogs = await getAuditLogs(order.id);
    expect(auditLogs).toContainEqual(
      expect.objectContaining({
        action: 'payment_completed'
      })
    );
  });
});
```

---

## 10. Priority Action Items

### Week 1-2: Critical Foundation
1. ✅ Implement Redis cache integration
2. ✅ Set up enhanced rate limiting
3. ✅ Configure database connection pooling
4. ✅ Implement API versioning

### Week 3-4: Security & Database
1. ✅ Add production database indexes
2. ✅ Implement enhanced authentication
3. ✅ Set up input validation and sanitization
4. ✅ Configure security headers and CORS

### Week 5-6: Payments & Jobs
1. ✅ Implement PCI compliance measures
2. ✅ Set up webhook security
3. ✅ Configure background job queues
4. ✅ Implement Saudi SMS service

### Week 7-8: Monitoring & Saudi Features
1. ✅ Set up APM and logging
2. ✅ Implement health checks
3. ✅ Add Saudi compliance features
4. ✅ Configure deployment pipeline

### Week 9: Final Testing
1. ✅ Run load testing
2. ✅ Perform security audit
3. ✅ Execute integration tests
4. ✅ Deploy to production

---

## Conclusion

This comprehensive backend production plan provides a structured approach to transitioning CargoParts from MVP to production-ready deployment. The plan focuses on:

1. **Performance**: Redis caching, query optimization, connection pooling
2. **Security**: Enhanced authentication, PCI compliance, input validation
3. **Reliability**: Background jobs, monitoring, health checks
4. **Saudi Market**: SMS integration, VAT compliance, Arabic support
5. **Scalability**: Horizontal scaling ready, optimized database queries

Follow the prioritized timeline to ensure a smooth transition to production while maintaining system stability and security.