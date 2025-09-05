import { NextRequest } from 'next/server';
import { ListingService } from '@/lib/catalog/listing-service';
import { withSellerAuth, validateQueryParams, createApiSuccessResponse, createApiErrorResponse } from '@/lib/auth/api-wrapper';
import { z } from 'zod';
import { ListingStatus } from '@prisma/client';
import { logger, domainLoggers } from '@/lib/api/logger';
import { generateRequestId } from '@/lib/api/errors';

const inventoryQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.nativeEnum(ListingStatus).optional(),
  search: z.string().optional(),
  lowStock: z.coerce.boolean().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'viewCount', 'priceSar', 'quantity']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const GET = withSellerAuth<{ id: string }>(
  async (request, context, params) => {
    const requestId = generateRequestId();
    const startTime = Date.now();
    
    try {
      // Validate params and query
      const sellerId = params!.id;
      const query = validateQueryParams(request, inventoryQuerySchema);
      
      logger.info('Fetching seller inventory', {
        requestId,
        sellerId,
        userId: context?.user.id,
        filters: query,
      });

      // Build filters for seller's inventory
      const filters = {
        sellerId,
        status: query.status,
        search: query.search,
        isActive: true, // Only show active listings by default
        ...(query.lowStock && { quantity: { lte: 5 } }), // Low stock filter
      };

      // Get listings with pagination
      const result = await ListingService.searchListings(
        filters,
        query.page,
        query.limit,
        query.sortBy,
        query.sortOrder
      );

      // Calculate inventory metrics
      const inventoryMetrics = await ListingService.getSellerInventoryMetrics(sellerId);

      const duration = Date.now() - startTime;
      logger.info('Seller inventory fetched successfully', {
        requestId,
        sellerId,
        duration,
        totalItems: result.pagination.total,
      });

      return createApiSuccessResponse(
        {
          items: result.listings.map(listing => ({
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
          metrics: inventoryMetrics,
        },
        {
          page: result.pagination.page,
          limit: result.pagination.limit,
          total: result.pagination.total,
          totalPages: result.pagination.totalPages,
        }
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to fetch seller inventory', error, {
        requestId,
        sellerId: params?.id,
        duration,
      });
      
      if (error instanceof z.ZodError) {
        return createApiErrorResponse(
          'VALIDATION_ERROR',
          'Invalid request parameters',
          'معاملات الطلب غير صحيحة',
          400,
          error.issues
        );
      }

      return createApiErrorResponse(
        'INTERNAL_ERROR',
        'Failed to fetch inventory',
        'فشل في جلب المخزون',
        500
      );
    }
  }
);