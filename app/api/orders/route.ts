import { NextRequest, NextResponse } from 'next/server';
import { OrderService, OrderFilters } from '@/lib/orders/order-service';
import { withAuth } from '@/lib/auth/middleware';
import { createSuccessResponse, createPaginatedResponse, handleError } from '@/lib/api/response';
import { parseSearchParams, parseOrderFilters } from '@/lib/api/utils';
import { OrderStatus } from '@prisma/client';
import { z } from 'zod';

const createOrderSchema = z.object({
  addressId: z.string().cuid('Invalid address ID'),
  items: z.array(z.object({
    listingId: z.string().cuid('Invalid listing ID'),
    quantity: z.number().int().positive().max(100, 'Quantity cannot exceed 100'),
  })).min(1, 'At least one item is required'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

const updateOrderStatusSchema = z.object({
  orderId: z.string().cuid('Invalid order ID'),
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'READY_TO_SHIP',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED',
    'DISPUTED'
  ]),
  notes: z.string().max(500).optional(),
});

// Get orders list
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

    const searchParams = parseSearchParams(request);
    const apiFilters = parseOrderFilters(request);

    // Convert API filters to OrderService filters
    const filters: OrderFilters = {
      status: apiFilters.status as OrderStatus,
      buyerId: apiFilters.buyerId,
      sellerId: apiFilters.sellerId,
      dateFrom: apiFilters.dateFrom ? new Date(apiFilters.dateFrom) : undefined,
      dateTo: apiFilters.dateTo ? new Date(apiFilters.dateTo) : undefined,
      minTotal: apiFilters.minTotal,
      maxTotal: apiFilters.maxTotal,
    };

    let result;

    if (context.user.role === 'ADMIN') {
      // Admin can see all orders with filters
      result = await OrderService.searchOrders(filters, searchParams.page, searchParams.limit);
    } else if (context.user.role === 'SELLER') {
      // Sellers can see their own orders
      const { SellerService } = await import('@/lib/sellers/seller-service');
      const seller = await SellerService.getSellerByUserId(context.user.id);
      
      if (!seller) {
        return NextResponse.json(
          { error: 'Seller profile not found' },
          { status: 404 }
        );
      }

      result = await OrderService.getSellerOrders(
        seller.id,
        searchParams.page,
        searchParams.limit
      );
    } else {
      // Buyers can see their own orders
      result = await OrderService.getUserOrders(
        context.user.id,
        searchParams.page,
        searchParams.limit
      );
    }

    return createPaginatedResponse(
      result.orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        subtotal: order.subtotal,
        taxAmount: order.taxAmount,
        shippingAmount: order.shippingAmount,
        total: order.total,
        currency: order.currency,
        notes: order.notes,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        confirmedAt: order.confirmedAt,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt,
        cancelledAt: order.cancelledAt,
        buyer: {
          id: order.buyer.id,
          name: order.buyer.name,
          email: order.buyer.email,
          phone: order.buyer.phone,
        },
        address: order.address ? {
          id: order.address.id,
          title: order.address.title,
          firstName: order.address.firstName,
          lastName: order.address.lastName,
          addressLine1: order.address.addressLine1,
          city: order.address.city,
          postalCode: order.address.postalCode,
          phone: order.address.phone,
        } : null,
        items: order.items.map(item => ({
          id: item.id,
          listingId: item.listingId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          listing: {
            id: item.listing.id,
            titleAr: item.listing.titleAr,
            titleEn: item.listing.titleEn,
            sku: item.listing.sku,
            condition: item.listing.condition,
            photos: item.listing.photos,
            seller: item.listing.seller,
          },
        })),
        latestPayment: order.payments[0] || null,
        itemCount: order.items.length,
        totalQuantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
      })),
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
      'Orders retrieved successfully'
    );
  } catch (error) {
    return handleError(error);
  }
}

// Create new order
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

    // Only buyers can create orders
    if (context.user.role !== 'BUYER') {
      return NextResponse.json(
        { error: 'Only buyers can create orders' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const orderData = createOrderSchema.parse(body);

    const order = await OrderService.createOrder({
      buyerId: context.user.id,
      addressId: orderData.addressId,
      items: orderData.items,
      notes: orderData.notes,
    });

    return createSuccessResponse({
      message: 'Order created successfully',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        currency: order.currency,
        createdAt: order.createdAt,
        items: order.items.map(item => ({
          id: item.id,
          listingId: item.listingId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          listing: {
            titleAr: item.listing.titleAr,
            titleEn: item.listing.titleEn,
            sku: item.listing.sku,
          },
        })),
      },
    }, 'Order created successfully', 201);
  } catch (error) {
    return handleError(error);
  }
}

// Update order status (admin/seller only)
export async function PATCH(request: NextRequest) {
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
    const { orderId, status, notes } = updateOrderStatusSchema.parse(body);

    // Verify user can update this order
    if (context.user.role === 'SELLER') {
      const { SellerService } = await import('@/lib/sellers/seller-service');
      const seller = await SellerService.getSellerByUserId(context.user.id);
      
      if (!seller) {
        return NextResponse.json(
          { error: 'Seller profile not found' },
          { status: 404 }
        );
      }

      // Check if order contains items from this seller
      const order = await OrderService.getOrderById(orderId);
      if (!order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      const hasSellerItems = order.items.some(item => 
        item.listing.seller.id === seller.id
      );

      if (!hasSellerItems) {
        return NextResponse.json(
          { error: 'Not authorized to update this order' },
          { status: 403 }
        );
      }
    }

    const updatedOrder = await OrderService.updateOrderStatus(
      orderId,
      status,
      notes,
      context.user.id
    );

    return createSuccessResponse({
      message: 'Order status updated successfully',
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        updatedAt: updatedOrder.updatedAt,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}