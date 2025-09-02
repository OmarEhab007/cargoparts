import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { createSuccessResponse, handleError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { context, response } = await withAuth(request, { 
      requiredRoles: ['SELLER', 'ADMIN'] 
    });
    
    if (response) {
      return response;
    }

    if (!context) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get seller profile for the authenticated user
    const seller = await prisma.seller.findFirst({
      where: { userId: context.user.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            avatar: true,
            preferredLocale: true
          }
        },
        _count: {
          select: {
            listings: {
              where: {
                status: 'PUBLISHED',
                isActive: true
              }
            }
          }
        }
      }
    });

    if (!seller) {
      return NextResponse.json(
        { error: 'Seller profile not found. Please complete your seller registration.' },
        { status: 404 }
      );
    }

    const sellerProfile = {
      id: seller.id,
      userId: seller.userId,
      businessName: seller.businessName,
      businessNameEn: seller.businessNameEn,
      businessType: seller.businessType,
      city: seller.city,
      district: seller.district,
      address: seller.address,
      phone: seller.phone,
      whatsapp: seller.whatsapp,
      description: seller.description,
      descriptionEn: seller.descriptionEn,
      logo: seller.logo,
      coverImage: seller.coverImage,
      verified: seller.verified,
      verifiedAt: seller.verifiedAt,
      status: seller.status,
      rating: seller.rating,
      reviewCount: seller.reviewCount,
      totalSales: seller.totalSales,
      createdAt: seller.createdAt,
      updatedAt: seller.updatedAt,
      user: seller.user,
      activeListings: seller._count.listings,
    };

    return createSuccessResponse(sellerProfile, 'Seller profile retrieved successfully');
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { context, response } = await withAuth(request, { 
      requiredRoles: ['SELLER'] 
    });
    
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
    
    // Get current seller
    const currentSeller = await prisma.seller.findFirst({
      where: { userId: context.user.id }
    });

    if (!currentSeller) {
      return NextResponse.json(
        { error: 'Seller profile not found' },
        { status: 404 }
      );
    }

    // Only allow specific fields to be updated
    const allowedFields = [
      'businessName', 'businessNameEn', 'city', 'district', 'address',
      'phone', 'whatsapp', 'description', 'descriptionEn', 'logo', 'coverImage'
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const updatedSeller = await prisma.seller.update({
      where: { id: currentSeller.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            avatar: true
          }
        }
      }
    });

    return createSuccessResponse(updatedSeller, 'Seller profile updated successfully');
  } catch (error) {
    return handleError(error);
  }
}