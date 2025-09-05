# CargoParts Backend Production Deployment Plan

## Executive Summary

This document outlines the comprehensive backend transformation plan for CargoParts from MVP/prototype to production-ready deployment. The plan focuses on scalability, security, performance, and Saudi Arabia-specific requirements.

**Current State**: Next.js 15 App Router monolith with basic API routes, JWT authentication, and Prisma ORM with PostgreSQL.

**Target State**: Production-ready, scalable backend infrastructure capable of handling 100,000+ daily active users with sub-200ms API response times.

## Timeline Overview

- **Phase 1 (Weeks 1-2)**: Critical Security & Database Optimization
- **Phase 2 (Weeks 3-4)**: API Architecture & Performance
- **Phase 3 (Weeks 5-6)**: Caching & Background Jobs
- **Phase 4 (Weeks 7-8)**: Infrastructure & Monitoring
- **Phase 5 (Weeks 9-10)**: Saudi Compliance & Localization
- **Phase 6 (Weeks 11-12)**: Testing & Load Optimization

---

## 1. API Architecture & Performance

### 1.1 Current State Analysis

**Issues Identified**:
- No API versioning strategy
- Missing rate limiting on most endpoints
- No request/response validation middleware
- Lack of consistent error handling
- No API documentation (OpenAPI/Swagger)
- Missing pagination on list endpoints
- No caching layer

### 1.2 Implementation Strategy

#### API Versioning & Structure

Create a new API structure with versioning:

```typescript
// app/api/v1/route-config.ts
export const API_VERSION = 'v1';
export const API_BASE_PATH = `/api/${API_VERSION}`;

// Middleware for API versioning
export function withApiVersion(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    res.setHeader('X-API-Version', API_VERSION);
    res.setHeader('X-RateLimit-Limit', '100');
    res.setHeader('X-RateLimit-Remaining', '99');
    return handler(req, res);
  };
}
```

#### Request/Response Validation Middleware

```typescript
// lib/api/middleware/validation.ts
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (handler: (req: NextRequest, data: T) => Promise<NextResponse>) => {
    return async (req: NextRequest) => {
      try {
        const body = await req.json();
        const validated = schema.parse(body);
        return handler(req, validated);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            { 
              error: 'Validation failed', 
              details: error.errors 
            },
            { status: 400 }
          );
        }
        throw error;
      }
    };
  };
}
```

#### Global Error Handler

```typescript
// lib/api/middleware/error-handler.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
  }
}

export function withErrorHandler(handler: Function) {
  return async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
            details: error.details
          },
          { status: error.statusCode }
        );
      }
      
      // Log to monitoring service
      console.error('Unhandled error:', error);
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
```

### 1.3 Performance Optimizations

#### Response Compression

```typescript
// lib/api/middleware/compression.ts
import { compress } from 'zlib';
import { promisify } from 'util';

const gzip = promisify(compress);

export async function compressResponse(data: any) {
  const json = JSON.stringify(data);
  if (json.length < 1024) return json; // Don't compress small responses
  
  const compressed = await gzip(json);
  return compressed;
}
```

#### Pagination Implementation

```typescript
// lib/api/utils/pagination.ts
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export async function paginate<T>(
  query: any,
  params: PaginationParams
): Promise<PaginatedResponse<T>> {
  const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = params;
  const skip = (page - 1) * limit;
  
  const [data, total] = await Promise.all([
    query.skip(skip).take(limit).orderBy({ [sort]: order }),
    query.count()
  ]);
  
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
}
```

### 1.4 API Documentation

Implement OpenAPI documentation:

```typescript
// lib/api/openapi/schema.ts
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

const registry = new OpenAPIRegistry();

// Register endpoints
registry.registerPath({
  method: 'get',
  path: '/api/v1/listings',
  description: 'Get paginated listings',
  summary: 'List all listings with pagination',
  request: {
    query: z.object({
      page: z.number().optional(),
      limit: z.number().optional(),
      make: z.string().optional(),
      model: z.string().optional(),
    })
  },
  responses: {
    200: {
      description: 'Successful response',
      content: {
        'application/json': {
          schema: ListingResponseSchema
        }
      }
    }
  }
});
```

