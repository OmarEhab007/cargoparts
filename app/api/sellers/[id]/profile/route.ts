import { NextRequest, NextResponse } from 'next/server';
import { SellerService } from '@/lib/sellers/seller-service';
import { SessionService } from '@/lib/auth/session';
import { z } from 'zod';

const paramsSchema = z.object({
  id: z.string()
});

const updateSchema = z.object({
  businessName: z.string().optional(),
  businessNameEn: z.string().optional(),
  businessType: z.enum(['SCRAPYARD', 'PARTS_DEALER', 'WORKSHOP', 'INDIVIDUAL']).optional(),
  commercialLicense: z.string().optional(),
  taxNumber: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  region: z.string().optional(),
  postalCode: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  website: z.string().optional(),
  email: z.string().email().optional(),
  contactPerson: z.string().optional(),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  logo: z.string().optional(),
  coverImage: z.string().optional(),
  establishedYear: z.number().optional(),
  employeeCount: z.string().optional(),
  specializations: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  workingHours: z.array(z.object({
    day: z.string(),
    dayIndex: z.number(),
    open: z.string().nullable(),
    close: z.string().nullable(),
    isOpen: z.boolean()
  })).optional(),
  socialMedia: z.array(z.object({
    platform: z.string(),
    url: z.string(),
    isActive: z.boolean()
  })).optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await and validate params
    const resolvedParams = await params;
    const { id: sellerId } = paramsSchema.parse(resolvedParams);

    // Get seller profile (public data)
    const profile = await SellerService.getSellerProfile(sellerId);

    if (!profile) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching seller profile:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request parameters', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await SessionService.getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
      // Await and validate params
      const resolvedParams = await params;
      const { id: sellerId } = paramsSchema.parse(resolvedParams);

      // Check if user is authorized to update this seller's profile
      const seller = await SellerService.getSellerById(sellerId);
      if (!seller) {
        return NextResponse.json(
          { error: 'Seller not found' },
          { status: 404 }
        );
      }

      // Only the seller themselves or admins can update the profile
      if (seller.userId !== session.user.id && session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      // Parse and validate request body
      const body = await request.json();
      const validatedData = updateSchema.parse(body);

      // Update profile
      const updatedProfile = await SellerService.updateSellerProfile(sellerId, validatedData);

      return NextResponse.json({
        success: true,
        data: updatedProfile
      });
    } catch (error) {
      console.error('Error updating seller profile:', error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid request data', details: error.issues },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication error' },
      { status: 500 }
    );
  }
}