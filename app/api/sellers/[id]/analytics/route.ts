import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';
import { createSuccessResponse, handleError } from '@/lib/api/response';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const analyticsQuerySchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y']).optional().default('30d'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const resolvedParams = await params;
    const sellerId = resolvedParams.id;
    const query = analyticsQuerySchema.parse({
      ...Object.fromEntries(request.nextUrl.searchParams.entries())
    });

    // Authorization check - sellers can only access their own analytics
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

    // Calculate date range
    let startDate: Date;
    let endDate: Date = new Date();

    if (query.startDate && query.endDate) {
      startDate = new Date(query.startDate);
      endDate = new Date(query.endDate);
    } else {
      const days = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365
      }[query.period];
      
      startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
    }

    // Get analytics data from SellerAnalytics table
    const analyticsData = await prisma.sellerAnalytics.findMany({
      where: {
        sellerId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Get current period totals
    const currentPeriodStats = analyticsData.reduce((acc, record) => ({
      totalViews: acc.totalViews + record.views,
      totalInquiries: acc.totalInquiries + record.inquiries,
      totalOrders: acc.totalOrders + record.orders,
      totalRevenue: acc.totalRevenue + record.revenue,
      totalNewListings: acc.totalNewListings + record.newListings,
    }), {
      totalViews: 0,
      totalInquiries: 0,
      totalOrders: 0,
      totalRevenue: 0,
      totalNewListings: 0,
    });

    // Get comparison period (same length, previous period)
    const comparisonStartDate = new Date(startDate);
    const periodLength = endDate.getTime() - startDate.getTime();
    comparisonStartDate.setTime(startDate.getTime() - periodLength);
    const comparisonEndDate = new Date(startDate);

    const comparisonData = await prisma.sellerAnalytics.findMany({
      where: {
        sellerId,
        date: {
          gte: comparisonStartDate,
          lt: comparisonEndDate
        }
      }
    });

    const comparisonStats = comparisonData.reduce((acc, record) => ({
      totalViews: acc.totalViews + record.views,
      totalInquiries: acc.totalInquiries + record.inquiries,
      totalOrders: acc.totalOrders + record.orders,
      totalRevenue: acc.totalRevenue + record.revenue,
      totalNewListings: acc.totalNewListings + record.newListings,
    }), {
      totalViews: 0,
      totalInquiries: 0,
      totalOrders: 0,
      totalRevenue: 0,
      totalNewListings: 0,
    });

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // Get current seller stats
    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      select: {
        rating: true,
        reviewCount: true,
        totalSales: true,
        verified: true,
        _count: {
          select: {
            listings: {
              where: {
                status: 'PUBLISHED',
                isActive: true
              }
            }
          }
        }
      }
    });

    // Get top performing listings
    const topListings = await prisma.listing.findMany({
      where: {
        sellerId,
        status: 'PUBLISHED',
        isActive: true
      },
      select: {
        id: true,
        titleAr: true,
        titleEn: true,
        viewCount: true,
        priceSar: true,
        photos: {
          take: 1,
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: {
        viewCount: 'desc'
      },
      take: 5
    });

    // Format daily data for charts
    const chartData = analyticsData.map(record => ({
      date: record.date.toISOString().split('T')[0],
      views: record.views,
      inquiries: record.inquiries,
      orders: record.orders,
      revenue: record.revenue / 100, // Convert from halalas to SAR
    }));

    const analytics = {
      overview: {
        totalViews: currentPeriodStats.totalViews,
        totalInquiries: currentPeriodStats.totalInquiries,
        totalOrders: currentPeriodStats.totalOrders,
        totalRevenue: currentPeriodStats.totalRevenue / 100, // Convert to SAR
        totalNewListings: currentPeriodStats.totalNewListings,
        activeListings: seller?._count.listings || 0,
        averageRating: seller?.rating || 0,
        totalReviews: seller?.reviewCount || 0,
        totalSales: seller?.totalSales || 0,
        isVerified: seller?.verified || false,
      },
      growth: {
        viewsGrowth: calculateGrowth(currentPeriodStats.totalViews, comparisonStats.totalViews),
        inquiriesGrowth: calculateGrowth(currentPeriodStats.totalInquiries, comparisonStats.totalInquiries),
        ordersGrowth: calculateGrowth(currentPeriodStats.totalOrders, comparisonStats.totalOrders),
        revenueGrowth: calculateGrowth(currentPeriodStats.totalRevenue, comparisonStats.totalRevenue),
      },
      chartData,
      topListings: topListings.map(listing => ({
        id: listing.id,
        title: listing.titleAr,
        titleEn: listing.titleEn,
        views: listing.viewCount,
        price: listing.priceSar / 100, // Convert to SAR
        image: listing.photos[0]?.url || null,
      })),
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        period: query.period,
      }
    };

    return createSuccessResponse(analytics, 'Seller analytics retrieved successfully');
  } catch (error) {
    return handleError(error);
  }
}