---

## 2. Database Architecture & Scaling

### 2.1 Current Issues

- Missing indexes on foreign keys
- No connection pooling optimization
- No read replica configuration
- Missing database monitoring
- No automated backup strategy

### 2.2 Database Optimization Strategy

#### Connection Pooling Configuration

```typescript
// lib/db/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Configure connection pool
if (process.env.NODE_ENV === 'production') {
  prisma.$connect().then(() => {
    // Set pool configuration
    prisma.$executeRaw`SET statement_timeout = '30s'`;
    prisma.$executeRaw`SET idle_in_transaction_session_timeout = '60s'`;
  });
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

#### Read Replica Setup

```typescript
// lib/db/read-replica.ts
import { PrismaClient } from '@prisma/client';

export const readReplica = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_READ_REPLICA_URL || process.env.DATABASE_URL,
    },
  },
});

// Use for read-only operations
export async function getListingsOptimized(filters: any) {
  return readReplica.listing.findMany({
    where: filters,
    include: {
      photos: {
        take: 1,
        orderBy: { sortOrder: 'asc' }
      },
      seller: {
        select: {
          businessName: true,
          verified: true,
          rating: true,
        }
      }
    }
  });
}
```

#### Index Optimization

```sql
-- migrations/add_performance_indexes.sql

-- Composite indexes for common queries
CREATE INDEX idx_listings_search ON listings(status, is_active, city, make, model);
CREATE INDEX idx_listings_price_range ON listings(price_sar, status) WHERE is_active = true;
CREATE INDEX idx_orders_user_status ON orders(buyer_id, status, created_at);
CREATE INDEX idx_sessions_expiry ON sessions(expires_at) WHERE expires_at > NOW();

-- Partial indexes for active records
CREATE INDEX idx_active_sellers ON sellers(status) WHERE verified = true;
CREATE INDEX idx_pending_payments ON payments(status) WHERE status IN ('PENDING', 'PROCESSING');

