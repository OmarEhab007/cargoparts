import { NextRequest, NextResponse } from 'next/server';
import { SessionService } from '@/lib/auth/session';
import { z } from 'zod';
import { SellerService } from '@/lib/sellers/seller-service';

const paramsSchema = z.object({
  id: z.string()
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TEMPORARY: Development bypass for testing
    // const session = await SessionService.getCurrentSession();
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }
    try {
      // Validate params
      const resolvedParams = await params;
      const { id: sellerId } = paramsSchema.parse(resolvedParams);

      // Check if seller exists
      const seller = await SellerService.getSellerById(sellerId);
      if (!seller) {
        return NextResponse.json(
          { error: 'Seller not found' },
          { status: 404 }
        );
      }

      // TEMPORARY: Skip authorization check for development

      // Get counts
      const counts = await SellerService.getSellerCounts(sellerId);

      return NextResponse.json({
        success: true,
        data: counts
      });
    } catch (error) {
      console.error('Error fetching seller counts:', error);
      
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