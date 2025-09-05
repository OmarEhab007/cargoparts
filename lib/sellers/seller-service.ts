import { prisma } from '@/lib/db/prisma';
import type { Seller, SellerStatus, BusinessType, DocumentType, VerificationStatus, User, Prisma } from '@prisma/client';
import { z } from 'zod';
import { cache } from 'react';

export interface SellerDashboardData {
  overview: {
    totalViews: number;
    totalInquiries: number;
    totalOrders: number;
    totalRevenue: number;
    totalNewListings: number;
    activeListings: number;
    averageRating: number;
    totalReviews: number;
    totalSales: number;
    isVerified: boolean;
  };
  growth: {
    viewsGrowth: number;
    inquiriesGrowth: number;
    ordersGrowth: number;
    revenueGrowth: number;
  };
  chartData: Array<{
    date: string;
    views: number;
    inquiries: number;
    orders: number;
    revenue: number;
  }>;
  topListings: Array<{
    id: string;
    title: string;
    titleEn?: string;
    views: number;
    price: number;
    image: string | null;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    buyerName: string;
    items: number;
    total: number;
    status: string;
    createdAt: string;
  }>;
  period: {
    startDate: string;
    endDate: string;
    period: string;
  };
}

export interface SellerProfile {
  id: string;
  businessName: string;
  businessNameEn: string | null;
  businessType: string;
  commercialLicense: string | null;
  taxNumber: string | null;
  city: string;
  district: string | null;
  region: string | null;
  postalCode: string | null;
  address: string;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  email: string | null;
  contactPerson: string | null;
  description: string | null;
  descriptionEn: string | null;
  logo: string | null;
  coverImage: string | null;
  establishedYear: number | null;
  employeeCount: string | null;
  specializations: string[];
  certifications: string[];
  verified: boolean;
  verifiedAt: Date | null;
  status: string;
  rating: number;
  reviewCount: number;
  totalSales: number;
  totalRevenue: number;
  responseTime: string | null;
  profileCompletion: number;
  trustScore: number;
  workingHours?: Array<{
    day: string;
    dayIndex: number;
    open: string | null;
    close: string | null;
    isOpen: boolean;
  }>;
  socialMedia?: Array<{
    platform: string;
    url: string;
    isActive: boolean;
  }>;
}

export interface SellerSettings {
  storeName: string | null;
  storeNameAr: string | null;
  storeSlug: string | null;
  currency: string;
  language: string;
  timeZone: string;
  theme: string;
  primaryColor: string;
  secondaryColor: string;
  showPrices: boolean;
  showStock: boolean;
  allowNegotiation: boolean;
  autoAcceptOrders: boolean;
  requireDeposit: boolean;
  depositPercentage: number;
  minimumOrderValue: number;
  deliveryRadius: number;
  freeShippingThreshold: number;
  returnPolicy: string | null;
  returnPolicyAr: string | null;
  privacyPolicy: string | null;
  privacyPolicyAr: string | null;
  termsOfService: string | null;
  termsOfServiceAr: string | null;
  paymentMethods?: Array<{
    method: string;
    isEnabled: boolean;
    fees: number;
  }>;
  shippingMethods?: Array<{
    name: string;
    nameAr: string | null;
    cost: number;
    estimatedDays: string;
    isActive: boolean;
  }>;
}

export interface CreateSellerInput {
  userId: string;
  businessName: string;
  businessNameEn?: string;
  businessType: BusinessType;
  commercialLicense?: string;
  taxNumber?: string;
  city: string;
  district?: string;
  address: string;
  phone?: string;
  whatsapp?: string;
  description?: string;
  descriptionEn?: string;
}

export interface UpdateSellerInput {
  businessName?: string;
  businessNameEn?: string;
  businessType?: BusinessType;
  commercialLicense?: string;
  taxNumber?: string;
  city?: string;
  district?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  description?: string;
  descriptionEn?: string;
}

export interface SellerFilters {
  city?: string;
  businessType?: BusinessType;
  status?: SellerStatus;
  verified?: boolean;
  rating?: number;
  search?: string;
}

export interface VerificationDocInput {
  sellerId: string;
  type: DocumentType;
  filename: string;
  url: string;
}

const saudiPhoneSchema = z.string().regex(/^(\+966|0)?[5][0-9]{8}$/, 'Invalid Saudi phone number');

