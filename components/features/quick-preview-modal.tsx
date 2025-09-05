'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SARSymbol } from '@/components/ui/currency-symbol';
import { QuickAddToCart } from '@/components/features/quick-add-to-cart';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  Star,
  Shield,
  Truck,
  Clock,
  MapPin,
  Eye,
  Sparkles,
  CheckCircle,
  Zap,  // Used in component
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';

interface Seller {
  id: string;
  businessName: string;
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

interface QuickPreviewModalProps {
  listing: Listing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleFavorite?: (listingId: string) => void;
  isFavorited?: boolean;
}

const conditionLabels: Record<string, Record<string, string>> = {
  NEW: { ar: 'جديد', en: 'New' },
  REFURBISHED: { ar: 'مجدد', en: 'Refurbished' },
  USED: { ar: 'مستعمل', en: 'Used' },
};

// const conditionColors = {
//   NEW: 'bg-green-500',
//   REFURBISHED: 'bg-blue-500',
//   USED: 'bg-amber-500',
// };

export function QuickPreviewModal({ 
  listing, 
  open, 
  onOpenChange, 
  onToggleFavorite,
  isFavorited = false
}: QuickPreviewModalProps) {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  if (!listing) return null;

  // Generate enhanced data like in the product card
  const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  };
  
  const seed = hashCode(listing.id);
  const seededRandom = (max: number = 1) => ((seed % 1000) / 1000) * max;

  const seller = {
    ...listing.seller,
    rating: listing.seller.rating || 4.2 + seededRandom(0.8),
    totalReviews: listing.seller.totalReviews || Math.floor(seededRandom(200)) + 10,
    verified: listing.seller.verified !== undefined ? listing.seller.verified : seededRandom(1) > 0.3,
    responseTime: listing.seller.responseTime || (isArabic ? 'خلال ساعة' : '< 1 hour'),
    certifications: listing.seller.certifications || (seededRandom(1) > 0.5 ? ['OEM', 'Quality'] : []),
  };

  const enhancedListing = {
    ...listing,
    warrantyMonths: listing.warrantyMonths || (listing.condition === 'NEW' ? 6 : listing.condition === 'REFURBISHED' ? 3 : 0),
    installationAvailable: listing.installationAvailable !== undefined ? listing.installationAvailable : seededRandom(1) > 0.4,
    deliveryTime: listing.deliveryTime || (isArabic ? '2-3 أيام' : '2-3 days'),
    views: listing.views || Math.floor(seededRandom(100)) + 20,
    savedBy: listing.savedBy || Math.floor(seededRandom(15)),
    inStock: listing.inStock !== undefined ? listing.inStock : true,
    partNumber: listing.partNumber || `P${listing.id.substring(0, 6).toUpperCase()}`,
  };

