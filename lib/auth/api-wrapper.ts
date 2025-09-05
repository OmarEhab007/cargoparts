import { NextRequest, NextResponse } from 'next/server';
import { SessionService } from './session';
import { AuthErrors, createErrorResponse, handleUnknownError } from './errors';
import { z } from 'zod';
import type { Role } from '@prisma/client';

export interface AuthenticatedContext {
  user: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    role: Role;
    avatar: string | null;
    status: string;
  };
  sessionId: string;
}

interface ApiWrapperOptions {
  requireAuth?: boolean;
  allowedRoles?: Role[];
  requireSeller?: boolean;
  requireAdmin?: boolean;
  rateLimiter?: {
    maxRequests: number;
    windowMs: number;
  };
}

type ApiHandler<T = any> = (
  request: NextRequest,
  context: AuthenticatedContext | null,
  params?: T
) => Promise<NextResponse>;

type ApiHandlerWithParams<T = any> = (
  request: NextRequest,
  props: { params: Promise<T> }
) => Promise<NextResponse>;

// Rate limiting storage
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Generic API wrapper with authentication, error handling, and validation
 */
export function withApiAuth<T = any>(
  handler: ApiHandler<T>,
  options: ApiWrapperOptions = {}
): ApiHandlerWithParams<T> {
  return async (request: NextRequest, props: { params: Promise<T> }) => {
    try {
      let context: AuthenticatedContext | null = null;

      // Authentication check
      if (options.requireAuth || options.requireSeller || options.requireAdmin) {
        const session = await SessionService.getCurrentSession();
        
        if (!session) {
          return createErrorResponse(AuthErrors.UNAUTHORIZED());
        }

        // Role-based access control
        if (options.requireAdmin && !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
          return createErrorResponse(AuthErrors.UNAUTHORIZED());
        }

        if (options.requireSeller && !['SELLER', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
          return createErrorResponse(AuthErrors.UNAUTHORIZED());
        }

        if (options.allowedRoles && !options.allowedRoles.includes(session.user.role)) {
          return createErrorResponse(AuthErrors.UNAUTHORIZED());
        }

        // Rate limiting per user
        if (options.rateLimiter) {
          const now = Date.now();
          const key = `${session.user.id}-${request.url}`;
          let entry = rateLimitMap.get(key);

          if (!entry || now > entry.resetTime) {
            entry = {
              count: 0,
              resetTime: now + options.rateLimiter.windowMs,
            };
            rateLimitMap.set(key, entry);
          }

          if (entry.count >= options.rateLimiter.maxRequests) {
            return createErrorResponse(
              AuthErrors.RATE_LIMIT_EXCEEDED(Math.ceil((entry.resetTime - now) / 1000))
            );
          }

          entry.count++;
        }

        context = {
          user: session.user,
          sessionId: session.sessionId,
        };
      }

      // Resolve params if provided
      const resolvedParams = props.params ? await props.params : undefined;

      // Call the actual handler
      return await handler(request, context, resolvedParams);

    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid request parameters',
              details: error.issues,
            },
          },
          { status: 400 }
        );
      }

      // Handle known auth errors
      const authError = handleUnknownError(error);
      return createErrorResponse(authError);
    }
  };
}

/**
 * Wrapper specifically for seller endpoints
 * Ensures user is authenticated and has seller permissions
 * Also validates that the seller ID in params matches the authenticated user's seller profile
 */
export function withSellerAuth<T extends { id: string }>(
  handler: ApiHandler<T>,
  options: Omit<ApiWrapperOptions, 'requireSeller'> = {}
): ApiHandlerWithParams<T> {
  return withApiAuth(
    async (request: NextRequest, context: AuthenticatedContext | null, params?: T) => {
      if (!context) {
        return createErrorResponse(AuthErrors.UNAUTHORIZED());
      }

      // For seller endpoints, validate seller ID matches unless admin
      if (params?.id && !['ADMIN', 'SUPER_ADMIN'].includes(context.user.role)) {
        // Get seller profile for the user
        const { prisma } = await import('@/lib/db/prisma');
        const seller = await prisma.seller.findUnique({
          where: { userId: context.user.id },
        });

        if (!seller || seller.id !== params.id) {
          return createErrorResponse(AuthErrors.UNAUTHORIZED());
        }
      }

      return handler(request, context, params);
    },
    { ...options, requireSeller: true }
  );
}

/**
 * Wrapper for admin-only endpoints
 */
export function withAdminAuth<T = any>(
  handler: ApiHandler<T>,
  options: Omit<ApiWrapperOptions, 'requireAdmin'> = {}
): ApiHandlerWithParams<T> {
  return withApiAuth(handler, { ...options, requireAdmin: true });
}

/**
 * Helper to extract and validate request body with Zod schema
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw error;
    }
    throw AuthErrors.INVALID_INPUT('Invalid request body', 'محتوى الطلب غير صحيح');
  }
}

/**
 * Helper to validate query parameters with Zod schema
 */
export function validateQueryParams<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): T {
  const searchParams = request.nextUrl.searchParams;
  const params: Record<string, any> = {};
  
  searchParams.forEach((value, key) => {
    // Handle array parameters (e.g., ?status=active&status=pending)
    if (params[key]) {
      if (Array.isArray(params[key])) {
        params[key].push(value);
      } else {
        params[key] = [params[key], value];
      }
    } else {
      params[key] = value;
    }
  });

  return schema.parse(params);
}

/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    messageAr?: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

/**
 * Create a standard success response
 */
export function createApiSuccessResponse<T>(
  data: T,
  meta?: ApiResponse['meta'],
  status: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta && { meta }),
    } as ApiResponse<T>,
    { status }
  );
}

/**
 * Create a standard error response (wrapper around AuthError)
 */
export function createApiErrorResponse(
  code: string,
  message: string,
  messageAr?: string,
  status: number = 400,
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        messageAr,
        details,
      },
    } as ApiResponse,
    { status }
  );
}

// Re-export from existing response helpers for convenience
export { 
  createSuccessResponse, 
  createPaginatedResponse,
  handleError,
  createNotFoundResponse,
  createUnauthorizedResponse,
  createForbiddenResponse
} from '@/lib/api/response';

/**
 * Cleanup old rate limit entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // Clean up every minute