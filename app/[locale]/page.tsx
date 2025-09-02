import LandingClient from './landing-client';

async function getFeaturedListings() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/listings?limit=6`, {
      cache: 'no-store'
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.listings || [];
    }
  } catch (error) {
    console.error('Error fetching featured listings:', error);
  }
  
  return [];
}

export default async function MarketingPage() {
  const featuredListings = await getFeaturedListings();
  
  return <LandingClient initialListings={featuredListings} />;
}