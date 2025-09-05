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
  Zap,
  TrendingUp
} from 'lucide-react';

interface Seller {
  id: string;
  businessName: string;
  yardName?: string; // for backward compatibility
  rating?: number;
  totalReviews?: number;
  verified?: boolean;
  responseTime?: string;
  location?: string;
  city?: string;
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
  photos: { url: string; alt?: string }[];
  warrantyMonths?: number;
  installationAvailable?: boolean;
  deliveryTime?: string;
  views?: number;
  viewCount?: number; // from database
  savedBy?: number;
  inStock?: boolean;
  sku?: string;
  partNumber?: string;
  compatibility?: string[];
  isFeatured?: boolean;
  quantity?: number;
}

interface EnhancedProductCardProps {
  listing: Listing;
  onToggleFavorite?: (listingId: string) => void;
  isFavorited?: boolean;
  onQuickView?: () => void;
  viewMode?: 'grid' | 'list';
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
  onQuickView,
  viewMode = 'grid',
  className 
}: EnhancedProductCardProps) {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const hasPhoto = listing.photos && listing.photos.length > 0 && !imageError;
  
  // Use real seller data from the database
  const seller = {
    ...listing.seller,
    rating: listing.seller.rating || 0,
    totalReviews: listing.seller.totalReviews || 0,
    verified: listing.seller.verified || false,
    responseTime: listing.seller.responseTime || (isArabic ? 'خلال ساعة' : '< 1 hour'),
    certifications: listing.seller.certifications || [],
  };

  // Use real listing data from the database
  const enhancedListing = {
    ...listing,
    warrantyMonths: listing.warrantyMonths || (listing.condition === 'NEW' ? 6 : listing.condition === 'REFURBISHED' ? 3 : 0),
    installationAvailable: listing.installationAvailable !== undefined ? listing.installationAvailable : false,
    deliveryTime: listing.deliveryTime || (isArabic ? '2-3 أيام' : '2-3 days'),
    views: listing.viewCount || listing.views || 0,
    savedBy: listing.savedBy || 0,
    inStock: listing.quantity ? listing.quantity > 0 : (listing.inStock !== undefined ? listing.inStock : true),
    partNumber: listing.partNumber || listing.sku || `P${listing.id.substring(0, 6).toUpperCase()}`,
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

  // List view layout
  if (viewMode === 'list') {
    return (
      <Card className={cn(
        "group overflow-hidden transition-all duration-300 hover:shadow-md",
        "bg-white dark:bg-card border border-border/50 hover:border-saudi-green/30",
        "flex flex-row gap-4 p-4",
        !enhancedListing.inStock && "opacity-60",
        className
      )}>
        {/* List Image */}
        <div className="w-28 h-28 bg-muted/50 flex items-center justify-center relative overflow-hidden rounded-lg flex-shrink-0">
          {hasPhoto ? (
            <Image 
              src={listing.photos[0].url} 
              alt={isArabic ? listing.titleAr : listing.titleEn || listing.titleAr}
              fill
              className={cn(
                "object-cover transition-all duration-300 group-hover:scale-105",
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
          {!enhancedListing.inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white text-xs font-medium px-2 py-1 bg-red-500 rounded">
                {isArabic ? 'نفد' : 'Out'}
              </span>
            </div>
          )}
        </div>

        {/* List Content */}
        <div className="flex-1 space-y-3">
          {/* Title & Price Row */}
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 space-y-1">
              <h3 className={cn(
                "font-semibold text-base leading-tight line-clamp-2 group-hover:text-saudi-green transition-colors",
                isArabic && "font-bold"
              )}>
                {isArabic ? listing.titleAr : listing.titleEn || listing.titleAr}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">{listing.make} {listing.model}</span>
                <span>•</span>
                <span>{listing.fromYear}-{listing.toYear}</span>
              </div>
            </div>
            <div className="text-end space-y-1">
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold text-saudi-green">
                  {(listing.priceSar / 100).toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                </span>
                <SARSymbol className="h-5 w-5 text-saudi-green/80" />
              </div>
              {enhancedListing.warrantyMonths && enhancedListing.warrantyMonths > 0 && (
                <div className="flex items-center gap-1 text-xs text-desert-gold">
                  <Shield className="h-3 w-3" />
                  <span>{enhancedListing.warrantyMonths} {isArabic ? 'شهر' : 'mo'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Details & Actions */}
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Badge 
                  variant="outline"
                  className={cn(
                    "text-xs",
                    listing.condition === 'NEW' && "border-green-200 bg-green-50 text-green-700",
                    listing.condition === 'USED' && "border-amber-200 bg-amber-50 text-amber-700",
                    listing.condition === 'REFURBISHED' && "border-blue-200 bg-blue-50 text-blue-700"
                  )}
                >
                  {conditionLabels[listing.condition]?.[locale as 'ar' | 'en'] || listing.condition}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {listing.city}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {seller.businessName || seller.yardName}
                </span>
                {seller.verified && (
                  <CheckCircle className="h-4 w-4 text-saudi-green" />
                )}
                <div className="flex items-center gap-1">
                  {renderStars(seller.rating!)}
                  <span className="text-xs text-muted-foreground ms-1">
                    ({seller.totalReviews})
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => onToggleFavorite?.(listing.id)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Heart className={cn(
                  "h-4 w-4 transition-colors",
                  isFavorited ? "fill-red-500 text-red-500" : "text-muted-foreground"
                )} />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                asChild
                disabled={!enhancedListing.inStock}
              >
                <Link href={`/${locale}/shop/listing/${listing.id}`}>
                  {isArabic ? 'التفاصيل' : 'Details'}
                </Link>
              </Button>
              <QuickAddToCart 
                listing={listing} 
                size="sm" 
                disabled={!enhancedListing.inStock}
                className={cn(
                  enhancedListing.inStock ? "btn-saudi" : "",
                  !enhancedListing.inStock && "opacity-50 cursor-not-allowed"
                )}
              />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Grid view layout (default)
  return (
    <Card className={cn(
      // Modern minimal card styling
      "group overflow-hidden cursor-pointer",
      // Clean background
      "bg-white dark:bg-card",
      // Subtle borders
      "border border-border/50 hover:border-saudi-green/30",
      // Clean shadows
      "shadow-sm hover:shadow-lg",
      // Gentle hover effects
      "hover:-translate-y-1 hover:scale-[1.02]",
      // Smooth transitions
      "transition-all duration-300 ease-out",
      // Out of stock styling
      !enhancedListing.inStock && "opacity-60",
      className
    )}>
      {/* Image Header */}
      <CardHeader className="p-0 relative">
        <div className="aspect-square bg-muted/50 flex items-center justify-center relative overflow-hidden rounded-t-lg">
          {hasPhoto ? (
            <Image 
              src={listing.photos[0].url} 
              alt={isArabic ? listing.titleAr : listing.titleEn || listing.titleAr}
              fill
              className={cn(
                "object-cover transition-all duration-300 group-hover:scale-105",
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

          {/* Simplified Top Badges */}
          <div className="absolute top-3 start-3">
            {listing.condition === 'NEW' && (
              <Badge className="bg-green-500 text-white text-xs font-medium px-2 py-1">
                {isArabic ? 'جديد' : 'New'}
              </Badge>
            )}
          </div>

          {/* Top Right Actions - Simplified */}
          <div className="absolute top-3 end-3">
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite?.(listing.id);
              }}
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-white/90 hover:bg-white transition-colors rounded-full shadow-sm"
            >
              <Heart className={cn(
                "h-4 w-4 transition-colors",
                isFavorited 
                  ? "fill-red-500 text-red-500" 
                  : "text-muted-foreground hover:text-red-500"
              )} />
            </Button>
          </div>

          {/* Out of stock overlay */}
          {!enhancedListing.inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Badge className="bg-red-500 text-white px-3 py-1">
                {isArabic ? 'نفد المخزون' : 'Out of Stock'}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {/* Title */}
        <div className="space-y-2">
          <h3 className={cn(
            "font-semibold text-base leading-tight line-clamp-2 group-hover:text-saudi-green transition-colors",
            isArabic && "font-bold"
          )}>
            {isArabic ? listing.titleAr : listing.titleEn || listing.titleAr}
          </h3>
          
          {/* Vehicle Info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">{listing.make} {listing.model}</span>
            <span className="text-xs">•</span>
            <span>{listing.fromYear}-{listing.toYear}</span>
          </div>
        </div>

        {/* Condition & Location */}
        <div className="flex items-center justify-between">
          <Badge 
            variant="outline"
            className={cn(
              "text-xs",
              listing.condition === 'NEW' && "border-green-200 bg-green-50 text-green-700",
              listing.condition === 'USED' && "border-amber-200 bg-amber-50 text-amber-700",
              listing.condition === 'REFURBISHED' && "border-blue-200 bg-blue-50 text-blue-700"
            )}
          >
            {conditionLabels[listing.condition]?.[locale as 'ar' | 'en'] || listing.condition}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {listing.city}
          </div>
        </div>

        {/* Seller Info - Simplified */}
        <div className="flex items-center gap-2 py-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {seller.businessName || seller.yardName}
              </span>
              {seller.verified && (
                <CheckCircle className="h-4 w-4 text-saudi-green" />
              )}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {renderStars(seller.rating!)}
              <span className="text-xs text-muted-foreground ms-1">
                {seller.rating?.toFixed(1)} ({seller.totalReviews})
              </span>
            </div>
          </div>
        </div>

        {/* Price & Warranty */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-1">
            <span className="text-xl font-bold text-saudi-green">
              {(listing.priceSar / 100).toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
            </span>
            <SARSymbol className="h-5 w-5 text-saudi-green/80" />
          </div>
          {enhancedListing.warrantyMonths && enhancedListing.warrantyMonths > 0 && (
            <div className="flex items-center gap-1 text-xs text-desert-gold bg-desert-gold/10 px-2 py-1 rounded-full">
              <Shield className="h-3 w-3" />
              <span>{enhancedListing.warrantyMonths} {isArabic ? 'شهر' : 'mo'}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button 
          className="flex-1" 
          variant="outline" 
          asChild
          disabled={!enhancedListing.inStock}
        >
          <Link href={`/${locale}/shop/listing/${listing.id}`}>
            {isArabic ? 'عرض التفاصيل' : 'View Details'}
          </Link>
        </Button>
        <QuickAddToCart 
          listing={listing} 
          size="default" 
          disabled={!enhancedListing.inStock}
          className={cn(
            enhancedListing.inStock ? "btn-saudi" : "",
            !enhancedListing.inStock && "opacity-50 cursor-not-allowed"
          )}
        />
      </CardFooter>
    </Card>
  );
}