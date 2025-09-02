import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { createSuccessResponse, handleError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    const { context, response } = await withAuth(request);
    
    if (response) {
      return response;
    }

    if (!context) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Return user information from the auth context
    const userInfo = {
      id: context.user.id,
      email: context.user.email,
      name: context.user.name,
      role: context.user.role,
      phone: context.user.phone,
      avatar: context.user.avatar,
      preferredLocale: context.user.preferredLocale,
      emailVerified: context.user.emailVerified,
      phoneVerified: context.user.phoneVerified,
      status: context.user.status,
      lastLoginAt: context.user.lastLoginAt,
      createdAt: context.user.createdAt,
      updatedAt: context.user.updatedAt,
    };

    return createSuccessResponse({
      user: userInfo,
      session: {
        expiresAt: context.session.expiresAt
      }
    }, 'User information retrieved successfully');
  } catch (error) {
    return handleError(error);
  }
}