
import { prisma } from '@/lib/db/prisma';
import { Prisma, Condition, ListingStatus } from '@prisma/client';

export interface CreateListingInput {
  sellerId: string;
  categoryId?: string;
  makeId?: string;
  modelId?: string;
  sku?: string;
  titleAr: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  condition: Condition;
  priceSar: number;
  originalPrice?: number;
  quantity?: number;
  minQuantity?: number;
  weight?: number;
  dimensions?: string;
  // Vehicle compatibility
  make?: string;
  model?: string;
  fromYear?: number;
  toYear?: number;
  engineSize?: string;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  oemNumbers?: string[];
  // Location
  city: string;
  district?: string;
  // Photos
  photos?: Array<{
    url: string;
    filename?: string;
    alt?: string;
    sortOrder?: number;
  }>;
}

export interface UpdateListingInput extends Partial<CreateListingInput> {
  id: string;
}

export interface ListingFilters {
  categoryId?: string;
  make?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  condition?: Condition;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
  city?: string;
  status?: ListingStatus;
  isActive?: boolean;
  isFeatured?: boolean;
  search?: string;
}

export interface SearchFilters extends ListingFilters {
  sortBy?: 'price' | 'date' | 'popularity' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

export class ListingService {
  /**
   * Create a new listing
   */
  static async createListing(data: CreateListingInput) {
    const { photos, oemNumbers, ...listingData } = data;

    // Generate SKU if not provided
    if (!listingData.sku) {
      listingData.sku = await this.generateSKU(data.sellerId);
    }

    return prisma.$transaction(async (tx) => {
      // Create listing
      const listing = await tx.listing.create({
        data: {
          ...listingData,
          oem_numbers: oemNumbers || [],
          status: 'PUBLISHED', // Auto-publish new listings
          publishedAt: new Date(),
          quantity: data.quantity || 1,
          minQuantity: data.minQuantity || 1,
        },
        include: {
          seller: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      // Create photos if provided
      if (photos && photos.length > 0) {
        await tx.photo.createMany({
          data: photos.map((photo, index) => ({
            listingId: listing.id,
            url: photo.url,
            filename: photo.filename,
            alt: photo.alt,
            sortOrder: photo.sortOrder || index,
          })),
        });
      }

      return listing;
    });
  }

  /**
   * Update a listing
   */
  static async updateListing({ id, photos, oemNumbers, ...data }: UpdateListingInput) {
    return prisma.$transaction(async (tx) => {
      // Update listing
      const listing = await tx.listing.update({
        where: { id },
        data: {
          ...data,
          ...(oemNumbers && { oem_numbers: oemNumbers }),
        },
        include: {
          seller: true,
          photos: true,
        },
      });

      // Update photos if provided
      if (photos) {
        // Delete existing photos
        await tx.photo.deleteMany({
          where: { listingId: id },
        });

        // Create new photos
        if (photos.length > 0) {
          await tx.photo.createMany({
            data: photos.map((photo, index) => ({
              listingId: id,
              url: photo.url,
              filename: photo.filename,
              alt: photo.alt,
              sortOrder: photo.sortOrder || index,
            })),
          });
        }
      }

      return listing;
    });
  }

  /**
   * Get a single listing by ID
   */
  static async getListingById(id: string, includeInactive = false) {
    const where: any = { id };
    
    if (!includeInactive) {
      where.isActive = true;
      where.status = { in: ['PUBLISHED'] };
    }

    return prisma.listing.findUnique({
      where,
      include: {
        seller: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
                avatar: true,
              },
            },
          },
        },
        category: true,
        makeRef: true,
        modelRef: true,
        photos: {
          orderBy: { sortOrder: 'asc' },
        },
        reviews: {
          where: { isHidden: false },
          include: {
            user: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            reviews: {
              where: { isHidden: false },
            },
            orderItems: true,
          },
        },
      },
    });
  }

  /**
   * Increment view count
   */
  static async incrementViewCount(id: string): Promise<void> {
    await prisma.listing.update({
      where: { id },
      data: {
        viewCount: { increment: 1 },
      },
    });
  }

  /**
   * Search listings with comprehensive filters
   */
  static async searchListings(filters: SearchFilters = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const where: Prisma.ListingWhereInput = {
      // Base filters for public listings
      isActive: filters.isActive !== undefined ? filters.isActive : true,
      status: filters.status || { in: ['PUBLISHED'] },
    };

    // Apply specific filters
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.make) {
      where.make = { contains: filters.make, mode: 'insensitive' };
    }

    if (filters.model) {
      where.model = { contains: filters.model, mode: 'insensitive' };
    }

    if (filters.condition) {
      where.condition = filters.condition;
    }

