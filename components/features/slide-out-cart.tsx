'use client';

import { useState, Fragment } from 'react';
import { useLocale } from 'next-intl';
import { Dialog, Transition } from '@headlessui/react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Reserved for future use
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SARSymbol } from '@/components/ui/currency-symbol';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  ArrowRight,
  Truck,
  Shield,
  Clock,
  Star,
  CheckCircle,
  AlertTriangle,
  // Heart, Share2, Gift - Reserved for future use
  Zap,
  CreditCard,
  Lock,
  Package,
} from 'lucide-react';

interface CartItem {
  id: string;
  listingId: string;
  title: string;
  titleAr: string;
  make: string;
  model: string;
  year: string;
  condition: string;
  price: number;
  quantity: number;
  image?: string;
  sellerId: string;
  sellerName: string;
  sellerRating: number;
  partNumber?: string;
  warranty?: number;
  installationAvailable?: boolean;
  estimatedDelivery?: string;
  inStock: boolean;
}

interface SlideOutCartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  className?: string;
}

export function SlideOutCart({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  // className, // Available for future styling - currently unused
}: SlideOutCartProps) {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [isUpdating, setIsUpdating] = useState(false);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Estimated delivery and shipping
  const estimatedShipping = subtotal > 500 ? 0 : 25; // Free shipping over 500 SAR
  const estimatedTax = Math.round(subtotal * 0.15); // 15% VAT
  const total = subtotal + estimatedShipping + estimatedTax;

  // Group items by seller for better organization
  const itemsBySeller = items.reduce((acc, item) => {
    if (!acc[item.sellerId]) {
      acc[item.sellerId] = {
        sellerName: item.sellerName,
        sellerRating: item.sellerRating,
        items: []
      };
    }
    acc[item.sellerId].items.push(item);
    return acc;
  }, {} as Record<string, { sellerName: string; sellerRating: number; items: CartItem[] }>);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setIsUpdating(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    onUpdateQuantity(itemId, newQuantity);
    setIsUpdating(false);
  };

  const handleRemoveItem = async (itemId: string) => {
    setIsUpdating(true);
    
    // Simulate API call delay  
    await new Promise(resolve => setTimeout(resolve, 200));
    
    onRemoveItem(itemId);
    setIsUpdating(false);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-3 w-3",
          i < Math.floor(rating) 
            ? "fill-desert-gold text-desert-gold" 
            : "fill-muted text-muted-foreground"
        )}
      />
    ));
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className={cn(
              "pointer-events-none fixed inset-y-0 flex max-w-full",
              isArabic ? "left-0 pl-10" : "right-0 pr-10"
            )}>
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom={isArabic ? "-translate-x-full" : "translate-x-full"}
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo={isArabic ? "-translate-x-full" : "translate-x-full"}
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-background shadow-xl border-s border-border">
                    {/* Header */}
                    <div className="p-6 bg-gradient-saudi text-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <ShoppingCart className="h-6 w-6" />
                          <div>
                            <Dialog.Title className="text-lg font-bold">
                              {isArabic ? 'سلة التسوق' : 'Shopping Cart'}
                            </Dialog.Title>
                            <p className="text-sm text-white/80">
                              {itemCount} {isArabic ? 'قطعة' : 'items'}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={onClose}
                          className="text-white hover:bg-white/20 hover:text-white"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>

                      {/* Progress to free shipping */}
                      {subtotal < 500 && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span>{isArabic ? 'شحن مجاني عند' : 'Free shipping at'} 500 ر.س</span>
                            <span>{500 - subtotal} {isArabic ? 'ر.س متبقية' : 'SAR remaining'}</span>
                          </div>
                          <div className="w-full bg-white/20 rounded-full h-2">
                            <div 
                              className="bg-desert-gold h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min((subtotal / 500) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {subtotal >= 500 && (
                        <div className="mt-4 flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-desert-gold" />
                          <span>{isArabic ? 'تأهلت للشحن المجاني!' : 'You qualify for free shipping!'}</span>
                        </div>
                      )}
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-hidden">
                      {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                            <ShoppingCart className="w-10 h-10 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">
                            {isArabic ? 'السلة فارغة' : 'Cart is empty'}
                          </h3>
                          <p className="text-muted-foreground mb-6">
                            {isArabic ? 'ابدأ بإضافة قطع الغيار التي تحتاجها' : 'Start adding the parts you need'}
                          </p>
                          <Button
                            onClick={onClose}
                            className="btn-saudi"
                            asChild
                          >
                            <Link href={`/${locale}/shop`}>
                              {isArabic ? 'تصفح القطع' : 'Browse Parts'}
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <ScrollArea className="h-full">
                          <div className="p-6 space-y-6">
                            {Object.entries(itemsBySeller).map(([sellerId, sellerData]) => (
                              <div key={sellerId} className="space-y-4">
                                {/* Seller Header */}
                                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-saudi-green rounded-full flex items-center justify-center">
                                      <CheckCircle className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm">{sellerData.sellerName}</p>
                                      <div className="flex items-center gap-1">
                                        {renderStars(sellerData.sellerRating)}
                                        <span className="text-xs text-muted-foreground">
                                          ({sellerData.sellerRating})
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <Badge className="badge-saudi text-xs">
                                    {isArabic ? 'موثوق' : 'Verified'}
                                  </Badge>
                                </div>

                                {/* Seller's Items */}
                                <div className="space-y-4">
                                  {sellerData.items.map((item) => (
                                    <div
                                      key={item.id}
                                      className={cn(
                                        "flex gap-4 p-4 border rounded-lg transition-all",
                                        isUpdating && "opacity-50 pointer-events-none",
                                        !item.inStock && "border-red-200 bg-red-50/50"
                                      )}
                                    >
                                      {/* Item Image */}
                                      <div className="w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                                        {item.image ? (
                                          <Image
                                            src={item.image}
                                            alt={item.title}
                                            width={64}
                                            height={64}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                            <Package className="w-6 h-6 text-muted-foreground" />
                                          </div>
                                        )}
                                      </div>

                                      {/* Item Details */}
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm line-clamp-2 mb-1">
                                          {isArabic ? item.titleAr : item.title}
                                        </h4>
                                        <p className="text-xs text-muted-foreground mb-2">
                                          {item.make} {item.model} • {item.year} • {item.condition}
                                        </p>

                                        {item.partNumber && (
                                          <p className="text-xs text-muted-foreground font-mono mb-2">
                                            {isArabic ? 'رقم القطعة:' : 'Part #'} {item.partNumber}
                                          </p>
                                        )}

                                        {/* Features */}
                                        <div className="flex flex-wrap gap-1 mb-2">
                                          {item.warranty && (
                                            <Badge variant="outline" className="text-xs">
                                              <Shield className="w-3 h-3 me-1" />
                                              {item.warranty} {isArabic ? 'شهر' : 'mo'}
                                            </Badge>
                                          )}
                                          {item.installationAvailable && (
                                            <Badge variant="outline" className="text-xs">
                                              <Zap className="w-3 h-3 me-1" />
                                              {isArabic ? 'تركيب' : 'Install'}
                                            </Badge>
                                          )}
                                          {item.estimatedDelivery && (
                                            <Badge variant="outline" className="text-xs">
                                              <Clock className="w-3 h-3 me-1" />
                                              {item.estimatedDelivery}
                                            </Badge>
                                          )}
                                        </div>

                                        {/* Stock Status */}
                                        {!item.inStock && (
                                          <div className="flex items-center gap-1 text-red-600 text-xs mb-2">
                                            <AlertTriangle className="w-3 h-3" />
                                            {isArabic ? 'نفد من المخزون' : 'Out of stock'}
                                          </div>
                                        )}

                                        {/* Price and Quantity Controls */}
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-1">
                                            <span className="font-bold text-saudi-green">
                                              {item.price.toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                                            </span>
                                            <SARSymbol className="w-4 h-4 text-saudi-green/80" />
                                          </div>

                                          <div className="flex items-center gap-2">
                                            {/* Quantity Controls */}
                                            <div className="flex items-center border rounded-md">
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1 || !item.inStock}
                                              >
                                                <Minus className="h-3 w-3" />
                                              </Button>
                                              <span className="w-8 text-center text-sm font-medium">
                                                {item.quantity}
                                              </span>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                disabled={!item.inStock}
                                              >
                                                <Plus className="h-3 w-3" />
                                              </Button>
                                            </div>

                                            {/* Remove Button */}
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                              onClick={() => handleRemoveItem(item.id)}
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}

                            {/* Clear Cart Option */}
                            {items.length > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={onClearCart}
                                className="w-full text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 me-2" />
                                {isArabic ? 'إفراغ السلة' : 'Clear Cart'}
                              </Button>
                            )}
                          </div>
                        </ScrollArea>
                      )}
                    </div>

                    {/* Footer with Totals and Checkout */}
                    {items.length > 0 && (
                      <div className="border-t border-border bg-background p-6">
                        {/* Summary */}
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span>{isArabic ? 'المجموع الفرعي' : 'Subtotal'}</span>
                            <div className="flex items-center gap-1">
                              <span>{subtotal.toLocaleString(isArabic ? 'ar-SA' : 'en-US')}</span>
                              <SARSymbol className="w-3 h-3" />
                            </div>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <Truck className="w-3 h-3" />
                              {isArabic ? 'الشحن' : 'Shipping'}
                            </span>
                            <div className="flex items-center gap-1">
                              {estimatedShipping === 0 ? (
                                <span className="text-green-600 font-medium">
                                  {isArabic ? 'مجاني' : 'Free'}
                                </span>
                              ) : (
                                <>
                                  <span>{estimatedShipping.toLocaleString(isArabic ? 'ar-SA' : 'en-US')}</span>
                                  <SARSymbol className="w-3 h-3" />
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <span>{isArabic ? 'ضريبة القيمة المضافة (15%)' : 'VAT (15%)'}</span>
                            <div className="flex items-center gap-1">
                              <span>{estimatedTax.toLocaleString(isArabic ? 'ar-SA' : 'en-US')}</span>
                              <SARSymbol className="w-3 h-3" />
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div className="flex justify-between text-base font-bold">
                            <span>{isArabic ? 'المجموع' : 'Total'}</span>
                            <div className="flex items-center gap-1 text-saudi-green">
                              <span>{total.toLocaleString(isArabic ? 'ar-SA' : 'en-US')}</span>
                              <SARSymbol className="w-4 h-4" />
                            </div>
                          </div>
                        </div>

                        {/* Trust Indicators */}
                        <div className="flex items-center justify-center gap-4 mb-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            {isArabic ? 'دفع آمن' : 'Secure Payment'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            {isArabic ? 'ضمان شامل' : 'Full Warranty'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            {isArabic ? 'توصيل سريع' : 'Fast Delivery'}
                          </div>
                        </div>

                        {/* Checkout Button */}
                        <Button
                          className="w-full btn-saudi h-12 text-base"
                          asChild
                        >
                          <Link href={`/${locale}/checkout`}>
                            <CreditCard className="w-4 h-4 me-2" />
                            {isArabic ? 'إتمام الطلب' : 'Proceed to Checkout'}
                            <ArrowRight className="w-4 h-4 ms-2" />
                          </Link>
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full mt-2"
                          onClick={onClose}
                        >
                          {isArabic ? 'متابعة التسوق' : 'Continue Shopping'}
                        </Button>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}