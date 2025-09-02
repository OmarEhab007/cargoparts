import { NextRequest, NextResponse } from 'next/server';
import { SessionService } from '@/lib/auth/session';
import { withAuth, clearAuthResponse } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  try {
    // Get current session context (allow guest for graceful logout)
    const { context } = await withAuth(request, { allowGuest: true });

    if (context?.sessionId) {
      // Invalidate the session
      await SessionService.invalidateSession(context.sessionId);
    }

    // Clear auth cookies and return response
    return clearAuthResponse({
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if there's an error, clear cookies and return success
    // This ensures the user can always log out from the client side
    return clearAuthResponse({
      message: 'Logout completed',
    });
  }
}

// Alternative endpoint to logout from all devices
export async function DELETE(request: NextRequest) {
  try {
    // Require authentication for this endpoint
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

    // Invalidate all user sessions
    await SessionService.invalidateAllUserSessions(context.user.id);

    // Clear auth cookies and return response
    return clearAuthResponse({
      message: 'Logged out from all devices',
    });
  } catch (error) {
    console.error('Global logout error:', error);
    
    return NextResponse.json(
      { error: 'Failed to logout from all devices' },
      { status: 500 }
    );
  }
}