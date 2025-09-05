'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SARSymbol } from '@/components/ui/currency-symbol';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Save,
  AlertCircle,
  Loader2,
  Package,
  DollarSign,
  Hash,
  FileText,
  Settings,
} from 'lucide-react';
import { ErrorBoundary, SellerErrorFallback } from '@/components/ui/error-boundary';

// Form data interface matching the actual database schema
interface ListingFormData {
  titleAr: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  condition: 'NEW' | 'USED' | 'REFURBISHED';
  priceSar: string; // String for form input, will be converted to halalas
  originalPrice?: string;
  quantity: string;
  minQuantity?: string;
  weight?: string;
  make?: string;
  model?: string;
  fromYear?: string;
  toYear?: string;
  engineSize?: string;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  city: string;
  district?: string;
  oem_numbers: string; // Will be split into array
}

const conditions = [
  { value: 'NEW', labelAr: 'جديد', labelEn: 'New/OEM' },
  { value: 'USED', labelAr: 'مستعمل', labelEn: 'Used' },
  { value: 'REFURBISHED', labelAr: 'مجدد', labelEn: 'Refurbished' },
] as const;

const fuelTypes = [
  { value: 'NOT_SPECIFIED', labelAr: 'غير محدد', labelEn: 'Not specified' },
  { value: 'GASOLINE', labelAr: 'بنزين', labelEn: 'Gasoline' },
  { value: 'DIESEL', labelAr: 'ديزل', labelEn: 'Diesel' },
  { value: 'HYBRID', labelAr: 'هايبرد', labelEn: 'Hybrid' },
  { value: 'ELECTRIC', labelAr: 'كهربائي', labelEn: 'Electric' },
];

const transmissionTypes = [
  { value: 'NOT_SPECIFIED', labelAr: 'غير محدد', labelEn: 'Not specified' },
  { value: 'MANUAL', labelAr: 'يدوي', labelEn: 'Manual' },
  { value: 'AUTOMATIC', labelAr: 'أوتوماتيك', labelEn: 'Automatic' },
  { value: 'CVT', labelAr: 'CVT', labelEn: 'CVT' },
];

const bodyTypes = [
  { value: 'NOT_SPECIFIED', labelAr: 'غير محدد', labelEn: 'Not specified' },
  { value: 'SEDAN', labelAr: 'سيدان', labelEn: 'Sedan' },
  { value: 'SUV', labelAr: 'SUV', labelEn: 'SUV' },
  { value: 'HATCHBACK', labelAr: 'هاتشباك', labelEn: 'Hatchback' },
  { value: 'COUPE', labelAr: 'كوبيه', labelEn: 'Coupe' },
  { value: 'PICKUP', labelAr: 'بيك أب', labelEn: 'Pickup' },
  { value: 'VAN', labelAr: 'فان', labelEn: 'Van' },
];

const saudiCities = [
  { value: 'الرياض', labelAr: 'الرياض', labelEn: 'Riyadh' },
  { value: 'جدة', labelAr: 'جدة', labelEn: 'Jeddah' },
  { value: 'مكة المكرمة', labelAr: 'مكة المكرمة', labelEn: 'Makkah' },
  { value: 'المدينة المنورة', labelAr: 'المدينة المنورة', labelEn: 'Madinah' },
  { value: 'الدمام', labelAr: 'الدمام', labelEn: 'Dammam' },
  { value: 'الخبر', labelAr: 'الخبر', labelEn: 'Khobar' },
  { value: 'الطائف', labelAr: 'الطائف', labelEn: 'Taif' },
  { value: 'بريدة', labelAr: 'بريدة', labelEn: 'Buraidah' },
  { value: 'تبوك', labelAr: 'تبوك', labelEn: 'Tabuk' },
  { value: 'القصيم', labelAr: 'القصيم', labelEn: 'Qassim' },
];

