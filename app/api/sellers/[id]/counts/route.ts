import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { createSuccessResponse, handleError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';

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

    // Authorization check - sellers can only access their own counts
    if (context.user.role === 'SELLER') {
      const seller = await prisma.seller.findFirst({
        where: { userId: context.user.id }
      });
      
      if (!seller || seller.id !== sellerId) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    // Get all counts in parallel for better performance
    const [
      pendingOrders,
      processingOrders,
      readyOrders,
      shippedOrders,
      completedOrders,
      returnsOrders,
      lowStockListings,
      outOfStockListings,
      archivedListings,
      newMessages,
      totalListings,
      draftListings
    ] = await Promise.all([
      // Order counts
      prisma.order.count({
        where: {
          sellerId,
          status: 'PENDING'
        }
      }),
      prisma.order.count({
        where: {
          sellerId,
          status: 'PROCESSING'
        }
      }),
      prisma.order.count({
        where: {
          sellerId,
          status: 'READY_TO_SHIP'
        }
      }),
      prisma.order.count({
        where: {
          sellerId,
          status: 'SHIPPED'
        }
      }),
      prisma.order.count({
        where: {
          sellerId,
          status: 'DELIVERED'
        }
      }),
      prisma.order.count({
        where: {
          sellerId,
          status: {
            in: ['CANCELLED', 'REFUNDED', 'DISPUTED']
          }
        }
      }),
      
      // Inventory counts
      prisma.listing.count({
        where: {
          sellerId,
          quantity: {
            lte: 5,
            gt: 0
          },
          status: 'PUBLISHED',
          isActive: true
        }
      }),
      prisma.listing.count({
        where: {
          sellerId,
          quantity: 0,
          status: 'PUBLISHED',
          isActive: true
        }
      }),
      prisma.listing.count({
        where: {
          sellerId,
          isActive: false
        }
      }),

      // Message counts
      prisma.conversation.count({
        where: {
          sellerId,
          messages: {
            some: {
              isRead: false,
              sender: {
                seller: {
                  isNot: {
                    id: sellerId
                  }
                }
              }
            }
          }
        }
      }),

      // General listing counts
      prisma.listing.count({
        where: {
          sellerId,
          status: 'PUBLISHED',
          isActive: true
        }
      }),
      prisma.listing.count({
        where: {
          sellerId,
          status: 'DRAFT'
        }
      })
    ]);

    // Get recent activity counts (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [recentViews, recentInquiries, newCustomers] = await Promise.all([
      prisma.sellerAnalytics.aggregate({
        where: {
          sellerId,
          date: {
            gte: weekAgo
          }
        },
        _sum: {
          views: true,
          inquiries: true
        }
      }),
      prisma.conversation.count({
        where: {
          sellerId,
          createdAt: {
            gte: weekAgo
          }
        }
      }),
      prisma.order.count({
        where: {
          sellerId,
          createdAt: {
            gte: weekAgo
          }
        },
        distinct: ['buyerId']
      })
    ]);

    const counts = {
      // Navigation badges
      orders: {
        pending: pendingOrders,
        processing: processingOrders,
        ready: readyOrders,
        shipped: shippedOrders,
        completed: completedOrders,
        returns: returnsOrders,
        total: pendingOrders + processingOrders + readyOrders + shippedOrders + completedOrders + returnsOrders
      },
      
      inventory: {
        total: totalListings,
        draft: draftListings,
        lowStock: lowStockListings,
        outOfStock: outOfStockListings,
        archived: archivedListings
      },

      messages: {
        unread: newMessages
      },

      // Recent activity
      activity: {
        recentViews: recentViews._sum.views || 0,
        recentInquiries: recentViews._sum.inquiries || 0,
        newCustomers,
      },

      // Summary for dashboard
      summary: {
        activeOrders: pendingOrders + processingOrders + readyOrders,
        urgentActions: lowStockListings + outOfStockListings + newMessages + pendingOrders,
        totalProducts: totalListings,
      }
    };

    return createSuccessResponse(counts, 'Seller counts retrieved successfully');
  } catch (error) {
    return handleError(error);
  }
}