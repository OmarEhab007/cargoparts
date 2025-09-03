import { prisma } from '@/lib/db/prisma';
// import { CartService } from './cart-service';
import type { Order, OrderStatus, OrderItem, Address } from '@prisma/client';

export interface CreateOrderInput {
  buyerId: string;
  addressId: string;
  items: Array<{
    listingId: string;
    quantity: number;
  }>;
  notes?: string;
}

export interface OrderWithDetails extends Order {
  buyer: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  };
  address: Address | null;
  items: Array<OrderItem & {
    listing: {
      id: string;
      titleAr: string;
      titleEn: string | null;
      sku: string | null;
      condition: string;
      seller: {
        id: string;
        businessName: string;
        city: string;
        phone: string | null;
      };
      photos: Array<{
        id: string;
        url: string;
        alt: string | null;
      }>;
    };
  }>;
  payments: Array<{
    id: string;
    provider: string;
    status: string;
    amount: number;
    createdAt: Date;
  }>;
  statusHistory: Array<{
    id: string;
    status: OrderStatus;
    notes: string | null;
    createdAt: Date;
  }>;
}

export interface OrderFilters {
  status?: OrderStatus;
  buyerId?: string;
  sellerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minTotal?: number;
  maxTotal?: number;
}

export class OrderService {
  /**
   * Create order from cart or specific items
   */
  static async createOrder(input: CreateOrderInput): Promise<OrderWithDetails> {
    return prisma.$transaction(async (tx) => {
      // Validate user address
      const address = await tx.address.findUnique({
        where: {
          id: input.addressId,
          userId: input.buyerId,
        },
      });

      if (!address) {
        throw new Error('Invalid shipping address');
      }

      // Validate and calculate items
      const orderItems: Array<{
        listingId: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
      }> = [];

      let subtotal = 0;

      for (const item of input.items) {
        const listing = await tx.listing.findUnique({
          where: { 
            id: item.listingId,
            isActive: true,
            status: 'PUBLISHED',
          },
          select: {
            id: true,
            priceSar: true,
            quantity: true,
            minQuantity: true,
            sellerId: true,
          },
        });

        if (!listing) {
          throw new Error(`Listing ${item.listingId} not found or unavailable`);
        }

        // Check quantity availability
        if (item.quantity > listing.quantity) {
          throw new Error(`Only ${listing.quantity} items available for listing ${item.listingId}`);
        }

        if (item.quantity < listing.minQuantity) {
          throw new Error(`Minimum quantity is ${listing.minQuantity} for listing ${item.listingId}`);
        }

        // Check if buyer is not the seller
        const seller = await tx.seller.findUnique({
          where: { id: listing.sellerId },
          select: { userId: true },
        });

        if (seller?.userId === input.buyerId) {
          throw new Error('Cannot purchase your own items');
        }

        const itemTotal = listing.priceSar * item.quantity;
        subtotal += itemTotal;

        orderItems.push({
          listingId: item.listingId,
          quantity: item.quantity,
          unitPrice: listing.priceSar,
          totalPrice: itemTotal,
        });
      }

      // Calculate totals (for now, no tax or shipping)
      const taxAmount = 0; // TODO: Implement tax calculation
      const shippingAmount = 0; // TODO: Implement shipping calculation
      const total = subtotal + taxAmount + shippingAmount;

      // Generate unique order number
      const orderNumber = await this.generateOrderNumber();

      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber,
          buyerId: input.buyerId,
          addressId: input.addressId,
          status: 'PENDING',
          subtotal,
          taxAmount,
          shippingAmount,
          total,
          notes: input.notes,
          items: {
            create: orderItems,
          },
        },
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          address: true,
          items: {
            include: {
              listing: {
                include: {
                  seller: {
                    select: {
                      id: true,
                      businessName: true,
                      city: true,
                      phone: true,
                    },
                  },
                  photos: {
                    take: 1,
                    orderBy: { sortOrder: 'asc' },
                    select: {
                      id: true,
                      url: true,
                      alt: true,
                    },
                  },
                },
              },
            },
          },
          payments: true,
          statusHistory: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      // Create initial status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'PENDING',
          notes: 'Order created',
        },
      });

      // Remove items from cart if they were purchased from cart
      await tx.cartItem.deleteMany({
        where: {
          userId: input.buyerId,
          listingId: { in: orderItems.map(item => item.listingId) },
        },
      });

      return order as OrderWithDetails;
    });
  }

  /**
   * Get order by ID with full details
   */
  static async getOrderById(orderId: string, userId?: string): Promise<OrderWithDetails | null> {
    const where: Record<string, unknown> = { id: orderId };
    
    // If userId provided, ensure user can access this order
    if (userId) {
      where.OR = [
        { buyerId: userId },
        { items: { some: { listing: { seller: { userId } } } } },
      ];
    }

    return prisma.order.findUnique({
      where,
      include: {
        buyer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        address: true,
        items: {
          include: {
            listing: {
              include: {
                seller: {
                  select: {
                    id: true,
                    businessName: true,
                    city: true,
                    phone: true,
                  },
                },
                photos: {
                  take: 1,
                  orderBy: { sortOrder: 'asc' },
                  select: {
                    id: true,
                    url: true,
                    alt: true,
                  },
                },
              },
            },
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    }) as OrderWithDetails | null;
  }

  /**
   * Get order by order number
   */
  static async getOrderByNumber(orderNumber: string): Promise<OrderWithDetails | null> {
    return this.getOrderById(orderNumber) as Promise<OrderWithDetails | null>;
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(
    orderId: string, 
    status: OrderStatus, 
    notes?: string,
    changedBy?: string
  ): Promise<OrderWithDetails> {
    return prisma.$transaction(async (tx) => {
      // Update order
      const order = await tx.order.update({
        where: { id: orderId },
        data: {
          status,
          ...(status === 'CONFIRMED' && { confirmedAt: new Date() }),
          ...(status === 'SHIPPED' && { shippedAt: new Date() }),
          ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
          ...(status === 'CANCELLED' && { cancelledAt: new Date() }),
        },
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          address: true,
          items: {
            include: {
              listing: {
                include: {
                  seller: {
                    select: {
                      id: true,
                      businessName: true,
                      city: true,
                      phone: true,
                    },
                  },
                  photos: {
                    take: 1,
                    orderBy: { sortOrder: 'asc' },
                    select: {
                      id: true,
                      url: true,
                      alt: true,
                    },
                  },
                },
              },
            },
          },
          payments: {
            orderBy: { createdAt: 'desc' },
          },
          statusHistory: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      // Add to status history
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status,
          notes,
          changedBy,
        },
      });

      // Handle status-specific logic
      if (status === 'CANCELLED') {
        // Restore inventory quantities
        for (const item of order.items) {
          await tx.listing.update({
            where: { id: item.listingId },
            data: {
              quantity: { increment: item.quantity },
            },
          });
        }
      }

      return order as OrderWithDetails;
    });
  }

  /**
   * Search orders with filters and pagination
   */
  static async searchOrders(
    filters: OrderFilters = {},
    page = 1,
    limit = 20
  ): Promise<{
    orders: OrderWithDetails[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const skip = (page - 1) * limit;
    
    const where: Record<string, unknown> = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.buyerId) {
      where.buyerId = filters.buyerId;
    }

    if (filters.sellerId) {
      where.items = {
        some: {
          listing: {
            sellerId: filters.sellerId,
          },
        },
      };
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) (where.createdAt as Record<string, unknown>).gte = filters.dateFrom;
      if (filters.dateTo) (where.createdAt as Record<string, unknown>).lte = filters.dateTo;
    }

    if (filters.minTotal || filters.maxTotal) {
      where.total = {};
      if (filters.minTotal) (where.total as Record<string, unknown>).gte = filters.minTotal;
      if (filters.maxTotal) (where.total as Record<string, unknown>).lte = filters.maxTotal;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          address: true,
          items: {
            include: {
              listing: {
                include: {
                  seller: {
                    select: {
                      id: true,
                      businessName: true,
                      city: true,
                      phone: true,
                    },
                  },
                  photos: {
                    take: 1,
                    orderBy: { sortOrder: 'asc' },
                    select: {
                      id: true,
                      url: true,
                      alt: true,
                    },
                  },
                },
              },
            },
          },
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          statusHistory: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }) as OrderWithDetails[],
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get user's orders
   */
  static async getUserOrders(userId: string, page = 1, limit = 20) {
    return this.searchOrders({ buyerId: userId }, page, limit);
  }

  /**
   * Get seller's orders
   */
  static async getSellerOrders(sellerId: string, page = 1, limit = 20) {
    return this.searchOrders({ sellerId }, page, limit);
  }

  /**
   * Cancel order (if cancellable)
   */
  static async cancelOrder(orderId: string, reason?: string, cancelledBy?: string): Promise<OrderWithDetails> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Check if order can be cancelled
    const cancellableStatuses: OrderStatus[] = ['PENDING', 'CONFIRMED'];
    
    if (!cancellableStatuses.includes(order.status)) {
      throw new Error('Order cannot be cancelled at this stage');
    }

    return this.updateOrderStatus(
      orderId, 
      'CANCELLED', 
      reason || 'Order cancelled',
      cancelledBy
    );
  }

  /**
   * Get order statistics
   */
  static async getOrderStats(filters: { sellerId?: string; buyerId?: string } = {}): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: Record<OrderStatus, number>;
    recentOrders: number;
  }> {
    const where: Record<string, unknown> = {};
    
    if (filters.sellerId) {
      where.items = {
        some: {
          listing: { sellerId: filters.sellerId },
        },
      };
    }

    if (filters.buyerId) {
      where.buyerId = filters.buyerId;
    }

    // Get recent orders (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalStats,
      revenueStats,
      statusStats,
      recentOrdersCount,
    ] = await Promise.all([
      prisma.order.aggregate({
        where,
        _count: { id: true },
      }),
      prisma.order.aggregate({
        where: {
          ...where,
          status: { in: ['DELIVERED', 'COMPLETED'] },
        },
        _sum: { total: true },
      }),
      prisma.order.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
      }),
      prisma.order.count({
        where: {
          ...where,
          createdAt: { gte: sevenDaysAgo },
        },
      }),
    ]);

    const totalOrders = totalStats._count.id || 0;
    const totalRevenue = revenueStats._sum.total || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const ordersByStatus = statusStats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.id;
      return acc;
    }, {} as Record<OrderStatus, number>);

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      ordersByStatus,
      recentOrders: recentOrdersCount,
    };
  }

  /**
   * Generate unique order number
   */
  private static async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    let orderNumber: string;
    let attempts = 0;
    const maxAttempts = 100;
    
    do {
      const sequence = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      orderNumber = `CP${year}${month}${day}${sequence}`;
      
      const existing = await prisma.order.findUnique({
        where: { orderNumber },
        select: { id: true },
      });
      
      if (!existing) {
        break;
      }
      
      attempts++;
    } while (attempts < maxAttempts);
    
    if (attempts >= maxAttempts) {
      throw new Error('Unable to generate unique order number');
    }
    
    return orderNumber;
  }
}