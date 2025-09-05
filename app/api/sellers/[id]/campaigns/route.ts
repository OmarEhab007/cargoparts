import { NextRequest, NextResponse } from 'next/server';
import { SessionService } from '@/lib/auth/session';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { SellerService } from '@/lib/sellers/seller-service';

const paramsSchema = z.object({
  id: z.string()
});

const campaignSchema = z.object({
  name: z.string(),
  nameAr: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(['PROMOTION', 'DISCOUNT', 'FLASH_SALE', 'SEASONAL', 'CLEARANCE', 'NEW_ARRIVAL', 'BUNDLE']),
  status: z.enum(['DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']).optional(),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  budget: z.number().optional(),
  targetAudience: z.string().optional(),
  promotions: z.array(z.object({
    name: z.string(),
    nameAr: z.string().optional(),
    description: z.string().optional(),
    type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'BUY_ONE_GET_ONE', 'FREE_SHIPPING', 'BUNDLE_DISCOUNT']),
    value: z.number(),
    code: z.string().optional(),
    minPurchase: z.number().optional(),
    maxDiscount: z.number().optional(),
    usageLimit: z.number().optional()
  })).optional()
});

// Get all campaigns for a seller
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await SessionService.getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
      const resolvedParams = await params;
      const { id: sellerId } = paramsSchema.parse(resolvedParams);

      // Check authorization
      const seller = await SellerService.getSellerById(sellerId);
      if (!seller) {
        return NextResponse.json(
          { error: 'Seller not found' },
          { status: 404 }
        );
      }

      if (seller.userId !== session.user.id && session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      // Get query parameters
      const searchParams = request.nextUrl.searchParams;
      const status = searchParams.get('status');
      const type = searchParams.get('type');

      // Build where clause
      const where: any = { sellerId };
      if (status) where.status = status;
      if (type) where.type = type;

      // Fetch campaigns with promotions
      const campaigns = await prisma.marketingCampaign.findMany({
        where,
        include: {
          promotions: true,
          _count: {
            select: {
              promotions: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Calculate campaign metrics
      const campaignsWithMetrics = await Promise.all(
        campaigns.map(async (campaign) => {
          // Get promotion usage stats
          const promotionStats = await prisma.promotion.findMany({
            where: { campaignId: campaign.id },
            select: {
              usageCount: true,
              usageLimit: true
            }
          });

          const totalUsage = promotionStats.reduce((sum, p) => sum + p.usageCount, 0);
          const totalLimit = promotionStats.reduce((sum, p) => sum + (p.usageLimit || 0), 0);

          return {
            ...campaign,
            metrics: {
              totalPromotions: campaign._count.promotions,
              totalUsage,
              totalLimit,
              usageRate: totalLimit > 0 ? (totalUsage / totalLimit) * 100 : 0
            }
          };
        })
      );

      return NextResponse.json({
        success: true,
        data: campaignsWithMetrics
      });
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      
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
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication error' },
      { status: 500 }
    );
  }
}

// Create a new campaign
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await SessionService.getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
      const resolvedParams = await params;
      const { id: sellerId } = paramsSchema.parse(resolvedParams);

      // Check authorization
      const seller = await SellerService.getSellerById(sellerId);
      if (!seller) {
        return NextResponse.json(
          { error: 'Seller not found' },
          { status: 404 }
        );
      }

      if (seller.userId !== session.user.id && session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      // Parse and validate request body
      const body = await request.json();
      const validatedData = campaignSchema.parse(body);
      const { promotions, ...campaignData } = validatedData;

      // Create campaign
      const campaign = await prisma.marketingCampaign.create({
        data: {
          ...campaignData,
          sellerId,
          status: campaignData.status || 'DRAFT'
        }
      });

      // Create associated promotions if provided
      if (promotions && promotions.length > 0) {
        await prisma.promotion.createMany({
          data: promotions.map(promo => ({
            ...promo,
            sellerId,
            campaignId: campaign.id,
            startDate: campaign.startDate,
            endDate: campaign.endDate,
            isActive: campaign.status === 'ACTIVE'
          }))
        });
      }

      // Fetch created campaign with relations
      const createdCampaign = await prisma.marketingCampaign.findUnique({
        where: { id: campaign.id },
        include: {
          promotions: true
        }
      });

      return NextResponse.json({
        success: true,
        data: createdCampaign
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
      
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

// Update campaign status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await SessionService.getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
      const resolvedParams = await params;
      const { id: sellerId } = paramsSchema.parse(resolvedParams);
      const body = await request.json();
      const { campaignId, status } = z.object({
        campaignId: z.string(),
        status: z.enum(['DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'])
      }).parse(body);

      // Check authorization
      const campaign = await prisma.marketingCampaign.findFirst({
        where: {
          id: campaignId,
          sellerId
        }
      });

      if (!campaign) {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        );
      }

      const seller = await SellerService.getSellerById(sellerId);
      if (seller?.userId !== session.user.id && session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 403 }
        );
      }

      // Update campaign status
      const updatedCampaign = await prisma.marketingCampaign.update({
        where: { id: campaignId },
        data: { status }
      });

      // Update related promotions' active status
      await prisma.promotion.updateMany({
        where: { campaignId },
        data: { isActive: status === 'ACTIVE' }
      });

      return NextResponse.json({
        success: true,
        data: updatedCampaign
      });
    } catch (error) {
      console.error('Error updating campaign:', error);
      
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