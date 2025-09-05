import { NextRequest } from 'next/server';
import { SellerService } from '@/lib/sellers/seller-service';
import { withSellerAuth, validateQueryParams, createApiSuccessResponse, createApiErrorResponse } from '@/lib/auth/api-wrapper';
import { z } from 'zod';

const paramsSchema = z.object({
  id: z.string()
});

const querySchema = z.object({
  period: z.enum(['7d', '30d']).optional().default('7d')
});

export const GET = withSellerAuth<{ id: string }>(
  async (request, context, params) => {
    try {
      // Validate params
      const { id: sellerId } = paramsSchema.parse(params);
      
      // Validate query params
      const { period } = validateQueryParams(request, querySchema);

      // Check if seller exists
      const seller = await SellerService.getSellerById(sellerId);
      if (!seller) {
        return createApiErrorResponse(
          'SELLER_NOT_FOUND',
          'Seller not found',
          'البائع غير موجود',
          404
        );
      }

      // Get dashboard data
      const dashboardData = await SellerService.getEnhancedDashboard(sellerId, period);

      return createApiSuccessResponse(dashboardData);
    } catch (error) {
      console.error('Error fetching seller dashboard:', error);
      
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
        'Failed to fetch dashboard data',
        'فشل في جلب بيانات لوحة التحكم',
        500
      );
    }
  }
);