export class SellerService {
  /**
   * Create a new seller profile
   */
  static async createSeller(input: CreateSellerInput): Promise<Seller> {
    // Validate phone numbers if provided
    if (input.phone) {
      saudiPhoneSchema.parse(input.phone);
    }
    if (input.whatsapp) {
      saudiPhoneSchema.parse(input.whatsapp);
    }

    // Check if user already has a seller profile
    const existingSeller = await prisma.seller.findUnique({
      where: { userId: input.userId },
    });

    if (existingSeller) {
      throw new Error('User already has a seller profile');
    }

    // Create seller
    const seller = await prisma.seller.create({
      data: {
        ...input,
        status: 'PENDING_REVIEW',
      },
      include: {
        user: true,
      },
    });

    // Update user role to SELLER
    await prisma.user.update({
      where: { id: input.userId },
      data: { role: 'SELLER' },
    });

    return seller;
  }

  /**
   * Get seller by ID
   */
  static async getSellerById(id: string): Promise<(Seller & { 
    user: User;
    verificationDocs: Array<{
      id: string;
      type: string;
      filename: string;
      status: string;
      createdAt: Date;
    }>;
    bankAccounts: Array<{
      id: string;
      bankName: string;
      accountNumber: string;
      isActive: boolean;
    }>;
    _count: { listings: number };
  }) | null> {
    return prisma.seller.findUnique({
      where: { id },
      include: {
        user: true,
        verificationDocs: true,
        bankAccounts: true,
        _count: {
          select: { listings: true },
        },
      },
    });
  }

  /**
   * Get seller by user ID
   */
  static async getSellerByUserId(userId: string): Promise<Seller | null> {
    return prisma.seller.findUnique({
      where: { userId },
      include: {
        user: true,
        verificationDocs: true,
        _count: {
          select: { listings: true },
        },
      },
    });
  }

  /**
   * Update seller profile
   */
  static async updateSeller(id: string, input: UpdateSellerInput): Promise<Seller> {
    // Validate phone numbers if provided
    if (input.phone) {
      saudiPhoneSchema.parse(input.phone);
    }
    if (input.whatsapp) {
      saudiPhoneSchema.parse(input.whatsapp);
    }

    return prisma.seller.update({
      where: { id },
      data: input,
      include: {
        user: true,
      },
    });
  }

