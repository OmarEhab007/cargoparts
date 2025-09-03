import { prisma } from '@/lib/db/prisma';
import type { Seller, SellerStatus, BusinessType, DocumentType, VerificationStatus, User } from '@prisma/client';
import { z } from 'zod';

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