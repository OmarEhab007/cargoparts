'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/cart/cart-context';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export function CartBadge() {
  const { totalItems } = useCart();
  const locale = useLocale();
  
  return (
    <Button
      variant="ghost"
      size="sm"
      className="relative text-muted-foreground hover:text-saudi-green"
      asChild
    >
      <Link href={`/${locale}/cart`}>
        <ShoppingCart className="h-4 w-4" />
        <Badge className="absolute -top-1 -end-1 h-5 w-5 rounded-full bg-desert-gold text-saudi-green-dark text-xs flex items-center justify-center p-0">
          {totalItems > 99 ? '99+' : totalItems}
        </Badge>
      </Link>
    </Button>
  );
}