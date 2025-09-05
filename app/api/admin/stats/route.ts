import { NextRequest, NextResponse } from 'next/server';
import { SessionService } from '@/lib/auth/session';
import { UserService } from '@/lib/auth/user-service';
import { AuthErrors, createErrorResponse, handleUnknownError } from '@/lib/auth/errors';

export async function GET(req: NextRequest) {
  try {
    // Check admin authentication
    const session = await SessionService.getCurrentSession();
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      throw AuthErrors.UNAUTHORIZED();
    }

    // Get user statistics
    const userStats = await UserService.getUserStats();

    return NextResponse.json({
      success: true,
      data: {
        users: userStats,
        overview: {
          totalUsers: userStats.totalUsers,
          activeUsers: userStats.activeUsers,
          newUsersToday: userStats.newUsersToday,
          activePercentage: userStats.totalUsers > 0 
            ? Math.round((userStats.activeUsers / userStats.totalUsers) * 100) 
            : 0,
        },
        breakdown: {
          byRole: userStats.usersByRole,
          byStatus: userStats.usersByStatus,
        },
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}