-- GIN index for array searches
CREATE INDEX idx_listing_oem_numbers ON listings USING GIN(oem_numbers);
```

### 2.3 Migration Strategy

```typescript
// scripts/db-migration-safe.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function safeMigration() {
  console.log('Starting safe migration process...');
  
  try {
    // 1. Create backup
    await execAsync('pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql');
    
    // 2. Run migrations in transaction
    await execAsync('npx prisma migrate deploy');
    
    // 3. Verify data integrity
    const healthCheck = await prisma.$queryRaw`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed, rolling back...');
    // Implement rollback logic
    throw error;
  }
}
```

---

## 3. Security Hardening

### 3.1 Authentication Improvements

#### Multi-Factor Authentication

```typescript
// lib/auth/mfa.ts
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

export class MFAService {
  static generateSecret(user: User) {
    const secret = speakeasy.generateSecret({
      name: `CargoParts (${user.email})`,
      issuer: 'CargoParts',
      length: 32
    });
    
    return {
      secret: secret.base32,
      qrCode: qrcode.toDataURL(secret.otpauth_url!)
    };
  }
  
  static verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2 // Allow 2 intervals before/after
    });
  }
}
```

#### Refresh Token Rotation

```typescript
// lib/auth/refresh-token.ts
export class RefreshTokenService {
  static async rotateRefreshToken(oldToken: string) {
    const decoded = await JwtService.verifyRefreshToken(oldToken);
    
    // Blacklist old token
    await redis.setex(`blacklist:${oldToken}`, 86400, '1');
    
    // Generate new token pair
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    
    const newAccessToken = JwtService.generateAccessToken(user);
    const newRefreshToken = JwtService.generateRefreshToken(user.id);
    
    return { 
      accessToken: newAccessToken, 
      refreshToken: newRefreshToken 
    };
  }
}
```

### 3.2 API Security

#### Rate Limiting Implementation

```typescript
// lib/api/rate-limiter.ts
import { Redis } from 'ioredis';
import { NextRequest, NextResponse } from 'next/server';

const redis = new Redis(process.env.REDIS_URL!);

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyGenerator?: (req: NextRequest) => string;
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, max, keyGenerator } = options;
  
  return async (req: NextRequest) => {
    const key = keyGenerator ? keyGenerator(req) : req.ip || 'anonymous';
    const redisKey = `rate_limit:${key}`;
    
    const current = await redis.incr(redisKey);
    
    if (current === 1) {
      await redis.expire(redisKey, Math.ceil(windowMs / 1000));
    }
    
    if (current > max) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(windowMs / 1000)),
            'X-RateLimit-Limit': String(max),
            'X-RateLimit-Remaining': '0',
          }
        }
      );
    }
    
    // Continue with request
    return null;
  };
}

// Usage
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.ip + ':auth'
});
```

#### Input Sanitization

```typescript
// lib/security/sanitizer.ts
import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

export class Sanitizer {
  static sanitizeHtml(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href']
    });
  }
  
  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/\.{2,}/g, '.')
      .substring(0, 255);
  }
  
  static sanitizeArabicText(text: string): string {
    // Remove potential script injections while preserving Arabic
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }
}

// Validation schemas with sanitization
export const arabicTextSchema = z.string().transform(Sanitizer.sanitizeArabicText);
export const htmlContentSchema = z.string().transform(Sanitizer.sanitizeHtml);
```

### 3.3 Payment Security

#### PCI Compliance

```typescript
// lib/payments/pci-compliance.ts
export class PCIComplianceService {
  // Never store card details - use tokenization
  static async tokenizeCard(cardDetails: any) {
    // Use payment provider's tokenization
    const token = await tapPaymentService.tokenize(cardDetails);
    return token;
  }
  
  // Audit logging for payment operations
  static async logPaymentActivity(activity: PaymentActivity) {
    await prisma.activityLog.create({
      data: {
        action: 'PAYMENT_ACTIVITY',
        entity: 'payment',
        entityId: activity.paymentId,
        metadata: {
          ...activity,
          // Never log sensitive data
          cardNumber: undefined,
          cvv: undefined
        }
      }
    });
  }
  
  // Encrypt sensitive payment data at rest
  static encryptPaymentData(data: any): string {
    const cipher = crypto.createCipher('aes-256-gcm', process.env.PAYMENT_ENCRYPTION_KEY!);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }
}
```

---

## 4. Service Architecture

### 4.1 Event-Driven Architecture

```typescript
// lib/events/event-bus.ts
import { EventEmitter } from 'events';
import { Redis } from 'ioredis';

export class EventBus extends EventEmitter {
  private redis: Redis;
  private subscriber: Redis;
  
  constructor() {
    super();
    this.redis = new Redis(process.env.REDIS_URL!);
    this.subscriber = new Redis(process.env.REDIS_URL!);
    this.setupSubscriber();
  }
  
  private setupSubscriber() {
    this.subscriber.on('message', (channel, message) => {
      const event = JSON.parse(message);
      this.emit(event.type, event.data);
    });
  }
  
  async publish(eventType: string, data: any) {
    const event = {
      type: eventType,
      data,
      timestamp: new Date().toISOString(),
      id: crypto.randomUUID()
    };
    
    await this.redis.publish('events', JSON.stringify(event));
    
    // Store for event sourcing
    await prisma.eventLog.create({
      data: {
        eventType,
        payload: event,
        createdAt: new Date()
      }
    });
  }
  
  subscribe(eventType: string, handler: Function) {
    this.on(eventType, handler);
    this.subscriber.subscribe('events');
  }
}

// Usage
const eventBus = new EventBus();

// Order service listens for payment events
eventBus.subscribe('payment.completed', async (data) => {
  await OrderService.updateStatus(data.orderId, 'PAID');
  await NotificationService.sendOrderConfirmation(data.orderId);
});
```

### 4.2 Background Job Processing

```typescript
// lib/jobs/queue.ts
import Bull from 'bull';
import { Job } from 'bull';

// Create queues for different job types
export const emailQueue = new Bull('email', process.env.REDIS_URL!);
export const imageQueue = new Bull('image-processing', process.env.REDIS_URL!);
export const analyticsQueue = new Bull('analytics', process.env.REDIS_URL!);

// Email job processor
emailQueue.process(async (job: Job) => {
  const { to, subject, template, data } = job.data;
  
  try {
    await EmailService.send({
      to,
      subject,
      template,
      data
    });
    
    return { success: true, sentAt: new Date() };
  } catch (error) {
    throw error; // Bull will retry based on configuration
  }
});

// Image processing job
imageQueue.process(async (job: Job) => {
  const { imageUrl, sizes } = job.data;
  
  const processed = await ImageService.generateSizes(imageUrl, sizes);
  
  // Update listing with processed images
  await prisma.photo.update({
    where: { id: job.data.photoId },
    data: { 
      processedUrls: processed,
      status: 'PROCESSED'
    }
  });
  
  return processed;
});

// Configure job options
export const jobOptions = {
  removeOnComplete: 100, // Keep last 100 completed jobs
  removeOnFail: 500,     // Keep last 500 failed jobs
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000
  }
};

// Usage
export async function queueEmail(emailData: EmailData) {
  await emailQueue.add(emailData, jobOptions);
}
```

### 4.3 Caching Strategy

```typescript
// lib/cache/cache-service.ts
import { Redis } from 'ioredis';
import { LRUCache } from 'lru-cache';

class CacheService {
  private redis: Redis;
  private memoryCache: LRUCache<string, any>;
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!);
    this.memoryCache = new LRUCache({
      max: 500,
      ttl: 1000 * 60 * 5 // 5 minutes
    });
  }
  
  // Multi-layer caching
  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memCached = this.memoryCache.get(key);
    if (memCached) return memCached;
    
    // Check Redis
    const redisCached = await this.redis.get(key);
    if (redisCached) {
      const parsed = JSON.parse(redisCached);
      this.memoryCache.set(key, parsed);
      return parsed;
    }
    
    return null;
  }
  
  async set(key: string, value: any, ttlSeconds = 3600) {
    const serialized = JSON.stringify(value);
    
    // Set in both caches
    this.memoryCache.set(key, value);
    await this.redis.setex(key, ttlSeconds, serialized);
  }
  
  async invalidate(pattern: string) {
    // Clear from memory cache
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
      }
    }
    
    // Clear from Redis
    const keys = await this.redis.keys(pattern);
    if (keys.length) {
      await this.redis.del(...keys);
    }
  }
  
  // Cache-aside pattern implementation
  async getOrSet<T>(
    key: string, 
    factory: () => Promise<T>, 
    ttl = 3600
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) return cached;
    
    const fresh = await factory();
    await this.set(key, fresh, ttl);
    
    return fresh;
  }
}

export const cache = new CacheService();

// Usage in API routes
export async function getCachedListings(filters: any) {
  const cacheKey = `listings:${JSON.stringify(filters)}`;
  
  return cache.getOrSet(cacheKey, async () => {
    return prisma.listing.findMany({
      where: filters,
      include: {
        photos: true,
        seller: true
      }
    });
  }, 900); // 15 minutes
}
```

---

## 5. Infrastructure & DevOps

### 5.1 Container Configuration

```dockerfile
# Dockerfile.production
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### 5.2 Kubernetes Configuration

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cargoparts-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: cargoparts-api
  template:
    metadata:
      labels:
        app: cargoparts-api
    spec:
      containers:
      - name: api
        image: cargoparts/api:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-secret
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### 5.3 Monitoring Setup

```typescript
// lib/monitoring/metrics.ts
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { MeterProvider } from '@opentelemetry/sdk-metrics-base';
import * as Sentry from '@sentry/nextjs';

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request?.cookies) {
      delete event.request.cookies;
    }
    return event;
  }
});

