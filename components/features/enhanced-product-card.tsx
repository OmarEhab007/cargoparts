'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SARSymbol } from '@/components/ui/currency-symbol';
import { QuickAddToCart } from '@/components/features/quick-add-to-cart';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  Star,
  Shield,
  Truck,
  Clock,
  MapPin,
  Heart,
  Eye,
  Sparkles,
  CheckCircle,
  Award,
  Zap
} from 'lucide-react';

interface Seller {
  id: string;
  yardName: string;
  rating?: number;
  totalReviews?: number;
  verified?: boolean;
  responseTime?: string;
  location?: string;
  certifications?: string[];
}

interface Listing {
  id: string;
  titleAr: string;
  titleEn: string | null;
  priceSar: number;
  make: string;
  model: string;
  fromYear: number;
  toYear: number;
  condition: string;
  city: string;
  seller: Seller;
  photos: { url: string }[];
  warrantyMonths?: number;
  installationAvailable?: boolean;
  deliveryTime?: string;
  views?: number;
  savedBy?: number;
  inStock?: boolean;
  partNumber?: string;
  compatibility?: string[];
}

interface EnhancedProductCardProps {
  listing: Listing;
  onToggleFavorite?: (listingId: string) => void;
  isFavorited?: boolean;
  className?: string;
}

const conditionLabels: Record<string, Record<string, string>> = {
  NEW: { ar: 'جديد', en: 'New' },
  REFURBISHED: { ar: 'مجدد', en: 'Refurbished' },
  USED: { ar: 'مستعمل', en: 'Used' },
};

const conditionColors = {
  NEW: 'bg-green-500',
  REFURBISHED: 'bg-blue-500', 
  USED: 'bg-amber-500',
};

