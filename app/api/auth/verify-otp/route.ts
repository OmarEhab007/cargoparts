import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/auth/user-service';
import { SessionService } from '@/lib/auth/session';
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

    // Extract user agent and IP for session tracking
    const userAgent = req.headers.get('user-agent') || undefined;
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined;

    // Complete OTP login
    const loginResult = await UserService.completeOtpLogin(
      {
        email: validatedData.email,
        otpCode: validatedData.otpCode,
      },
      userAgent,
      ipAddress
    );

    // Set authentication cookies
    await SessionService.setAuthCookies(loginResult.token, loginResult.refreshToken);

    // Return success response with user data
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      messageAr: "تم تسجيل الدخول بنجاح",
      data: {
        user: {
          id: loginResult.user.id,
          email: loginResult.user.email,
          name: loginResult.user.name,
          phone: loginResult.user.phone,
          role: loginResult.user.role,
          avatar: loginResult.user.avatar,
          status: loginResult.user.status,
          emailVerified: !!loginResult.user.emailVerified,
          phoneVerified: !!loginResult.user.phoneVerified,
          preferredLocale: loginResult.user.preferredLocale,
          lastLoginAt: loginResult.user.lastLoginAt,
        },
        sessionId: loginResult.sessionId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
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