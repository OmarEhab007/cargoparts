import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { 
  ApiResponse, 
  PaginatedResponse, 
  ValidationError, 
  API_ERROR_CODES, 
  HTTP_STATUS,
  ApiErrorCode 
} from './types';

/**
 * Create a successful API response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = HTTP_STATUS.OK
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };

  return NextResponse.json(response, { status });
}

/**
 * Create a paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): NextResponse {
  const totalPages = Math.ceil(total / limit);
  
  const response: PaginatedResponse<T> = {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    },
  };

  return NextResponse.json(response, { status: HTTP_STATUS.OK });
}

/**
 * Create an error response
 */
export function createErrorResponse(
  code: ApiErrorCode,
  message: string,
  messageAr?: string,
  details?: Record<string, unknown>,
  statusCode: number = HTTP_STATUS.BAD_REQUEST
): NextResponse {
  // const error: ApiError = {
  //   code,
  //   message,
  //   messageAr,
  //   details,
  //   statusCode,
  // };

  const response: ApiResponse = {
    success: false,
    error: message,
    details: {
      code,
      messageAr,
      ...details,
    },
  };

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Create validation error response
 */
export function createValidationErrorResponse(
  errors: ValidationError[],
  message: string = 'Validation failed'
): NextResponse {
  return createErrorResponse(
    API_ERROR_CODES.VALIDATION_ERROR,
    message,
    'فشل في التحقق من البيانات',
    { validationErrors: errors },
    HTTP_STATUS.UNPROCESSABLE_ENTITY
  );
}

/**
 * Handle Zod validation errors
 */
export function handleZodError(error: ZodError): NextResponse {
  const validationErrors: ValidationError[] = error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }));

  return createValidationErrorResponse(
    validationErrors,
    'Invalid input data'
  );
}

/**
 * Handle Prisma errors
 */
export function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): NextResponse {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = error.meta?.target as string[] | undefined;
      return createErrorResponse(
        API_ERROR_CODES.ALREADY_EXISTS,
        `Record with this ${field?.join(', ') || 'value'} already exists`,
        `سجل بهذه ${field?.join(', ') || 'القيمة'} موجود بالفعل`,
        { field },
        HTTP_STATUS.CONFLICT
      );

    case 'P2025':
      // Record not found
      return createErrorResponse(
        API_ERROR_CODES.NOT_FOUND,
        'Record not found',
        'السجل غير موجود',
        undefined,
        HTTP_STATUS.NOT_FOUND
      );

    case 'P2003':
      // Foreign key constraint violation
      return createErrorResponse(
        API_ERROR_CODES.RESOURCE_CONFLICT,
        'Cannot delete record due to related data',
        'لا يمكن حذف السجل بسبب وجود بيانات مرتبطة',
        undefined,
        HTTP_STATUS.CONFLICT
      );

    case 'P2023':
      // Invalid ID
      return createErrorResponse(
        API_ERROR_CODES.INVALID_INPUT,
        'Invalid ID format',
        'تنسيق المعرف غير صحيح',
        undefined,
        HTTP_STATUS.BAD_REQUEST
      );

    default:
      console.error('Unhandled Prisma error:', error);
      return createErrorResponse(
        API_ERROR_CODES.DATABASE_ERROR,
        'Database operation failed',
        'فشل في عملية قاعدة البيانات',
        undefined,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
  }
}

/**
 * Handle general application errors
 */