    if (filters.sellerId) {
      where.sellerId = filters.sellerId;
    }

    if (filters.city) {
      where.city = { contains: filters.city, mode: 'insensitive' };
    }

    if (filters.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
    }

    // Price range
    if (filters.minPrice || filters.maxPrice) {
      where.priceSar = {};
      if (filters.minPrice) where.priceSar.gte = filters.minPrice;
      if (filters.maxPrice) where.priceSar.lte = filters.maxPrice;
    }

    // Year range overlap logic
    if (filters.yearFrom || filters.yearTo) {
      const yearConditions: Prisma.ListingWhereInput[] = [];
      
      if (filters.yearFrom && filters.yearTo) {
        yearConditions.push({
          AND: [
            { fromYear: { lte: filters.yearTo } },
            { toYear: { gte: filters.yearFrom } },
          ],
        });
      } else if (filters.yearFrom) {
        yearConditions.push({ toYear: { gte: filters.yearFrom } });
      } else if (filters.yearTo) {
        yearConditions.push({ fromYear: { lte: filters.yearTo } });
      }
      
      where.AND = yearConditions;
    }

    // Search functionality
    if (filters.search) {
      where.OR = [
        { titleAr: { contains: filters.search, mode: 'insensitive' } },
        { titleEn: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { descriptionEn: { contains: filters.search, mode: 'insensitive' } },
        { make: { contains: filters.search, mode: 'insensitive' } },
        { model: { contains: filters.search, mode: 'insensitive' } },
        { oem_numbers: { hasSome: [filters.search] } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Determine sort order
    let orderBy: Prisma.ListingOrderByWithRelationInput[] = [];
    
    switch (filters.sortBy) {
      case 'price':
        orderBy = [{ priceSar: filters.sortOrder || 'asc' }];
        break;
      case 'popularity':
        orderBy = [{ viewCount: 'desc' }, { createdAt: 'desc' }];
        break;
      case 'relevance':
        // For relevance, we could implement a scoring system later
        orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
        break;
      case 'date':
      default:
        orderBy = [{ createdAt: filters.sortOrder || 'desc' }];
        break;
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          seller: {
            select: {
              id: true,
              businessName: true,
              city: true,
              verified: true,
              rating: true,
              user: {
                select: {
                  name: true,
                  avatar: true,
                },
              },
            },
          },
          category: {
            select: {
              id: true,
              nameAr: true,
              nameEn: true,
              slug: true,
            },
          },
          makeRef: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              logo: true,
            },
          },
          modelRef: {
            select: {
              id: true,
              name: true,
              nameAr: true,
            },
          },
          photos: {
            take: 3,
            orderBy: { sortOrder: 'asc' },
            select: {
              id: true,
              url: true,
              alt: true,
            },
          },
          _count: {
            select: {
              reviews: {
                where: { isHidden: false },
              },
            },
          },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    return {
      listings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get featured listings for homepage
   */
  static async getFeaturedListings(limit = 12) {
    return prisma.listing.findMany({
      where: {
        isActive: true,
        status: 'PUBLISHED',
        isFeatured: true,
      },
      take: limit,
      orderBy: [
        { viewCount: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        seller: {
          select: {
            businessName: true,
            city: true,
            verified: true,
            rating: true,
          },
        },
        photos: {
          take: 1,
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            reviews: {
              where: { isHidden: false },
            },
          },
        },
      },
    });
  }

  /**
   * Get recent listings
   */
  static async getRecentListings(limit = 20) {
    return prisma.listing.findMany({
      where: {
        isActive: true,
        status: 'PUBLISHED',
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        seller: {
          select: {
            businessName: true,
            city: true,
            verified: true,
          },
        },
        photos: {
          take: 1,
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  /**
   * Update listing status
   */
  static async updateListingStatus(id: string, status: ListingStatus): Promise<void> {
    const updateData: Record<string, unknown> = { status };
    
    if (status === 'PUBLISHED') {
      updateData.publishedAt = new Date();
      updateData.isActive = true;
    } else if (status === 'SUSPENDED' || status === 'DELETED') {
      updateData.isActive = false;
    }

    await prisma.listing.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Soft delete a listing
   */
  static async deleteListing(id: string): Promise<void> {
    await this.updateListingStatus(id, 'DELETED');
  }

  /**
   * Check year compatibility
   */
  static checkYearCompatibility(listingYearFrom: number | null, listingYearTo: number | null, targetYear: number): boolean {
    if (!listingYearFrom || !listingYearTo) return false;
    return targetYear >= listingYearFrom && targetYear <= listingYearTo;
  }

  /**
   * Generate unique SKU
   */
  private static async generateSKU(sellerId: string): Promise<string> {
    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      select: { id: true },
    });

    if (!seller) throw new Error('Seller not found');

    const prefix = seller.id.substring(0, 4).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * Get listing statistics for seller dashboard
   */
  static async getSellerListingStats(sellerId: string): Promise<{
    total: number;
    published: number;
    draft: number;
    sold: number;
    suspended: number;
    totalViews: number;
    totalOrders: number;
  }> {
    const [stats, viewStats, orderStats] = await Promise.all([
      prisma.listing.groupBy({
        by: ['status'],
        where: { sellerId },
        _count: { id: true },
      }),
      prisma.listing.aggregate({
        where: { sellerId },
        _sum: { viewCount: true },
        _count: { id: true },
      }),
      prisma.orderItem.count({
        where: { listing: { sellerId } },
      }),
    ]);

    const statusCounts = stats.reduce((acc, stat) => {
      acc[stat.status.toLowerCase()] = stat._count.id;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: viewStats._count.id || 0,
      published: statusCounts.published || 0,
      draft: statusCounts.draft || 0,
      sold: statusCounts.sold || 0,
      suspended: statusCounts.suspended || 0,
      totalViews: viewStats._sum.viewCount || 0,
      totalOrders: orderStats,
    };
  }

  /**
   * Get similar listings based on make, model, and category
   */
  static async getSimilarListings(listingId: string, limit = 8) {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        make: true,
        model: true,
        categoryId: true,
        priceSar: true,
      },
    });

    if (!listing) return [];

    const priceRange = {
      min: Math.floor(listing.priceSar * 0.7), // 30% lower
      max: Math.ceil(listing.priceSar * 1.3),  // 30% higher
    };

    return prisma.listing.findMany({
      where: {
        id: { not: listingId },
        isActive: true,
        status: 'PUBLISHED',
        OR: [
          {
            AND: [
              { make: listing.make },
              { model: listing.model },
            ],
          },
          { categoryId: listing.categoryId },
          {
            priceSar: {
              gte: priceRange.min,
              lte: priceRange.max,
            },
          },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        seller: {
          select: {
            businessName: true,
            city: true,
            verified: true,
          },
        },
        photos: {
          take: 1,
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  /**
   * Get seller inventory metrics for dashboard
   */
  static async getSellerInventoryMetrics(sellerId: string) {
    const [
      inventoryStats,
      stockAlerts,
      recentActivity,
      topPerformers
    ] = await Promise.all([
      // Basic inventory stats
      prisma.listing.groupBy({
        by: ['status'],
        where: { sellerId },
        _count: { id: true },
        _sum: { 
          quantity: true,
          viewCount: true 
        },
      }),
      
      // Stock alerts
      Promise.all([
        prisma.listing.count({
          where: {
            sellerId,
            quantity: { lte: 5, gt: 0 },
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
        })
      ]),
      
      // Recent activity (last 30 days)
      prisma.listing.count({
        where: {
          sellerId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Top 5 performing listings
      prisma.listing.findMany({
        where: {
          sellerId,
          status: 'PUBLISHED',
          isActive: true
        },
        select: {
          id: true,
          titleAr: true,
          viewCount: true,
          priceSar: true,
          photos: {
            take: 1,
            orderBy: { sortOrder: 'asc' }
          }
        },
        orderBy: { viewCount: 'desc' },
        take: 5
      })
    ]);

    const statusCounts = inventoryStats.reduce((acc, stat) => {
      acc[stat.status.toLowerCase()] = stat._count.id;
      return acc;
    }, {} as Record<string, number>);

    const totalQuantity = inventoryStats.reduce((sum, stat) => sum + (stat._sum.quantity || 0), 0);
    const totalViews = inventoryStats.reduce((sum, stat) => sum + (stat._sum.viewCount || 0), 0);

    return {
      overview: {
        totalListings: inventoryStats.reduce((sum, stat) => sum + stat._count.id, 0),
        published: statusCounts.published || 0,
        draft: statusCounts.draft || 0,
        sold: statusCounts.sold || 0,
        suspended: statusCounts.suspended || 0,
        totalQuantity,
        totalViews
      },
      
      stockAlerts: {
        lowStock: stockAlerts[0],
        outOfStock: stockAlerts[1],
      },
      
      activity: {
        newListingsThisMonth: recentActivity,
      },
      
      topPerformers: topPerformers.map(listing => ({
        id: listing.id,
        title: listing.titleAr,
        views: listing.viewCount,
        price: listing.priceSar / 100, // Convert to SAR
        image: listing.photos[0]?.url || null,
      }))
    };
  }
}