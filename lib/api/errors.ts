import { z } from 'zod';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    messageAr?: string;
    details?: Record<string, unknown>;
    timestamp?: string;
    requestId?: string;
  };
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export class ApiError extends Error {
  public readonly code: string;
  public readonly messageAr?: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;
  public readonly isOperational: boolean;

  constructor(
    code: string,
    message: string,
    messageAr?: string,
    statusCode: number = 400,
    details?: Record<string, unknown>,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.messageAr = messageAr;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  toResponse(requestId?: string): ApiErrorResponse {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        messageAr: this.messageAr,
        details: this.details,
        timestamp: new Date().toISOString(),
        requestId,
      },
    };
  }
}

// Business Logic Errors
export const BusinessErrors = {
  // Seller errors
  SELLER_NOT_FOUND: () =>
    new ApiError(
      'SELLER_NOT_FOUND',
      'Seller not found',
      'البائع غير موجود',
      404
    ),

  SELLER_NOT_VERIFIED: () =>
    new ApiError(
      'SELLER_NOT_VERIFIED',
      'Seller account is not verified',
      'حساب البائع غير موثق',
      403
    ),

  SELLER_SUSPENDED: () =>
    new ApiError(
      'SELLER_SUSPENDED',
      'Seller account is suspended',
      'حساب البائع معلق',
      403
    ),

  SELLER_ALREADY_EXISTS: () =>
    new ApiError(
      'SELLER_ALREADY_EXISTS',
      'Seller profile already exists for this user',
      'ملف البائع موجود بالفعل لهذا المستخدم',
      409
    ),

  // Listing errors
  LISTING_NOT_FOUND: () =>
    new ApiError(
      'LISTING_NOT_FOUND',
      'Listing not found',
      'الإعلان غير موجود',
      404
    ),

  LISTING_OUT_OF_STOCK: () =>
    new ApiError(
      'LISTING_OUT_OF_STOCK',
      'This item is out of stock',
      'هذا المنتج غير متوفر',
      400
    ),

  LISTING_INACTIVE: () =>
    new ApiError(
      'LISTING_INACTIVE',
      'This listing is not active',
      'هذا الإعلان غير نشط',
      400
    ),

  INSUFFICIENT_STOCK: (available: number, requested: number) =>
    new ApiError(
      'INSUFFICIENT_STOCK',
      `Only ${available} items available, but ${requested} requested`,
      `متوفر ${available} قطعة فقط، ولكن تم طلب ${requested}`,
      400,
      { available, requested }
    ),

  // Order errors
  ORDER_NOT_FOUND: () =>
    new ApiError(
      'ORDER_NOT_FOUND',
      'Order not found',
      'الطلب غير موجود',
      404
    ),

  ORDER_ALREADY_CANCELLED: () =>
    new ApiError(
      'ORDER_ALREADY_CANCELLED',
      'Order is already cancelled',
      'الطلب ملغي بالفعل',
      400
    ),

  ORDER_CANNOT_CANCEL: () =>
    new ApiError(
      'ORDER_CANNOT_CANCEL',
      'Order cannot be cancelled in its current status',
      'لا يمكن إلغاء الطلب في وضعه الحالي',
      400
    ),

  ORDER_ALREADY_SHIPPED: () =>
    new ApiError(
      'ORDER_ALREADY_SHIPPED',
      'Order has already been shipped',
      'تم شحن الطلب بالفعل',
      400
    ),

  // Payment errors
  PAYMENT_NOT_FOUND: () =>
    new ApiError(
      'PAYMENT_NOT_FOUND',
      'Payment not found',
      'الدفعة غير موجودة',
      404
    ),

  PAYMENT_FAILED: (reason?: string) =>
    new ApiError(
      'PAYMENT_FAILED',
      `Payment failed${reason ? `: ${reason}` : ''}`,
      `فشل الدفع${reason ? `: ${reason}` : ''}`,
      400
    ),

  PAYMENT_ALREADY_PROCESSED: () =>
    new ApiError(
      'PAYMENT_ALREADY_PROCESSED',
      'Payment has already been processed',
      'تمت معالجة الدفعة بالفعل',
      400
    ),

  INVALID_PAYMENT_METHOD: () =>
    new ApiError(
      'INVALID_PAYMENT_METHOD',
      'Invalid payment method',
      'طريقة دفع غير صحيحة',
      400
    ),

  // Cart errors
  CART_EMPTY: () =>
    new ApiError(
      'CART_EMPTY',
      'Cart is empty',
      'السلة فارغة',
      400
    ),

  CART_ITEM_NOT_FOUND: () =>
    new ApiError(
      'CART_ITEM_NOT_FOUND',
      'Item not found in cart',
      'المنتج غير موجود في السلة',
      404
    ),

  // Analytics errors
  NO_DATA_AVAILABLE: () =>
    new ApiError(
      'NO_DATA_AVAILABLE',
      'No data available for the specified period',
      'لا توجد بيانات متاحة للفترة المحددة',
      404
    ),

  INVALID_DATE_RANGE: () =>
    new ApiError(
      'INVALID_DATE_RANGE',
      'Invalid date range specified',
      'نطاق التاريخ المحدد غير صحيح',
      400
    ),

  // Campaign errors
  CAMPAIGN_NOT_FOUND: () =>
    new ApiError(
      'CAMPAIGN_NOT_FOUND',
      'Campaign not found',
      'الحملة غير موجودة',
      404
    ),

  CAMPAIGN_EXPIRED: () =>
    new ApiError(
      'CAMPAIGN_EXPIRED',
      'Campaign has expired',
      'انتهت صلاحية الحملة',
      400
    ),

  CAMPAIGN_NOT_ACTIVE: () =>
    new ApiError(
      'CAMPAIGN_NOT_ACTIVE',
      'Campaign is not active',
      'الحملة غير نشطة',
      400
    ),

  // General business errors
  INVALID_OPERATION: (reason?: string) =>
    new ApiError(
      'INVALID_OPERATION',
      `Invalid operation${reason ? `: ${reason}` : ''}`,
      `عملية غير صحيحة${reason ? `: ${reason}` : ''}`,
      400
    ),

  RESOURCE_LOCKED: () =>
    new ApiError(
      'RESOURCE_LOCKED',
      'Resource is locked for modification',
      'المورد مقفل للتعديل',
      423
    ),

  DUPLICATE_ENTRY: (field?: string) =>
    new ApiError(
      'DUPLICATE_ENTRY',
      `Duplicate entry${field ? ` for ${field}` : ''}`,
      `إدخال مكرر${field ? ` لـ ${field}` : ''}`,
      409
    ),

  DEPENDENCY_ERROR: (resource?: string) =>
    new ApiError(
      'DEPENDENCY_ERROR',
      `Cannot delete due to existing dependencies${resource ? ` on ${resource}` : ''}`,
      `لا يمكن الحذف بسبب وجود تبعيات${resource ? ` على ${resource}` : ''}`,
      409
    ),
};

