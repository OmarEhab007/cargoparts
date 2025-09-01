// import { listingService } from '@/lib/catalog/listing-service';
import ShopClient from './shop-client';

export default async function ShopPage() {
  // TODO: Fix Prisma connection issue with port 5433
  // Temporary: Use empty listings to prevent server errors
  const listings: any[] = [];
  
  return <ShopClient initialListings={listings} />;
}