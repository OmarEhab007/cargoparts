import { NextRequest, NextResponse } from 'next/server';
import { SessionService } from '@/lib/auth/session';
import { UserService } from '@/lib/auth/user-service';
import { adminSearchUsersSchema } from '@/lib/auth/validation';
import { AuthErrors, createErrorResponse, handleUnknownError } from '@/lib/auth/errors';

export async function GET(req: NextRequest) {
  try {
    // Check admin authentication
    const session = await SessionService.getCurrentSession();
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      throw AuthErrors.UNAUTHORIZED();
    }

    // Parse query parameters
    const url = new URL(req.url);
    const queryParams = {
      search: url.searchParams.get('search') || undefined,
      role: url.searchParams.get('role') || undefined,
      status: url.searchParams.get('status') || undefined,
      page: url.searchParams.get('page') || '1',
      limit: url.searchParams.get('limit') || '20',
    };

    // Validate query parameters
    const validatedQuery = adminSearchUsersSchema.parse(queryParams);

    // Search users
    const result = await UserService.searchUsers(validatedQuery);

    return NextResponse.json({
      success: true,
      data: {
        users: result.users.map(user => ({
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          status: user.status,
          emailVerified: !!user.emailVerified,
          phoneVerified: !!user.phoneVerified,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
        })),
        pagination: result.pagination,
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