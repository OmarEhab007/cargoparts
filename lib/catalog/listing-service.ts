
import { prisma } from '@/lib/db/prisma';
import { Prisma, Condition } from '@prisma/client';

export interface CreateListingInput {
  titleAr: string;
  titleEn?: string;
  description?: string;
  priceSar: number;
  condition: Condition;
  make: string;
  model: string;
  fromYear: number;
  toYear: number;
  city: string;
  sellerId: string;
}

export interface UpdateListingInput extends Partial<CreateListingInput> {
  id: string;
}

export interface ListingFilters {
  make?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  condition?: Condition;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
  search?: string;
}

export class ListingService {
  // Create a new listing
  async createListing(data: CreateListingInput) {
    return prisma.listing.create({
      data: {
        ...data,
        sellerId: data.sellerId,
      },
      include: {
        seller: true,
        photos: true,
      },
    });
  }

  // Update a listing
  async updateListing({ id, ...data }: UpdateListingInput) {
    return prisma.listing.update({
      where: { id },
      data,
      include: {
        seller: true,
        photos: true,
      },
    });
  }

  // Get a single listing by ID
  async getListingById(id: string) {
    return prisma.listing.findUnique({
      where: { id },
      include: {
        seller: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        photos: true,
      },
    });
  }

  // Get listings with filters
  async getListings(filters: ListingFilters = {}, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const where: Prisma.ListingWhereInput = {
      ...(filters.make && { make: { contains: filters.make, mode: 'insensitive' } }),
      ...(filters.model && { model: { contains: filters.model, mode: 'insensitive' } }),
      ...(filters.condition && { condition: filters.condition }),
      ...(filters.sellerId && { sellerId: filters.sellerId }),
      ...(filters.minPrice && { priceSar: { gte: filters.minPrice } }),
      ...(filters.maxPrice && { priceSar: { lte: filters.maxPrice } }),
      ...(filters.search && {
        OR: [
          { titleAr: { contains: filters.search, mode: 'insensitive' } },
          { titleEn: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { make: { contains: filters.search, mode: 'insensitive' } },
          { model: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    };

    // Handle year range overlap
    if (filters.yearFrom || filters.yearTo) {
      const yearConditions: Prisma.ListingWhereInput[] = [];
      
      if (filters.yearFrom && filters.yearTo) {
        // Check if the listing's year range overlaps with the filter's year range
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

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          seller: true,
          photos: {
            take: 1,
            orderBy: { createdAt: 'asc' },
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

  // Get featured listings for homepage
  async getFeaturedListings(limit = 8) {
    return prisma.listing.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        seller: true,
        photos: {
          take: 1,
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  // Delete a listing
  async deleteListing(id: string) {
    return prisma.listing.delete({
      where: { id },
    });
  }

  // Check year compatibility
  checkYearCompatibility(listingYearFrom: number, listingYearTo: number, targetYear: number): boolean {
    return targetYear >= listingYearFrom && targetYear <= listingYearTo;
  }

  // Get unique makes
  async getUniqueMakes() {
    const makes = await prisma.listing.findMany({
      select: { make: true },
      distinct: ['make'],
      orderBy: { make: 'asc' },
    });
    return makes.map(m => m.make);
  }

  // Get models for a specific make
  async getModelsForMake(make: string) {
    const models = await prisma.listing.findMany({
      where: { make },
      select: { model: true },
      distinct: ['model'],
      orderBy: { model: 'asc' },
    });
    return models.map(m => m.model);
  }
}

export const listingService = new ListingService();