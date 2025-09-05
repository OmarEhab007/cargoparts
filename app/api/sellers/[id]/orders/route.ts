import { NextRequest } from 'next/server';
import { withSellerAuth, validateQueryParams, validateRequestBody, createApiSuccessResponse, createApiErrorResponse } from '@/lib/auth/api-wrapper';
import { z } from 'zod';
import { OrderStatus, OrderShippingStatus } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { logger, domainLoggers } from '@/lib/api/logger';
import { generateRequestId, BusinessErrors } from '@/lib/api/errors';

// Query schema for listing orders
const ordersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.nativeEnum(OrderStatus).optional(),
  shippingStatus: z.nativeEnum(OrderShippingStatus).optional(),
  search: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'totalAmount', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Schema for updating order status
const updateOrderSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  shippingStatus: z.nativeEnum(OrderShippingStatus).optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * GET /api/sellers/[id]/orders
 * Get all orders for a seller with pagination and filters
 */
export const GET = withSellerAuth<{ id: string }>(
  async (request, context, params) => {
    const requestId = generateRequestId();
    const startTime = Date.now();
    
    try {
      const sellerId = params!.id;
      const query = validateQueryParams(request, ordersQuerySchema);
      
      logger.info('Fetching seller orders', {
        requestId,
        sellerId,
        userId: context?.user.id,
        filters: query,
      });

      // Build where clause for orders
      const where: any = {
        items: {
          some: {
            listing: {
              sellerId,
            },
          },
        },
      };

      // Add filters
      if (query.status) {
        where.status = query.status;
      }
      if (query.shippingStatus) {
        where.shippingStatus = query.shippingStatus;
      }
      if (query.startDate || query.endDate) {
        where.createdAt = {};
        if (query.startDate) {
          where.createdAt.gte = new Date(query.startDate);
        }
        if (query.endDate) {
          where.createdAt.lte = new Date(query.endDate);
        }
      }
      if (query.search) {
        where.OR = [
          { orderNumber: { contains: query.search, mode: 'insensitive' } },
          { user: { name: { contains: query.search, mode: 'insensitive' } } },
          { user: { email: { contains: query.search, mode: 'insensitive' } } },
        ];
      }

      // Get total count
      const total = await prisma.order.count({ where });

      // Get orders with pagination
      const orders = await prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatar: true,
            },
          },
          items: {
            where: {
              listing: {
                sellerId,
              },
            },
            include: {
              listing: {
                select: {
                  id: true,
                  titleAr: true,
                  titleEn: true,
                  sku: true,
                  photos: {
                    take: 1,
                    orderBy: { sortOrder: 'asc' },
                  },
                },
              },
            },
          },
          payment: {
            select: {
              id: true,
              method: true,
              status: true,
              transactionId: true,
            },
          },
        },
        orderBy: {
          [query.sortBy]: query.sortOrder,
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      });

      // Calculate seller-specific metrics for each order
      const ordersWithMetrics = orders.map(order => {
        const sellerItems = order.items;
        const sellerTotal = sellerItems.reduce((sum, item) => sum + item.subtotal, 0);
        const sellerCommission = sellerItems.reduce((sum, item) => sum + (item.sellerEarnings || 0), 0);
        
        return {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          shippingStatus: order.shippingStatus,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          customer: {
            id: order.user.id,
            name: order.user.name,
            email: order.user.email,
            phone: order.user.phone,
            avatar: order.user.avatar,
          },
          items: sellerItems.map(item => ({
            id: item.id,
            listingId: item.listingId,
            title: item.listing.titleAr,
            titleEn: item.listing.titleEn,
            sku: item.listing.sku,
            quantity: item.quantity,
            pricePerUnit: item.pricePerUnit,
            subtotal: item.subtotal,
            sellerEarnings: item.sellerEarnings,
            image: item.listing.photos[0]?.url || null,
          })),
          sellerTotal,
          sellerCommission,
          itemCount: sellerItems.length,
          payment: order.payment ? {
            method: order.payment.method,
            status: order.payment.status,
            transactionId: order.payment.transactionId,
          } : null,
          shippingAddress: order.shippingAddress,
          trackingNumber: order.trackingNumber,
          notes: order.notes,
        };
      });

      // Get order statistics for the seller
      const stats = await prisma.order.aggregate({
        where: {
          items: {
            some: {
              listing: {
                sellerId,
              },
            },
          },
        },
        _count: {
          id: true,
        },
      });

      const statusCounts = await prisma.order.groupBy({
        by: ['status'],
        where: {
          items: {
            some: {
              listing: {
                sellerId,
              },
            },
          },
        },
        _count: {
          id: true,
        },
      });

      const duration = Date.now() - startTime;
      logger.info('Seller orders fetched successfully', {
        requestId,
        sellerId,
        duration,
        totalOrders: total,
      });

      return createApiSuccessResponse(
        {
          orders: ordersWithMetrics,
          stats: {
            total: stats._count.id,
            byStatus: Object.fromEntries(
              statusCounts.map(item => [item.status, item._count.id])
            ),
          },
        },
        {
          page: query.page,
          limit: query.limit,
          total,
          totalPages: Math.ceil(total / query.limit),
        }
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to fetch seller orders', error, {
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
        'Failed to fetch orders',
        'فشل في جلب الطلبات',
        500
      );
    }
  }
);

