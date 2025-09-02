'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useCart } from '@/lib/cart/cart-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { SARSymbol } from '@/components/ui/currency-symbol';
import { AlertCircle, ArrowRight, Loader2, CheckCircle2, User, Mail, Phone, MapPin } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Form validation schema
const checkoutSchema = z.object({
  fullName: z.string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(100, { message: 'Name must be less than 100 characters' }),
  email: z.string()
    .email({ message: 'Please enter a valid email address' }),
  phone: z.string()
    .min(10, { message: 'Phone number must be at least 10 digits' })
    .regex(/^[+]?[0-9]{10,15}$/, { message: 'Please enter a valid phone number' }),
  addressLine1: z.string()
    .min(5, { message: 'Address must be at least 5 characters' })
    .max(200, { message: 'Address must be less than 200 characters' }),
  addressLine2: z.string().max(200).optional(),
  city: z.string()
    .min(2, { message: 'City must be at least 2 characters' })
    .max(100, { message: 'City must be less than 100 characters' }),
  postalCode: z.string()
    .max(20, { message: 'Postal code must be less than 20 characters' })
    .optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const locale = useLocale();
  const router = useRouter();
  const isArabic = locale === 'ar';
  const { items, totalPrice, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  // Initialize form with React Hook Form and Zod validation
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      postalCode: '',
    },
  });
  
  // Handle redirect when cart is empty
  useEffect(() => {
    if (items.length === 0 && !orderSuccess) {
      toast.error(isArabic ? 'السلة فارغة' : 'Cart is empty');
      router.push(`/${locale}/cart`);
    }
  }, [items.length, locale, router, orderSuccess, isArabic]);
  
  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);
    
    try {
      // Show loading toast
      toast.loading(isArabic ? 'جاري إنشاء الطلب...' : 'Creating order...', {
        id: 'create-order'
      });
      
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
          buyerInfo: data,
          totalAmount: totalPrice,
        }),
      });
      
      if (response.ok) {
        const order = await response.json();
        setOrderSuccess(true);
        clearCart();
        
        // Success toast
        toast.success(isArabic ? 'تم إنشاء الطلب بنجاح!' : 'Order created successfully!', {
          id: 'create-order'
        });
        
        // Redirect after a brief delay to show success state
        setTimeout(() => {
          router.push(`/${locale}/order-success/${order.id}`);
        }, 1500);
      } else {
        const errorData = await response.json();
        console.error('Order creation failed:', errorData);
        
        // Handle specific validation errors
        if (errorData.details && Array.isArray(errorData.details)) {
          errorData.details.forEach((err: { path?: string[]; message?: string }) => {
            if (err.path && err.path.length > 0) {
              const fieldName = err.path[err.path.length - 1] as keyof CheckoutFormData;
              if (fieldName in data) {
                form.setError(fieldName, {
                  type: 'server',
                  message: err.message || 'Invalid value'
                });
              }
            }
          });
          
          toast.error(isArabic ? 'يرجى التحقق من البيانات المدخلة' : 'Please check the form data', {
            id: 'create-order'
          });
        } else {
          toast.error(errorData.error || (isArabic ? 'فشل في إنشاء الطلب' : 'Failed to create order'), {
            id: 'create-order'
          });
        }
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(isArabic ? 'حدث خطأ. حاول مرة أخرى.' : 'An error occurred. Please try again.', {
        id: 'create-order'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Show loading state while redirecting
  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {isArabic ? 'جاري التحميل...' : 'Loading...'}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Show success state
  if (orderSuccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              {isArabic ? 'تم إنشاء الطلب بنجاح!' : 'Order Created Successfully!'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {isArabic ? 'سيتم توجيهك إلى صفحة تأكيد الطلب...' : 'Redirecting to order confirmation...'}
            </p>
            <div className="flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">
        {isArabic ? 'إتمام الطلب' : 'Checkout'}
      </h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card className="relative overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-desert-gold" />
                  {isArabic ? 'معلومات الاتصال' : 'Contact Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        {isArabic ? 'الاسم الكامل' : 'Full Name'} *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={isArabic ? 'أدخل الاسم الكامل' : 'Enter your full name'}
                          className="h-11 transition-colors focus:ring-2 focus:ring-desert-gold/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {isArabic ? 'البريد الإلكتروني' : 'Email'} *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="example@email.com"
                            className="h-11 transition-colors focus:ring-2 focus:ring-desert-gold/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {isArabic ? 'رقم الجوال' : 'Phone Number'} *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            dir="ltr"
                            placeholder="+966 5XXXXXXXX"
                            className="h-11 transition-colors focus:ring-2 focus:ring-desert-gold/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Shipping Address */}
            <Card className="relative overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-desert-gold" />
                  {isArabic ? 'عنوان الشحن' : 'Shipping Address'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="addressLine1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        {isArabic ? 'العنوان - السطر الأول' : 'Address Line 1'} *
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={isArabic ? 'أدخل العنوان الأساسي' : 'Enter your street address'}
                          className="h-11 transition-colors focus:ring-2 focus:ring-desert-gold/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="addressLine2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-muted-foreground">
                        {isArabic ? 'العنوان - السطر الثاني' : 'Address Line 2'} ({isArabic ? 'اختياري' : 'Optional'})
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={isArabic ? 'شقة، مبنى، وحدة، إلخ' : 'Apartment, building, unit, etc.'}
                          className="h-11 transition-colors focus:ring-2 focus:ring-desert-gold/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          {isArabic ? 'المدينة' : 'City'} *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={isArabic ? 'أدخل المدينة' : 'Enter city'}
                            className="h-11 transition-colors focus:ring-2 focus:ring-desert-gold/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-muted-foreground">
                          {isArabic ? 'الرمز البريدي' : 'Postal Code'} ({isArabic ? 'اختياري' : 'Optional'})
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={isArabic ? '12345' : '12345'}
                            dir="ltr"
                            className="h-11 transition-colors focus:ring-2 focus:ring-desert-gold/20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Payment Notice */}
            <Alert className="border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {isArabic 
                  ? 'هذا نموذج تجريبي. لن يتم تحصيل أي مبالغ فعلية.'
                  : 'This is a demo. No actual payment will be processed.'}
              </AlertDescription>
            </Alert>
          </div>
          
          {/* Order Summary */}
          <div>
            <Card className="sticky top-4 border-2 border-desert-gold/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">
                  {isArabic ? 'ملخص الطلب' : 'Order Summary'}
                </CardTitle>
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
                  className="w-full h-12 bg-desert-gold hover:bg-desert-gold/90 text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isProcessing || !form.formState.isValid}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="me-2 h-4 w-4 animate-spin" />
                      {isArabic ? 'جاري المعالجة...' : 'Processing...'}
                    </>
                  ) : (
                    <>
                      {isArabic ? 'تأكيد الطلب' : 'Place Order'}
                      <ArrowRight className="ms-2 h-4 w-4 transition-transform group-hover:translate-x-1 rotate-180 rtl:rotate-0" />
                    </>
                  )}
                </Button>
                
                {/* Form validation status */}
                {Object.keys(form.formState.errors).length > 0 && (
                  <div className="text-xs text-destructive text-center">
                    {isArabic ? 'يرجى تصحيح الأخطاء أعلاه' : 'Please correct the errors above'}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        </form>
      </Form>
    </div>
  );
}