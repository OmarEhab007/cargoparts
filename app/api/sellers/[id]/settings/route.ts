import { NextRequest } from 'next/server';
import { SellerService } from '@/lib/sellers/seller-service';
import { withSellerAuth, validateRequestBody, createApiSuccessResponse, createApiErrorResponse } from '@/lib/auth/api-wrapper';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/api/logger';
import { generateRequestId, BusinessErrors } from '@/lib/api/errors';

const settingsSchema = z.object({
  storeName: z.string().nullable().optional(),
  storeNameAr: z.string().nullable().optional(),
  storeSlug: z.string().nullable().optional(),
  currency: z.string().optional(),
  language: z.string().optional(),
  timeZone: z.string().optional(),
  theme: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  showPrices: z.boolean().optional(),
  showStock: z.boolean().optional(),
  allowNegotiation: z.boolean().optional(),
  autoAcceptOrders: z.boolean().optional(),
  requireDeposit: z.boolean().optional(),
  depositPercentage: z.number().min(0).max(100).optional(),
  minimumOrderValue: z.number().min(0).optional(),
  deliveryRadius: z.number().min(0).optional(),
  freeShippingThreshold: z.number().min(0).optional(),
  returnPolicy: z.string().nullable().optional(),
  returnPolicyAr: z.string().nullable().optional(),
  privacyPolicy: z.string().nullable().optional(),
  privacyPolicyAr: z.string().nullable().optional(),
  termsOfService: z.string().nullable().optional(),
  termsOfServiceAr: z.string().nullable().optional(),
  paymentMethods: z.array(z.object({
    method: z.string(),
    isEnabled: z.boolean(),
    fees: z.number().min(0)
  })).optional(),
  shippingMethods: z.array(z.object({
    name: z.string(),
    nameAr: z.string().nullable(),
    cost: z.number().min(0),
    estimatedDays: z.string(),
    isActive: z.boolean()
  })).optional(),
  notifications: z.object({
    emailNewOrder: z.boolean().optional(),
    emailCancellation: z.boolean().optional(),
    emailLowStock: z.boolean().optional(),
    smsNewOrder: z.boolean().optional(),
    smsCancellation: z.boolean().optional(),
    smsLowStock: z.boolean().optional(),
  }).optional(),
  businessHours: z.object({
    sunday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }).optional(),
    monday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }).optional(),
    tuesday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }).optional(),
    wednesday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }).optional(),
    thursday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }).optional(),
    friday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }).optional(),
    saturday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }).optional(),
  }).optional(),
});

/**
 * GET /api/sellers/[id]/settings
 * Get seller settings
 */
export const GET = withSellerAuth<{ id: string }>(
  async (request, context, params) => {
    const requestId = generateRequestId();
    const startTime = Date.now();
    
    try {
      const sellerId = params!.id;
      
      logger.info('Fetching seller settings', {
        requestId,
        sellerId,
        userId: context?.user.id,
      });

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

      // Get settings
      const settings = await SellerService.getSellerSettings(sellerId);

      const duration = Date.now() - startTime;
      logger.info('Seller settings fetched successfully', {
        requestId,
        sellerId,
        duration,
      });

      return createApiSuccessResponse(settings);
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to fetch seller settings', error, {
        requestId,
        sellerId: params?.id,
        duration,
      });

      return createApiErrorResponse(
        'INTERNAL_ERROR',
        'Failed to fetch settings',
        'فشل في جلب الإعدادات',
        500
      );
    }
  }
);

/**
 * PUT /api/sellers/[id]/settings
 * Update seller settings
 */