// Validation Errors
export const ValidationErrors = {
  INVALID_INPUT: (field?: string, message?: string) =>
    new ApiError(
      'INVALID_INPUT',
      message || `Invalid input${field ? ` for ${field}` : ''}`,
      `إدخال غير صحيح${field ? ` لـ ${field}` : ''}`,
      400
    ),

  MISSING_REQUIRED_FIELD: (field: string) =>
    new ApiError(
      'MISSING_REQUIRED_FIELD',
      `Missing required field: ${field}`,
      `حقل مطلوب مفقود: ${field}`,
      400
    ),

  INVALID_FORMAT: (field: string, expectedFormat?: string) =>
    new ApiError(
      'INVALID_FORMAT',
      `Invalid format for ${field}${expectedFormat ? `. Expected: ${expectedFormat}` : ''}`,
      `تنسيق غير صحيح لـ ${field}${expectedFormat ? `. متوقع: ${expectedFormat}` : ''}`,
      400
    ),

  VALUE_OUT_OF_RANGE: (field: string, min?: number, max?: number) =>
    new ApiError(
      'VALUE_OUT_OF_RANGE',
      `Value for ${field} is out of range${min !== undefined ? ` (min: ${min})` : ''}${max !== undefined ? ` (max: ${max})` : ''}`,
      `قيمة ${field} خارج النطاق${min !== undefined ? ` (الحد الأدنى: ${min})` : ''}${max !== undefined ? ` (الحد الأقصى: ${max})` : ''}`,
      400
    ),
};

