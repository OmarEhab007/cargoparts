import { NextRequest, NextResponse } from 'next/server';
import { SessionService } from '@/lib/auth/session';
import { UserService } from '@/lib/auth/user-service';
import { updateProfileSchema } from '@/lib/auth/validation';
import { AuthErrors, createErrorResponse, handleUnknownError } from '@/lib/auth/errors';

export async function GET(req: NextRequest) {
  try {
    // Get current session
    const session = await SessionService.getCurrentSession();
    
    if (!session) {
      throw AuthErrors.UNAUTHORIZED();
    }

    // Get detailed user profile
    const userProfile = await UserService.getUserProfile(session.user.id);
    
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
          avatar: userProfile.user.avatar,
          status: userProfile.user.status,
          emailVerified: !!userProfile.user.emailVerified,
          phoneVerified: !!userProfile.user.phoneVerified,
          preferredLocale: userProfile.user.preferredLocale,
          lastLoginAt: userProfile.user.lastLoginAt,
          createdAt: userProfile.user.createdAt,
        },
        seller: userProfile.seller ? {
          id: userProfile.seller.id,
          businessName: userProfile.seller.businessName,
          listingsCount: userProfile.seller._count.listings,
        } : null,
        stats: userProfile.stats,
      },
    });

  } catch (error) {
    const authError = handleUnknownError(error);
    return createErrorResponse(authError);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Get current session
    const session = await SessionService.getCurrentSession();
    
    if (!session) {
      throw AuthErrors.UNAUTHORIZED();
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = updateProfileSchema.parse(body);

    // Update user profile
    const updatedUser = await UserService.updateUser(session.user.id, validatedData);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      messageAr: 'تم تحديث الملف الشخصي بنجاح',
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          phone: updatedUser.phone,
          role: updatedUser.role,
          avatar: updatedUser.avatar,
          status: updatedUser.status,
          emailVerified: !!updatedUser.emailVerified,
          phoneVerified: !!updatedUser.phoneVerified,
          preferredLocale: updatedUser.preferredLocale,
          lastLoginAt: updatedUser.lastLoginAt,
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