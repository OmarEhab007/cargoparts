import { NextRequest } from 'next/server';
import { UserService } from '@/lib/auth/user-service';
import { requireAdmin } from '@/lib/auth/middleware';
import { createSuccessResponse, handleError } from '@/lib/api/response';

// Get user statistics (admin only)
export async function GET(request: NextRequest) {
  try {
    const { context, response } = await requireAdmin(request);
    
    if (response) {
      return response;
    }

    const stats = await UserService.getUserStats();

    return createSuccessResponse({
      userStats: stats,
    }, 'User statistics retrieved successfully');
  } catch (error) {
    return handleError(error);
  }
}