export const PUT = withSellerAuth<{ id: string }>(
  async (request, context, params) => {
    const requestId = generateRequestId();
    const startTime = Date.now();
    
    try {
      const sellerId = params!.id;
      const body = await validateRequestBody(request, settingsSchema);
      
      logger.info('Updating seller settings', {
        requestId,
        sellerId,
        userId: context?.user.id,
        fields: Object.keys(body),
      });

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

      const { paymentMethods, shippingMethods, notifications, businessHours, ...settingsData } = body;

      // Start transaction for atomic updates
      const updatedSettings = await prisma.$transaction(async (tx) => {
        // Update or create main settings
        const settings = await tx.sellerSettings.upsert({
          where: { sellerId },
          update: settingsData,
          create: {
            sellerId,
            ...settingsData
          }
        });

        // Update payment methods if provided
        if (paymentMethods) {
          for (const pm of paymentMethods) {
            await tx.sellerPaymentMethod.upsert({
              where: {
                sellerId_method: {
                  sellerId,
                  method: pm.method
                }
              },
              update: {
                isEnabled: pm.isEnabled,
                fees: pm.fees
              },
              create: {
                sellerId,
                ...pm
              }
            });
          }
        }

        // Update shipping methods if provided
        if (shippingMethods) {
          // Delete existing shipping methods
          await tx.sellerShippingMethod.deleteMany({
            where: { sellerId }
          });

          // Create new shipping methods
          if (shippingMethods.length > 0) {
            await tx.sellerShippingMethod.createMany({
              data: shippingMethods.map(sm => ({
                sellerId,
                ...sm
              }))
            });
          }
        }

        // Update notification preferences if provided
        if (notifications) {
          await tx.sellerNotificationPreferences.upsert({
            where: { sellerId },
            update: notifications,
            create: {
              sellerId,
              ...notifications
            }
          });
        }

        // Update business hours if provided
        if (businessHours) {
          await tx.sellerBusinessHours.upsert({
            where: { sellerId },
            update: { hours: businessHours },
            create: {
              sellerId,
              hours: businessHours
            }
          });
        }

        return settings;
      });

      // Fetch updated settings with all relations
      const finalSettings = await SellerService.getSellerSettings(sellerId);

      const duration = Date.now() - startTime;
      logger.info('Seller settings updated successfully', {
        requestId,
        sellerId,
        duration,
        updatedFields: Object.keys(body),
      });

      return createApiSuccessResponse(finalSettings);
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to update seller settings', error, {
        requestId,
        sellerId: params?.id,
        duration,
      });
      
      if (error instanceof z.ZodError) {
        return createApiErrorResponse(
          'VALIDATION_ERROR',
          'Invalid settings data',
          'بيانات الإعدادات غير صحيحة',
          400,
          error.issues
        );
      }

      return createApiErrorResponse(
        'INTERNAL_ERROR',
        'Failed to update settings',
        'فشل في تحديث الإعدادات',
        500
      );
    }
  }
);

/**
 * DELETE /api/sellers/[id]/settings
 * Reset seller settings to defaults
 */
export const DELETE = withSellerAuth<{ id: string }>(
  async (request, context, params) => {
    const requestId = generateRequestId();
    const startTime = Date.now();
    
    try {
      const sellerId = params!.id;
      
      logger.info('Resetting seller settings', {
        requestId,
        sellerId,
        userId: context?.user.id,
      });

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

      // Delete custom settings (will revert to defaults)
      await prisma.$transaction([
        prisma.sellerSettings.deleteMany({ where: { sellerId } }),
        prisma.sellerPaymentMethod.deleteMany({ where: { sellerId } }),
        prisma.sellerShippingMethod.deleteMany({ where: { sellerId } }),
        prisma.sellerNotificationPreferences.deleteMany({ where: { sellerId } }),
        prisma.sellerBusinessHours.deleteMany({ where: { sellerId } }),
      ]);

      const duration = Date.now() - startTime;
      logger.info('Seller settings reset successfully', {
        requestId,
        sellerId,
        duration,
      });

      return createApiSuccessResponse({
        message: 'Settings reset to defaults',
        messageAr: 'تم إعادة تعيين الإعدادات إلى الافتراضية',
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to reset seller settings', error, {
        requestId,
        sellerId: params?.id,
        duration,
      });

      return createApiErrorResponse(
        'INTERNAL_ERROR',
        'Failed to reset settings',
        'فشل في إعادة تعيين الإعدادات',
        500
      );
    }
  }
);