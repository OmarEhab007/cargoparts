import { NextRequest, NextResponse } from 'next/server';
import { ListingService } from '@/lib/catalog/listing-service';
import { withAuth } from '@/lib/auth/middleware';
import { createPaginatedResponse, handleError } from '@/lib/api/response';
import { parseSearchParams } from '@/lib/api/utils';
import { z } from 'zod';
import { ListingStatus } from '@prisma/client';

const inventoryQuerySchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  status: z.nativeEnum(ListingStatus).optional(),
  search: z.string().optional(),
  lowStock: z.string().transform(val => val === 'true').optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'viewCount', 'priceSar', 'quantity']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const sellerId = params.id;
    const searchParams = parseSearchParams(request);
    const query = inventoryQuerySchema.parse({
      ...Object.fromEntries(request.nextUrl.searchParams.entries())
    });

    // Authorization check - sellers can only access their own inventory
    if (context.user.role === 'SELLER') {
      const { SellerService } = await import('@/lib/sellers/seller-service');
      const seller = await SellerService.getSellerByUserId(context.user.id);
      
      if (!seller || seller.id !== sellerId) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    // Build filters for seller's inventory
    const filters = {
      sellerId,
      status: query.status,
      search: query.search,
      isActive: true, // Only show active listings by default
    };

    // Get listings with pagination
    const result = await ListingService.searchListings(
      filters,
      query.page || 1,
      query.limit || 20,
      query.sortBy || 'createdAt',
      query.sortOrder || 'desc'
    );

    // Calculate inventory metrics
    const inventoryMetrics = await ListingService.getSellerInventoryMetrics(sellerId);

    return createPaginatedResponse(
      result.listings.map(listing => ({
        id: listing.id,
        titleAr: listing.titleAr,
        titleEn: listing.titleEn,
        sku: listing.sku,
        priceSar: listing.priceSar,
        condition: listing.condition,
        quantity: listing.quantity,
        status: listing.status,
        viewCount: listing.viewCount,
        isFeatured: listing.isFeatured,
        make: listing.make,
        model: listing.model,
        fromYear: listing.fromYear,
        toYear: listing.toYear,
        city: listing.city,
        publishedAt: listing.publishedAt,
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
        photos: listing.photos?.slice(0, 1) || [], // Include only first photo for list view
        category: listing.category,
        // Add inventory-specific metrics
        isLowStock: listing.quantity <= 5,
        daysSinceCreated: Math.floor(
          (new Date().getTime() - new Date(listing.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        ),
        reviewCount: listing._count?.reviews || 0,
      })),
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
      'Seller inventory retrieved successfully',
      {
        metrics: inventoryMetrics
      }
    );
  } catch (error) {
    return handleError(error);
  }
}