import { z } from 'zod';

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    messageAr?: string;
    details?: Record<string, unknown>;
  };
}

export class AuthError extends Error {
  public readonly code: string;
  public readonly messageAr?: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    messageAr?: string,
    statusCode: number = 400,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.messageAr = messageAr;
    this.statusCode = statusCode;
    this.details = details;
  }

  toResponse(): ErrorResponse {
    return {
      error: {
        code: this.code,
        message: this.message,
        messageAr: this.messageAr,
        details: this.details,
      },
    };
  }
}

// Predefined authentication errors
export const AuthErrors = {
  // Validation errors
  INVALID_INPUT: (message: string, messageAr?: string) =>
    new AuthError('INVALID_INPUT', message, messageAr, 400),

  INVALID_EMAIL: () =>
    new AuthError(
      'INVALID_EMAIL',
      'Please provide a valid email address',
      'يرجى إدخال عنوان بريد إلكتروني صحيح',
      400
    ),

  INVALID_PHONE: () =>
    new AuthError(
      'INVALID_PHONE',
      'Please provide a valid Saudi phone number (+966XXXXXXXXX)',
      'يرجى إدخال رقم هاتف سعودي صحيح (+966XXXXXXXXX)',
      400
    ),

  INVALID_OTP: () =>
    new AuthError(
      'INVALID_OTP',
      'Invalid or expired OTP code',
      'رمز التحقق غير صحيح أو منتهي الصلاحية',
      400
    ),

  // User errors
  USER_NOT_FOUND: () =>
    new AuthError(
      'USER_NOT_FOUND',
      'User not found',
      'المستخدم غير موجود',
      404
    ),

  USER_ALREADY_EXISTS: () =>
    new AuthError(
      'USER_ALREADY_EXISTS',
      'A user with this email already exists',
      'يوجد مستخدم بهذا البريد الإلكتروني',
      409
    ),

  PHONE_ALREADY_EXISTS: () =>
    new AuthError(
      'PHONE_ALREADY_EXISTS',
      'A user with this phone number already exists',
      'يوجد مستخدم بهذا الرقم',
      409
    ),

  EMAIL_ALREADY_VERIFIED: () =>
    new AuthError(
      'EMAIL_ALREADY_VERIFIED',
      'Email is already verified',
      'البريد الإلكتروني محقق بالفعل',
      400
    ),

  PHONE_ALREADY_VERIFIED: () =>
    new AuthError(
      'PHONE_ALREADY_VERIFIED',
      'Phone number is already verified',
      'رقم الهاتف محقق بالفعل',
      400
    ),

  // Account status errors
  ACCOUNT_BANNED: () =>
    new AuthError(
      'ACCOUNT_BANNED',
      'Your account has been banned. Please contact support.',
      'تم حظر حسابك. يرجى التواصل مع الدعم.',
      403
    ),

  ACCOUNT_INACTIVE: () =>
    new AuthError(
      'ACCOUNT_INACTIVE',
      'Your account is inactive. Please contact support.',
      'حسابك غير نشط. يرجى التواصل مع الدعم.',
      403
    ),

  ACCOUNT_PENDING_VERIFICATION: () =>
    new AuthError(
      'ACCOUNT_PENDING_VERIFICATION',
      'Please verify your email address to continue',
      'يرجى تأكيد عنوان بريدك الإلكتروني للمتابعة',
      403
    ),

  // Authentication errors
  INVALID_CREDENTIALS: () =>
    new AuthError(
      'INVALID_CREDENTIALS',
      'Invalid email or OTP code',
      'البريد الإلكتروني أو رمز التحقق غير صحيح',
      401
    ),

  SESSION_EXPIRED: () =>
    new AuthError(
      'SESSION_EXPIRED',
      'Your session has expired. Please login again.',
      'انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى.',
      401
    ),

  INVALID_TOKEN: () =>
    new AuthError(
      'INVALID_TOKEN',
      'Invalid or expired token',
      'الرمز غير صحيح أو منتهي الصلاحية',
      401
    ),

  UNAUTHORIZED: () =>
    new AuthError(
      'UNAUTHORIZED',
      'You are not authorized to perform this action',
      'غير مصرح لك بتنفيذ هذا الإجراء',
      403
    ),

  // OTP errors
  OTP_EXPIRED: () =>
    new AuthError(
      'OTP_EXPIRED',
      'OTP code has expired. Please request a new one.',
      'انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد.',
      400
    ),

  OTP_ALREADY_VERIFIED: () =>
    new AuthError(
      'OTP_ALREADY_VERIFIED',
      'OTP code has already been used',
      'تم استخدام رمز التحقق بالفعل',
      400
    ),

  OTP_MAX_ATTEMPTS: () =>
    new AuthError(
      'OTP_MAX_ATTEMPTS',
      'Maximum attempts exceeded. Please request a new OTP.',
      'تم تجاوز الحد الأقصى للمحاولات. يرجى طلب رمز جديد.',
      400
    ),

  // Rate limiting errors
  RATE_LIMIT_EXCEEDED: (retryAfter?: number) =>
    new AuthError(
      'RATE_LIMIT_EXCEEDED',
      'Too many requests. Please try again later.',
      'طلبات كثيرة جداً. يرجى المحاولة لاحقاً.',
      429,
      { retryAfter }
    ),

  OTP_RATE_LIMIT: () =>
    new AuthError(
      'OTP_RATE_LIMIT',
      'You can only request 5 OTP codes per hour. Please try again later.',
      'يمكنك طلب 5 رموز تحقق فقط في الساعة. يرجى المحاولة لاحقاً.',
      429
    ),

  LOGIN_RATE_LIMIT: () =>
    new AuthError(
      'LOGIN_RATE_LIMIT',
      'Too many login attempts. Please try again in an hour.',
      'محاولات تسجيل دخول كثيرة جداً. يرجى المحاولة بعد ساعة.',
      429
    ),

  // Server errors
  INTERNAL_ERROR: () =>
    new AuthError(
      'INTERNAL_ERROR',
      'An internal error occurred. Please try again.',
      'حدث خطأ داخلي. يرجى المحاولة مرة أخرى.',
      500
    ),

  EMAIL_SEND_FAILED: () =>
    new AuthError(
      'EMAIL_SEND_FAILED',
      'Failed to send email. Please try again.',
      'فشل في إرسال البريد الإلكتروني. يرجى المحاولة مرة أخرى.',
      500
    ),

  SMS_SEND_FAILED: () =>
    new AuthError(
      'SMS_SEND_FAILED',
      'Failed to send SMS. Please try again.',
      'فشل في إرسال الرسالة النصية. يرجى المحاولة مرة أخرى.',
      500
    ),

  DATABASE_ERROR: () =>
    new AuthError(
      'DATABASE_ERROR',
      'A database error occurred. Please try again.',
      'حدث خطأ في قاعدة البيانات. يرجى المحاولة مرة أخرى.',
      500
    ),
} as const;

/**
 * Convert Zod validation error to AuthError
 */
export function handleValidationError(error: z.ZodError): AuthError {
  const firstError = error.issues[0];
  const field = firstError.path.join('.');
  
  return AuthErrors.INVALID_INPUT(
    `${field}: ${firstError.message}`,
    `${field}: ${firstError.message}` // You can add Arabic translations for specific fields here
  );
}

/**
 * Handle unknown errors and convert to AuthError
 */
export function handleUnknownError(error: unknown): AuthError {
  if (error instanceof AuthError) {
    return error;
  }

  if (error instanceof z.ZodError) {
    return handleValidationError(error);
  }

  if (error instanceof Error) {
    // Log the actual error for debugging
    console.error('Unknown error:', error);
    
    // Don't expose internal error messages to the client
    return AuthErrors.INTERNAL_ERROR();
  }

  return AuthErrors.INTERNAL_ERROR();
}

/**
 * Create error response with proper structure
 */
export function createErrorResponse(error: AuthError): Response {
  return new Response(JSON.stringify(error.toResponse()), {
    status: error.statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}