// Prometheus metrics
const exporter = new PrometheusExporter({
  port: 9090,
});

const meter = new MeterProvider({
  exporter,
  interval: 1000,
}).getMeter('cargoparts-api');

// Custom metrics
export const metrics = {
  apiRequests: meter.createCounter('api_requests_total', {
    description: 'Total API requests'
  }),
  
  apiLatency: meter.createHistogram('api_latency_seconds', {
    description: 'API request latency'
  }),
  
  dbQueries: meter.createCounter('db_queries_total', {
    description: 'Total database queries'
  }),
  
  cacheHits: meter.createCounter('cache_hits_total', {
    description: 'Cache hit ratio'
  }),
  
  paymentProcessed: meter.createCounter('payments_processed_total', {
    description: 'Total payments processed'
  })
};

// Health check endpoint
export async function healthCheck() {
  const checks = {
    database: false,
    redis: false,
    storage: false,
  };
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }
  
  try {
    await redis.ping();
    checks.redis = true;
  } catch (error) {
    console.error('Redis health check failed:', error);
  }
  
  const allHealthy = Object.values(checks).every(v => v);
  
  return {
    status: allHealthy ? 'healthy' : 'degraded',
    checks,
    timestamp: new Date().toISOString()
  };
}
```

---

## 6. Saudi Arabia Backend Requirements

### 6.1 PDPL Compliance (Personal Data Protection Law)

```typescript
// lib/compliance/pdpl.ts
export class PDPLCompliance {
  // Data anonymization
  static anonymizeUser(user: User) {
    return {
      ...user,
      email: this.hashEmail(user.email),
      phone: this.hashPhone(user.phone),
      name: 'REDACTED',
      addresses: []
    };
  }
  
