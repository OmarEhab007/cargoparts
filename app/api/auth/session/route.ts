import { NextRequest, NextResponse } from 'next/server';
import { SessionService } from '@/lib/auth/session';
import { withAuth, createAuthResponse } from '@/lib/auth/middleware';

// Get current session
export async function GET(request: NextRequest) {
  try {
    const { context } = await withAuth(request, { allowGuest: true });

    if (!context) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: context.user,
      sessionId: context.sessionId,
    });
  } catch (error) {
    console.error('Get session error:', error);
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    );
  }
}

// Refresh session
export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await SessionService.getAuthCookies();

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token not found' },
        { status: 401 }
      );
    }

    const result = await SessionService.refreshSession(refreshToken);

    if (!result) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // Return new tokens
    return createAuthResponse(
      {
        message: 'Session refreshed successfully',
        refreshed: true,
      },
      {
        token: result.token,
        refreshToken: result.refreshToken,
      }
    );
  } catch (error) {
    console.error('Refresh session error:', error);
    return NextResponse.json(
      { error: 'Failed to refresh session' },
      { status: 500 }
    );
  }
}

// Get session statistics (for user dashboard)
export async function PUT(request: NextRequest) {
  try {
    const { context, response } = await withAuth(request);

    if (response) {
      return response;
    }

    if (!context) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const stats = await SessionService.getUserSessionStats(context.user.id);

    return NextResponse.json({
      sessionStats: stats,
    });
  } catch (error) {
    console.error('Get session stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get session statistics' },
      { status: 500 }
    );
  }
}