'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SARSymbol } from '@/components/ui/currency-symbol';
import { useCart } from '@/lib/cart/cart-context';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const locale = useLocale();
  const router = useRouter();
  const isArabic = locale === 'ar';
  const { items, totalPrice, removeItem, updateQuantity, clearCart } = useCart();
  
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <ShoppingBag className="mx-auto mb-6 h-24 w-24 text-muted-foreground" />
          <h1 className="mb-4 text-3xl font-bold">
            {isArabic ? 'السلة فارغة' : 'Your cart is empty'}
          </h1>
          <p className="mb-8 text-muted-foreground">
            {isArabic 
              ? 'لم تقم بإضافة أي قطع غيار إلى السلة بعد'
              : 'You haven\'t added any parts to your cart yet'}
          </p>
          <Button size="lg" asChild>
            <Link href={`/${locale}/shop`}>
              {isArabic ? 'تصفح القطع' : 'Browse Parts'}
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">
        {isArabic ? 'سلة التسوق' : 'Shopping Cart'}
      </h1>
      
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {isArabic ? 'القطع' : 'Items'} ({items.length})
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearCart}
                className="text-destructive hover:text-destructive"
              >
                {isArabic ? 'إفراغ السلة' : 'Clear Cart'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id}>
                  {index > 0 && <Separator className="mb-4" />}
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted relative">
                      {item.image ? (
                        <Image 
                          src={item.image} 
                          alt={isArabic ? item.titleAr : item.titleEn || item.titleAr}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="text-2xl text-muted-foreground">📦</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="mb-2">
                        <Link 
                          href={`/${locale}/shop/listing/${item.listingId}`}
                          className="font-semibold hover:underline"
                        >
                          {isArabic ? item.titleAr : item.titleEn || item.titleAr}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {item.make} {item.model} • {item.condition}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isArabic ? 'البائع:' : 'Seller:'} {item.sellerName}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-lg font-semibold flex items-center gap-1">
                            {(item.price * item.quantity).toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                            <SARSymbol className="h-4 w-4" />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        
        {/* Order Summary */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>{isArabic ? 'ملخص الطلب' : 'Order Summary'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {isArabic ? 'المجموع الفرعي' : 'Subtotal'}
                  </span>
                  <span className="flex items-center gap-1">
                    {totalPrice.toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                    <SARSymbol className="h-3 w-3" />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {isArabic ? 'الشحن' : 'Shipping'}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {isArabic ? 'سيتم الحساب عند الدفع' : 'Calculated at checkout'}
                  </span>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-semibold">
                <span>{isArabic ? 'المجموع' : 'Total'}</span>
                <span className="flex items-center gap-1">
                  {totalPrice.toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                  <SARSymbol className="h-4 w-4" />
                </span>
              </div>
              
              <Button 
                size="lg" 
                className="w-full"
                onClick={() => router.push(`/${locale}/checkout`)}
              >
                {isArabic ? 'إتمام الطلب' : 'Proceed to Checkout'}
                <ArrowRight className="ms-2 h-4 w-4 rotate-180 rtl:rotate-0" />
              </Button>
              
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/${locale}/shop`}>
                  {isArabic ? 'متابعة التسوق' : 'Continue Shopping'}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}