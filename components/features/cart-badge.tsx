'use client';

import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/cart/cart-context';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export function CartBadge() {
  const { totalItems } = useCart();
  const locale = useLocale();
  
  return (
    <Button variant="ghost" size="icon" className="relative" asChild>
      <Link href={`/${locale}/cart`}>
        <ShoppingCart className="h-5 w-5" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -end-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        )}
      </Link>
    </Button>
  );
}