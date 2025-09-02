'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { SARSymbol } from '@/components/ui/currency-symbol';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Upload,
  Plus,
  X,
  Camera,
  Package,
  Tag,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Save,
  Eye,
  Sparkles,
  Car,
  Wrench,
  Gauge,
  Battery,
  Disc,
  Cog,
} from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  oemNumber: string;
  category: string;
  subcategory: string;
  condition: 'new' | 'used' | 'refurbished';
  price: number;
  costPrice: number;
  quantity: number;
  minQuantity: number;
  location: string;
  supplier: string;
  images: string[];
  brand: string;
  model: string;
  year: string;
  sku: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  warranty: number;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
}

const categories = [
  { value: 'engine', label: 'Engine Parts', icon: Gauge },
  { value: 'transmission', label: 'Transmission', icon: Cog },
  { value: 'brakes', label: 'Brake System', icon: Disc },
  { value: 'electrical', label: 'Electrical', icon: Battery },
  { value: 'body', label: 'Body Parts', icon: Car },
  { value: 'suspension', label: 'Suspension', icon: Wrench },
  { value: 'interior', label: 'Interior', icon: Package },
  { value: 'exterior', label: 'Exterior', icon: Package },
  { value: 'fluids', label: 'Fluids & Oils', icon: Package },
  { value: 'tools', label: 'Tools', icon: Wrench },
];

const conditions = [
  { value: 'new', label: 'New/OEM', color: 'bg-green-100 text-green-800' },
  { value: 'used', label: 'Used/Good', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'refurbished', label: 'Refurbished', color: 'bg-blue-100 text-blue-800' },
];

const suppliers = [
  'Al-Rajhi Motors',
  'Saudi Auto Parts Co.',
  'Gulf Auto Supply',
  'Riyadh Car Parts',
  'Jeddah Motors',
  'Dammam Auto Center',
  'National Auto Parts',
  'Kingdom Motors Supply',
];

const locations = [
  'Warehouse A - Section 1',
  'Warehouse A - Section 2',
  'Warehouse B - Section 1',
  'Warehouse B - Section 2',
  'Storage Room 1',
  'Storage Room 2',
  'Counter Display',
  'Online Only',
];