// System Errors
export const SystemErrors = {
  DATABASE_ERROR: (details?: string) =>
    new ApiError(
      'DATABASE_ERROR',
      'A database error occurred',
      'حدث خطأ في قاعدة البيانات',
      500,
      details ? { details } : undefined,
      false
    ),

  EXTERNAL_SERVICE_ERROR: (service?: string) =>
    new ApiError(
      'EXTERNAL_SERVICE_ERROR',
      `External service error${service ? ` from ${service}` : ''}`,
      `خطأ في الخدمة الخارجية${service ? ` من ${service}` : ''}`,
      502,
      undefined,
      false
    ),

  FILE_OPERATION_ERROR: (operation?: string) =>
    new ApiError(
      'FILE_OPERATION_ERROR',
      `File operation failed${operation ? `: ${operation}` : ''}`,
      `فشلت عملية الملف${operation ? `: ${operation}` : ''}`,
      500,
      undefined,
      false
    ),

  CONFIGURATION_ERROR: () =>
    new ApiError(
      'CONFIGURATION_ERROR',
      'System configuration error',
      'خطأ في تكوين النظام',
      500,
      undefined,
      false
    ),
};

/**
 * Handle Prisma database errors
 */
export function handlePrismaError(error: unknown): ApiError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const field = (error.meta?.target as string[])?.[0];
        return BusinessErrors.DUPLICATE_ENTRY(field);
      
      case 'P2003':
        // Foreign key constraint violation
        return BusinessErrors.DEPENDENCY_ERROR(error.meta?.field_name as string);
      
      case 'P2025':
        // Record not found
        return new ApiError(
          'RECORD_NOT_FOUND',
          'Record not found',
          'السجل غير موجود',
          404
        );
      
      default:
        console.error('Prisma error:', error);
        return SystemErrors.DATABASE_ERROR(error.code);
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return ValidationErrors.INVALID_INPUT(undefined, 'Database validation error');
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    console.error('Database initialization error:', error);
    return SystemErrors.DATABASE_ERROR('Connection failed');
  }

  return SystemErrors.DATABASE_ERROR();
}

/**
 * Handle Zod validation errors
 */
export function handleZodError(error: z.ZodError): ApiError {
  const firstError = error.issues[0];
  const field = firstError.path.join('.');
  
  switch (firstError.code) {
    case 'invalid_type':
      return ValidationErrors.INVALID_FORMAT(field, firstError.expected as string);
    
    case 'too_small':
    case 'too_big':
      return ValidationErrors.VALUE_OUT_OF_RANGE(
        field,
        firstError.code === 'too_small' ? (firstError as any).minimum : undefined,
        firstError.code === 'too_big' ? (firstError as any).maximum : undefined
      );
    
    default:
      return ValidationErrors.INVALID_INPUT(field, firstError.message);
  }
}

/**
 * Central error handler for all API errors
 */
export function handleApiError(error: unknown, requestId?: string): NextResponse {
  let apiError: ApiError;

  if (error instanceof ApiError) {
    apiError = error;
  } else if (error instanceof z.ZodError) {
    apiError = handleZodError(error);
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    apiError = handlePrismaError(error);
  } else if (error instanceof Error) {
    // Log unexpected errors
    console.error(`[${requestId}] Unexpected error:`, error);
    
    // Don't expose internal error messages
    apiError = new ApiError(
      'INTERNAL_ERROR',
      'An internal error occurred',
      'حدث خطأ داخلي',
      500,
      undefined,
      false
    );
  } else {
    console.error(`[${requestId}] Unknown error type:`, error);
    apiError = new ApiError(
      'UNKNOWN_ERROR',
      'An unknown error occurred',
      'حدث خطأ غير معروف',
      500,
      undefined,
      false
    );
  }

  // Log non-operational errors
  if (!apiError.isOperational) {
    console.error(`[${requestId}] Non-operational error:`, {
      code: apiError.code,
      message: apiError.message,
      stack: apiError.stack,
    });
  }

  return NextResponse.json(apiError.toResponse(requestId), {
    status: apiError.statusCode,
  });
}

/**
 * Async error wrapper for route handlers
 */
export function asyncHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T) => {
    try {
      return await fn(...args);
    } catch (error) {
      throw error; // Will be caught by the API wrapper
    }
  };
}

/**
 * Request ID generator for tracking
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}