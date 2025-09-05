import { NextRequest, NextResponse } from 'next/server';
import { SessionService } from '@/lib/auth/session';
import { AuthErrors, createErrorResponse, handleUnknownError } from '@/lib/auth/errors';

export async function POST(req: NextRequest) {
  try {
    // Get refresh token from cookies
    const { refreshToken } = await SessionService.getAuthCookies();
    
    if (!refreshToken) {
      throw AuthErrors.INVALID_TOKEN();
    }

    // Refresh the session
    const result = await SessionService.refreshSession(refreshToken);
    
    if (!result) {
      throw AuthErrors.SESSION_EXPIRED();
    }

    // Set new authentication cookies
    await SessionService.setAuthCookies(result.token, result.refreshToken);

    return NextResponse.json({
      success: true,
      message: 'Session refreshed successfully',
      messageAr: 'تم تجديد الجلسة بنجاح',
      data: {
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

  } catch (error) {
    // Clear cookies if refresh fails
    try {
      await SessionService.clearAuthCookies();
    } catch {
      // Ignore cookie clearing errors
    }

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