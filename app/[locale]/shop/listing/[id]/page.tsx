import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SARSymbol } from '@/components/ui/currency-symbol';
import { AddToCart } from '@/components/features/add-to-cart';
import { ArrowRight, MapPin, Phone, Store } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { listingService } from '@/lib/catalog/listing-service';

const conditionLabels: Record<string, Record<string, string>> = {
  NEW: { ar: 'جديد', en: 'New' },
  REFURBISHED: { ar: 'مجدد', en: 'Refurbished' },
  USED: { ar: 'مستعمل', en: 'Used' },
};

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id, locale } = await params;
  const isArabic = locale === 'ar';
  const t = await getTranslations();
  
  const listing = await listingService.getListingById(id);
  
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
              {t('navigation.home')}
            </Link>
          </li>
          <li>
            <ArrowRight className="h-4 w-4 rotate-180 rtl:rotate-0" />
          </li>
          <li>
            <Link href={`/${locale}/shop`} className="hover:text-foreground">
              {t('navigation.shop')}
            </Link>
          </li>
          <li>
            <ArrowRight className="h-4 w-4 rotate-180 rtl:rotate-0" />
          </li>
          <li className="text-foreground">
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
              <div className="flex h-full items-center justify-center">
                <span className="text-8xl text-muted-foreground">📦</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Product Details */}
        <div>
          <div className="mb-4">
            <h1 className="mb-2 text-3xl font-bold">
              {isArabic ? listing.titleAr : listing.titleEn || listing.titleAr}
            </h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {conditionLabels[listing.condition]?.[locale as 'ar' | 'en'] || listing.condition}
              </Badge>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                {listing.make} {listing.model}
              </span>
            </div>
          </div>
          
          <div className="mb-6 text-4xl font-bold text-primary flex items-center gap-2">
            {listing.priceSar.toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
            <SARSymbol className="h-8 w-8" />
          </div>
          
          {listing.description && (
            <div className="mb-6">
              <h2 className="mb-2 text-lg font-semibold">{t('listing.description')}</h2>
              <p className="text-muted-foreground">{listing.description}</p>
            </div>
          )}
          
          <div className="mb-6 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('listing.make')}</span>
              <span className="font-medium">{listing.make}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('listing.model')}</span>
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
                <MapPin className="inline h-4 w-4" /> {isArabic ? 'المدينة' : 'City'}
              </span>
              <span className="font-medium">{listing.city}</span>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          {/* Seller Information */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="mb-3 font-semibold">{t('listing.seller')}</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-muted-foreground" />
                  <span>{listing.seller.yardName}</span>
                  {listing.seller.verified && (
                    <Badge variant="outline" className="text-xs">
                      {isArabic ? 'موثق' : 'Verified'}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{listing.seller.city}</span>
                </div>
                {listing.seller.user?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
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
                yardName: listing.seller.yardName
              }
            }} size="lg" className="flex-1" />
            <Button size="lg" variant="outline">
              <Phone className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}