export function handleApplicationError(error: Error): NextResponse {
  console.error('Application error:', error);

  // Check for known error patterns
  const errorMessage = error.message.toLowerCase();

  // Authentication errors
  if (errorMessage.includes('unauthorized') || errorMessage.includes('authentication')) {
    return createErrorResponse(
      API_ERROR_CODES.UNAUTHORIZED,
      error.message,
      'غير مصرح',
      undefined,
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  // Forbidden errors
  if (errorMessage.includes('forbidden') || errorMessage.includes('permission')) {
    return createErrorResponse(
      API_ERROR_CODES.FORBIDDEN,
      error.message,
      'محظور',
      undefined,
      HTTP_STATUS.FORBIDDEN
    );
  }

  // Not found errors
  if (errorMessage.includes('not found')) {
    return createErrorResponse(
      API_ERROR_CODES.NOT_FOUND,
      error.message,
      'غير موجود',
      undefined,
      HTTP_STATUS.NOT_FOUND
    );
  }

  // Already exists errors
  if (errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
    return createErrorResponse(
      API_ERROR_CODES.ALREADY_EXISTS,
      error.message,
      'موجود بالفعل',
      undefined,
      HTTP_STATUS.CONFLICT
    );
  }

  // Rate limit errors
  if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
    return createErrorResponse(
      API_ERROR_CODES.RATE_LIMIT_EXCEEDED,
      error.message,
      'تم تجاوز الحد المسموح',
      undefined,
      HTTP_STATUS.TOO_MANY_REQUESTS
    );
  }

  // Business logic errors
  if (errorMessage.includes('insufficient balance')) {
    return createErrorResponse(
      API_ERROR_CODES.INSUFFICIENT_BALANCE,
      error.message,
      'رصيد غير كافي',
      undefined,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  if (errorMessage.includes('out of stock')) {
    return createErrorResponse(
      API_ERROR_CODES.PRODUCT_OUT_OF_STOCK,
      error.message,
      'المنتج غير متوفر',
      undefined,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  if (errorMessage.includes('seller not verified')) {
    return createErrorResponse(
      API_ERROR_CODES.SELLER_NOT_VERIFIED,
      error.message,
      'البائع غير معتمد',
      undefined,
      HTTP_STATUS.FORBIDDEN
    );
  }

  // Default to internal server error
  return createErrorResponse(
    API_ERROR_CODES.INTERNAL_SERVER_ERROR,
    'An unexpected error occurred',
    'حدث خطأ غير متوقع',
    process.env.NODE_ENV === 'development' ? error.stack : undefined,
    HTTP_STATUS.INTERNAL_SERVER_ERROR
  );
}

/**
 * Main error handler that determines the type of error and handles it appropriately
 */
export function handleError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return handleZodError(error);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error);
  }

  if (error instanceof Error) {
    return handleApplicationError(error);
  }

  // Unknown error type
  console.error('Unknown error type:', error);
  return createErrorResponse(
    API_ERROR_CODES.INTERNAL_SERVER_ERROR,
    'An unexpected error occurred',
    'حدث خطأ غير متوقع',
    undefined,
    HTTP_STATUS.INTERNAL_SERVER_ERROR
  );
}

/**
 * Rate limit response
 */
export function createRateLimitResponse(
  retryAfter: number,
  message: string = 'Too many requests'
): NextResponse {
  return createErrorResponse(
    API_ERROR_CODES.RATE_LIMIT_EXCEEDED,
    message,
    'تم تجاوز الحد المسموح من الطلبات',
    { retryAfter },
    HTTP_STATUS.TOO_MANY_REQUESTS
  );
}

/**
 * Unauthorized response
 */
export function createUnauthorizedResponse(
  message: string = 'Authentication required'
): NextResponse {
  return createErrorResponse(
    API_ERROR_CODES.UNAUTHORIZED,
    message,
    'مطلوب تسجيل الدخول',
    undefined,
    HTTP_STATUS.UNAUTHORIZED
  );
}

/**
 * Forbidden response
 */
export function createForbiddenResponse(
  message: string = 'Insufficient permissions'
): NextResponse {
  return createErrorResponse(
    API_ERROR_CODES.FORBIDDEN,
    message,
    'صلاحيات غير كافية',
    undefined,
    HTTP_STATUS.FORBIDDEN
  );
}

/**
 * Not found response
 */
export function createNotFoundResponse(
  message: string = 'Resource not found'
): NextResponse {
  return createErrorResponse(
    API_ERROR_CODES.NOT_FOUND,
    message,
    'المورد غير موجود',
    undefined,
    HTTP_STATUS.NOT_FOUND
  );
}