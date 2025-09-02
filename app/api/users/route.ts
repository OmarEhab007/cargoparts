import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/auth/user-service';
import { requireAdmin } from '@/lib/auth/middleware';
import { createPaginatedResponse, handleError } from '@/lib/api/response';
import { parseSearchParams, parseUserFilters } from '@/lib/api/utils';
import { z } from 'zod';

const updateUserStatusSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BANNED', 'PENDING_VERIFICATION']),
  reason: z.string().optional(),
});

// Get users list (admin only)
export async function GET(request: NextRequest) {
  try {
    const { context, response } = await requireAdmin(request);
    
    if (response) {
      return response;
    }

    const searchParams = parseSearchParams(request);
    const filters = parseUserFilters(request);

    const result = await UserService.searchUsers({
      search: searchParams.search,
      role: filters.role as any,
      status: filters.status as any,
      page: searchParams.page,
      limit: searchParams.limit,
    });

    return createPaginatedResponse(
      result.users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      })),
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
      'Users retrieved successfully'
    );
  } catch (error) {
    return handleError(error);
  }
}

// Update user status (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const { context, response } = await requireAdmin(request);
    
    if (response) {
      return response;
    }

    const body = await request.json();
    const { userId, status, reason } = updateUserStatusSchema.parse(body);

    // Update user status
    const updatedUser = await UserService.updateUserStatus(userId, status);

    // TODO: Log admin action for audit trail
    // await AdminActionService.logAction({
    //   adminId: context.user.id,
    //   action: 'USER_STATUS_UPDATED',
    //   targetType: 'user',
    //   targetId: userId,
    //   reason,
    //   metadata: { oldStatus: originalUser.status, newStatus: status }
    // });

    return NextResponse.json({
      success: true,
      message: 'User status updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        status: updatedUser.status,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}