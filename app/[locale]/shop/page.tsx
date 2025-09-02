// import { listingService } from '@/lib/catalog/listing-service';
import ShopClient from './shop-client';

async function getListings() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/listings?limit=20&page=1`, {
      cache: 'default',
      next: { revalidate: 300 } // Cache for 5 minutes
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.data || [];
    }
  } catch (error) {
    console.error('Error fetching listings:', error);
  }
  
  return [];
}

export default async function ShopPage() {
  // TODO: Fix Prisma connection issue with port 5433
  // Temporary: Fetch mock data from API
  const listings = await getListings();
  
  return <ShopClient initialListings={listings} />;
}