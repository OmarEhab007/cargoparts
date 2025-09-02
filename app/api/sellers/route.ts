import { NextRequest, NextResponse } from 'next/server';
import { SellerService } from '@/lib/sellers/seller-service';
import { withAuth, requireAdmin } from '@/lib/auth/middleware';
import { createSuccessResponse, createPaginatedResponse, handleError } from '@/lib/api/response';
import { parseSearchParams } from '@/lib/api/utils';
import { z } from 'zod';

const createSellerSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters').max(200),
  businessNameEn: z.string().max(200).optional(),
  businessType: z.enum(['SCRAPYARD', 'PARTS_DEALER', 'WORKSHOP', 'INDIVIDUAL']),
  commercialLicense: z.string().optional(),
  taxNumber: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  district: z.string().optional(),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  phone: z.string().regex(/^(\+966|0)?[5][0-9]{8}$/, 'Invalid Saudi phone number').optional(),
  whatsapp: z.string().regex(/^(\+966|0)?[5][0-9]{8}$/, 'Invalid Saudi phone number').optional(),
  description: z.string().max(1000).optional(),
  descriptionEn: z.string().max(1000).optional(),
});

// Get sellers list (public for browsing, filtered for admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { context } = await withAuth(request, { allowGuest: true });
    
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    
    const filters: any = {};

    // Parse filters
    if (searchParams.get('city')) {
      filters.city = searchParams.get('city');
    }
    if (searchParams.get('businessType')) {
      filters.businessType = searchParams.get('businessType');
    }
    if (searchParams.get('search')) {
      filters.search = searchParams.get('search');
    }

    // For public access, only show verified sellers
    if (!context || context.user.role !== 'ADMIN') {
      filters.verified = true;
      filters.status = 'APPROVED';
    } else {
      // Admin can filter by status and verification
      if (searchParams.get('status')) {
        filters.status = searchParams.get('status');
      }
      if (searchParams.get('verified') !== null) {
        filters.verified = searchParams.get('verified') === 'true';
      }
    }

    const result = await SellerService.searchSellers(filters, page, limit);

    return createPaginatedResponse(
      result.sellers.map(seller => ({
        id: seller.id,
        businessName: seller.businessName,
        businessNameEn: seller.businessNameEn,
        businessType: seller.businessType,
        city: seller.city,
        district: seller.district,
        verified: seller.verified,
        rating: seller.rating,
        reviewCount: seller.reviewCount,
        totalSales: seller.totalSales,
        logo: seller.logo,
        coverImage: seller.coverImage,
        description: seller.description,
        descriptionEn: seller.descriptionEn,
        listingsCount: (seller as any)._count?.listings || 0,
        // Only include sensitive data for admin
        ...(context?.user.role === 'ADMIN' && {
          status: seller.status,
          phone: seller.phone,
          whatsapp: seller.whatsapp,
          commercialLicense: seller.commercialLicense,
          taxNumber: seller.taxNumber,
          user: (seller as any).user,
          createdAt: seller.createdAt,
        }),
      })),
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
      'Sellers retrieved successfully'
    );
  } catch (error) {
    return handleError(error);
  }
}

// Create seller profile (authenticated users only)
export async function POST(request: NextRequest) {
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
    const data = createSellerSchema.parse(body);

    // Create seller profile
    const seller = await SellerService.createSeller({
      ...data,
      userId: context.user.id,
    });

    return createSuccessResponse({
      message: 'Seller profile created successfully. Your application is under review.',
      seller: {
        id: seller.id,
        businessName: seller.businessName,
        businessNameEn: seller.businessNameEn,
        businessType: seller.businessType,
        city: seller.city,
        status: seller.status,
        verified: seller.verified,
      },
    }, 'Seller profile created successfully', 201);
  } catch (error) {
    return handleError(error);
  }
}

// Update seller status (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const { context, response } = await requireAdmin(request);
    
    if (response) {
      return response;
    }

    const body = await request.json();
    const { sellerId, status, notes } = body;

    if (!sellerId || !status) {
      return NextResponse.json(
        { error: 'Seller ID and status are required' },
        { status: 400 }
      );
    }

    const updatedSeller = await SellerService.updateSellerStatus(
      sellerId,
      status,
      context.user.id
    );

    // TODO: Send notification to seller about status change
    // TODO: Log admin action

    return createSuccessResponse({
      message: 'Seller status updated successfully',
      seller: {
        id: updatedSeller.id,
        businessName: updatedSeller.businessName,
        status: updatedSeller.status,
        verified: updatedSeller.verified,
        verifiedAt: updatedSeller.verifiedAt,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}