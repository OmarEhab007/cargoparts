import { NextRequest, NextResponse } from 'next/server';
import { JwtService, type SessionData } from './jwt';
import { SessionService } from './session';
import type { Role } from '@prisma/client';

export interface AuthContext {
  user: SessionData['user'];
  sessionId: string;
  isAuthenticated: boolean;
}

export interface AuthOptions {
  requiredRoles?: Role[];
  allowGuest?: boolean;
  redirectTo?: string;
}

/**
 * Authentication middleware for API routes
 */
export async function withAuth(
  request: NextRequest,
  options: AuthOptions = {}
): Promise<{ context: AuthContext | null; response?: NextResponse }> {
  const { requiredRoles = [], allowGuest = false, redirectTo } = options;

  try {
    // Extract token from cookies or Authorization header
    let token: string | null = null;

    // First try cookies (for same-origin requests)
    const cookieToken = request.cookies.get('cargoparts-session')?.value;
    if (cookieToken) {
      token = cookieToken;
    } else {
      // Fallback to Authorization header (for API requests)
      const authHeader = request.headers.get('Authorization');
      token = JwtService.extractTokenFromHeader(authHeader);
    }

    if (!token) {
      if (allowGuest) {
        return { context: null };
      }
      
      if (redirectTo) {
        return {
          context: null,
          response: NextResponse.redirect(new URL(redirectTo, request.url)),
        };
      }

      return {
        context: null,
        response: NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        ),
      };
    }

    // Validate session
    const sessionData = await SessionService.validateSession(token);

    if (!sessionData) {
      if (allowGuest) {
        return { context: null };
      }

      if (redirectTo) {
        return {
          context: null,
          response: NextResponse.redirect(new URL(redirectTo, request.url)),
        };
      }

      return {
        context: null,
        response: NextResponse.json(
          { error: 'Invalid or expired session' },
          { status: 401 }
        ),
      };
    }

    // Check user status
    if (sessionData.user.status === 'BANNED') {
      return {
        context: null,
        response: NextResponse.json(
          { error: 'Account has been banned' },
          { status: 403 }
        ),
      };
    }

    if (sessionData.user.status === 'INACTIVE') {
      return {
        context: null,
        response: NextResponse.json(
          { error: 'Account is inactive' },
          { status: 403 }
        ),
      };
    }

    // Check role requirements
    if (requiredRoles.length > 0 && !requiredRoles.includes(sessionData.user.role as Role)) {
      return {
        context: null,
        response: NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        ),
      };
    }

    // Return authenticated context
    const context: AuthContext = {
      user: sessionData.user,
      sessionId: sessionData.sessionId,
      isAuthenticated: true,
    };

    return { context };
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (allowGuest) {
      return { context: null };
    }

    return {
      context: null,
      response: NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Extract user context from request (without requiring authentication)
 */
export async function getUserContext(request: NextRequest): Promise<AuthContext | null> {
  const { context } = await withAuth(request, { allowGuest: true });
  return context;
}

/**
 * Require authentication
 */
export async function requireAuth(
  request: NextRequest,
  options: Omit<AuthOptions, 'allowGuest'> = {}
): Promise<{ context: AuthContext; response?: NextResponse }> {
  const { context, response } = await withAuth(request, { ...options, allowGuest: false });
  
  if (!context) {
    throw new Error('Authentication required but context is null');
  }

  return { context: context as AuthContext, response };
}

/**
 * Require specific role
 */
export async function requireRole(
  request: NextRequest,
  requiredRoles: Role | Role[],
  options: Omit<AuthOptions, 'requiredRoles'> = {}
): Promise<{ context: AuthContext; response?: NextResponse }> {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  return requireAuth(request, {
    ...options,
    requiredRoles: roles,
  });
}

/**
 * Require admin role
 */
export async function requireAdmin(
  request: NextRequest,
  options: Omit<AuthOptions, 'requiredRoles'> = {}
): Promise<{ context: AuthContext; response?: NextResponse }> {
  return requireRole(request, ['ADMIN', 'SUPER_ADMIN'], options);
}

/**
 * Require seller role
 */
export async function requireSeller(
  request: NextRequest,
  options: Omit<AuthOptions, 'requiredRoles'> = {}
): Promise<{ context: AuthContext; response?: NextResponse }> {
  return requireRole(request, 'SELLER', options);
}

/**
 * Get IP address from request
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  const connection = request.headers.get('x-connecting-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (real) {
    return real.trim();
  }

  if (connection) {
    return connection.trim();
  }

  return 'unknown';
}

/**
 * Get user agent from request
 */
export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Create auth response with tokens
 */
export function createAuthResponse(
  data: any,
  tokens: { token: string; refreshToken: string },
  options: { status?: number } = {}
): NextResponse {
  const response = NextResponse.json(data, { status: options.status || 200 });

  // Set secure cookies
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };

  response.cookies.set('cargoparts-session', tokens.token, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  response.cookies.set('cargoparts-session_refresh', tokens.refreshToken, {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });

  return response;
}

/**
 * Clear auth cookies
 */
export function clearAuthResponse(data: any, options: { status?: number } = {}): NextResponse {
  const response = NextResponse.json(data, { status: options.status || 200 });

  response.cookies.delete('cargoparts-session');
  response.cookies.delete('cargoparts-session_refresh');

  return response;
}

/**
 * Rate limiting by IP
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  ip: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): { isLimited: boolean; remainingRequests: number; resetTime: number } {
  const now = Date.now();
  const key = `${ip}:${Math.floor(now / windowMs)}`;
  
  const current = rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs };
  
  if (now > current.resetTime) {
    // Reset window
    current.count = 0;
    current.resetTime = now + windowMs;
  }
  
  current.count++;
  rateLimitStore.set(key, current);
  
  // Clean up old entries
  for (const [storeKey, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(storeKey);
    }
  }
  
  return {
    isLimited: current.count > maxRequests,
    remainingRequests: Math.max(0, maxRequests - current.count),
    resetTime: current.resetTime,
  };
}