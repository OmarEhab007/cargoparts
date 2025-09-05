import { NextRequest, NextResponse } from 'next/server';
import { SessionService } from '@/lib/auth/session';
import { AuthErrors, createErrorResponse, handleUnknownError } from '@/lib/auth/errors';

export async function POST(req: NextRequest) {
  try {
    // Get current session
    const session = await SessionService.getCurrentSession();
    
    if (session) {
      // Invalidate the current session
      await SessionService.invalidateSession(session.sessionId);
    }

    // Clear authentication cookies
    await SessionService.clearAuthCookies();

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
      messageAr: 'تم تسجيل الخروج بنجاح',
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