  // Right to be forgotten
  static async deleteUserData(userId: string) {
    // Start transaction
    await prisma.$transaction(async (tx) => {
      // Anonymize orders instead of deleting
      await tx.order.updateMany({
        where: { buyerId: userId },
        data: {
          buyerId: 'DELETED_USER',
          notes: null,
          address: null
        }
      });
      
      // Delete personal data
      await tx.address.deleteMany({ where: { userId } });
      await tx.session.deleteMany({ where: { userId } });
      await tx.notification.deleteMany({ where: { userId } });
      
      // Anonymize user record
      await tx.user.update({
        where: { id: userId },
        data: {
          email: `deleted_${Date.now()}@example.com`,
          phone: null,
          name: 'DELETED USER',
          status: 'DELETED'
        }
      });
    });
  }
  
  // Data export for GDPR/PDPL requests
  static async exportUserData(userId: string) {
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orders: true,
        addresses: true,
        reviews: true,
        activityLogs: {
          take: 100,
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    return {
      exportDate: new Date().toISOString(),
      data: userData,
      format: 'json'
    };
  }
}
```

### 6.2 SAMA Payment Regulations

```typescript
// lib/compliance/sama.ts
export class SAMACompliance {
  // Transaction monitoring
  static async monitorTransaction(payment: Payment) {
    // Check for suspicious patterns
    const flags = [];
    
    // Large transaction monitoring (>10,000 SAR)
    if (payment.amount > 10000) {
      flags.push('LARGE_TRANSACTION');
    }
    
    // Rapid transaction monitoring
    const recentTransactions = await prisma.payment.count({
      where: {
        orderId: payment.orderId,
        createdAt: {
          gte: new Date(Date.now() - 3600000) // Last hour
        }
      }
    });
    
    if (recentTransactions > 5) {
      flags.push('RAPID_TRANSACTIONS');
    }
    
    if (flags.length > 0) {
      await this.reportSuspiciousActivity(payment, flags);
    }
  }
  
  // KYC verification for sellers
  static async verifySeller(sellerId: string) {
    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      include: { verificationDocs: true }
    });
    