/**
 * PATCH /api/sellers/[id]/orders/[orderId]
 * Update order status or shipping information
 */
export const PATCH = withSellerAuth<{ id: string }>(
  async (request, context, params) => {
    const requestId = generateRequestId();
    const startTime = Date.now();
    
    try {
      const sellerId = params!.id;
      const url = new URL(request.url);
      const pathParts = url.pathname.split('/');
      const orderId = pathParts[pathParts.length - 1];
      
      const body = await validateRequestBody(request, updateOrderSchema);
      
      logger.info('Updating order', {
        requestId,
        sellerId,
        orderId,
        userId: context?.user.id,
        updates: body,
      });

      // Check if order exists and belongs to seller
      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          items: {
            some: {
              listing: {
                sellerId,
              },
            },
          },
        },
      });

      if (!order) {
        return createApiErrorResponse(
          'ORDER_NOT_FOUND',
          'Order not found or access denied',
          'الطلب غير موجود أو الوصول مرفوض',
          404
        );
      }

      // Validate status transitions
      if (body.status) {
        const invalidTransitions = {
          [OrderStatus.CANCELLED]: ['PROCESSING', 'SHIPPED', 'DELIVERED'],
          [OrderStatus.DELIVERED]: ['PENDING', 'PROCESSING', 'SHIPPED'],
        };

        if (invalidTransitions[order.status]?.includes(body.status)) {
          return createApiErrorResponse(
            'INVALID_STATUS_TRANSITION',
            `Cannot change status from ${order.status} to ${body.status}`,
            `لا يمكن تغيير الحالة من ${order.status} إلى ${body.status}`,
            400
          );
        }
      }

      // Update order
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          ...(body.status && { status: body.status }),
          ...(body.shippingStatus && { shippingStatus: body.shippingStatus }),
          ...(body.trackingNumber && { trackingNumber: body.trackingNumber }),
          ...(body.notes && { notes: body.notes }),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            where: {
              listing: {
                sellerId,
              },
            },
            include: {
              listing: {
                select: {
                  titleAr: true,
                  titleEn: true,
                },
              },
            },
          },
        },
      });

      // Log business event
      if (body.status) {
        domainLoggers.order.statusChanged(
          orderId,
          order.status,
          body.status,
          { requestId, sellerId }
        );
      }

      const duration = Date.now() - startTime;
      logger.info('Order updated successfully', {
        requestId,
        orderId,
        sellerId,
        duration,
      });

      return createApiSuccessResponse({
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        shippingStatus: updatedOrder.shippingStatus,
        trackingNumber: updatedOrder.trackingNumber,
        notes: updatedOrder.notes,
        updatedAt: updatedOrder.updatedAt,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Failed to update order', error, {
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
        'Failed to update order',
        'فشل في تحديث الطلب',
        500
      );
    }
  }
);