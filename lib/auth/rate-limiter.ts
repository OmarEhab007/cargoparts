import { env } from '@/lib/env.mjs';
import { NextRequest } from 'next/server';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Check if request is within rate limit
   */
  async checkLimit(req: NextRequest): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  }> {
    const key = this.config.keyGenerator ? this.config.keyGenerator(req) : this.getDefaultKey(req);
    const now = Date.now();
    
    let entry = rateLimitStore.get(key);
    
    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      entry = {
        count: 0,
        resetTime: now + this.config.windowMs,
      };
      rateLimitStore.set(key, entry);
    }

    const remaining = Math.max(0, this.config.maxRequests - entry.count);
    const allowed = entry.count < this.config.maxRequests;

    if (allowed) {
      entry.count++;
      rateLimitStore.set(key, entry);
    }

    return {
      allowed,
      remaining: allowed ? remaining - 1 : 0,
      resetTime: entry.resetTime,
      retryAfter: allowed ? undefined : Math.ceil((entry.resetTime - now) / 1000),
    };
  }

  /**
   * Record successful request (if skipSuccessfulRequests is enabled)
   */
  recordSuccess(req: NextRequest): void {
    if (!this.config.skipSuccessfulRequests) return;

    const key = this.config.keyGenerator ? this.config.keyGenerator(req) : this.getDefaultKey(req);
    const entry = rateLimitStore.get(key);
    
    if (entry && entry.count > 0) {
      entry.count--;
      rateLimitStore.set(key, entry);
    }
  }

  private getDefaultKey(req: NextRequest): string {
    // Use IP address and user agent for default key
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    return `${ip}:${userAgent}`;
  }
}

// Pre-configured rate limiters
export const otpRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: env.RATE_LIMIT_OTP_PER_HOUR,
  keyGenerator: (req) => {
    // Rate limit by email for OTP requests
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    return `otp:${ip}`;
  },
});

export const loginRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: env.RATE_LIMIT_LOGIN_PER_HOUR,
  keyGenerator: (req) => {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    return `login:${ip}`;
  },
});

export const generalRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  keyGenerator: (req) => {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    return `general:${ip}`;
  },
});

/**
 * Rate limiting middleware
 */
export function withRateLimit(rateLimiter: RateLimiter) {
  return async (req: NextRequest): Promise<Response | null> => {
    const result = await rateLimiter.checkLimit(req);

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.',
            retryAfter: result.retryAfter,
          },
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': rateLimiter['config'].maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
            'Retry-After': result.retryAfter?.toString() || '',
          },
        }
      );
    }

    return null; // Continue to next middleware/handler
  };
}

/**
 * Apply rate limit headers to response
 */
export function applyRateLimitHeaders(
  response: Response,
  result: { remaining: number; resetTime: number; retryAfter?: number },
  maxRequests: number
): Response {
  response.headers.set('X-RateLimit-Limit', maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000).toString());
  
  if (result.retryAfter) {
    response.headers.set('Retry-After', result.retryAfter.toString());
  }

  return response;
}