    const requiredDocs = [
      'COMMERCIAL_LICENSE',
      'TAX_CERTIFICATE',
      'BANK_STATEMENT'
    ];
    
    const hasAllDocs = requiredDocs.every(docType =>
      seller.verificationDocs.some(doc => 
        doc.type === docType && doc.status === 'APPROVED'
      )
    );
    
    if (hasAllDocs) {
      await prisma.seller.update({
        where: { id: sellerId },
        data: {
          verified: true,
          verifiedAt: new Date()
        }
      });
    }
    
    return hasAllDocs;
  }
}
```

### 6.3 Arabic Language Support

```typescript
// lib/i18n/arabic-support.ts
export class ArabicSupport {
  // Arabic text search optimization
  static normalizeArabicText(text: string): string {
    return text
      // Remove tashkeel (diacritics)
      .replace(/[\u064B-\u0652]/g, '')
      // Normalize alef variations
      .replace(/[أإآ]/g, 'ا')
      // Normalize taa marbouta
      .replace(/ة/g, 'ه')
      // Normalize yaa
      .replace(/ى/g, 'ي');
  }
  
  // RTL-aware text truncation
  static truncateArabic(text: string, length: number): string {
    if (text.length <= length) return text;
    
    // Don't break in middle of word
    const truncated = text.substring(0, length);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return lastSpace > 0 
      ? truncated.substring(0, lastSpace) + '...'
      : truncated + '...';
  }
  
  // Hijri calendar support
  static getHijriDate(date: Date = new Date()): string {
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }
}

// Database search with Arabic normalization
export async function searchArabicListings(query: string) {
  const normalized = ArabicSupport.normalizeArabicText(query);
  
  return prisma.$queryRaw`
    SELECT * FROM listings
    WHERE 
      regexp_replace(title_ar, '[\u064B-\u0652]', '', 'g') ILIKE ${'%' + normalized + '%'}
      OR regexp_replace(description, '[\u064B-\u0652]', '', 'g') ILIKE ${'%' + normalized + '%'}
    ORDER BY 
      CASE 
        WHEN title_ar ILIKE ${query + '%'} THEN 1
        WHEN title_ar ILIKE ${'%' + query + '%'} THEN 2
        ELSE 3
      END
    LIMIT 50
  `;
}
```

### 6.4 Local Payment Integration

```typescript
// lib/payments/mada.ts
export class MadaPaymentService {
  private readonly config = {
    entityId: process.env.MADA_ENTITY_ID,
    accessToken: process.env.HYPERPAY_ACCESS_TOKEN,
    baseUrl: 'https://eu-prod.oppwa.com/v1'
  };
  
  async createCheckout(amount: number, orderId: string) {
    const data = {
      entityId: this.config.entityId,
      amount: amount.toFixed(2),
      currency: 'SAR',
      paymentType: 'DB',
      merchantTransactionId: orderId,
      customer: {
        givenName: 'عميل',
        surname: 'كارقو بارتس'
      },
      billing: {
        country: 'SA'
      },
      customParameters: {
        SHOPPER_payment_mode: 'MADA'
      }
    };
    
    const response = await fetch(`${this.config.baseUrl}/checkouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(data)
    });
    
    return response.json();
  }
  
  async verifyPayment(checkoutId: string) {
    const response = await fetch(
      `${this.config.baseUrl}/checkouts/${checkoutId}/payment?entityId=${this.config.entityId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`
        }
      }
    );
    
    const result = await response.json();
    
    // Verify MADA-specific response codes
    const successCodes = ['000.000.000', '000.100.110'];
    
    return {
      success: successCodes.includes(result.result.code),
      transactionId: result.id,
      amount: parseFloat(result.amount),
      card: {
        bin: result.card?.bin,
        last4: result.card?.last4Digits,
        brand: result.paymentBrand
      }
    };
  }
}
```

### 6.5 SMS Integration (Unifonic)

```typescript
// lib/communication/unifonic.ts
export class UnifonicService {
  private readonly config = {
    appSid: process.env.UNIFONIC_APP_SID!,
    senderId: process.env.UNIFONIC_SENDER_ID!,
    baseUrl: 'https://el.cloud.unifonic.com/rest'
  };
  
  async sendSMS(to: string, message: string, isArabic = true) {
    // Format Saudi phone number
    const recipient = this.formatSaudiNumber(to);
    
    const data = {
      AppSid: this.config.appSid,
      SenderID: this.config.senderId,
      Recipient: recipient,
      Body: message,
      encoding: isArabic ? 'UTF8' : 'GSM7'
    };
    
    const response = await fetch(`${this.config.baseUrl}/SMS/Messages/Send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(data)
    });
    
    const result = await response.json();
    
    // Log for compliance
    await prisma.smsLog.create({
      data: {
        recipient,
        message: message.substring(0, 50) + '...',
        provider: 'UNIFONIC',
        status: result.success ? 'SENT' : 'FAILED',
        providerResponse: result,
        cost: result.cost || 0,
        createdAt: new Date()
      }
    });
    
    return result;
  }
  
