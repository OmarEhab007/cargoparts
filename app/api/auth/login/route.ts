import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/auth/user-service';
import { emailService } from '@/lib/communication/email-service';
import { loginSchema } from '@/lib/auth/validation';
import { AuthErrors, createErrorResponse, handleUnknownError } from '@/lib/auth/errors';
import { withRateLimit, loginRateLimiter } from '@/lib/auth/rate-limiter';

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await withRateLimit(loginRateLimiter)(req);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = loginSchema.parse(body);

    // Extract user agent and IP for session tracking
    const userAgent = req.headers.get('user-agent');
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip');

    // Initiate login process (this will send OTP email)
    const result = await UserService.initiateLogin({
      email: validatedData.email,
      useOtp: true,
    });

    // If user exists, send OTP email
    if (result.userId) {
      try {
        const user = await UserService.getUserById(result.userId);
        if (user) {
          // Get the generated OTP code
          const { OtpService } = await import('@/lib/auth/otp');
          const otpStatus = await OtpService.getOtpStatus(user.id, 'LOGIN');
          
          if (otpStatus.hasActiveOtp) {
            // Find the actual OTP code from the database
            const { prisma } = await import('@/lib/db/prisma');
            const otpRecord = await prisma.otpCode.findFirst({
              where: {
                userId: user.id,
                type: 'LOGIN',
                verified: false,
                expiresAt: { gte: new Date() },
              },
              orderBy: { createdAt: 'desc' },
            });
            
            if (otpRecord) {
              // In development mode, log the OTP to console
              if (process.env.NODE_ENV === 'development') {
                console.log('🔑 LOGIN OTP for', user.email, ':', otpRecord.code);
              }
              await emailService.sendLoginOtp(user.email, otpRecord.code, (user.preferredLocale as 'ar' | 'en') || 'ar');
            }
          }
        }
      } catch (emailError) {
        console.error('Failed to send login OTP email:', emailError);
        throw AuthErrors.EMAIL_SEND_FAILED();
      }
    }

    // Always return the same message for security (don't reveal if email exists)
    return NextResponse.json({
      success: true,
      requiresOtp: true,
      message: result.message,
      messageAr: 'إذا كان البريد الإلكتروني موجوداً، فقد تم إرسال رمز التحقق',
    });

  } catch (error) {
    const authError = handleUnknownError(error);
    return createErrorResponse(authError);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}