import { NextRequest, NextResponse } from 'next/server';
import { SessionService } from '@/lib/auth/session';
import { UserService } from '@/lib/auth/user-service';
import { updateUserStatusSchema } from '@/lib/auth/validation';
import { AuthErrors, createErrorResponse, handleUnknownError } from '@/lib/auth/errors';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    // Check admin authentication
    const session = await SessionService.getCurrentSession();
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      throw AuthErrors.UNAUTHORIZED();
    }

    const { id } = await params;

    // Get user profile
    const userProfile = await UserService.getUserProfile(id);
    
    if (!userProfile) {
      throw AuthErrors.USER_NOT_FOUND();
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: userProfile.user.id,
          email: userProfile.user.email,
          name: userProfile.user.name,
          phone: userProfile.user.phone,
          role: userProfile.user.role,
          status: userProfile.user.status,
          avatar: userProfile.user.avatar,
          emailVerified: !!userProfile.user.emailVerified,
          phoneVerified: !!userProfile.user.phoneVerified,
          preferredLocale: userProfile.user.preferredLocale,
          lastLoginAt: userProfile.user.lastLoginAt,
          createdAt: userProfile.user.createdAt,
          updatedAt: userProfile.user.updatedAt,
        },
        seller: userProfile.seller,
        stats: userProfile.stats,
      },
    });

  } catch (error) {
    const authError = handleUnknownError(error);
    return createErrorResponse(authError);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    // Check admin authentication
    const session = await SessionService.getCurrentSession();
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      throw AuthErrors.UNAUTHORIZED();
    }

    const { id } = await params;

    // Parse and validate request body
    const body = await req.json();
    const validatedData = updateUserStatusSchema.parse({ ...body, userId: id });

    // Update user status
    const updatedUser = await UserService.updateUserStatus(id, validatedData.status);

    // Log admin action (you can implement activity logging here)
    console.log(`Admin ${session.user.email} updated user ${id} status to ${validatedData.status}`, {
      reason: validatedData.reason,
      adminId: session.user.id,
      targetUserId: id,
    });

    return NextResponse.json({
      success: true,
      message: 'User status updated successfully',
      messageAr: 'تم تحديث حالة المستخدم بنجاح',
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          status: updatedUser.status,
          updatedAt: updatedUser.updatedAt,
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
      'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}