  private formatSaudiNumber(phone: string): string {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Handle different formats
    if (digits.startsWith('966')) {
      return digits;
    } else if (digits.startsWith('05')) {
      return '966' + digits.substring(1);
    } else if (digits.startsWith('5')) {
      return '966' + digits;
    }
    
    return '966' + digits;
  }
  
  // Send OTP with rate limiting
  async sendOTP(phone: string, code: string) {
    // Check rate limit
    const recentOTPs = await prisma.otpCode.count({
      where: {
        phone,
        createdAt: {
          gte: new Date(Date.now() - 3600000) // Last hour
        }
      }
    });
    
    if (recentOTPs >= 5) {
      throw new Error('Too many OTP requests');
    }
    
    const message = `رمز التحقق الخاص بك في كارقو بارتس: ${code}
صالح لمدة 5 دقائق. لا تشارك هذا الرمز مع أحد.`;
    
    return this.sendSMS(phone, message, true);
  }
}
```

---

## 7. Performance Targets & Monitoring

### 7.1 Key Performance Indicators

| Metric | Current | Target | Implementation |
|--------|---------|--------|----------------|
| API Response Time (p95) | 800ms | < 200ms | Caching, Query Optimization |
| Database Query Time (p95) | 500ms | < 50ms | Indexing, Connection Pooling |
| Concurrent Users | 100 | 10,000 | Horizontal Scaling, Load Balancing |
| Cache Hit Rate | 0% | > 80% | Redis, CDN |
| Error Rate | 2% | < 0.1% | Error Handling, Monitoring |
| Uptime | 95% | 99.9% | Redundancy, Health Checks |

### 7.2 Load Testing Strategy

```typescript
// scripts/load-test.ts
import autocannon from 'autocannon';

const scenarios = [
  {
    name: 'Browse Listings',
    url: 'http://localhost:3000/api/v1/listings',
    connections: 100,
    duration: 30
  },
  {
    name: 'Search',
    url: 'http://localhost:3000/api/v1/search?q=toyota',
    connections: 50,
    duration: 30
  },
  {
    name: 'Checkout',
    url: 'http://localhost:3000/api/v1/orders',
    method: 'POST',
    connections: 20,
    duration: 30,
    body: JSON.stringify({
      items: [{ listingId: '123', quantity: 1 }]
    })
  }
];