export default function NewInventoryPage() {
  const router = useRouter();
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const { user, seller, isLoading: authLoading, isLoggedIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<ListingFormData>({
    titleAr: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    condition: 'USED',
    priceSar: '',
    originalPrice: '',
    quantity: '1',
    minQuantity: '1',
    weight: '',
    make: '',
    model: '',
    fromYear: '',
    toYear: '',
    engineSize: '',
    fuelType: 'NOT_SPECIFIED',
    transmission: 'NOT_SPECIFIED',
    bodyType: 'NOT_SPECIFIED',
    city: '',
    district: '',
    oem_numbers: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Authentication check
  useEffect(() => {
    if (authLoading) return;
    
    if (!isLoggedIn) {
      router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    
    if (user?.role !== 'SELLER') {
      router.push(`/${locale}/`);
      return;
    }
  }, [authLoading, isLoggedIn, user, router, locale]);

  const handleInputChange = (field: keyof ListingFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Title validation (min 2 chars, max 200)
    if (!formData.titleAr.trim()) {
      newErrors.titleAr = isArabic ? 'اسم المنتج مطلوب' : 'Product name is required';
    } else if (formData.titleAr.trim().length < 2) {
      newErrors.titleAr = isArabic ? 'اسم المنتج يجب أن يكون على الأقل حرفين' : 'Product name must be at least 2 characters';
    } else if (formData.titleAr.trim().length > 200) {
      newErrors.titleAr = isArabic ? 'اسم المنتج يجب أن يكون أقل من 200 حرف' : 'Product name must be less than 200 characters';
    }
    
    // Price validation (positive, max 1M SAR)
    const price = parseFloat(formData.priceSar);
    if (!formData.priceSar || isNaN(price) || price <= 0) {
      newErrors.priceSar = isArabic ? 'السعر مطلوب ويجب أن يكون أكبر من صفر' : 'Price is required and must be greater than 0';
    } else if (price > 1000000) {
      newErrors.priceSar = isArabic ? 'السعر يجب أن يكون أقل من مليون ريال' : 'Price must be less than 1,000,000 SAR';
    }
    
    // Quantity validation (positive integer)
    const quantity = parseInt(formData.quantity);
    if (!formData.quantity || isNaN(quantity) || quantity < 1) {
      newErrors.quantity = isArabic ? 'الكمية مطلوبة ويجب أن تكون على الأقل 1' : 'Quantity is required and must be at least 1';
    }
    
    // City validation (min 2 chars, max 50)
    if (!formData.city.trim()) {
      newErrors.city = isArabic ? 'المدينة مطلوبة' : 'City is required';
    } else if (formData.city.trim().length < 2) {
      newErrors.city = isArabic ? 'المدينة يجب أن تكون على الأقل حرفين' : 'City must be at least 2 characters';
    }

    // Year validation (if provided)
    if (formData.fromYear && formData.toYear) {
      const fromYear = parseInt(formData.fromYear);
      const toYear = parseInt(formData.toYear);
      if (fromYear > toYear) {
        newErrors.fromYear = isArabic ? 'سنة البداية لا يمكن أن تكون أكبر من سنة النهاية' : 'From year cannot be greater than to year';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error(isArabic ? 'يرجى تصحيح الأخطاء في النموذج' : 'Please fix the form errors');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare form data according to API schema
      const submitData = {
        titleAr: formData.titleAr.trim(),
        titleEn: formData.titleEn?.trim() || undefined,
        description: formData.description?.trim() || undefined,
        descriptionEn: formData.descriptionEn?.trim() || undefined,
        condition: formData.condition,
        priceSar: Math.round(parseFloat(formData.priceSar) * 100), // Convert to halalas
        originalPrice: formData.originalPrice ? Math.round(parseFloat(formData.originalPrice) * 100) : undefined,
        quantity: Math.max(1, parseInt(formData.quantity) || 1), // Ensure positive quantity
        minQuantity: Math.max(1, parseInt(formData.minQuantity) || 1),
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        make: formData.make?.trim() || undefined,
        model: formData.model?.trim() || undefined,
        fromYear: formData.fromYear ? parseInt(formData.fromYear) : undefined,
        toYear: formData.toYear ? parseInt(formData.toYear) : undefined,
        engineSize: formData.engineSize?.trim() || undefined,
        fuelType: formData.fuelType === 'NOT_SPECIFIED' ? undefined : formData.fuelType || undefined,
        transmission: formData.transmission === 'NOT_SPECIFIED' ? undefined : formData.transmission || undefined,
        bodyType: formData.bodyType === 'NOT_SPECIFIED' ? undefined : formData.bodyType || undefined,
        city: formData.city.trim(),
        district: formData.district?.trim() || undefined,
        oemNumbers: formData.oem_numbers ? formData.oem_numbers.split(',').map(s => s.trim()).filter(s => s) : undefined,
      };

      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create listing (${response.status})`);
      }

      const result = await response.json();
      
      toast.success(isArabic ? 'تم إضافة المنتج بنجاح' : 'Product added successfully');
      router.push(`/${locale}/seller/inventory`);
      
    } catch (error) {
      console.error('Error creating listing:', error);
      toast.error(error instanceof Error ? error.message : (isArabic ? 'حدث خطأ' : 'An error occurred'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while authenticating
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {isArabic ? 'جاري التحميل...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or not a seller
  if (!isLoggedIn || user?.role !== 'SELLER' || !seller) {
    return null;
  }

  // Check seller verification status (skip in development for testing)
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (!isDevelopment && (seller.status !== 'APPROVED' || !seller.verified)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center gap-6">
              <Link href={`/${locale}/seller/inventory`}>
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100/80">
                  <ArrowLeft className="h-4 w-4 me-2" />
                  {isArabic ? 'رجوع' : 'Back'}
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  {isArabic ? 'منتج جديد' : 'New Product'}
                </h1>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-orange-200/60 p-8 text-center">
              <div className="mb-6">
                <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-slate-900 mb-2">
                  {isArabic ? 'الحساب قيد المراجعة' : 'Account Under Review'}
                </h2>
                <p className="text-slate-600">
                  {isArabic 
                    ? 'حسابك كبائع قيد المراجعة حالياً. لا يمكنك إضافة منتجات جديدة حتى يتم الموافقة على حسابك.'
                    : 'Your seller account is currently under review. You cannot add new products until your account is approved.'
                  }
                </p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-orange-800">
                  {isArabic
                    ? 'ستتلقى إشعاراً عبر البريد الإلكتروني فور الموافقة على حسابك.'
                    : 'You will receive an email notification once your account is approved.'
                  }
                </p>
              </div>
              <Link href={`/${locale}/seller/dashboard`}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl">
                  {isArabic ? 'العودة للوحة التحكم' : 'Back to Dashboard'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={SellerErrorFallback}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        {/* Minimal Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-40">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center gap-6">
              <Link href={`/${locale}/seller/inventory`}>
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100/80">
                  <ArrowLeft className="h-4 w-4 me-2" />
                  {isArabic ? 'رجوع' : 'Back'}
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  {isArabic ? 'منتج جديد' : 'New Product'}
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  {isArabic ? 'إضافة قطعة غيار جديدة' : 'Add a new spare part'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Centered Form Container */}
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Essential Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8">
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-slate-900 mb-2">
                    {isArabic ? 'المعلومات الأساسية' : 'Essential Information'}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {isArabic ? 'المعلومات المطلوبة للمنتج' : 'Required product details'}
                  </p>
                </div>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="titleAr" className="text-slate-700 font-medium mb-3 block">
                      {isArabic ? 'اسم القطعة' : 'Part Name'} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="titleAr"
                      value={formData.titleAr}
                      onChange={(e) => handleInputChange('titleAr', e.target.value)}
                      className={cn(
                        "border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400",
                        errors.titleAr && "border-red-300 focus:border-red-400 focus:ring-red-400/20"
                      )}
                      placeholder={isArabic ? 'مثال: فرامل أمامية تويوتا كامري' : 'e.g., Toyota Camry Front Brake Pads'}
                    />
                    {errors.titleAr && (
                      <p className="text-sm text-red-600 flex items-center gap-1 mt-2">
                        <AlertCircle className="h-3 w-3" />
                        {errors.titleAr}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="condition" className="text-slate-700 font-medium mb-3 block">
                        {isArabic ? 'الحالة' : 'Condition'} <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.condition}
                        onValueChange={(value: 'NEW' | 'USED' | 'REFURBISHED') => handleInputChange('condition', value)}
                      >
                        <SelectTrigger className="border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl px-4 py-3 h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {conditions.map((condition) => (
                            <SelectItem key={condition.value} value={condition.value} className="rounded-lg">
                              {isArabic ? condition.labelAr : condition.labelEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="city" className="text-slate-700 font-medium mb-3 block">
                        {isArabic ? 'المدينة' : 'City'} <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.city}
                        onValueChange={(value) => handleInputChange('city', value)}
                      >
                        <SelectTrigger className={cn(
                          "border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl px-4 py-3 h-12",
                          errors.city && "border-red-300 focus:border-red-400 focus:ring-red-400/20"
                        )}>
                          <SelectValue placeholder={isArabic ? 'اختر المدينة' : 'Select city'} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {saudiCities.map((city) => (
                            <SelectItem key={city.value} value={city.value} className="rounded-lg">
                              {isArabic ? city.labelAr : city.labelEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.city && (
                        <p className="text-sm text-red-600 flex items-center gap-1 mt-2">
                          <AlertCircle className="h-3 w-3" />
                          {errors.city}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-slate-700 font-medium mb-3 block">
                      {isArabic ? 'وصف المنتج' : 'Product Description'}
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 min-h-[120px] resize-none"
                      placeholder={isArabic ? 'أضف وصفاً مفصلاً للقطعة...' : 'Add a detailed description of the part...'}
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8">
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-slate-900 mb-2">
                    {isArabic ? 'السعر والكمية' : 'Price & Quantity'}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {isArabic ? 'تفاصيل البيع والمخزون' : 'Sales and inventory details'}
                  </p>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priceSar" className="text-slate-700 font-medium mb-3 flex items-center gap-2">
                        {isArabic ? 'السعر' : 'Price'} <span className="text-red-500">*</span>
                        <SARSymbol className="h-4 w-4 text-slate-400" />
                      </Label>
                      <Input
                        id="priceSar"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.priceSar}
                        onChange={(e) => handleInputChange('priceSar', e.target.value)}
                        className={cn(
                          "border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400",
                          errors.priceSar && "border-red-300 focus:border-red-400 focus:ring-red-400/20"
                        )}
                        placeholder="0.00"
                      />
                      {errors.priceSar && (
                        <p className="text-sm text-red-600 flex items-center gap-1 mt-2">
                          <AlertCircle className="h-3 w-3" />
                          {errors.priceSar}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="quantity" className="text-slate-700 font-medium mb-3 block">
                        {isArabic ? 'الكمية' : 'Quantity'} <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="0"
                        value={formData.quantity}
                        onChange={(e) => handleInputChange('quantity', e.target.value)}
                        className={cn(
                          "border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400",
                          errors.quantity && "border-red-300 focus:border-red-400 focus:ring-red-400/20"
                        )}
                        placeholder="1"
                      />
                      {errors.quantity && (
                        <p className="text-sm text-red-600 flex items-center gap-1 mt-2">
                          <AlertCircle className="h-3 w-3" />
                          {errors.quantity}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="oem_numbers" className="text-slate-700 font-medium mb-3 block">
                      {isArabic ? 'أرقام القطعة الأصلية' : 'OEM Part Numbers'}
                    </Label>
                    <Input
                      id="oem_numbers"
                      value={formData.oem_numbers}
                      onChange={(e) => handleInputChange('oem_numbers', e.target.value)}
                      className="border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400"
                      placeholder={isArabic ? '12345, ABC123, XYZ789' : '12345, ABC123, XYZ789'}
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      {isArabic ? 'افصل الأرقام بفواصل إذا كان لديك أرقام متعددة' : 'Separate multiple numbers with commas'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Vehicle Compatibility */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8">
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-slate-900 mb-2">
                    {isArabic ? 'توافق المركبة' : 'Vehicle Compatibility'}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {isArabic ? 'المركبات المتوافقة مع هذه القطعة' : 'Vehicles compatible with this part'}
                  </p>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="make" className="text-slate-700 font-medium mb-3 block">
                        {isArabic ? 'الماركة' : 'Brand'}
                      </Label>
                      <Input
                        id="make"
                        value={formData.make}
                        onChange={(e) => handleInputChange('make', e.target.value)}
                        className="border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400"
                        placeholder={isArabic ? 'تويوتا' : 'Toyota'}
                      />
                    </div>

                    <div>
                      <Label htmlFor="model" className="text-slate-700 font-medium mb-3 block">
                        {isArabic ? 'الموديل' : 'Model'}
                      </Label>
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) => handleInputChange('model', e.target.value)}
                        className="border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400"
                        placeholder={isArabic ? 'كامري' : 'Camry'}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fromYear" className="text-slate-700 font-medium mb-3 block">
                        {isArabic ? 'من سنة' : 'From Year'}
                      </Label>
                      <Input
                        id="fromYear"
                        type="number"
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        value={formData.fromYear}
                        onChange={(e) => handleInputChange('fromYear', e.target.value)}
                        className="border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400"
                        placeholder="2018"
                      />
                    </div>

                    <div>
                      <Label htmlFor="toYear" className="text-slate-700 font-medium mb-3 block">
                        {isArabic ? 'إلى سنة' : 'To Year'}
                      </Label>
                      <Input
                        id="toYear"
                        type="number"
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        value={formData.toYear}
                        onChange={(e) => handleInputChange('toYear', e.target.value)}
                        className="border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400"
                        placeholder="2024"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-8 border-t border-slate-200">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => router.back()}
                  className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-8 py-3 rounded-xl"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl shadow-sm min-w-[140px] font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin me-2" />
                      {isArabic ? 'جاري الحفظ...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 me-2" />
                      {isArabic ? 'إضافة المنتج' : 'Add Product'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}