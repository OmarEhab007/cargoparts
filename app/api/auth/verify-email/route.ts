import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/auth/user-service';
import { verifyOtpSchema } from '@/lib/auth/validation';
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
    const validatedData = verifyOtpSchema.parse(body);

    // Find user by email
    const user = await UserService.getUserByEmail(validatedData.email);
    if (!user) {
      throw AuthErrors.USER_NOT_FOUND();
    }

    if (user.emailVerified) {
      throw AuthErrors.EMAIL_ALREADY_VERIFIED();
    }

    // Verify email with OTP
    const verified = await UserService.verifyEmail(user.id, validatedData.otpCode);
    
    if (!verified) {
      throw AuthErrors.INVALID_OTP();
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
      messageAr: "تم تأكيد البريد الإلكتروني بنجاح",
      data: {
        emailVerified: true,
      },
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