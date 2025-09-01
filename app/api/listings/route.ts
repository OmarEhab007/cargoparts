import { NextRequest, NextResponse } from 'next/server';
import { listingService } from '@/lib/catalog/listing-service';
import { z } from 'zod';
import { Condition } from '@prisma/client';

const listingQuerySchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  yearFrom: z.string().transform(Number).optional(),
  yearTo: z.string().transform(Number).optional(),
  condition: z.nativeEnum(Condition).optional(),
  minPrice: z.string().transform(Number).optional(),
  maxPrice: z.string().transform(Number).optional(),
  search: z.string().optional(),
  sellerId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const params = listingQuerySchema.parse(searchParams);
    
    // TODO: Fix Prisma connection issue with port 5433
    // Temporary: Return empty results to prevent API errors
    const result = {
      listings: [],
      pagination: {
        total: 0,
        page: params.page || 1,
        limit: params.limit || 20,
        totalPages: 0,
      },
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching listings:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}

const createListingSchema = z.object({
  titleAr: z.string().min(1).max(200),
  titleEn: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  priceSar: z.number().positive(),
  condition: z.nativeEnum(Condition),
  make: z.string().min(1),
  model: z.string().min(1),
  fromYear: z.number().min(1900).max(new Date().getFullYear() + 1),
  toYear: z.number().min(1900).max(new Date().getFullYear() + 1),
  city: z.string().min(1),
  // For POC, we'll use a dummy seller ID
  sellerId: z.string().default('dummy-seller-1'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createListingSchema.parse(body);
    
    // For POC, ensure we have a dummy seller
    const dummySellerId = 'dummy-seller-1';
    
    const listing = await listingService.createListing({
      ...data,
      sellerId: dummySellerId,
    });
    
    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error('Error creating listing:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid listing data', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create listing' },
      { status: 500 }
    );
  }
}