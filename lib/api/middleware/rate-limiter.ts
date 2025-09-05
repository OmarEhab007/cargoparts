import { NextRequest, NextResponse } from 'next/server';
import { Redis } from 'ioredis';

// Initialize Redis connection
const redis = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL)
  : null;

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: NextRequest) => string;
  skip?: (req: NextRequest) => boolean;
  handler?: (req: NextRequest) => NextResponse;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
}

/**
 * Rate limiter middleware for API routes
 */
export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes default
    max = 100,
    message = 'Too many requests, please try again later.',
    keyGenerator = (req) => req.ip || 'anonymous',
    skip = () => false,
    handler
  } = options;

  return async function rateLimitMiddleware(
    req: NextRequest,
    next?: () => Promise<NextResponse>
  ): Promise<NextResponse | null> {
    // Skip rate limiting if configured
    if (skip(req)) {
      return next ? await next() : null;
    }

    // Fallback to in-memory if Redis is not available
    if (!redis) {
      console.warn('Redis not configured, rate limiting disabled');
      return next ? await next() : null;
    }

    const key = `rate_limit:${keyGenerator(req)}`;
    const now = Date.now();
    const window = Math.floor(now / windowMs);
    const redisKey = `${key}:${window}`;

    try {
      // Increment counter
      const current = await redis.incr(redisKey);

      // Set expiry on first request in window
      if (current === 1) {
        await redis.expire(redisKey, Math.ceil(windowMs / 1000));
      }

      // Calculate rate limit info
      const ttl = await redis.ttl(redisKey);
      const resetTime = new Date(now + ttl * 1000);
      
      const info: RateLimitInfo = {
        limit: max,
        remaining: Math.max(0, max - current),
        reset: resetTime
      };

      // Check if limit exceeded
      if (current > max) {
        // Use custom handler if provided
        if (handler) {
          return handler(req);
        }

        // Default rate limit response
        return NextResponse.json(
          { 
            error: 'Too Many Requests',
            message,
            retryAfter: ttl
          },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': String(info.limit),
              'X-RateLimit-Remaining': String(info.remaining),
              'X-RateLimit-Reset': info.reset.toISOString(),
              'Retry-After': String(ttl)
            }
          }
        );
      }

      // Add rate limit headers to successful responses
      if (next) {
        const response = await next();
        response.headers.set('X-RateLimit-Limit', String(info.limit));
        response.headers.set('X-RateLimit-Remaining', String(info.remaining));
        response.headers.set('X-RateLimit-Reset', info.reset.toISOString());
        return response;
      }

      return null;
    } catch (error) {
      console.error('Rate limiting error:', error);
      // Fail open - allow request if rate limiting fails
      return next ? await next() : null;
    }
  };
}

/**
 * Predefined rate limiters for different API endpoints
 */
export const rateLimiters = {
  // Strict rate limiting for auth endpoints
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many authentication attempts, please try again later.',
    keyGenerator: (req) => {
      const forwarded = req.headers.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0] : req.ip;
      return `auth:${ip}`;
    }
  }),

  // Standard API rate limiting
  api: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise IP
      const userId = req.headers.get('x-user-id');
      const ip = req.ip || 'anonymous';
      return userId ? `user:${userId}` : `ip:${ip}`;
    }
  }),

  // Search endpoint rate limiting
  search: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30,
    message: 'Too many search requests, please slow down.',
    keyGenerator: (req) => `search:${req.ip}`
  }),

  // Order creation rate limiting
  orders: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: 'Too many orders, please wait before placing another order.',
    keyGenerator: (req) => {
      const userId = req.headers.get('x-user-id');
      return userId ? `orders:${userId}` : `orders:${req.ip}`;
    }
  }),

  // Payment processing rate limiting
  payments: rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5,
    message: 'Too many payment attempts, please try again later.',
    keyGenerator: (req) => {
      const userId = req.headers.get('x-user-id');
      return userId ? `payments:${userId}` : `payments:${req.ip}`;
    }
  }),

  // SMS/OTP rate limiting
  otp: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: 'Too many OTP requests, please try again later.',
    keyGenerator: (req) => {
      const phone = req.headers.get('x-phone-number');
      const ip = req.ip || 'anonymous';
      return phone ? `otp:${phone}` : `otp:${ip}`;
    }
  }),

  // File upload rate limiting
  upload: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    message: 'Too many file uploads, please try again later.',
    keyGenerator: (req) => {
      const userId = req.headers.get('x-user-id');
      return userId ? `upload:${userId}` : `upload:${req.ip}`;
    }
  })
};