  const hasPhotos = listing.photos && listing.photos.length > 0 && !imageError;
  const currentPhoto = hasPhotos ? listing.photos[currentImageIndex] : null;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < Math.floor(rating) 
            ? "fill-desert-gold text-desert-gold" 
            : i < rating 
            ? "fill-desert-gold/50 text-desert-gold" 
            : "fill-muted text-muted-foreground"
        )}
      />
    ));
  };

  const nextImage = () => {
    if (hasPhotos && listing.photos.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.photos.length);
    }
  };

  const prevImage = () => {
    if (hasPhotos && listing.photos.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.photos.length) % listing.photos.length);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden p-0 gap-0"
        showCloseButton={false}
      >
        {/* Clean Header */}
        <DialogHeader className="px-4 sm:px-6 pt-4 pb-3 border-b border-border/30">
          <div className="flex items-start justify-between gap-2 sm:gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg sm:text-xl font-bold leading-tight mb-1 truncate">
                {isArabic ? listing.titleAr : listing.titleEn || listing.titleAr}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                <span>{listing.make} {listing.model}</span>
                <span className="text-xs ml-2">({listing.fromYear}-{listing.toYear})</span>
                {enhancedListing.partNumber && (
                  <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded ml-2">
                    #{enhancedListing.partNumber}
                  </span>
                )}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                onClick={() => onToggleFavorite?.(listing.id)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-red-50"
              >
                <Heart className={cn(
                  "h-4 w-4",
                  isFavorited ? "fill-red-500 text-red-500" : "text-muted-foreground"
                )} />
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 p-4 sm:p-6">
            {/* Image Gallery Section */}
            <div className="space-y-3">
              {/* Main Image */}
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center relative overflow-hidden border">
                {currentPhoto ? (
                  <Image 
                    src={currentPhoto.url} 
                    alt={isArabic ? listing.titleAr : listing.titleEn || listing.titleAr}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
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

                {/* Image Navigation */}
                {hasPhotos && listing.photos.length > 1 && (
                  <>
                    <Button
                      onClick={prevImage}
                      variant="ghost"
                      size="sm"
                      className="absolute start-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={nextImage}
                      variant="ghost"
                      size="sm"
                      className="absolute end-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}

                {/* Image Counter */}
                {hasPhotos && listing.photos.length > 1 && (
                  <div className="absolute bottom-2 start-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                    {currentImageIndex + 1} / {listing.photos.length}
                  </div>
                )}

                {/* Status Badges */}
                <div className="absolute top-2 start-2 flex flex-col gap-1">
                  {listing.condition === 'NEW' && (
                    <Badge className="bg-green-500 text-white text-xs">
                      <Sparkles className="h-3 w-3 me-1" />
                      {isArabic ? 'جديد' : 'New'}
                    </Badge>
                  )}
                  {enhancedListing.warrantyMonths && enhancedListing.warrantyMonths > 0 && (
                    <Badge className="bg-saudi-green text-white text-xs">
                      <Shield className="h-3 w-3 me-1" />
                      {enhancedListing.warrantyMonths} {isArabic ? 'شهر' : 'mo'}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Thumbnail Navigation */}
              {hasPhotos && listing.photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {listing.photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn(
                        "w-16 h-16 rounded-md overflow-hidden border-2 transition-colors flex-shrink-0",
                        index === currentImageIndex ? "border-saudi-green" : "border-transparent"
                      )}
                    >
                      <Image
                        src={photo.url}
                        alt={`${isArabic ? listing.titleAr : listing.titleEn || listing.titleAr} - ${index + 1}`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-4 sm:space-y-6">
              {/* Price & Status */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl sm:text-3xl font-bold text-saudi-green">
                    {(listing.priceSar / 100).toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                  </span>
                  <SARSymbol className="h-5 w-5 sm:h-6 sm:w-6 text-saudi-green/80" />
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <Badge 
                    variant="outline"
                    className={cn(
                      "border-2 text-xs",
                      listing.condition === 'NEW' && "border-green-200 bg-green-50 text-green-800",
                      listing.condition === 'USED' && "border-amber-200 bg-amber-50 text-amber-800",
                      listing.condition === 'REFURBISHED' && "border-blue-200 bg-blue-50 text-blue-800"
                    )}
                  >
                    {conditionLabels[listing.condition]?.[locale as 'ar' | 'en'] || listing.condition}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{enhancedListing.views} {isArabic ? 'مشاهدة' : 'views'}</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{listing.city}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{enhancedListing.deliveryTime}</span>
                </div>
                {enhancedListing.warrantyMonths && enhancedListing.warrantyMonths > 0 && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span className="truncate">{enhancedListing.warrantyMonths} {isArabic ? 'شهر ضمان' : 'mo warranty'}</span>
                  </div>
                )}
                {enhancedListing.installationAvailable && (
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-riyadh-sky flex-shrink-0" />
                    <span className="truncate">{isArabic ? 'تركيب متوفر' : 'Installation available'}</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Seller Information */}
              <div>
                <h4 className="font-semibold mb-3 text-sm sm:text-base">{isArabic ? 'معلومات البائع' : 'Seller Information'}</h4>
                <div className="bg-muted/30 p-3 sm:p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm sm:text-base truncate">{seller.businessName}</span>
                    {seller.verified && (
                      <CheckCircle className="h-4 w-4 text-saudi-green flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">{renderStars(seller.rating!)}</div>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      ({seller.totalReviews} {isArabic ? 'تقييم' : 'reviews'})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                    <Clock className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{isArabic ? 'يرد خلال' : 'Responds in'} {seller.responseTime}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 sm:space-y-3">
                <QuickAddToCart 
                  listing={listing} 
                  disabled={!enhancedListing.inStock}
                  className="w-full btn-saudi h-10 sm:h-11"
                />
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-9 sm:h-10 text-sm"
                    asChild
                  >
                    <Link href={`/${locale}/shop/listing/${listing.id}`}>
                      {isArabic ? 'عرض التفاصيل' : 'View Details'}
                    </Link>
                  </Button>
                  <Button variant="outline" className="flex-1 h-9 sm:h-10 text-sm">
                    {isArabic ? 'اتصل بالبائع' : 'Contact'}
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}