export default function NewInventoryPage() {
  const router = useRouter();
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: '',
    description: '',
    oemNumber: '',
    category: '',
    subcategory: '',
    condition: 'used',
    price: 0,
    costPrice: 0,
    quantity: 1,
    minQuantity: 1,
    location: '',
    supplier: '',
    images: [],
    brand: '',
    model: '',
    year: '',
    sku: '',
    weight: 0,
    dimensions: { length: 0, width: 0, height: 0 },
    warranty: 0,
    tags: [],
    isActive: true,
    isFeatured: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDimensionChange = (dimension: 'length' | 'width' | 'height', value: number) => {
    setFormData(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions!,
        [dimension]: value
      }
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Product name is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
    if (!formData.quantity || formData.quantity < 0) newErrors.quantity = 'Valid quantity is required';
    if (!formData.location) newErrors.location = 'Storage location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate SKU if not provided
      if (!formData.sku) {
        const sku = `${formData.category?.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-6)}`;
        formData.sku = sku;
      }

      console.log('Submitting inventory item:', formData);
      
      // Redirect back to inventory list
      router.push(`/${locale}/seller/inventory?success=Item added successfully`);
    } catch (error) {
      console.error('Error adding inventory item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    // Simulate file upload
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), imageUrl]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || []
    }));
  };

  const isArabic = locale === 'ar';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-slate-200 dark:bg-slate-950/90 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/${locale}/seller/inventory`}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  <ArrowLeft className="h-4 w-4 me-2" />
                  {isArabic ? 'العودة للمخزون' : 'Back to Inventory'}
                </Button>
              </Link>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  {isArabic ? 'إضافة منتج جديد' : 'Add New Product'}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isArabic ? 'أضف منتجاً جديداً إلى مخزونك' : 'Add a new product to your inventory'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setPreviewMode(!previewMode)}
                className="border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Eye className="h-4 w-4 me-2" />
                {previewMode 
                  ? (isArabic ? 'إخفاء المعاينة' : 'Hide Preview')
                  : (isArabic ? 'معاينة' : 'Preview')
                }
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-saudi-green hover:bg-saudi-green/90 text-white shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white me-2" />
                    {isArabic ? 'جاري الحفظ...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 me-2" />
                    {isArabic ? 'حفظ المنتج' : 'Save Product'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <TabsTrigger value="basic" className="data-[state=active]:bg-saudi-green data-[state=active]:text-white">
                  {isArabic ? 'أساسي' : 'Basic'}
                </TabsTrigger>
                <TabsTrigger value="details" className="data-[state=active]:bg-saudi-green data-[state=active]:text-white">
                  {isArabic ? 'تفاصيل' : 'Details'}
                </TabsTrigger>
                <TabsTrigger value="images" className="data-[state=active]:bg-saudi-green data-[state=active]:text-white">
                  {isArabic ? 'صور' : 'Images'}
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-saudi-green data-[state=active]:text-white">
                  {isArabic ? 'إعدادات' : 'Settings'}
                </TabsTrigger>
              </TabsList>

              {/* Basic Information */}
              <TabsContent value="basic" className="space-y-6">
                <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                      <Package className="h-5 w-5 text-saudi-green" />
                      {isArabic ? 'معلومات المنتج الأساسية' : 'Basic Product Information'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">
                          {isArabic ? 'اسم المنتج *' : 'Product Name *'}
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={cn(
                            "mt-1",
                            errors.name ? "border-red-300 focus:ring-red-500" : "border-slate-200 dark:border-slate-700"
                          )}
                          placeholder={isArabic ? 'أدخل اسم المنتج' : 'Enter product name'}
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="description" className="text-slate-700 dark:text-slate-300">
                          {isArabic ? 'الوصف *' : 'Description *'}
                        </Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          className={cn(
                            "mt-1 min-h-[100px]",
                            errors.description ? "border-red-300 focus:ring-red-500" : "border-slate-200 dark:border-slate-700"
                          )}
                          placeholder={isArabic ? 'وصف تفصيلي للمنتج' : 'Detailed product description'}
                        />
                        {errors.description && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.description}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="category" className="text-slate-700 dark:text-slate-300">
                          {isArabic ? 'الفئة *' : 'Category *'}
                        </Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => handleInputChange('category', value)}
                        >
                          <SelectTrigger className={cn(
                            "mt-1",
                            errors.category ? "border-red-300 focus:ring-red-500" : "border-slate-200 dark:border-slate-700"
                          )}>
                            <SelectValue placeholder={isArabic ? 'اختر الفئة' : 'Select category'} />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => {
                              const IconComponent = category.icon;
                              return (
                                <SelectItem key={category.value} value={category.value}>
                                  <div className="flex items-center gap-2">
                                    <IconComponent className="h-4 w-4" />
                                    {category.label}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        {errors.category && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.category}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="condition" className="text-slate-700 dark:text-slate-300">
                          {isArabic ? 'الحالة' : 'Condition'}
                        </Label>
                        <Select
                          value={formData.condition}
                          onValueChange={(value: 'new' | 'used' | 'refurbished') => handleInputChange('condition', value)}
                        >
                          <SelectTrigger className="mt-1 border-slate-200 dark:border-slate-700">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {conditions.map((condition) => (
                              <SelectItem key={condition.value} value={condition.value}>
                                <div className="flex items-center gap-2">
                                  <Badge className={cn("text-xs", condition.color)}>
                                    {condition.label}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="price" className="text-slate-700 dark:text-slate-300">
                          {isArabic ? 'السعر *' : 'Price *'} 
                          <SARSymbol className="h-3 w-3 ms-1" />
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price || ''}
                          onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                          className={cn(
                            "mt-1",
                            errors.price ? "border-red-300 focus:ring-red-500" : "border-slate-200 dark:border-slate-700"
                          )}
                          placeholder="0.00"
                        />
                        {errors.price && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.price}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="costPrice" className="text-slate-700 dark:text-slate-300">
                          {isArabic ? 'سعر التكلفة' : 'Cost Price'} 
                          <SARSymbol className="h-3 w-3 ms-1" />
                        </Label>
                        <Input
                          id="costPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.costPrice || ''}
                          onChange={(e) => handleInputChange('costPrice', parseFloat(e.target.value) || 0)}
                          className="mt-1 border-slate-200 dark:border-slate-700"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Product Details */}
              <TabsContent value="details" className="space-y-6">
                <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                      <Tag className="h-5 w-5 text-saudi-green" />
                      {isArabic ? 'تفاصيل المنتج' : 'Product Details'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="oemNumber" className="text-slate-700 dark:text-slate-300">
                          {isArabic ? 'رقم OEM' : 'OEM Number'}
                        </Label>
                        <Input
                          id="oemNumber"
                          value={formData.oemNumber}
                          onChange={(e) => handleInputChange('oemNumber', e.target.value)}
                          className="mt-1 border-slate-200 dark:border-slate-700"
                          placeholder={isArabic ? 'رقم القطعة الأصلي' : 'Original part number'}
                        />
                      </div>

                      <div>
                        <Label htmlFor="sku" className="text-slate-700 dark:text-slate-300">
                          {isArabic ? 'رمز المنتج (SKU)' : 'SKU Code'}
                        </Label>
                        <Input
                          id="sku"
                          value={formData.sku}
                          onChange={(e) => handleInputChange('sku', e.target.value)}
                          className="mt-1 border-slate-200 dark:border-slate-700"
                          placeholder={isArabic ? 'سيتم إنشاؤه تلقائياً' : 'Auto-generated if empty'}
                        />
                      </div>

                      <div>
                        <Label htmlFor="brand" className="text-slate-700 dark:text-slate-300">
                          {isArabic ? 'الماركة' : 'Brand'}
                        </Label>
                        <Input
                          id="brand"
                          value={formData.brand}
                          onChange={(e) => handleInputChange('brand', e.target.value)}
                          className="mt-1 border-slate-200 dark:border-slate-700"
                          placeholder={isArabic ? 'ماركة السيارة' : 'Vehicle brand'}
                        />
                      </div>

                      <div>
                        <Label htmlFor="model" className="text-slate-700 dark:text-slate-300">
                          {isArabic ? 'الموديل' : 'Model'}
                        </Label>
                        <Input
                          id="model"
                          value={formData.model}
                          onChange={(e) => handleInputChange('model', e.target.value)}
                          className="mt-1 border-slate-200 dark:border-slate-700"
                          placeholder={isArabic ? 'موديل السيارة' : 'Vehicle model'}
                        />
                      </div>

                      <div>
                        <Label htmlFor="year" className="text-slate-700 dark:text-slate-300">
                          {isArabic ? 'السنة' : 'Year'}
                        </Label>
                        <Input
                          id="year"
                          value={formData.year}
                          onChange={(e) => handleInputChange('year', e.target.value)}
                          className="mt-1 border-slate-200 dark:border-slate-700"
                          placeholder={isArabic ? 'سنة الصنع' : 'Manufacturing year'}
                        />
                      </div>

                      <div>
                        <Label htmlFor="weight" className="text-slate-700 dark:text-slate-300">
                          {isArabic ? 'الوزن (كيلو)' : 'Weight (kg)'}
                        </Label>
                        <Input
                          id="weight"
                          type="number"
                          min="0"
                          step="0.1"
                          value={formData.weight || ''}
                          onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                          className="mt-1 border-slate-200 dark:border-slate-700"
                          placeholder="0.0"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label className="text-slate-700 dark:text-slate-300">
                          {isArabic ? 'الأبعاد (سم)' : 'Dimensions (cm)'}
                        </Label>
                        <div className="grid grid-cols-3 gap-3 mt-1">
                          <div>
                            <Input
                              type="number"
                              min="0"
                              value={formData.dimensions?.length || ''}
                              onChange={(e) => handleDimensionChange('length', parseFloat(e.target.value) || 0)}
                              className="border-slate-200 dark:border-slate-700"
                              placeholder={isArabic ? 'الطول' : 'Length'}
                            />
                          </div>
                          <div>
                            <Input
                              type="number"
                              min="0"
                              value={formData.dimensions?.width || ''}
                              onChange={(e) => handleDimensionChange('width', parseFloat(e.target.value) || 0)}
                              className="border-slate-200 dark:border-slate-700"
                              placeholder={isArabic ? 'العرض' : 'Width'}
                            />
                          </div>
                          <div>
                            <Input
                              type="number"
                              min="0"
                              value={formData.dimensions?.height || ''}
                              onChange={(e) => handleDimensionChange('height', parseFloat(e.target.value) || 0)}
                              className="border-slate-200 dark:border-slate-700"
                              placeholder={isArabic ? 'الارتفاع' : 'Height'}
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="warranty" className="text-slate-700 dark:text-slate-300">
                          {isArabic ? 'الضمان (شهور)' : 'Warranty (months)'}
                        </Label>
                        <Input
                          id="warranty"
                          type="number"
                          min="0"
                          value={formData.warranty || ''}
                          onChange={(e) => handleInputChange('warranty', parseInt(e.target.value) || 0)}
                          className="mt-1 border-slate-200 dark:border-slate-700"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <Label htmlFor="supplier" className="text-slate-700 dark:text-slate-300">
                          {isArabic ? 'المورد' : 'Supplier'}
                        </Label>
                        <Select
                          value={formData.supplier}
                          onValueChange={(value) => handleInputChange('supplier', value)}
                        >
                          <SelectTrigger className="mt-1 border-slate-200 dark:border-slate-700">
                            <SelectValue placeholder={isArabic ? 'اختر المورد' : 'Select supplier'} />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers.map((supplier) => (
                              <SelectItem key={supplier} value={supplier}>
                                {supplier}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <Label className="text-slate-700 dark:text-slate-300">
                        {isArabic ? 'الكلمات المفتاحية' : 'Tags'}
                      </Label>
                      <div className="mt-2 space-y-3">
                        <div className="flex gap-2">
                          <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            className="border-slate-200 dark:border-slate-700"
                            placeholder={isArabic ? 'أضف كلمة مفتاحية' : 'Add a tag'}
                            onKeyPress={(e) => e.key === 'Enter' && addTag()}
                          />
                          <Button
                            type="button"
                            onClick={addTag}
                            size="sm"
                            className="bg-saudi-green hover:bg-saudi-green/90"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {formData.tags && formData.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {formData.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="bg-saudi-green/10 text-saudi-green border border-saudi-green/20"
                              >
                                {tag}
                                <button
                                  onClick={() => removeTag(tag)}
                                  className="ms-1 hover:text-red-500"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Images */}
              <TabsContent value="images" className="space-y-6">
                <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                      <Camera className="h-5 w-5 text-saudi-green" />
                      {isArabic ? 'صور المنتج' : 'Product Images'}
                    </CardTitle>
                    <CardDescription>
                      {isArabic 
                        ? 'أضف صوراً واضحة وعالية الجودة للمنتج. الصورة الأولى ستكون الصورة الرئيسية.'
                        : 'Add clear, high-quality images of your product. The first image will be the main display image.'
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Upload Area */}
                    <div
                      className={cn(
                        "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                        dragActive 
                          ? "border-saudi-green bg-saudi-green/5"
                          : "border-slate-300 hover:border-saudi-green hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50"
                      )}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          files.forEach(file => {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              const imageUrl = e.target?.result as string;
                              setFormData(prev => ({
                                ...prev,
                                images: [...(prev.images || []), imageUrl]
                              }));
                            };
                            reader.readAsDataURL(file);
                          });
                        }}
                      />
                      <Upload className="h-10 w-10 mx-auto text-slate-400 mb-4" />
                      <div className="space-y-2">
                        <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
                          {isArabic ? 'اسحب وأفلت الصور هنا' : 'Drag and drop images here'}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {isArabic ? 'أو انقر لتحديد الملفات' : 'or click to select files'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {isArabic ? 'PNG, JPG, JPEG حتى 10MB' : 'PNG, JPG, JPEG up to 10MB'}
                        </p>
                      </div>
                    </div>

                    {/* Image Grid */}
                    {formData.images && formData.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                              <img
                                src={image}
                                alt={`Product ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {index === 0 && (
                              <Badge className="absolute top-2 start-2 bg-saudi-green text-white">
                                {isArabic ? 'رئيسية' : 'Main'}
                              </Badge>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute top-2 end-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings */}
              <TabsContent value="settings" className="space-y-6">
                <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                      <MapPin className="h-5 w-5 text-saudi-green" />
                      {isArabic ? 'إعدادات المخزون' : 'Inventory Settings'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="quantity" className="text-slate-700 dark:text-slate-300">
                          {isArabic ? 'الكمية الحالية *' : 'Current Quantity *'}
                        </Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="0"
                          value={formData.quantity || ''}
                          onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                          className={cn(
                            "mt-1",
                            errors.quantity ? "border-red-300 focus:ring-red-500" : "border-slate-200 dark:border-slate-700"
                          )}
                          placeholder="0"
                        />
                        {errors.quantity && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.quantity}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="minQuantity" className="text-slate-700 dark:text-slate-300">
                          {isArabic ? 'الحد الأدنى للكمية' : 'Minimum Quantity Alert'}
                        </Label>
                        <Input
                          id="minQuantity"
                          type="number"
                          min="0"
                          value={formData.minQuantity || ''}
                          onChange={(e) => handleInputChange('minQuantity', parseInt(e.target.value) || 0)}
                          className="mt-1 border-slate-200 dark:border-slate-700"
                          placeholder="1"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="location" className="text-slate-700 dark:text-slate-300">
                          {isArabic ? 'موقع التخزين *' : 'Storage Location *'}
                        </Label>
                        <Select
                          value={formData.location}
                          onValueChange={(value) => handleInputChange('location', value)}
                        >
                          <SelectTrigger className={cn(
                            "mt-1",
                            errors.location ? "border-red-300 focus:ring-red-500" : "border-slate-200 dark:border-slate-700"
                          )}>
                            <SelectValue placeholder={isArabic ? 'اختر موقع التخزين' : 'Select storage location'} />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((location) => (
                              <SelectItem key={location} value={location}>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  {location}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.location && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.location}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status Settings */}
                    <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                      <h4 className="font-medium text-slate-900 dark:text-white">
                        {isArabic ? 'حالة المنتج' : 'Product Status'}
                      </h4>
                      
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Checkbox
                          id="isActive"
                          checked={formData.isActive}
                          onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                        />
                        <Label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {isArabic ? 'منتج نشط (مرئي للعملاء)' : 'Active Product (visible to customers)'}
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Checkbox
                          id="isFeatured"
                          checked={formData.isFeatured}
                          onCheckedChange={(checked) => handleInputChange('isFeatured', checked)}
                        />
                        <Label htmlFor="isFeatured" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          {isArabic ? 'منتج مميز' : 'Featured Product'}
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Sidebar */}
          {previewMode && (
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-slate-900 dark:text-white">
                      {isArabic ? 'معاينة المنتج' : 'Product Preview'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Product Image */}
                    <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                      {formData.images && formData.images.length > 0 ? (
                        <img
                          src={formData.images[0]}
                          alt="Product Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImagePlaceholder className="w-full h-full" type="part" />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-white line-clamp-2">
                          {formData.name || (isArabic ? 'اسم المنتج' : 'Product Name')}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3">
                          {formData.description || (isArabic ? 'وصف المنتج...' : 'Product description...')}
                        </p>
                      </div>

                      {formData.condition && (
                        <Badge className={conditions.find(c => c.value === formData.condition)?.color || 'bg-gray-100'}>
                          {conditions.find(c => c.value === formData.condition)?.label}
                        </Badge>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <SARSymbol className="h-4 w-4" />
                          <span className="text-lg font-bold text-saudi-green">
                            {formData.price?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                        {formData.quantity !== undefined && (
                          <Badge variant="outline" className="text-xs">
                            {isArabic ? `${formData.quantity} متوفر` : `${formData.quantity} in stock`}
                          </Badge>
                        )}
                      </div>

                      {formData.tags && formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {formData.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {formData.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{formData.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}