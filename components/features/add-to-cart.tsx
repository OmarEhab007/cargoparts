'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/lib/cart/cart-context';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

interface AddToCartProps {
  listing: {
    id: string;
    titleAr: string;
    titleEn?: string;
    priceSar: number;
    make: string;
    model: string;
    condition: string;
    city: string;
    seller: {
      id: string;
      yardName: string;
    };
    photos?: Array<{ url: string }>;
  };
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function AddToCart({ listing, variant = 'default', size = 'default', className }: AddToCartProps) {
  const { addItem, isInCart } = useCart();
  const locale = useLocale();
  const router = useRouter();
  const [isAdded, setIsAdded] = useState(false);
  const isArabic = locale === 'ar';
  
  const inCart = isInCart(listing.id);
  
  const handleAddToCart = () => {
    if (inCart) {
      // Navigate to cart if already in cart
      router.push(`/${locale}/cart`);
      return;
    }
    
    addItem({
      listingId: listing.id,
      titleAr: listing.titleAr,
      titleEn: listing.titleEn,
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
    
    setIsAdded(true);
    
    // Reset the "added" state after 2 seconds
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };
  
  const buttonText = inCart 
    ? (isArabic ? 'عرض السلة' : 'View Cart')
    : isAdded 
      ? (isArabic ? 'تمت الإضافة' : 'Added')
      : (isArabic ? 'أضف إلى السلة' : 'Add to Cart');
  
  const Icon = isAdded ? Check : ShoppingCart;
  
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleAddToCart}
    >
      <Icon className="me-2 h-5 w-5" />
      {buttonText}
    </Button>
  );
}