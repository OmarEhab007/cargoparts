'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { SARSymbol } from '@/components/ui/currency-symbol';
import { cn } from '@/lib/utils';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Shield,
  Truck,
  CreditCard,
  MapPin,
  Clock,
  Star,
  AlertCircle,
  CheckCircle2,
  Lock,
  Phone,
  Mail,
  User,
  Package,
  Award,
  Sparkles
} from 'lucide-react';

interface CheckoutItem {
  id: string;
  titleAr: string;
  titleEn: string | null;
  priceSar: number;
  quantity: number;
  condition: string;
  make: string;
  model: string;
  fromYear: number;
  toYear: number;
  warrantyMonths?: number;
  seller: {
    id: string;
    yardName: string;
    rating?: number;
    verified?: boolean;
    responseTime?: string;
  };
  photos: { url: string }[];
}

interface CheckoutData {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    district: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: 'card' | 'bank' | 'cash';
  specialInstructions: string;
}

interface MultiStepCheckoutProps {
  items: CheckoutItem[];
  subtotal: number;
  shipping: number;
  total: number;
  onComplete: (data: CheckoutData) => void;
  onBack: () => void;
}

const steps = {
  ar: [
    { key: 'review', title: 'مراجعة الطلب', description: 'تأكد من قطع الغيار المطلوبة' },
    { key: 'shipping', title: 'معلومات الشحن', description: 'أدخل عنوان التوصيل' },
    { key: 'payment', title: 'الدفع', description: 'اختر طريقة الدفع المناسبة' },
    { key: 'confirmation', title: 'التأكيد', description: 'مراجعة نهائية وتأكيد الطلب' }
  ],
  en: [
    { key: 'review', title: 'Review Order', description: 'Confirm your selected parts' },
    { key: 'shipping', title: 'Shipping Info', description: 'Enter delivery address' },
    { key: 'payment', title: 'Payment', description: 'Choose payment method' },
    { key: 'confirmation', title: 'Confirmation', description: 'Final review and confirm order' }
  ]
};

const saudiCities = [
  'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 
  'تبوك', 'بريدة', 'خميس مشيط', 'حائل', 'النجران', 'جازان'
];