/**
 * Distributed rate limiting with sliding window
 */
export class SlidingWindowRateLimiter {
  private redis: Redis;
  private windowMs: number;
  private max: number;

  constructor(redis: Redis, windowMs: number, max: number) {
    this.redis = redis;
    this.windowMs = windowMs;
    this.max = max;
  }

  async check(key: string): Promise<{ allowed: boolean; info: RateLimitInfo }> {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Remove old entries
    await this.redis.zremrangebyscore(key, '-inf', windowStart);

    // Count requests in current window
    const count = await this.redis.zcard(key);

    if (count < this.max) {
      // Add current request
      await this.redis.zadd(key, now, `${now}-${Math.random()}`);
      await this.redis.expire(key, Math.ceil(this.windowMs / 1000));

      return {
        allowed: true,
        info: {
          limit: this.max,
          remaining: this.max - count - 1,
          reset: new Date(now + this.windowMs)
        }
      };
    }

    // Get oldest entry to determine reset time
    const oldest = await this.redis.zrange(key, 0, 0, 'WITHSCORES');
    const resetTime = oldest.length > 1 
      ? new Date(parseInt(oldest[1]) + this.windowMs)
      : new Date(now + this.windowMs);

    return {
      allowed: false,
      info: {
        limit: this.max,
        remaining: 0,
        reset: resetTime
      }
    };
  }
}

/**
 * IP-based rate limiting with ban functionality
 */
export class IPRateLimiter {
  private redis: Redis;
  private banThreshold: number;
  private banDurationMs: number;

  constructor(
    redis: Redis,
    banThreshold = 10,
    banDurationMs = 24 * 60 * 60 * 1000 // 24 hours
  ) {
    this.redis = redis;
    this.banThreshold = banThreshold;
    this.banDurationMs = banDurationMs;
  }

  async checkIP(ip: string): Promise<{ banned: boolean; violations: number }> {
    const banKey = `banned:${ip}`;
    const violationKey = `violations:${ip}`;

    // Check if IP is banned
    const banned = await this.redis.get(banKey);
    if (banned) {
      return { banned: true, violations: parseInt(banned) };
    }

    // Get violation count
    const violations = await this.redis.get(violationKey);
    const violationCount = violations ? parseInt(violations) : 0;

    return { banned: false, violations: violationCount };
  }

  async recordViolation(ip: string): Promise<void> {
    const violationKey = `violations:${ip}`;
    const banKey = `banned:${ip}`;

    // Increment violation counter
    const violations = await this.redis.incr(violationKey);
    
    // Set expiry for violation counter
    if (violations === 1) {
      await this.redis.expire(violationKey, 3600); // 1 hour
    }

    // Ban if threshold exceeded
    if (violations >= this.banThreshold) {
      await this.redis.setex(
        banKey,
        Math.ceil(this.banDurationMs / 1000),
        violations.toString()
      );
      
      // Log ban for monitoring
      console.warn(`IP ${ip} banned for excessive violations: ${violations}`);
    }
  }

  async unbanIP(ip: string): Promise<void> {
    const banKey = `banned:${ip}`;
    const violationKey = `violations:${ip}`;
    
    await Promise.all([
      this.redis.del(banKey),
      this.redis.del(violationKey)
    ]);
  }
}