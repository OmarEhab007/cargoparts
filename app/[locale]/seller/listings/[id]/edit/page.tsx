'use client';

import { useState, useEffect } from 'react';
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
import { ArrowRight, AlertCircle, ImagePlus, Loader2 } from 'lucide-react';

const carMakes = ['Toyota', 'Honda', 'Nissan', 'Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Hyundai', 'Kia', 'Mazda'];
const conditions = [
  { value: 'NEW', labelEn: 'New', labelAr: 'جديد' },
  { value: 'USED', labelEn: 'Used', labelAr: 'مستعمل' },
  { value: 'REFURBISHED', labelEn: 'Refurbished', labelAr: 'مجدد' },
];

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default function EditListingPage({ params }: PageProps) {
  const router = useRouter();
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [listingId, setListingId] = useState('');
  
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
  
  useEffect(() => {
    const loadListing = async () => {
      const { id } = await params;
      setListingId(id);
      
      try {
        const response = await fetch(`/api/listings/${id}`);
        if (response.ok) {
          const listing = await response.json();
          setFormData({
            titleAr: listing.titleAr || '',
            titleEn: listing.titleEn || '',
            description: listing.description || '',
            priceSar: listing.priceSar.toString(),
            make: listing.make || '',
            model: listing.model || '',
            fromYear: listing.fromYear.toString(),
            toYear: listing.toYear.toString(),
            condition: listing.condition || 'USED',
            city: listing.city || '',
            oemNumbers: listing.oemNumbers || '',
            imageUrls: listing.photos?.length > 0 
              ? listing.photos.map((p: { url: string }) => p.url)
              : [''],
          });
        } else {
          setError('Failed to load listing');
        }
      } catch (error) {
        console.error('Error loading listing:', error);
        setError('Failed to load listing');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadListing();
  }, [params]);
  
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
      
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          priceSar: parseInt(formData.priceSar),
          fromYear: parseInt(formData.fromYear),
          toYear: parseInt(formData.toYear),
          photos,
        }),
      });
      
      if (response.ok) {
        router.push(`/${locale}/seller/listings`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update listing');
      }
    } catch (error) {
      console.error('Error updating listing:', error);
      setError(isArabic ? 'حدث خطأ. حاول مرة أخرى.' : 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-bold">
          {isArabic ? 'تعديل القطعة' : 'Edit Part'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'المعلومات الأساسية' : 'Basic Information'}</CardTitle>
              <CardDescription>
                {isArabic ? 'عدّل تفاصيل القطعة' : 'Edit details about the part'}
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
                      <SelectValue />
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
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'الصور' : 'Images'}</CardTitle>
              <CardDescription>
                {isArabic ? 'عدّل روابط الصور' : 'Edit image URLs'}
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
                ? (isArabic ? 'جاري الحفظ...' : 'Saving...')
                : (isArabic ? 'حفظ التغييرات' : 'Save Changes')}
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