  /**
   * Update seller status
   */
  static async updateSellerStatus(id: string, status: SellerStatus): Promise<Seller> {
    const updateData: Record<string, unknown> = {
      status,
      ...(status === 'APPROVED' && { verified: true, verifiedAt: new Date() }),
    };

    return prisma.seller.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
      },
    });
  }

  /**
   * Search sellers with filters and pagination
   */
  static async searchSellers(filters: SellerFilters = {}, page = 1, limit = 20): Promise<{
    sellers: Seller[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const skip = (page - 1) * limit;
    
    const where: Record<string, unknown> = {};

    if (filters.city) {
      where.city = { contains: filters.city, mode: 'insensitive' };
    }

    if (filters.businessType) {
      where.businessType = filters.businessType;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.verified !== undefined) {
      where.verified = filters.verified;
    }

    if (filters.rating) {
      where.rating = { gte: filters.rating };
    }

    if (filters.search) {
      where.OR = [
        { businessName: { contains: filters.search, mode: 'insensitive' } },
        { businessNameEn: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { user: { name: { contains: filters.search, mode: 'insensitive' } } },
        { user: { email: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    const [sellers, total] = await Promise.all([
      prisma.seller.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          _count: {
            select: { listings: true },
          },
        },
      }),
      prisma.seller.count({ where }),
    ]);

    return {
      sellers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get sellers pending verification
   */
  static async getPendingSellers(page = 1, limit = 20): Promise<{
    sellers: Seller[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    return this.searchSellers({ status: 'PENDING_REVIEW' }, page, limit);
  }

  /**
   * Upload verification document
   */
  static async uploadVerificationDoc(input: VerificationDocInput) {
    return prisma.verificationDoc.create({
      data: {
        sellerId: input.sellerId,
        type: input.type,
        filename: input.filename,
        url: input.url,
        status: 'PENDING',
      },
    });
  }

  /**
   * Update verification document status
   */
  static async updateVerificationDocStatus(
    docId: string,
    status: VerificationStatus,
    reviewedBy: string,
    notes?: string
  ) {
    return prisma.verificationDoc.update({
      where: { id: docId },
      data: {
        status,
        reviewedBy,
        reviewedAt: new Date(),
        notes,
      },
    });
  }

  /**
   * Get seller verification documents
   */
  static async getVerificationDocs(sellerId: string) {
    return prisma.verificationDoc.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Add bank account for seller
   */
  static async addBankAccount(data: {
    sellerId: string;
    bankName: string;
    accountNumber: string;
    iban: string;
    accountHolder: string;
  }) {
    // Deactivate other accounts first (only one active at a time)
    await prisma.bankAccount.updateMany({
      where: { sellerId: data.sellerId },
      data: { isActive: false },
    });

    return prisma.bankAccount.create({
      data: {
        ...data,
        isActive: true,
      },
    });
  }

  /**
   * Get seller bank accounts
   */
  static async getBankAccounts(sellerId: string) {
    return prisma.bankAccount.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update seller rating (called after review submission)
   */
  static async updateSellerRating(sellerId: string): Promise<void> {
    const reviews = await prisma.review.findMany({
      where: { sellerId, isHidden: false },
      select: { rating: true },
    });

    if (reviews.length === 0) return;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await prisma.seller.update({
      where: { id: sellerId },
      data: {
        rating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
        reviewCount: reviews.length,
      },
    });
  }

  /**
   * Get seller statistics
   */
  static async getSellerStats(sellerId: string): Promise<{
    totalListings: number;
    activeListings: number;
    totalOrders: number;
    completedOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    rating: number;
    reviewCount: number;
  }> {
    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      select: { rating: true, reviewCount: true },
    });

    const [
      totalListings,
      activeListings,
      orderStats,
      revenueStats,
    ] = await Promise.all([
      prisma.listing.count({
        where: { sellerId },
      }),
      prisma.listing.count({
        where: { sellerId, isActive: true, status: 'PUBLISHED' },
      }),
      prisma.order.aggregate({
        where: { 
          items: { some: { listing: { sellerId } } },
        },
        _count: { id: true },
      }),
      prisma.order.aggregate({
        where: { 
          items: { some: { listing: { sellerId } } },
          status: { in: ['DELIVERED'] },
        },
        _count: { id: true },
        _sum: { total: true },
      }),
    ]);

    const totalOrders = orderStats._count.id || 0;
    const completedOrders = revenueStats._count?.id || 0;
    const totalRevenue = revenueStats._sum?.total || 0;
    const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;

    return {
      totalListings,
      activeListings,
      totalOrders,
      completedOrders,
      totalRevenue,
      averageOrderValue,
      rating: seller?.rating || 0,
      reviewCount: seller?.reviewCount || 0,
    };
  }

  /**
   * Get top sellers by rating
   */
  static async getTopSellers(limit = 10): Promise<Seller[]> {
    return prisma.seller.findMany({
      where: {
        verified: true,
        status: 'APPROVED',
        reviewCount: { gt: 0 },
      },
      take: limit,
      orderBy: [
        { rating: 'desc' },
        { reviewCount: 'desc' },
      ],
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: { listings: true },
        },
      },
    });
  }

  /**
   * Get enhanced seller dashboard data with analytics
   */
  static async getEnhancedDashboard(sellerId: string, period: '7d' | '30d' = '7d'): Promise<SellerDashboardData> {
    const days = period === '7d' ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    // Get seller info
    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      include: {
        listings: {
          where: { status: 'PUBLISHED' }
        }
      }
    });

    if (!seller) throw new Error('Seller not found');

    // Get analytics data for the period
    const analytics = await prisma.sellerAnalytics.findMany({
      where: {
        sellerId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'asc' }
    });

    // Get previous period data for growth calculation
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - days);
    
    const prevAnalytics = await prisma.sellerAnalytics.findMany({
      where: {
        sellerId,
        date: {
          gte: prevStartDate,
          lt: startDate
        }
      }
    });

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      where: {
        items: { some: { listing: { sellerId } } },
        createdAt: {
          gte: startDate
        }
      },
      include: {
        buyer: true,
        items: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Get top listings by views
    const topListings = await prisma.listing.findMany({
      where: {
        sellerId,
        status: 'PUBLISHED'
      },
      include: {
        photos: {
          take: 1,
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { viewCount: 'desc' },
      take: 5
    });

    // Calculate totals for current period
    const currentTotals = analytics.reduce((acc, day) => ({
      views: acc.views + day.views,
      inquiries: acc.inquiries + day.inquiries,
      orders: acc.orders + day.orders,
      revenue: acc.revenue + day.revenue,
      newListings: acc.newListings + day.newListings
    }), { views: 0, inquiries: 0, orders: 0, revenue: 0, newListings: 0 });

    // Calculate totals for previous period
    const prevTotals = prevAnalytics.reduce((acc, day) => ({
      views: acc.views + day.views,
      inquiries: acc.inquiries + day.inquiries,
      orders: acc.orders + day.orders,
      revenue: acc.revenue + day.revenue
    }), { views: 0, inquiries: 0, orders: 0, revenue: 0 });

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    // Prepare chart data
    const chartData = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      date.setHours(0, 0, 0, 0);

      const dayData = analytics.find(a => 
        new Date(a.date).toDateString() === date.toDateString()
      );

      chartData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        views: dayData?.views || 0,
        inquiries: dayData?.inquiries || 0,
        orders: dayData?.orders || 0,
        revenue: dayData?.revenue || 0
      });
    }

    return {
      overview: {
        totalViews: currentTotals.views,
        totalInquiries: currentTotals.inquiries,
        totalOrders: currentTotals.orders,
        totalRevenue: currentTotals.revenue,
        totalNewListings: currentTotals.newListings,
        activeListings: seller.listings.length,
        averageRating: seller.rating,
        totalReviews: seller.reviewCount,
        totalSales: seller.totalSales,
        isVerified: seller.verified
      },
      growth: {
        viewsGrowth: calculateGrowth(currentTotals.views, prevTotals.views),
        inquiriesGrowth: calculateGrowth(currentTotals.inquiries, prevTotals.inquiries),
        ordersGrowth: calculateGrowth(currentTotals.orders, prevTotals.orders),
        revenueGrowth: calculateGrowth(currentTotals.revenue, prevTotals.revenue)
      },
      chartData,
      topListings: topListings.map(listing => ({
        id: listing.id,
        title: listing.titleAr,
        titleEn: listing.titleEn || undefined,
        views: listing.viewCount,
        price: listing.priceSar,
        image: listing.photos[0]?.url || null
      })),
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        buyerName: order.buyer.name || 'Unknown',
        items: order.items.length,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt.toISOString()
      })),
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        period
      }
    };
  }

  /**
   * Get seller profile with complete data
   */
  static async getSellerProfile(sellerId: string): Promise<SellerProfile | null> {
    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      include: {
        workingHours: {
          orderBy: { dayIndex: 'asc' }
        },
        socialMedia: {
          where: { isActive: true }
        }
      }
    });

    if (!seller) return null;

    // Calculate profile completion
    const profileCompletion = this.calculateProfileCompletion(seller);

    return {
      ...seller,
      profileCompletion,
      workingHours: seller.workingHours.map(wh => ({
        day: wh.day,
        dayIndex: wh.dayIndex,
        open: wh.open,
        close: wh.close,
        isOpen: wh.isOpen
      })),
      socialMedia: seller.socialMedia.map(sm => ({
        platform: sm.platform,
        url: sm.url,
        isActive: sm.isActive
      }))
    };
  }

  /**
   * Update seller profile with working hours and social media
   */
  static async updateSellerProfile(
    sellerId: string,
    data: Partial<SellerProfile>
  ) {
    const { workingHours, socialMedia, profileCompletion, trustScore, totalSales, totalRevenue, responseTime, ...profileData } = data;

    // Update main profile
    const updatedSeller = await prisma.seller.update({
      where: { id: sellerId },
      data: {
        ...profileData
      }
    });

    // Update working hours if provided
    if (workingHours) {
      await prisma.sellerWorkingHours.deleteMany({
        where: { sellerId }
      });

      await prisma.sellerWorkingHours.createMany({
        data: workingHours.map(wh => ({
          sellerId,
          ...wh
        }))
      });
    }

    // Update social media if provided
    if (socialMedia) {
      for (const sm of socialMedia) {
        await prisma.sellerSocialMedia.upsert({
          where: {
            sellerId_platform: {
              sellerId,
              platform: sm.platform
            }
          },
          update: {
            url: sm.url,
            isActive: sm.isActive
          },
          create: {
            sellerId,
            ...sm
          }
        });
      }
    }

    return updatedSeller;
  }

  /**
   * Get and manage seller settings
   */
  static async getSellerSettings(sellerId: string): Promise<SellerSettings | null> {
    const settings = await prisma.sellerSettings.findUnique({
      where: { sellerId },
      include: {
        seller: {
          include: {
            paymentMethods: true,
            shippingMethods: true
          }
        }
      }
    });

    if (!settings) {
      // Create default settings if not exists
      const defaultSettings = await prisma.sellerSettings.create({
        data: {
          sellerId,
          storeName: null,
          storeNameAr: null,
          storeSlug: null
        },
        include: {
          seller: {
            include: {
              paymentMethods: true,
              shippingMethods: true
            }
          }
        }
      });

      // Initialize default payment methods
      await prisma.sellerPaymentMethod.createMany({
        data: [
          { sellerId, method: 'cash_on_delivery', isEnabled: true, fees: 0 },
          { sellerId, method: 'bank_transfer', isEnabled: false, fees: 0 },
          { sellerId, method: 'credit_card', isEnabled: false, fees: 2.5 },
          { sellerId, method: 'apple_pay', isEnabled: false, fees: 2.9 }
        ],
        skipDuplicates: true
      });

      // Initialize default shipping methods
      await prisma.sellerShippingMethod.createMany({
        data: [
          {
            sellerId,
            name: 'Standard Delivery',
            nameAr: 'التوصيل العادي',
            cost: 25,
            estimatedDays: '2-3',
            isActive: true
          },
          {
            sellerId,
            name: 'Express Delivery',
            nameAr: 'التوصيل السريع',
            cost: 50,
            estimatedDays: '1-2',
            isActive: false
          }
        ],
        skipDuplicates: true
      });

      return {
        ...defaultSettings,
        paymentMethods: defaultSettings.seller.paymentMethods,
        shippingMethods: defaultSettings.seller.shippingMethods
      };
    }

    return {
      ...settings,
      paymentMethods: settings.seller.paymentMethods,
      shippingMethods: settings.seller.shippingMethods
    };
  }

  /**
   * Track seller analytics
   */
  static async trackAnalytics(
    sellerId: string,
    type: 'view' | 'inquiry' | 'order',
    data?: {
      revenue?: number;
      customerId?: string;
    }
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const analytics = await prisma.sellerAnalytics.findUnique({
      where: {
        sellerId_date: {
          sellerId,
          date: today
        }
      }
    });

    const updateData: Prisma.SellerAnalyticsUpdateInput = {};
    
    if (type === 'view') {
      updateData.views = { increment: 1 };
    } else if (type === 'inquiry') {
      updateData.inquiries = { increment: 1 };
    } else if (type === 'order' && data?.revenue) {
      updateData.orders = { increment: 1 };
      updateData.revenue = { increment: data.revenue };
      
      if (data.customerId) {
        // Track unique customers (simplified - in production, use a separate tracking table)
        updateData.uniqueCustomers = { increment: 1 };
      }
    }

    if (analytics) {
      await prisma.sellerAnalytics.update({
        where: { id: analytics.id },
        data: updateData
      });
    } else {
      await prisma.sellerAnalytics.create({
        data: {
          sellerId,
          date: today,
          views: type === 'view' ? 1 : 0,
          inquiries: type === 'inquiry' ? 1 : 0,
          orders: type === 'order' ? 1 : 0,
          revenue: type === 'order' && data?.revenue ? data.revenue : 0,
          uniqueCustomers: type === 'order' && data?.customerId ? 1 : 0
        }
      });
    }
  }

  /**
   * Get seller counts for dashboard
   */
  static async getSellerCounts(sellerId: string) {
    const [
      pendingOrders,
      processingOrders,
      readyOrders,
      shippedOrders,
      completedOrders,
      totalListings,
      draftListings,
      lowStockListings,
      outOfStockListings,
      unreadMessages,
      todayViews,
      todayInquiries,
      newCustomersToday
    ] = await Promise.all([
      prisma.order.count({ 
        where: { 
          items: { some: { listing: { sellerId } } },
          status: 'PENDING' 
        } 
      }),
      prisma.order.count({ 
        where: { 
          items: { some: { listing: { sellerId } } },
          status: 'PROCESSING' 
        } 
      }),
      prisma.order.count({ 
        where: { 
          items: { some: { listing: { sellerId } } },
          status: 'READY_TO_SHIP' 
        } 
      }),
      prisma.order.count({ 
        where: { 
          items: { some: { listing: { sellerId } } },
          status: 'SHIPPED' 
        } 
      }),
      prisma.order.count({ 
        where: { 
          items: { some: { listing: { sellerId } } },
          status: 'DELIVERED' 
        } 
      }),
      prisma.listing.count({ where: { sellerId, status: 'PUBLISHED' } }),
      prisma.listing.count({ where: { sellerId, status: 'DRAFT' } }),
      prisma.listing.count({ where: { sellerId, quantity: { lte: 5, gt: 0 } } }),
      prisma.listing.count({ where: { sellerId, quantity: 0 } }),
      prisma.message.count({
        where: {
          conversation: {
            OR: [
              { sellerId },
              { 
                messages: {
                  some: {
                    sender: {
                      seller: {
                        id: sellerId
                      }
                    }
                  }
                }
              }
            ]
          },
          isRead: false,
          senderId: {
            not: sellerId
          }
        }
      }),
      // Get today's analytics
      prisma.sellerAnalytics.findFirst({
        where: {
          sellerId,
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      }).then(analytics => analytics?.views || 0),
      prisma.sellerAnalytics.findFirst({
        where: {
          sellerId,
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      }).then(analytics => analytics?.inquiries || 0),
      prisma.sellerAnalytics.findFirst({
        where: {
          sellerId,
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      }).then(analytics => analytics?.uniqueCustomers || 0)
    ]);

    const activeOrders = pendingOrders + processingOrders + readyOrders + shippedOrders;
    const urgentActions = pendingOrders + lowStockListings + outOfStockListings;

    return {
      orders: {
        pending: pendingOrders,
        processing: processingOrders,
        ready: readyOrders,
        shipped: shippedOrders,
        completed: completedOrders,
        returns: 0, // To be implemented with returns feature
        total: activeOrders
      },
      inventory: {
        total: totalListings,
        draft: draftListings,
        lowStock: lowStockListings,
        outOfStock: outOfStockListings,
        archived: 0 // To be implemented
      },
      messages: {
        unread: unreadMessages
      },
      activity: {
        recentViews: todayViews,
        recentInquiries: todayInquiries,
        newCustomers: newCustomersToday
      },
      summary: {
        activeOrders,
        urgentActions,
        totalProducts: totalListings
      }
    };
  }

  /**
   * Calculate profile completion percentage
   */
  private static calculateProfileCompletion(seller: any): number {
    const fields = [
      'businessName',
      'businessNameEn',
      'businessType',
      'commercialLicense',
      'taxNumber',
      'city',
      'district',
      'region',
      'address',
      'phone',
      'email',
      'contactPerson',
      'description',
      'descriptionEn',
      'logo',
      'establishedYear',
      'employeeCount'
    ];

    const filledFields = fields.filter(field => seller[field] !== null && seller[field] !== '');
    return Math.round((filledFields.length / fields.length) * 100);
  }

  /**
   * Get seller dashboard data
   */
  static async getSellerDashboard(sellerId: string) {
    const [seller, stats, recentOrders, recentListings] = await Promise.all([
      this.getSellerById(sellerId),
      this.getSellerStats(sellerId),
      // Recent orders for this seller's items
      prisma.order.findMany({
        where: { 
          items: { some: { listing: { sellerId } } },
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: {
            select: { name: true, email: true },
          },
          items: {
            where: { listing: { sellerId } },
            include: { listing: true },
          },
        },
      }),
      // Recent listings
      prisma.listing.findMany({
        where: { sellerId },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          photos: { take: 1 },
          _count: { select: { orderItems: true } },
        },
      }),
    ]);

    if (!seller) {
      throw new Error('Seller not found');
    }

    return {
      seller,
      stats,
      recentOrders,
      recentListings,
    };
  }
}