export function MultiStepCheckout({ 
  items, 
  subtotal, 
  shipping, 
  total, 
  onComplete, 
  onBack 
}: MultiStepCheckoutProps) {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    },
    shippingAddress: {
      street: '',
      city: '',
      district: '',
      postalCode: '',
      country: 'Saudi Arabia'
    },
    paymentMethod: 'card',
    specialInstructions: ''
  });

  const currentSteps = steps[locale as keyof typeof steps];
  const currentStepKey = currentSteps[currentStep].key;
  
  const updateCheckoutData = (section: keyof CheckoutData, data: any) => {
    setCheckoutData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const handleNext = async () => {
    if (currentStep < currentSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      onComplete(checkoutData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      onBack();
    }
  };

  const isStepValid = () => {
    switch (currentStepKey) {
      case 'review':
        return items.length > 0;
      case 'shipping':
        return checkoutData.personalInfo.firstName && 
               checkoutData.personalInfo.lastName && 
               checkoutData.personalInfo.email && 
               checkoutData.personalInfo.phone &&
               checkoutData.shippingAddress.street &&
               checkoutData.shippingAddress.city;
      case 'payment':
        return checkoutData.paymentMethod;
      case 'confirmation':
        return true;
      default:
        return false;
    }
  };

  // Group items by seller
  const itemsBySeller = items.reduce((acc, item) => {
    if (!acc[item.seller.id]) {
      acc[item.seller.id] = {
        seller: item.seller,
        items: []
      };
    }
    acc[item.seller.id].items.push(item);
    return acc;
  }, {} as Record<string, { seller: any; items: CheckoutItem[] }>);

  const renderProgressBar = () => (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-4">
        {currentSteps.map((step, index) => (
          <div key={step.key} className="flex items-center">
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
              index < currentStep && "bg-saudi-green border-saudi-green text-white",
              index === currentStep && "border-saudi-green text-saudi-green bg-saudi-green/10",
              index > currentStep && "border-muted-foreground/30 text-muted-foreground"
            )}>
              {index < currentStep ? (
                <Check className="h-5 w-5" />
              ) : (
                <span className="text-sm font-semibold">{index + 1}</span>
              )}
            </div>
            {index < currentSteps.length - 1 && (
              <div className={cn(
                "h-0.5 w-16 mx-2 transition-all duration-300",
                index < currentStep ? "bg-saudi-green" : "bg-muted-foreground/30"
              )} />
            )}
          </div>
        ))}
      </div>
      <div className="text-center">
        <h3 className="hierarchy-subheading mb-1">
          {currentSteps[currentStep].title}
        </h3>
        <p className="hierarchy-caption text-muted-foreground">
          {currentSteps[currentStep].description}
        </p>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-6">
      {/* Trust Indicators */}
      <Card className="card-saudi">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-saudi-green/10 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-saudi-green" />
            </div>
            <div>
              <h3 className="font-semibold text-saudi-green">
                {isArabic ? 'حماية المشتري' : 'Buyer Protection'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isArabic ? 'ضمان استرداد المال لمدة 30 يوماً' : '30-day money back guarantee'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="h-8 w-8 text-saudi-green" />
              <span className="text-sm font-medium">
                {isArabic ? 'فحص مضمون' : 'Quality Checked'}
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Truck className="h-8 w-8 text-riyadh-sky" />
              <span className="text-sm font-medium">
                {isArabic ? 'شحن آمن' : 'Secure Shipping'}
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Award className="h-8 w-8 text-desert-gold" />
              <span className="text-sm font-medium">
                {isArabic ? 'ضمان معتمد' : 'Verified Warranty'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items by Seller */}
      {Object.values(itemsBySeller).map(({ seller, items: sellerItems }) => (
        <Card key={seller.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    {seller.yardName}
                    {seller.verified && (
                      <CheckCircle2 className="h-4 w-4 text-saudi-green" />
                    )}
                  </h4>
                  {seller.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-desert-gold text-desert-gold" />
                      <span className="text-sm text-muted-foreground">
                        {seller.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Badge className="bg-saudi-green/10 text-saudi-green">
                {sellerItems.length} {isArabic ? 'قطعة' : 'items'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {sellerItems.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                    {item.photos.length > 0 ? (
                      <img 
                        src={item.photos[0].url} 
                        alt={isArabic ? item.titleAr : item.titleEn || item.titleAr}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium line-clamp-1">
                      {isArabic ? item.titleAr : item.titleEn || item.titleAr}
                    </h5>
                    <p className="text-sm text-muted-foreground">
                      {item.make} {item.model} ({item.fromYear}-{item.toYear})
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {item.condition === 'NEW' ? (isArabic ? 'جديد' : 'New') :
                         item.condition === 'USED' ? (isArabic ? 'مستعمل' : 'Used') :
                         (isArabic ? 'مجدد' : 'Refurbished')}
                      </Badge>
                      {item.warrantyMonths && (
                        <Badge className="bg-saudi-green/10 text-saudi-green text-xs">
                          <Shield className="h-3 w-3 me-1" />
                          {item.warrantyMonths} {isArabic ? 'شهر' : 'mo'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-end">
                    <p className="font-semibold text-saudi-green">
                      {item.priceSar.toLocaleString(isArabic ? 'ar-SA' : 'en-US')} 
                      <SARSymbol className="inline h-3 w-3 ms-1" />
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'الكمية:' : 'Qty:'} {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Order Summary */}
      <Card className="card-saudi">
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>{isArabic ? 'المجموع الفرعي' : 'Subtotal'}</span>
              <span>{subtotal.toLocaleString(isArabic ? 'ar-SA' : 'en-US')} <SARSymbol className="inline h-3 w-3 ms-1" /></span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-2">
                {isArabic ? 'الشحن' : 'Shipping'}
                <Truck className="h-4 w-4 text-riyadh-sky" />
              </span>
              <span className={shipping === 0 ? 'text-saudi-green font-medium' : ''}>
                {shipping === 0 ? (isArabic ? 'مجاني' : 'Free') : 
                 `${shipping.toLocaleString(isArabic ? 'ar-SA' : 'en-US')} SAR`}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>{isArabic ? 'المجموع' : 'Total'}</span>
              <span className="text-saudi-green">
                {total.toLocaleString(isArabic ? 'ar-SA' : 'en-US')} <SARSymbol className="inline h-4 w-4 ms-1" />
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderShippingStep = () => (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-saudi-green" />
            {isArabic ? 'المعلومات الشخصية' : 'Personal Information'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                {isArabic ? 'الاسم الأول' : 'First Name'} *
              </Label>
              <Input
                id="firstName"
                value={checkoutData.personalInfo.firstName}
                onChange={(e) => updateCheckoutData('personalInfo', { firstName: e.target.value })}
                className="input-modern"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">
                {isArabic ? 'اسم العائلة' : 'Last Name'} *
              </Label>
              <Input
                id="lastName"
                value={checkoutData.personalInfo.lastName}
                onChange={(e) => updateCheckoutData('personalInfo', { lastName: e.target.value })}
                className="input-modern"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {isArabic ? 'البريد الإلكتروني' : 'Email'} *
              </Label>
              <Input
                id="email"
                type="email"
                value={checkoutData.personalInfo.email}
                onChange={(e) => updateCheckoutData('personalInfo', { email: e.target.value })}
                className="input-modern"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {isArabic ? 'رقم الهاتف' : 'Phone Number'} *
              </Label>
              <Input
                id="phone"
                type="tel"
                value={checkoutData.personalInfo.phone}
                onChange={(e) => updateCheckoutData('personalInfo', { phone: e.target.value })}
                className="input-modern"
                dir="ltr"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-saudi-green" />
            {isArabic ? 'عنوان الشحن' : 'Shipping Address'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street">
              {isArabic ? 'الشارع والحي' : 'Street Address'} *
            </Label>
            <Input
              id="street"
              value={checkoutData.shippingAddress.street}
              onChange={(e) => updateCheckoutData('shippingAddress', { street: e.target.value })}
              className="input-modern"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">
                {isArabic ? 'المدينة' : 'City'} *
              </Label>
              <Select
                value={checkoutData.shippingAddress.city}
                onValueChange={(value) => updateCheckoutData('shippingAddress', { city: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isArabic ? 'اختر المدينة' : 'Select city'} />
                </SelectTrigger>
                <SelectContent>
                  {saudiCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">
                {isArabic ? 'الحي' : 'District'}
              </Label>
              <Input
                id="district"
                value={checkoutData.shippingAddress.district}
                onChange={(e) => updateCheckoutData('shippingAddress', { district: e.target.value })}
                className="input-modern"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="postalCode">
                {isArabic ? 'الرمز البريدي' : 'Postal Code'}
              </Label>
              <Input
                id="postalCode"
                value={checkoutData.shippingAddress.postalCode}
                onChange={(e) => updateCheckoutData('shippingAddress', { postalCode: e.target.value })}
                className="input-modern"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>{isArabic ? 'الدولة' : 'Country'}</Label>
              <Input 
                value="Saudi Arabia | المملكة العربية السعودية" 
                disabled 
                className="bg-muted"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Special Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-desert-gold" />
            {isArabic ? 'تعليمات خاصة' : 'Special Instructions'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full min-h-[100px] p-3 border rounded-md resize-none focus:ring-2 focus:ring-saudi-green focus:border-transparent"
            placeholder={isArabic ? 
              'أي تعليمات خاصة للتوصيل (اختياري)' : 
              'Any special delivery instructions (optional)'}
            value={checkoutData.specialInstructions}
            onChange={(e) => setCheckoutData(prev => ({ 
              ...prev, 
              specialInstructions: e.target.value 
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      {/* Security Notice */}
      <Card className="border-saudi-green/20 bg-saudi-green/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Lock className="h-6 w-6 text-saudi-green" />
            <div>
              <h4 className="font-semibold text-saudi-green">
                {isArabic ? 'دفع آمن ومحمي' : 'Secure & Protected Payment'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {isArabic ? 
                  'جميع المعاملات محمية بتشفير SSL وشركاء دفع معتمدين' :
                  'All transactions are SSL encrypted with certified payment partners'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-saudi-green" />
            {isArabic ? 'اختر طريقة الدفع' : 'Choose Payment Method'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={checkoutData.paymentMethod}
            onValueChange={(value: 'card' | 'bank' | 'cash') => 
              updateCheckoutData('paymentMethod', value)
            }
            className="space-y-4"
          >
            {/* Credit/Debit Card */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse p-4 border rounded-lg hover:bg-muted/30 transition-colors">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-riyadh-sky" />
                    <div>
                      <div className="font-medium">
                        {isArabic ? 'البطاقة الائتمانية/المدينة' : 'Credit/Debit Card'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {isArabic ? 'فيزا، ماستركارد، مدى' : 'Visa, Mastercard, Mada'}
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-saudi-green/10 text-saudi-green">
                    {isArabic ? 'موصى' : 'Recommended'}
                  </Badge>
                </div>
              </Label>
            </div>

            {/* Bank Transfer */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse p-4 border rounded-lg hover:bg-muted/30 transition-colors">
              <RadioGroupItem value="bank" id="bank" />
              <Label htmlFor="bank" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 bg-riyadh-sky/20 rounded flex items-center justify-center">
                    <div className="h-3 w-3 bg-riyadh-sky rounded-sm" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {isArabic ? 'تحويل بنكي' : 'Bank Transfer'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {isArabic ? 'تحويل مباشر من البنك' : 'Direct bank transfer'}
                    </div>
                  </div>
                </div>
              </Label>
            </div>

            {/* Cash on Delivery */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse p-4 border rounded-lg hover:bg-muted/30 transition-colors">
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash" className="flex-1 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 bg-desert-gold/20 rounded flex items-center justify-center">
                      <div className="h-3 w-3 bg-desert-gold rounded-full" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {isArabic ? 'الدفع عند الاستلام' : 'Cash on Delivery'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {isArabic ? 'ادفع عندما تستلم الطلب' : 'Pay when you receive the order'}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">
                    +{(total * 0.02).toFixed(0)} {isArabic ? 'ريال رسوم' : 'SAR fee'}
                  </Badge>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card className="card-saudi">
        <CardHeader>
          <CardTitle>{isArabic ? 'ملخص الطلب' : 'Order Summary'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>{isArabic ? 'قيمة القطع' : 'Parts Total'}</span>
            <span>{subtotal.toLocaleString(isArabic ? 'ar-SA' : 'en-US')} <SARSymbol className="inline h-3 w-3 ms-1" /></span>
          </div>
          <div className="flex justify-between">
            <span>{isArabic ? 'الشحن' : 'Shipping'}</span>
            <span className={shipping === 0 ? 'text-saudi-green font-medium' : ''}>
              {shipping === 0 ? (isArabic ? 'مجاني' : 'Free') : 
               `${shipping.toLocaleString(isArabic ? 'ar-SA' : 'en-US')} SAR`}
            </span>
          </div>
          {checkoutData.paymentMethod === 'cash' && (
            <div className="flex justify-between text-sm">
              <span>{isArabic ? 'رسوم الدفع عند الاستلام' : 'COD Fee'}</span>
              <span>+{(total * 0.02).toFixed(0)} <SARSymbol className="inline h-3 w-3 ms-1" /></span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-lg font-semibold">
            <span>{isArabic ? 'المجموع النهائي' : 'Final Total'}</span>
            <span className="text-saudi-green">
              {(checkoutData.paymentMethod === 'cash' ? total + (total * 0.02) : total).toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
              <SARSymbol className="inline h-4 w-4 ms-1" />
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="space-y-6 text-center">
      <div className="w-20 h-20 bg-saudi-green/10 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="h-12 w-12 text-saudi-green" />
      </div>
      
      <div>
        <h3 className="text-2xl font-bold mb-2">
          {isArabic ? 'تم تأكيد طلبك!' : 'Order Confirmed!'}
        </h3>
        <p className="text-muted-foreground">
          {isArabic ? 
            'شكراً لثقتك بنا. سيتم التواصل معك قريباً' :
            'Thank you for your trust. We\'ll contact you soon'
          }
        </p>
      </div>

      {/* Order Details Summary */}
      <Card className="text-start">
        <CardHeader>
          <CardTitle className="text-center">
            {isArabic ? 'تفاصيل الطلب' : 'Order Details'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">{isArabic ? 'الاسم:' : 'Name:'}</span>
              <p>{checkoutData.personalInfo.firstName} {checkoutData.personalInfo.lastName}</p>
            </div>
            <div>
              <span className="font-medium">{isArabic ? 'الهاتف:' : 'Phone:'}</span>
              <p>{checkoutData.personalInfo.phone}</p>
            </div>
            <div className="col-span-2">
              <span className="font-medium">{isArabic ? 'العنوان:' : 'Address:'}</span>
              <p>
                {checkoutData.shippingAddress.street}, {checkoutData.shippingAddress.city}
                {checkoutData.shippingAddress.district && `, ${checkoutData.shippingAddress.district}`}
              </p>
            </div>
            <div>
              <span className="font-medium">{isArabic ? 'طريقة الدفع:' : 'Payment:'}</span>
              <p>
                {checkoutData.paymentMethod === 'card' ? 
                  (isArabic ? 'بطاقة ائتمان' : 'Credit Card') :
                  checkoutData.paymentMethod === 'bank' ?
                  (isArabic ? 'تحويل بنكي' : 'Bank Transfer') :
                  (isArabic ? 'دفع عند الاستلام' : 'Cash on Delivery')
                }
              </p>
            </div>
            <div>
              <span className="font-medium">{isArabic ? 'المجموع:' : 'Total:'}</span>
              <p className="text-saudi-green font-semibold">
                {(checkoutData.paymentMethod === 'cash' ? total + (total * 0.02) : total).toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                <SARSymbol className="inline h-3 w-3 ms-1" />
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-saudi-green/5 border-saudi-green/20">
        <CardContent className="p-6">
          <h4 className="font-semibold mb-3 flex items-center justify-center gap-2">
            <Clock className="h-5 w-5 text-saudi-green" />
            {isArabic ? 'الخطوات التالية' : 'Next Steps'}
          </h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <span className="w-6 h-6 bg-saudi-green text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
              {isArabic ? 'سيتم التأكد من توفر القطع خلال ساعة' : 'Parts availability confirmed within 1 hour'}
            </p>
            <p className="flex items-center gap-2">
              <span className="w-6 h-6 bg-saudi-green text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
              {isArabic ? 'تحضير وتغليف الطلب بعناية' : 'Careful preparation and packaging'}
            </p>
            <p className="flex items-center gap-2">
              <span className="w-6 h-6 bg-saudi-green text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
              {isArabic ? 'شحن الطلب خلال 1-2 يوم عمل' : 'Shipping within 1-2 business days'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {renderProgressBar()}
      
      <div className="mb-8">
        {currentStepKey === 'review' && renderReviewStep()}
        {currentStepKey === 'shipping' && renderShippingStep()}
        {currentStepKey === 'payment' && renderPaymentStep()}
        {currentStepKey === 'confirmation' && renderConfirmationStep()}
      </div>

      {/* Navigation */}
      {currentStepKey !== 'confirmation' && (
        <div className="flex items-center justify-between pt-6 border-t">
          <Button variant="outline" onClick={handleBack}>
            <ChevronLeft className={cn("h-4 w-4", isArabic ? "ms-2" : "me-2")} />
            {isArabic ? 'السابق' : 'Back'}
          </Button>
          
          <Button 
            onClick={handleNext}
            disabled={!isStepValid() || loading}
            className="btn-saudi"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isArabic ? 'جاري المعالجة...' : 'Processing...'}
              </div>
            ) : (
              <>
                {currentStep === currentSteps.length - 1 
                  ? (isArabic ? 'تأكيد الطلب' : 'Confirm Order')
                  : (isArabic ? 'التالي' : 'Next')
                }
                <ChevronRight className={cn("h-4 w-4", isArabic ? "me-2" : "ms-2")} />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}