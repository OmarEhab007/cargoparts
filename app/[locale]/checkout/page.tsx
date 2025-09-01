'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useCart } from '@/lib/cart/cart-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { SARSymbol } from '@/components/ui/currency-symbol';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function CheckoutPage() {
  const locale = useLocale();
  const router = useRouter();
  const isArabic = locale === 'ar';
  const { items, totalPrice, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
  });
  
  // Handle redirect when cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push(`/${locale}/cart`);
    }
  }, [items.length, locale, router]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      // Create order via API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            listingId: item.listingId,
            quantity: item.quantity,
            price: item.price,
          })),
          buyerInfo: formData,
          totalAmount: totalPrice,
        }),
      });
      
      if (response.ok) {
        const order = await response.json();
        clearCart();
        router.push(`/${locale}/order-success/${order.id}`);
      } else {
        const errorData = await response.json();
        console.error('Order creation failed:', errorData);
        
        // Check for specific validation errors
        if (errorData.details && Array.isArray(errorData.details)) {
          const emailError = errorData.details.find((err: { path?: string[] }) => err.path?.includes('email'));
          if (emailError) {
            alert(isArabic ? 'البريد الإلكتروني غير صحيح. الرجاء التحقق من صيغة البريد الإلكتروني.' : 'Invalid email address. Please check the email format.');
            return;
          }
        }
        
        throw new Error(errorData.error || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert(isArabic ? 'حدث خطأ. حاول مرة أخرى.' : 'An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Show loading state while redirecting
  if (items.length === 0) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">
        {isArabic ? 'إتمام الطلب' : 'Checkout'}
      </h1>
      
      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? 'معلومات الاتصال' : 'Contact Information'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fullName">
                    {isArabic ? 'الاسم الكامل' : 'Full Name'} *
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="email">
                      {isArabic ? 'البريد الإلكتروني' : 'Email'} *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                      placeholder="example@email.com"
                      pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">
                      {isArabic ? 'رقم الجوال' : 'Phone Number'} *
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                      dir="ltr"
                      placeholder="+966 5XXXXXXXX"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? 'عنوان الشحن' : 'Shipping Address'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="addressLine1">
                    {isArabic ? 'العنوان - السطر الأول' : 'Address Line 1'} *
                  </Label>
                  <Input
                    id="addressLine1"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="addressLine2">
                    {isArabic ? 'العنوان - السطر الثاني' : 'Address Line 2'}
                  </Label>
                  <Input
                    id="addressLine2"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="city">
                      {isArabic ? 'المدينة' : 'City'} *
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode">
                      {isArabic ? 'الرمز البريدي' : 'Postal Code'}
                    </Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Payment Notice */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {isArabic 
                  ? 'هذا نموذج تجريبي. لن يتم تحصيل أي مبالغ فعلية.'
                  : 'This is a demo. No actual payment will be processed.'}
              </AlertDescription>
            </Alert>
          </div>
          
          {/* Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>{isArabic ? 'ملخص الطلب' : 'Order Summary'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items List */}
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="line-clamp-1">
                        {isArabic ? item.titleAr : item.titleEn || item.titleAr} x{item.quantity}
                      </span>
                      <span className="flex items-center gap-1">
                        {(item.price * item.quantity).toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                        <SARSymbol className="h-3 w-3" />
                      </span>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                {/* Totals */}
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
                    <span className="text-muted-foreground">
                      {isArabic ? 'مجاني' : 'Free'}
                    </span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>{isArabic ? 'المجموع الكلي' : 'Total'}</span>
                  <span className="flex items-center gap-1">
                    {totalPrice.toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                    <SARSymbol className="h-4 w-4" />
                  </span>
                </div>
                
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing 
                    ? (isArabic ? 'جاري المعالجة...' : 'Processing...')
                    : (isArabic ? 'تأكيد الطلب' : 'Place Order')}
                  <ArrowRight className="ms-2 h-4 w-4 rotate-180 rtl:rotate-0" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}