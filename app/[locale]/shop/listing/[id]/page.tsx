import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SARSymbol } from '@/components/ui/currency-symbol';
import { AddToCart } from '@/components/features/add-to-cart';
import { ArrowRight, MapPin, Phone, Store, Shield, Truck, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const conditionLabels: Record<string, Record<string, string>> = {
  NEW: { ar: 'جديد', en: 'New' },
  REFURBISHED: { ar: 'مجدد', en: 'Refurbished' },
  USED: { ar: 'مستعمل', en: 'Used' },
};

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

async function getListingById(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/listings/${id}`, {
      cache: 'no-store', // Always fetch fresh data for listing details
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch listing');
    }
    
    const listing = await response.json();
    return listing;
  } catch (error) {
    console.error('Error fetching listing:', error);
    return null;
  }
}

async function getSimilarListings(id: string, limit: number = 4) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/listings?limit=${limit}&exclude=${id}`, {
      cache: 'default', // Cache similar listings for 5 minutes
      next: { revalidate: 300 }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch similar listings');
    }
    
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching similar listings:', error);
    return [];
  }
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id, locale } = await params;
  const isArabic = locale === 'ar';
  const t = await getTranslations();
  
  // Fetch listing and similar listings in parallel
  const [listing, similarListings] = await Promise.all([
    getListingById(id),
    getSimilarListings(id, 4)
  ]);
  
  if (!listing) {
    notFound();
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <Link href={`/${locale}`} className="hover:text-foreground">
              {isArabic ? 'الرئيسية' : 'Home'}
            </Link>
          </li>
          <li>
            <ArrowRight className="h-4 w-4 rotate-180 rtl:rotate-0" />
          </li>
          <li>
            <Link href={`/${locale}/shop`} className="hover:text-foreground">
              {isArabic ? 'المتجر' : 'Shop'}
            </Link>
          </li>
          <li>
            <ArrowRight className="h-4 w-4 rotate-180 rtl:rotate-0" />
          </li>
          <li className="text-foreground font-medium">
            {isArabic ? listing.titleAr : listing.titleEn || listing.titleAr}
          </li>
        </ol>
      </nav>
      
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div>
          <div className="aspect-square overflow-hidden rounded-lg bg-muted relative">
            {listing.photos && listing.photos.length > 0 ? (
              <Image 
                src={listing.photos[0].url} 
                alt={isArabic ? listing.titleAr : listing.titleEn || listing.titleAr}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
                <span className="text-8xl opacity-20">🔧</span>
              </div>
            )}
          </div>
          
          {/* Thumbnail Gallery */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square rounded-md bg-muted/50 overflow-hidden">
                <div className="flex h-full items-center justify-center">
                  <span className="text-2xl opacity-20">📷</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Product Details */}
        <div>
          <div className="mb-4">
            <h1 className="mb-2 text-3xl font-bold">
              {isArabic ? listing.titleAr : listing.titleEn || listing.titleAr}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                variant="secondary"
                className={
                  listing.condition === 'NEW' ? 'bg-green-100 text-green-800 border-green-200' :
                  listing.condition === 'REFURBISHED' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  'bg-amber-100 text-amber-800 border-amber-200'
                }
              >
                {conditionLabels[listing.condition]?.[locale as 'ar' | 'en'] || listing.condition}
              </Badge>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground font-medium">
                {listing.make} {listing.model}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                {listing.fromYear} - {listing.toYear}
              </span>
            </div>
          </div>
          
          <div className="mb-6 text-4xl font-bold text-saudi-green flex items-center gap-2">
            {(listing.priceSar / 100).toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
            <SARSymbol className="h-8 w-8" />
          </div>
          
          {/* Quick Features */}
          <div className="mb-6 flex flex-wrap gap-3">
            {listing.condition === 'NEW' && (
              <div className="flex items-center gap-1 text-sm">
                <Shield className="h-4 w-4 text-saudi-green" />
                <span>{isArabic ? 'ضمان 6 أشهر' : '6 Months Warranty'}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-sm">
              <Truck className="h-4 w-4 text-riyadh-sky" />
              <span>{isArabic ? 'شحن خلال 2-3 أيام' : 'Ships in 2-3 days'}</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Clock className="h-4 w-4 text-desert-gold" />
              <span>{isArabic ? 'رد سريع' : 'Quick Response'}</span>
            </div>
          </div>
          
          {listing.description && (
            <div className="mb-6">
              <h2 className="mb-2 text-lg font-semibold">{isArabic ? 'الوصف' : 'Description'}</h2>
              <p className="text-muted-foreground leading-relaxed">{listing.description}</p>
            </div>
          )}
          
          <div className="mb-6 space-y-3 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-semibold text-sm mb-2">{isArabic ? 'المواصفات' : 'Specifications'}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isArabic ? 'الشركة المصنعة' : 'Make'}</span>
                <span className="font-medium">{listing.make}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isArabic ? 'الموديل' : 'Model'}</span>
                <span className="font-medium">{listing.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {isArabic ? 'السنوات المتوافقة' : 'Compatible Years'}
                </span>
                <span className="font-medium">{listing.fromYear} - {listing.toYear}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {isArabic ? 'المدينة' : 'City'}
                </span>
                <span className="font-medium">{listing.city}</span>
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          {/* Seller Information */}
          <Card className="mb-6 border-saudi-green/20">
            <CardContent className="p-4">
              <h3 className="mb-3 font-semibold flex items-center gap-2">
                <Store className="h-4 w-4" />
                {isArabic ? 'معلومات البائع' : 'Seller Information'}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{listing.seller.businessName}</span>
                  {listing.seller.verified && (
                    <Badge variant="outline" className="text-xs border-saudi-green text-saudi-green">
                      <CheckCircle className="h-3 w-3 me-1" />
                      {isArabic ? 'موثق' : 'Verified'}
                    </Badge>
                  )}
                </div>
                {listing.seller.rating > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span 
                          key={i} 
                          className={`text-xs ${i < Math.floor(listing.seller.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                    <span className="text-muted-foreground">
                      {listing.seller.rating.toFixed(1)} ({listing.seller.reviewCount || 0} {isArabic ? 'تقييم' : 'reviews'})
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{listing.seller.city}</span>
                </div>
                {listing.seller.user?.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span dir="ltr">{listing.seller.user.phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Actions */}
          <div className="flex gap-3">
            <AddToCart listing={{
              ...listing,
              titleEn: listing.titleEn || undefined,
              seller: {
                id: listing.seller.id,
                businessName: listing.seller.businessName
              }
            }} size="lg" className="flex-1 btn-saudi" />
            <Button size="lg" variant="outline" className="border-saudi-green text-saudi-green hover:bg-saudi-green hover:text-white">
              <Phone className="h-5 w-5 me-2" />
              {isArabic ? 'اتصل بالبائع' : 'Call Seller'}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Related Products Section */}
      {similarListings.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">{isArabic ? 'منتجات مشابهة' : 'Related Products'}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {similarListings.map((similarListing: any) => (
              <Link key={similarListing.id} href={`/${locale}/shop/listing/${similarListing.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    {similarListing.photos && similarListing.photos.length > 0 ? (
                      <Image 
                        src={similarListing.photos[0].url} 
                        alt={isArabic ? similarListing.titleAr : similarListing.titleEn || similarListing.titleAr}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
                        <span className="text-4xl opacity-20">🔧</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-medium line-clamp-2 text-sm leading-tight">
                        {isArabic ? similarListing.titleAr : similarListing.titleEn || similarListing.titleAr}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>{similarListing.make}</span>
                        {similarListing.model && (
                          <>
                            <span>•</span>
                            <span>{similarListing.model}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-saudi-green flex items-center gap-1">
                          {(similarListing.priceSar / 100).toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                          <SARSymbol className="h-3 w-3" />
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {conditionLabels[similarListing.condition]?.[locale as 'ar' | 'en'] || similarListing.condition}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}