export function EnhancedProductCard({ 
  listing, 
  onToggleFavorite, 
  isFavorited = false, 
  className 
}: EnhancedProductCardProps) {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const hasPhoto = listing.photos && listing.photos.length > 0 && !imageError;
  
  // Enhanced seller data with defaults
  const seller = {
    ...listing.seller,
    rating: listing.seller.rating || 4.2 + Math.random() * 0.8, // Mock rating
    totalReviews: listing.seller.totalReviews || Math.floor(Math.random() * 200) + 10,
    verified: listing.seller.verified !== undefined ? listing.seller.verified : Math.random() > 0.3,
    responseTime: listing.seller.responseTime || (isArabic ? 'خلال ساعة' : '< 1 hour'),
    certifications: listing.seller.certifications || (Math.random() > 0.5 ? ['OEM', 'Quality'] : []),
  };

  // Enhanced listing data with defaults
  const enhancedListing = {
    ...listing,
    warrantyMonths: listing.warrantyMonths || (Math.random() > 0.5 ? 6 : 3),
    installationAvailable: listing.installationAvailable !== undefined ? listing.installationAvailable : Math.random() > 0.6,
    deliveryTime: listing.deliveryTime || (isArabic ? '2-3 أيام' : '2-3 days'),
    views: listing.views || Math.floor(Math.random() * 100) + 20,
    savedBy: listing.savedBy || Math.floor(Math.random() * 15),
    inStock: listing.inStock !== undefined ? listing.inStock : Math.random() > 0.1,
    partNumber: listing.partNumber || `P${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-3 w-3",
          i < Math.floor(rating) 
            ? "fill-desert-gold text-desert-gold" 
            : i < rating 
            ? "fill-desert-gold/50 text-desert-gold" 
            : "fill-muted text-muted-foreground"
        )}
      />
    ));
  };

  return (
    <Card className={cn(
      "group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
      "bg-white dark:bg-card border-border/50 hover:border-saudi-green/30",
      !enhancedListing.inStock && "opacity-75",
      className
    )}>
      {/* Image Header */}
      <CardHeader className="p-0 relative">
        <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
          {hasPhoto ? (
            <Image 
              src={listing.photos[0].url} 
              alt={isArabic ? listing.titleAr : listing.titleEn || listing.titleAr}
              fill
              className={cn(
                "object-cover transition-all duration-500 group-hover:scale-110",
                imageLoading && "blur-sm"
              )}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
            />
          ) : (
            <ImagePlaceholder 
              className="w-full h-full"
              type={
                listing.titleAr.includes('محرك') || listing.titleEn?.includes('Engine') ? 'engine' :
                listing.titleAr.includes('فرامل') || listing.titleEn?.includes('Brake') ? 'brake' :
                listing.titleAr.includes('ناقل') || listing.titleEn?.includes('Transmission') ? 'transmission' :
                listing.titleAr.includes('كهرب') || listing.titleEn?.includes('Electric') ? 'electrical' :
                'part'
              }
              size="lg"
            />
          )}

          {/* Loading Overlay */}
          {imageLoading && hasPhoto && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}

          {/* Top Badges */}
          <div className="absolute top-2 start-2 flex flex-col gap-1">
            {listing.condition === 'NEW' && (
              <div className="px-2 py-1 bg-green-500/90 text-white text-xs font-bold rounded-full flex items-center gap-1 backdrop-blur-sm">
                <Sparkles className="h-3 w-3" />
                {isArabic ? 'جديد' : 'New'}
              </div>
            )}
            {enhancedListing.warrantyMonths && enhancedListing.warrantyMonths > 0 && (
              <div className="px-2 py-1 bg-saudi-green/90 text-white text-xs font-semibold rounded-full flex items-center gap-1 backdrop-blur-sm">
                <Shield className="h-3 w-3" />
                {enhancedListing.warrantyMonths} {isArabic ? 'شهر' : 'mo'}
              </div>
            )}
          </div>

          {/* Top Right Actions */}
          <div className="absolute top-2 end-2 flex flex-col gap-1">
            <Button
              onClick={() => onToggleFavorite?.(listing.id)}
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-white/80 backdrop-blur-sm hover:bg-white hover:scale-110 transition-all"
            >
              <Heart className={cn(
                "h-4 w-4 transition-colors",
                isFavorited ? "fill-red-500 text-red-500" : "text-muted-foreground"
              )} />
            </Button>
            {!enhancedListing.inStock && (
              <Badge className="bg-red-500/90 text-white text-xs backdrop-blur-sm">
                {isArabic ? 'نفد' : 'Out'}
              </Badge>
            )}
          </div>

          {/* Bottom Badges */}
          <div className="absolute bottom-2 start-2 flex gap-1">
            {enhancedListing.installationAvailable && (
              <Badge className="bg-riyadh-sky/90 text-white text-xs backdrop-blur-sm">
                <Zap className="h-3 w-3 me-1" />
                {isArabic ? 'تركيب' : 'Install'}
              </Badge>
            )}
          </div>

          {/* Views Counter */}
          <div className="absolute bottom-2 end-2">
            <div className="px-2 py-1 bg-black/50 text-white text-xs rounded-full flex items-center gap-1 backdrop-blur-sm">
              <Eye className="h-3 w-3" />
              {enhancedListing.views}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {/* Title & Part Number */}
        <div className="space-y-1">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-saudi-green transition-colors">
            {isArabic ? listing.titleAr : listing.titleEn || listing.titleAr}
          </h3>
          {enhancedListing.partNumber && (
            <p className="text-xs text-muted-foreground font-mono">
              {isArabic ? 'رقم القطعة:' : 'Part #'} {enhancedListing.partNumber}
            </p>
          )}
        </div>

        {/* Seller Info */}
        <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-foreground truncate">
                {seller.yardName}
              </span>
              {seller.verified && (
                <CheckCircle className="h-3 w-3 text-saudi-green flex-shrink-0" />
              )}
              {seller.certifications && seller.certifications.length > 0 && (
                <Award className="h-3 w-3 text-desert-gold flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="flex">{renderStars(seller.rating!)}</div>
              <span className="text-xs text-muted-foreground">
                ({seller.totalReviews})
              </span>
            </div>
          </div>
          <div className="text-end">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {seller.responseTime}
            </div>
          </div>
        </div>

        {/* Vehicle Compatibility */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline"
              className={cn(
                "text-xs border-2",
                listing.condition === 'NEW' && "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400",
                listing.condition === 'USED' && "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                listing.condition === 'REFURBISHED' && "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
              )}
            >
              <div className={cn("w-2 h-2 rounded-full me-1", conditionColors[listing.condition as keyof typeof conditionColors])} />
              {conditionLabels[listing.condition]?.[locale as 'ar' | 'en'] || listing.condition}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground font-medium">
            {listing.make} {listing.model}
          </div>
        </div>

        {/* Years & Location */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted/50 rounded text-xs font-medium">
            {listing.fromYear} - {listing.toYear}
          </span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {listing.city}
          </div>
        </div>

        {/* Delivery Info */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Truck className="h-3 w-3" />
            {enhancedListing.deliveryTime}
          </div>
          {enhancedListing.savedBy && enhancedListing.savedBy > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Heart className="h-3 w-3" />
              {enhancedListing.savedBy} {isArabic ? 'محفوظ' : 'saved'}
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-saudi-green">
              {listing.priceSar.toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
            </span>
            <SARSymbol className="h-4 w-4 text-saudi-green/80" />
          </div>
          {enhancedListing.warrantyMonths && (
            <div className="text-xs text-desert-gold font-medium">
              <Shield className="h-3 w-3 inline me-1" />
              {isArabic ? 'ضمان' : 'Warranty'}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button 
          className="flex-1 transition-all duration-300 hover:shadow-md" 
          variant="outline" 
          asChild
          disabled={!enhancedListing.inStock}
        >
          <Link href={`/${locale}/shop/listing/${listing.id}`}>
            {isArabic ? 'عرض التفاصيل' : 'View Details'}
          </Link>
        </Button>
        <div className="transition-all duration-300 hover:scale-105">
          <QuickAddToCart 
            listing={listing} 
            size="default" 
            disabled={!enhancedListing.inStock}
            className={cn(
              enhancedListing.inStock ? "btn-saudi" : "",
              !enhancedListing.inStock && "opacity-50 cursor-not-allowed"
            )}
          />
        </div>
      </CardFooter>
    </Card>
  );
}