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
        "group overflow-hidden transition-all duration-300 hover:shadow-lg",
        "bg-white dark:bg-card border-border/50 hover:border-saudi-green/30",
        "flex flex-row gap-4 p-4",
        !enhancedListing.inStock && "opacity-75",
        className
      )}>
        {/* List Image */}
        <div className="w-32 h-32 bg-muted flex items-center justify-center relative overflow-hidden rounded-lg flex-shrink-0">
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
          {/* Quick View for List */}
          {onQuickView && (
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView();
              }}
              className="absolute top-2 end-2 bg-white/90 hover:bg-white text-black shadow-md transition-all hover:scale-105"
              size="sm"
              variant="ghost"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* List Content */}
        <div className="flex-1 space-y-3">
          {/* Title & Price Row */}
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-saudi-green transition-colors">
                {isArabic ? listing.titleAr : listing.titleEn || listing.titleAr}
              </h3>
              {enhancedListing.partNumber && (
                <p className="text-sm text-muted-foreground font-mono mt-1">
                  {isArabic ? 'رقم القطعة:' : 'Part #'} {enhancedListing.partNumber}
                </p>
              )}
            </div>
            <div className="text-end">
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold text-saudi-green">
                  {(listing.priceSar / 100).toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                </span>
                <SARSymbol className="h-5 w-5 text-saudi-green/80" />
              </div>
              {enhancedListing.warrantyMonths && (
                <div className="text-sm text-desert-gold font-medium mt-1">
                  <Shield className="h-4 w-4 inline me-1" />
                  {enhancedListing.warrantyMonths} {isArabic ? 'شهر ضمان' : 'mo warranty'}
                </div>
              )}
            </div>
          </div>

          {/* Details & Actions */}
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline"
                  className={cn(
                    "text-sm border-2",
                    listing.condition === 'NEW' && "border-green-200 bg-green-50 text-green-800",
                    listing.condition === 'USED' && "border-amber-200 bg-amber-50 text-amber-800",
                    listing.condition === 'REFURBISHED' && "border-blue-200 bg-blue-50 text-blue-800"
                  )}
                >
                  <div className={cn("w-2 h-2 rounded-full me-1", conditionColors[listing.condition as keyof typeof conditionColors])} />
                  {conditionLabels[listing.condition]?.[locale as 'ar' | 'en'] || listing.condition}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {listing.make} {listing.model} ({listing.fromYear}-{listing.toYear})
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {listing.city}
                </div>
                <div className="flex items-center gap-1">
                  <Truck className="h-4 w-4" />
                  {enhancedListing.deliveryTime}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {enhancedListing.views} {isArabic ? 'مشاهدة' : 'views'}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => onToggleFavorite?.(listing.id)}
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0"
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
                  {isArabic ? 'عرض التفاصيل' : 'View Details'}
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
      // Enhanced product card styling
      "group overflow-hidden cursor-pointer",
      // Premium gradient background
      "bg-gradient-to-br from-card via-card to-saudi-green/2",
      // Enhanced borders with gradient
      "border-2 border-border/30 hover:border-saudi-green/40",
      // Enhanced shadows with product-specific depth
      "shadow-md hover:shadow-xl hover:shadow-saudi-green/15",
      // Better hover effects with lift and subtle scale
      "hover:-translate-y-2 hover:scale-[1.01]",
      // Smooth transitions with easing
      "transition-all duration-500 ease-out",
      // Enhanced backdrop blur for depth
      "backdrop-blur-sm",
      // Out of stock styling
      !enhancedListing.inStock && "opacity-75 grayscale hover:grayscale-0",
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
            <div className="flex gap-1">
              {/* Quick View Button - Better hover behavior */}
              {onQuickView && (
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onQuickView();
                  }}
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 bg-white/90 backdrop-blur-sm hover:bg-saudi-green hover:text-white hover:scale-105 transition-all duration-200 shadow-lg border border-white/20 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleFavorite?.(listing.id);
                }}
                variant="ghost"
                size="icon"
                className="h-9 w-9 bg-white/90 backdrop-blur-sm hover:bg-red-50 hover:scale-105 transition-all duration-200 shadow-lg border border-white/20"
              >
                <Heart className={cn(
                  "h-4 w-4 transition-all duration-200",
                  isFavorited 
                    ? "fill-red-500 text-red-500 scale-110" 
                    : "text-muted-foreground hover:text-red-500"
                )} />
              </Button>
            </div>
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

          {/* Quick View Button - Shows on Hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center backdrop-blur-sm">
            {onQuickView && (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onQuickView();
                }}
                className="bg-white text-black hover:bg-white/90 transition-all duration-200 shadow-lg scale-95 group-hover:scale-100"
                size="sm"
              >
                <Eye className="h-4 w-4 me-2" />
                {isArabic ? 'معاينة سريعة' : 'Quick View'}
              </Button>
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

        {/* Enhanced Seller Info */}
        <div className={cn(
          "flex items-center gap-2 p-3 rounded-lg relative overflow-hidden",
          "bg-gradient-to-r from-muted/20 via-muted/30 to-muted/20",
          "border border-border/20 group-hover:border-saudi-green/20",
          "transition-all duration-300"
        )}>
          {/* Seller reputation indicator */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-saudi-green/30 to-transparent" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-foreground truncate">
                {seller.businessName || seller.yardName}
              </span>
              {seller.verified && (
                <div className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-saudi-green flex-shrink-0" />
                  <span className="text-xs text-saudi-green ml-0.5 font-medium">{isArabic ? 'موثق' : 'Verified'}</span>
                </div>
              )}
              {seller.certifications && seller.certifications.length > 0 && (
                <div className="flex items-center">
                  <Award className="h-3 w-3 text-desert-gold flex-shrink-0" />
                  <span className="text-xs text-desert-gold ml-0.5 font-medium">{isArabic ? 'معتمد' : 'Certified'}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-0.5">{renderStars(seller.rating!)}</div>
              <span className="text-xs text-muted-foreground font-medium">
                {seller.rating?.toFixed(1)} ({seller.totalReviews})
              </span>
            </div>
          </div>
          <div className="text-end">
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
              <Clock className="h-3 w-3 text-saudi-green" />
              <span className="font-medium">{seller.responseTime}</span>
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

        {/* Enhanced Price Display */}
        <div className={cn(
          "flex items-center justify-between pt-3 mt-1",
          "border-t border-gradient-to-r from-transparent via-border/50 to-transparent",
          "relative"
        )}>
          {/* Price highlight background */}
          <div className="absolute inset-0 bg-gradient-to-r from-saudi-green/2 via-transparent to-desert-gold/2 rounded-lg -mx-2 -my-1" />
          
          <div className="flex items-center gap-2 relative z-10">
            <div className="flex items-center gap-1">
              <span className={cn(
                "text-xl font-bold text-saudi-green",
                "group-hover:scale-105 transition-transform duration-200"
              )}>
                {(listing.priceSar / 100).toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
              </span>
              <SARSymbol className="h-5 w-5 text-saudi-green/80" />
            </div>
            {/* Add competitive pricing indicator */}
            {(listing.priceSar / 100) < 5000 && (
              <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-1 rounded-full text-xs font-bold">
                <TrendingUp className="h-3 w-3" />
                <span>{isArabic ? 'سعر ممتاز' : 'Great Deal'}</span>
              </div>
            )}
          </div>
          {enhancedListing.warrantyMonths && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-semibold relative z-10",
              "bg-desert-gold/10 text-desert-gold px-2 py-1 rounded-full",
              "border border-desert-gold/20"
            )}>
              <Shield className="h-3 w-3" />
              <span>
                {enhancedListing.warrantyMonths} {isArabic ? 'شهر ضمان' : 'mo warranty'}
              </span>
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