async function runLoadTests() {
  for (const scenario of scenarios) {
    console.log(`Running: ${scenario.name}`);
    
    const result = await autocannon({
      ...scenario,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log(`Results for ${scenario.name}:`);
    console.log(`- Requests/sec: ${result.requests.average}`);
    console.log(`- Latency p95: ${result.latency.p95}`);
    console.log(`- Errors: ${result.errors}`);
  }
}
```

---

## 8. Implementation Timeline

### Phase 1: Critical Security & Database (Weeks 1-2)
- [ ] Implement authentication improvements (MFA, refresh tokens)
- [ ] Add rate limiting to all endpoints
- [ ] Optimize database indexes
- [ ] Set up connection pooling
- [ ] Implement input validation and sanitization

### Phase 2: API Architecture (Weeks 3-4)
- [ ] Implement API versioning
- [ ] Add request/response validation
- [ ] Create OpenAPI documentation
- [ ] Implement pagination
- [ ] Add compression middleware

### Phase 3: Caching & Background Jobs (Weeks 5-6)
- [ ] Set up Redis cluster
- [ ] Implement multi-layer caching
- [ ] Configure Bull queues
- [ ] Set up event-driven architecture
- [ ] Implement job monitoring

### Phase 4: Infrastructure Setup (Weeks 7-8)
- [ ] Containerize application
- [ ] Set up Kubernetes cluster
- [ ] Configure load balancers
- [ ] Implement monitoring (Prometheus, Grafana)
- [ ] Set up centralized logging

### Phase 5: Saudi Compliance (Weeks 9-10)
- [ ] Implement PDPL compliance features
- [ ] Add SAMA transaction monitoring
- [ ] Integrate Unifonic SMS
- [ ] Set up MADA payment gateway
- [ ] Implement Arabic search optimization

### Phase 6: Testing & Optimization (Weeks 11-12)
- [ ] Conduct load testing
- [ ] Perform security audit
- [ ] Optimize slow queries
- [ ] Fine-tune caching strategies
- [ ] Complete documentation

---

## 9. Cost Estimation

### Infrastructure Costs (Monthly)

| Service | Specification | Cost (USD) |
|---------|--------------|------------|
| AWS EKS Cluster | 3 nodes (t3.large) | $300 |
| RDS PostgreSQL | db.r5.large, Multi-AZ | $400 |
| ElastiCache Redis | cache.r6g.large | $150 |
| S3 Storage | 500GB + CDN | $100 |
| Load Balancer | Application LB | $30 |
| Monitoring | CloudWatch, Sentry | $100 |
| **Total** | | **$1,080** |

### Third-Party Services (Monthly)

| Service | Usage | Cost (USD) |
|---------|-------|------------|
| Tap Payments | 2.9% + 1 SAR per transaction | Variable |
| Unifonic SMS | 10,000 SMS/month | $200 |
| SendGrid Email | 100,000 emails/month | $90 |
| Sentry | Pro plan | $80 |
| **Total** | | **$370+** |

---

## 10. Risk Mitigation

### Technical Risks

1. **Database Performance Degradation**
   - Mitigation: Implement read replicas, query optimization
   - Monitoring: Set up slow query alerts

2. **Payment Gateway Failures**
   - Mitigation: Implement fallback providers
   - Monitoring: Real-time payment success rate tracking

3. **DDoS Attacks**
   - Mitigation: CloudFlare, rate limiting, IP blocking
   - Monitoring: Traffic pattern analysis

### Compliance Risks

1. **PDPL Non-Compliance**
   - Mitigation: Regular audits, data encryption
   - Monitoring: Access logs, data export capabilities

2. **SAMA Regulations**
   - Mitigation: Transaction monitoring, KYC verification
   - Monitoring: Automated compliance reporting

---

## Conclusion

This comprehensive backend production plan transforms CargoParts from an MVP to a production-ready, scalable e-commerce platform. The phased approach ensures critical security and performance issues are addressed first, while gradually building towards a fully optimized, compliant system capable of serving the Saudi Arabian market at scale.

Key success factors:
- **Security First**: Every component implements security best practices
- **Performance Optimized**: Sub-200ms response times through caching and optimization
- **Saudi-Compliant**: Full compliance with local regulations and requirements
- **Scalable Architecture**: Horizontal scaling capability to handle growth
- **Monitored & Observable**: Comprehensive monitoring and alerting

The total implementation timeline is 12 weeks with an estimated monthly operational cost of ~$1,450 USD, providing a robust foundation for a production e-commerce marketplace.