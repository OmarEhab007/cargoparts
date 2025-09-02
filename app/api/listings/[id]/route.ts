import { NextRequest, NextResponse } from 'next/server';
import { ListingService } from '@/lib/catalog/listing-service';
import { z } from 'zod';
import { Condition } from '@prisma/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const listing = await ListingService.getListingById(id);
    
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(listing);
  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listing' },
      { status: 500 }
    );
  }
}

const updateListingSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  oemNumber: z.string().optional(),
  condition: z.nativeEnum(Condition).optional(),
  make: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  yearFrom: z.number().min(1900).max(new Date().getFullYear() + 1).optional(),
  yearTo: z.number().min(1900).max(new Date().getFullYear() + 1).optional(),
  quantity: z.number().int().positive().optional(),
  location: z.string().optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = updateListingSchema.parse(body);
    
    const listing = await ListingService.updateListing({
      id,
      ...data,
    });
    
    return NextResponse.json(listing);
  } catch (error) {
    console.error('Error updating listing:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid update data', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await ListingService.deleteListing(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
}