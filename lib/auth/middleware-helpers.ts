import { NextRequest, NextResponse } from 'next/server';
import { SessionService } from './session';
import { AuthErrors, createErrorResponse } from './errors';
import type { Role } from '@prisma/client';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    role: Role;
    avatar: string | null;
    status: string;
  };
  sessionId?: string;
}

/**
 * Middleware to require authentication
 */
export function requireAuth() {
  return async (req: NextRequest): Promise<Response | null> => {
    const session = await SessionService.getCurrentSession();
    
    if (!session) {
      return createErrorResponse(AuthErrors.UNAUTHORIZED());
    }

    // Add user data to request (this would be used in route handlers)
    (req as AuthenticatedRequest).user = session.user;
    (req as AuthenticatedRequest).sessionId = session.sessionId;
    
    return null; // Continue to next middleware/handler
  };
}

/**
 * Middleware to require specific role
 */
export function requireRole(allowedRoles: Role[]) {
  return async (req: NextRequest): Promise<Response | null> => {
    const session = await SessionService.getCurrentSession();
    
    if (!session) {
      return createErrorResponse(AuthErrors.UNAUTHORIZED());
    }

    if (!allowedRoles.includes(session.user.role)) {
      return createErrorResponse(AuthErrors.UNAUTHORIZED());
    }

    // Add user data to request
    (req as AuthenticatedRequest).user = session.user;
    (req as AuthenticatedRequest).sessionId = session.sessionId;
    
    return null; // Continue to next middleware/handler
  };
}

/**
 * Middleware to require admin role (ADMIN or SUPER_ADMIN)
 */
export function requireAdmin() {
  return requireRole(['ADMIN', 'SUPER_ADMIN']);
}

/**
 * Middleware to require super admin role
 */
export function requireSuperAdmin() {
  return requireRole(['SUPER_ADMIN']);
}

/**
 * Middleware to require seller role or admin
 */
export function requireSeller() {
  return requireRole(['SELLER', 'ADMIN', 'SUPER_ADMIN']);
}

/**
 * Optional auth middleware - adds user data if authenticated, but doesn't block
 */
export function optionalAuth() {
  return async (req: NextRequest): Promise<Response | null> => {
    const session = await SessionService.getCurrentSession();
    
    if (session) {
      (req as AuthenticatedRequest).user = session.user;
      (req as AuthenticatedRequest).sessionId = session.sessionId;
    }
    
    return null; // Continue to next middleware/handler
  };
}

/**
 * Combine multiple middleware functions
 */
export function combineMiddleware(...middlewares: Array<(req: NextRequest) => Promise<Response | null>>) {
  return async (req: NextRequest): Promise<Response | null> => {
    for (const middleware of middlewares) {
      const response = await middleware(req);
      if (response) {
        return response; // Stop execution if middleware returns a response
      }
    }
    return null;
  };
}

/**
 * Helper to get authenticated user from request
 */
export function getAuthenticatedUser(req: NextRequest) {
  return (req as AuthenticatedRequest).user;
}

/**
 * Helper to get session ID from request
 */
export function getSessionId(req: NextRequest) {
  return (req as AuthenticatedRequest).sessionId;
}

/**
 * Check if user has specific permissions
 */
export function hasPermission(user: AuthenticatedRequest['user'], permission: string): boolean {
  if (!user) return false;

  // Super admin has all permissions
  if (user.role === 'SUPER_ADMIN') return true;

  // Admin has most permissions
  if (user.role === 'ADMIN') {
    const adminPermissions = [
      'users.read',
      'users.update_status',
      'sellers.read',
      'sellers.approve',
      'listings.read',
      'listings.moderate',
      'orders.read',
      'orders.manage',
      'analytics.read',
    ];
    return adminPermissions.includes(permission);
  }

  // Seller permissions
  if (user.role === 'SELLER') {
    const sellerPermissions = [
      'listings.create',
      'listings.update_own',
      'listings.delete_own',
      'orders.read_own',
      'analytics.read_own',
    ];
    return sellerPermissions.includes(permission);
  }

  // Buyer permissions
  if (user.role === 'BUYER') {
    const buyerPermissions = [
      'listings.read',
      'orders.create',
      'orders.read_own',
    ];
    return buyerPermissions.includes(permission);
  }

  return false;
}

/**
 * Middleware to check specific permission
 */
export function requirePermission(permission: string) {
  return async (req: NextRequest): Promise<Response | null> => {
    const authResponse = await requireAuth()(req);
    if (authResponse) return authResponse;

    const user = getAuthenticatedUser(req);
    if (!hasPermission(user, permission)) {
      return createErrorResponse(AuthErrors.UNAUTHORIZED());
    }

    return null;
  };
}

/**
 * Rate limiting by user ID
 */
export function userRateLimit(maxRequests: number, windowMs: number) {
  const requestCounts = new Map<string, { count: number; resetTime: number }>();

  return async (req: NextRequest): Promise<Response | null> => {
    const user = getAuthenticatedUser(req);
    if (!user) return null; // Skip rate limiting for unauthenticated requests

    const now = Date.now();
    const key = user.id;
    let entry = requestCounts.get(key);

    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + windowMs,
      };
      requestCounts.set(key, entry);
    }

    if (entry.count >= maxRequests) {
      return createErrorResponse(
        AuthErrors.RATE_LIMIT_EXCEEDED(Math.ceil((entry.resetTime - now) / 1000))
      );
    }

    entry.count++;
    return null;
  };
}