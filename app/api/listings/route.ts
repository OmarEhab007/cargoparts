import { NextRequest, NextResponse } from 'next/server';
import { ListingService, SearchFilters } from '@/lib/catalog/listing-service';
import { withAuth, getUserAgent, getClientIp } from '@/lib/auth/middleware';
import { createPaginatedResponse, handleError, createSuccessResponse } from '@/lib/api/response';
import { parseSearchParams, parseListingFilters } from '@/lib/api/utils';
import { z } from 'zod';
import { Condition } from '@prisma/client';

const listingQuerySchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  yearFrom: z.string().transform(Number).optional(),
  yearTo: z.string().transform(Number).optional(),
  condition: z.nativeEnum(Condition).optional(),
  minPrice: z.string().transform(Number).optional(),
  maxPrice: z.string().transform(Number).optional(),
  search: z.string().optional(),
  sellerId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = parseSearchParams(request);
    const filters = parseListingFilters(request);

    // Create search filters compatible with ListingService
    const searchFilters: SearchFilters = {
      categoryId: filters.category,
      make: filters.make,
      model: filters.model,
      yearFrom: filters.yearFrom,
      yearTo: filters.yearTo,
      condition: filters.condition as any,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      city: filters.city,
      sellerId: filters.sellerId,
      isActive: filters.isActive,
      isFeatured: filters.isFeatured,
      search: searchParams.search,
      sortBy: searchParams.sortBy as any,
      sortOrder: searchParams.sortOrder,
    };

    const result = await ListingService.searchListings(
      searchFilters,
      searchParams.page,
      searchParams.limit
    );

    return createPaginatedResponse(
      result.listings.map(listing => ({
        id: listing.id,
        titleAr: listing.titleAr,
        titleEn: listing.titleEn,
        description: listing.description,
        descriptionEn: listing.descriptionEn,
        sku: listing.sku,
        priceSar: listing.priceSar,
        originalPrice: listing.originalPrice,
        condition: listing.condition,
        quantity: listing.quantity,
        make: listing.make,
        model: listing.model,
        fromYear: listing.fromYear,
        toYear: listing.toYear,
        engineSize: listing.engineSize,
        fuelType: listing.fuelType,
        transmission: listing.transmission,
        bodyType: listing.bodyType,
        oemNumbers: listing.oem_numbers,
        city: listing.city,
        district: listing.district,
        viewCount: listing.viewCount,
        isFeatured: listing.isFeatured,
        publishedAt: listing.publishedAt,
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
        seller: {
          id: listing.seller.id,
          businessName: listing.seller.businessName,
          city: listing.seller.city,
          verified: listing.seller.verified,
          rating: listing.seller.rating,
          user: listing.seller.user,
        },
        category: listing.category,
        make_ref: listing.makeRef,
        model_ref: listing.modelRef,
        photos: listing.photos,
        reviewCount: listing._count?.reviews || 0,
      })),
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total
    );
  } catch (error) {
    return handleError(error);
  }
}

const createListingSchema = z.object({
  categoryId: z.string().cuid().optional(),
  makeId: z.string().cuid().optional(),
  modelId: z.string().cuid().optional(),
  sku: z.string().max(50).optional(),
  titleAr: z.string().min(2, 'Title must be at least 2 characters').max(200),
  titleEn: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  descriptionEn: z.string().max(2000).optional(),
  condition: z.nativeEnum(Condition),
  priceSar: z.number().positive().max(1000000, 'Price must be less than 1,000,000 SAR'),
  originalPrice: z.number().positive().optional(),
  quantity: z.number().positive().default(1),
  minQuantity: z.number().positive().default(1),
  weight: z.number().positive().optional(),
  dimensions: z.string().max(100).optional(),
  // Vehicle compatibility
  make: z.string().max(50).optional(),
  model: z.string().max(50).optional(),
  fromYear: z.number().min(1950).max(new Date().getFullYear() + 2).optional(),
  toYear: z.number().min(1950).max(new Date().getFullYear() + 2).optional(),
  engineSize: z.string().max(20).optional(),
  fuelType: z.string().max(20).optional(),
  transmission: z.string().max(20).optional(),
  bodyType: z.string().max(20).optional(),
  oemNumbers: z.array(z.string().max(50)).optional(),
  // Location
  city: z.string().min(2, 'City is required').max(50),
  district: z.string().max(50).optional(),
  // Photos
  photos: z.array(z.object({
    url: z.string().url('Invalid photo URL'),
    filename: z.string().optional(),
    alt: z.string().optional(),
    sortOrder: z.number().optional(),
  })).optional(),
});

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const data = createListingSchema.parse(body);

    // Get seller profile for the authenticated user
    let sellerId = '';
    if (context.user.role === 'SELLER') {
      // For sellers, use their own seller profile
      const { SellerService } = await import('@/lib/sellers/seller-service');
      const seller = await SellerService.getSellerByUserId(context.user.id);
      
      if (!seller) {
        return NextResponse.json(
          { error: 'Seller profile not found. Please complete your seller registration.' },
          { status: 400 }
        );
      }

      // Check seller verification (skip in development for testing)
      const isDevelopment = process.env.NODE_ENV === 'development';
      if (!isDevelopment && (seller.status !== 'APPROVED' || !seller.verified)) {
        return NextResponse.json(
          { error: 'Seller account is not verified. Please wait for approval.' },
          { status: 403 }
        );
      }

      sellerId = seller.id;
    } else if (context.user.role === 'ADMIN') {
      // Admins can specify sellerId
      if (!body.sellerId) {
        return NextResponse.json(
          { error: 'Seller ID is required for admin listing creation' },
          { status: 400 }
        );
      }
      sellerId = body.sellerId;
    }

    // Validate year range
    if (data.fromYear && data.toYear && data.fromYear > data.toYear) {
      return NextResponse.json(
        { error: 'From year cannot be greater than to year' },
        { status: 400 }
      );
    }

    const listing = await ListingService.createListing({
      ...data,
      sellerId,
    });
    
    return createSuccessResponse({
      message: 'Listing created successfully',
      listing: {
        id: listing.id,
        titleAr: listing.titleAr,
        titleEn: listing.titleEn,
        sku: listing.sku,
        priceSar: listing.priceSar,
        condition: listing.condition,
        status: listing.status,
        createdAt: listing.createdAt,
      },
    }, 'Listing created successfully', 201);
  } catch (error) {
    return handleError(error);
  }
}