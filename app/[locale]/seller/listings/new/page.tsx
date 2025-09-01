'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SARSymbol } from '@/components/ui/currency-symbol';
import { ArrowRight, AlertCircle, ImagePlus } from 'lucide-react';

const carMakes = ['Toyota', 'Honda', 'Nissan', 'Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Hyundai', 'Kia', 'Mazda'];
const conditions = [
  { value: 'NEW', labelEn: 'New', labelAr: 'جديد' },
  { value: 'USED', labelEn: 'Used', labelAr: 'مستعمل' },
  { value: 'REFURBISHED', labelEn: 'Refurbished', labelAr: 'مجدد' },
];

export default function NewListingPage() {
  const locale = useLocale();
  const router = useRouter();
  const isArabic = locale === 'ar';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    titleAr: '',
    titleEn: '',
    description: '',
    priceSar: '',
    make: '',
    model: '',
    fromYear: '',
    toYear: '',
    condition: 'USED',
    city: '',
    oemNumbers: '',
    imageUrls: [''],
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleImageUrlChange = (index: number, value: string) => {
    const newUrls = [...formData.imageUrls];
    newUrls[index] = value;
    setFormData({
      ...formData,
      imageUrls: newUrls,
    });
  };
  
  const addImageUrl = () => {
    setFormData({
      ...formData,
      imageUrls: [...formData.imageUrls, ''],
    });
  };
  
  const removeImageUrl = (index: number) => {
    const newUrls = formData.imageUrls.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      imageUrls: newUrls.length > 0 ? newUrls : [''],
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // Filter out empty image URLs
      const photos = formData.imageUrls.filter(url => url.trim()).map(url => ({ url }));
      
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          priceSar: parseInt(formData.priceSar),
          fromYear: parseInt(formData.fromYear),
          toYear: parseInt(formData.toYear),
          photos,
          // For POC, use a dummy seller ID
          sellerId: 'cmeeff0zd0006p97egu4wecoo',
        }),
      });
      
      if (response.ok) {
        await response.json();
        router.push(`/${locale}/seller/listings`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create listing');
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      setError(isArabic ? 'حدث خطأ. حاول مرة أخرى.' : 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-bold">
          {isArabic ? 'إضافة قطعة جديدة' : 'Add New Part'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'المعلومات الأساسية' : 'Basic Information'}</CardTitle>
              <CardDescription>
                {isArabic ? 'أضف تفاصيل القطعة' : 'Add details about the part'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="titleAr">
                    {isArabic ? 'العنوان بالعربية' : 'Title in Arabic'} *
                  </Label>
                  <Input
                    id="titleAr"
                    name="titleAr"
                    value={formData.titleAr}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    dir="rtl"
                    placeholder="مثال: مرآة جانبية يمين كامري 2018"
                  />
                </div>
                <div>
                  <Label htmlFor="titleEn">
                    {isArabic ? 'العنوان بالإنجليزية' : 'Title in English'}
                  </Label>
                  <Input
                    id="titleEn"
                    name="titleEn"
                    value={formData.titleEn}
                    onChange={handleInputChange}
                    className="mt-1"
                    placeholder="e.g., Right Side Mirror Camry 2018"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">
                  {isArabic ? 'الوصف' : 'Description'}
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1"
                  rows={4}
                  placeholder={isArabic ? 'أضف وصفاً تفصيلياً للقطعة...' : 'Add a detailed description...'}
                />
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="priceSar">
                    {isArabic ? 'السعر' : 'Price'} *
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="priceSar"
                      name="priceSar"
                      type="number"
                      value={formData.priceSar}
                      onChange={handleInputChange}
                      required
                      className="pe-12"
                      placeholder="0"
                    />
                    <div className="absolute end-3 top-1/2 -translate-y-1/2">
                      <SARSymbol className="h-4 w-4" />
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="condition">
                    {isArabic ? 'الحالة' : 'Condition'} *
                  </Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(value) => handleSelectChange('condition', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map(condition => (
                        <SelectItem key={condition.value} value={condition.value}>
                          {isArabic ? condition.labelAr : condition.labelEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Vehicle Compatibility */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'توافق المركبة' : 'Vehicle Compatibility'}</CardTitle>
              <CardDescription>
                {isArabic ? 'حدد السيارات المتوافقة' : 'Specify compatible vehicles'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="make">
                    {isArabic ? 'الشركة المصنعة' : 'Make'} *
                  </Label>
                  <Select
                    value={formData.make}
                    onValueChange={(value) => handleSelectChange('make', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={isArabic ? 'اختر الشركة' : 'Select make'} />
                    </SelectTrigger>
                    <SelectContent>
                      {carMakes.map(make => (
                        <SelectItem key={make} value={make}>
                          {make}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="model">
                    {isArabic ? 'الموديل' : 'Model'} *
                  </Label>
                  <Input
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    placeholder={isArabic ? 'مثال: كامري' : 'e.g., Camry'}
                  />
                </div>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="fromYear">
                    {isArabic ? 'من سنة' : 'From Year'} *
                  </Label>
                  <Input
                    id="fromYear"
                    name="fromYear"
                    type="number"
                    value={formData.fromYear}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    placeholder="2015"
                    min="1990"
                    max="2025"
                  />
                </div>
                <div>
                  <Label htmlFor="toYear">
                    {isArabic ? 'إلى سنة' : 'To Year'} *
                  </Label>
                  <Input
                    id="toYear"
                    name="toYear"
                    type="number"
                    value={formData.toYear}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                    placeholder="2020"
                    min="1990"
                    max="2025"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="oemNumbers">
                  {isArabic ? 'أرقام OEM' : 'OEM Numbers'}
                </Label>
                <Input
                  id="oemNumbers"
                  name="oemNumbers"
                  value={formData.oemNumbers}
                  onChange={handleInputChange}
                  className="mt-1"
                  placeholder={isArabic ? 'مثال: 87910-06710, 87910-33701' : 'e.g., 87910-06710, 87910-33701'}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'الصور' : 'Images'}</CardTitle>
              <CardDescription>
                {isArabic ? 'أضف روابط الصور (مؤقتاً)' : 'Add image URLs (temporary)'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.imageUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={url}
                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                    placeholder={isArabic ? 'رابط الصورة' : 'Image URL'}
                    className="flex-1"
                  />
                  {formData.imageUrls.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeImageUrl(index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addImageUrl}
                className="w-full"
              >
                <ImagePlus className="me-2 h-4 w-4" />
                {isArabic ? 'إضافة صورة أخرى' : 'Add Another Image'}
              </Button>
            </CardContent>
          </Card>
          
          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'الموقع' : 'Location'}</CardTitle>
            </CardHeader>
            <CardContent>
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
                  placeholder={isArabic ? 'مثال: الرياض' : 'e.g., Riyadh'}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Submit Buttons */}
          <div className="flex gap-3">
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting 
                ? (isArabic ? 'جاري الإضافة...' : 'Adding...')
                : (isArabic ? 'إضافة القطعة' : 'Add Part')}
              <ArrowRight className="ms-2 h-4 w-4 rotate-180 rtl:rotate-0" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.push(`/${locale}/seller/listings`)}
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}