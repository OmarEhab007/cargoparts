'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart/cart-context';
import { Button } from '@/components/ui/button';
import { useLocale } from 'next-intl';
import { ShoppingCart, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface QuickAddToCartProps {
  listing: {
    id: string;
    titleAr: string;
    titleEn?: string | null;
    priceSar: number;
    make: string;
    model: string;
    condition: string;
    city: string;
    seller: {
      id: string;
      yardName: string;
    };
    photos?: { url: string }[];
  };
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive';
  disabled?: boolean;
}

export function QuickAddToCart({ listing, className, size = 'default', variant = 'default', disabled = false }: QuickAddToCartProps) {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const { addItem, isInCart } = useCart();
  const [added, setAdded] = useState(false);
  
  const inCart = isInCart(listing.id);
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if button is inside a link
    e.stopPropagation();
    
    if (inCart) {
      // Navigate to cart if item already in cart
      window.location.href = `/${locale}/cart`;
      return;
    }
    
    addItem({
      listingId: listing.id,
      titleAr: listing.titleAr,
      titleEn: listing.titleEn || undefined,
      price: listing.priceSar,
      quantity: 1,
      make: listing.make,
      model: listing.model,
      condition: listing.condition,
      city: listing.city,
      sellerId: listing.seller.id,
      sellerName: listing.seller.yardName,
      image: listing.photos?.[0]?.url,
    });
    
    setAdded(true);
    
    toast.success(
      isArabic ? 'تمت الإضافة للسلة' : 'Added to Cart',
      {
        description: isArabic 
          ? `${listing.titleAr} تمت إضافته للسلة`
          : `${listing.titleEn || listing.titleAr} has been added to your cart`,
      }
    );
    
    // Reset added state after animation
    setTimeout(() => setAdded(false), 2000);
  };
  
  return (
    <Button
      onClick={handleAddToCart}
      size={size}
      variant={inCart ? 'secondary' : variant}
      disabled={disabled}
      className={cn(
        'transition-all',
        added && 'animate-pulse',
        className
      )}
    >
      {inCart ? (
        <>
          <Check className="me-2 h-4 w-4" />
          {size === 'icon' ? null : isArabic ? 'في السلة' : 'In Cart'}
        </>
      ) : (
        <>
          <ShoppingCart className="me-2 h-4 w-4" />
          {size === 'icon' ? null : isArabic ? 'أضف للسلة' : 'Add to Cart'}
        </>
      )}
    </Button>
  );
}