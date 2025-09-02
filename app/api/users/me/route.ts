import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/auth/user-service';
import { withAuth } from '@/lib/auth/middleware';
import { createSuccessResponse, handleError } from '@/lib/api/response';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  phone: z.string().regex(/^(\+966|0)?[5][0-9]{8}$/, 'Invalid Saudi phone number').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
  preferredLocale: z.enum(['ar', 'en']).optional(),
});

// Get current user profile
export async function GET(request: NextRequest) {
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

    // Get complete user profile with stats
    const userProfile = await UserService.getUserProfile(context.user.id);
    
    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    return createSuccessResponse({
      user: {
        id: userProfile.user.id,
        email: userProfile.user.email,
        name: userProfile.user.name,
        phone: userProfile.user.phone,
        avatar: userProfile.user.avatar,
        role: userProfile.user.role,
        status: userProfile.user.status,
        emailVerified: userProfile.user.emailVerified,
        phoneVerified: userProfile.user.phoneVerified,
        preferredLocale: userProfile.user.preferredLocale,
        lastLoginAt: userProfile.user.lastLoginAt,
        createdAt: userProfile.user.createdAt,
      },
      seller: userProfile.seller ? {
        id: userProfile.seller.id,
        businessName: userProfile.seller.businessName,
        businessNameEn: userProfile.seller.businessNameEn,
        businessType: userProfile.seller.businessType,
        city: userProfile.seller.city,
        verified: userProfile.seller.verified,
        status: userProfile.seller.status,
        rating: userProfile.seller.rating,
        reviewCount: userProfile.seller.reviewCount,
        totalSales: userProfile.seller.totalSales,
        listingsCount: userProfile.seller._count?.listings || 0,
      } : null,
      stats: userProfile.stats,
    });
  } catch (error) {
    return handleError(error);
  }
}

// Update current user profile
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

    const body = await request.json();
    const data = updateProfileSchema.parse(body);

    // Update user
    const updatedUser = await UserService.updateUser(context.user.id, data);

    return createSuccessResponse({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        status: updatedUser.status,
        emailVerified: updatedUser.emailVerified,
        phoneVerified: updatedUser.phoneVerified,
        preferredLocale: updatedUser.preferredLocale,
        lastLoginAt: updatedUser.lastLoginAt,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

// Delete current user account
export async function DELETE(request: NextRequest) {
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

    // Soft delete user account
    await UserService.deleteUser(context.user.id);

    return createSuccessResponse({
      message: 'Account deleted successfully',
    });
  } catch (error) {
    return handleError(error);
  }
}