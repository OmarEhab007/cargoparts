'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SaudiCard, SaudiHeader } from '@/components/ui/saudi-theme';
import {
  Package,
  Upload,
  Download,
  Edit,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Star,
  Heart,
  Share,
  BarChart3,
  Settings,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  DollarSign,
  Tag,
  Camera,
  FileText,
  Zap,
  Target,
  Sparkles,
  ShoppingCart,
} from 'lucide-react';

// Advanced Listing Management Interfaces
interface AdvancedListing {
  id: string;
  title: string;
  titleAr: string;
  price: number;
  originalPrice: number;
  stock: number;
  category: string;
  brand: string;
  condition: 'new' | 'used' | 'refurbished';
  status: 'active' | 'draft' | 'paused' | 'archived';
  views: number;
  orders: number;
  conversion: number;
  rating: number;
  reviewCount: number;
  images: string[];
  seoScore: number;
  competitorPrice: number;
  marketDemand: number;
  profitMargin: number;
  createdAt: string;
  lastUpdated: string;
  isOptimized: boolean;
  aiRecommendations: string[];
}

interface BulkOperation {
  type: 'price_update' | 'status_change' | 'category_change' | 'bulk_edit' | 'export' | 'duplicate';
  name: string;
  description: string;
  icon: React.ElementType;
  count?: number;
}

interface PricingStrategy {
  id: string;
  name: string;
  type: 'competitive' | 'dynamic' | 'markup' | 'clearance';
  description: string;
  rules: {
    condition: string;
    action: string;
  }[];
  isActive: boolean;
  performance: {
    revenue: number;
    orders: number;
    conversion: number;
  };
}

export function AdvancedListingManager() {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock advanced listings data
  const [listings] = useState<AdvancedListing[]>([
    {
      id: '1',
      title: 'Toyota Camry Engine 2015-2018',
      titleAr: 'محرك تويوتا كامري 2015-2018',
      price: 8500,
      originalPrice: 9000,
      stock: 3,
      category: 'engines',
      brand: 'Toyota',
      condition: 'used',
      status: 'active',
      views: 1245,
      orders: 12,
      conversion: 0.96,
      rating: 4.8,
      reviewCount: 23,
      images: ['engine1.jpg', 'engine2.jpg'],
      seoScore: 85,
      competitorPrice: 9200,
      marketDemand: 88,
      profitMargin: 28.5,
      createdAt: '2024-11-15T08:00:00Z',
      lastUpdated: '2024-12-16T10:30:00Z',
      isOptimized: true,
      aiRecommendations: [
        isArabic ? 'زيادة السعر 8% للمنافسة مع السوق' : 'Increase price by 8% to match market',
        isArabic ? 'إضافة كلمات مفتاحية للمحرك' : 'Add engine-specific keywords',
      ],
    },
    {
      id: '2',
      title: 'Honda Accord Brake Set',
      titleAr: 'مجموعة فرامل هوندا أكورد',
      price: 450,
      originalPrice: 500,
      stock: 15,
      category: 'brakes',
      brand: 'Honda',
      condition: 'refurbished',
      status: 'active',
      views: 856,
      orders: 28,
      conversion: 3.27,
      rating: 4.6,
      reviewCount: 15,
      images: ['brake1.jpg'],
      seoScore: 92,
      competitorPrice: 520,
      marketDemand: 92,
      profitMargin: 35.2,
      createdAt: '2024-10-20T14:00:00Z',
      lastUpdated: '2024-12-14T16:45:00Z',
      isOptimized: true,
      aiRecommendations: [
        isArabic ? 'إضافة صور أكثر للمنتج' : 'Add more product images',
        isArabic ? 'تحديث الوصف بمعلومات التوافق' : 'Update description with compatibility info',
      ],
    },
    {
      id: '3',
      title: 'Nissan Altima Transmission',
      titleAr: 'ناقل حركة نيسان ألتيما',
      price: 12000,
      originalPrice: 12000,
      stock: 1,
      category: 'transmission',
      brand: 'Nissan',
      condition: 'used',
      status: 'paused',
      views: 324,
      orders: 2,
      conversion: 0.62,
      rating: 4.5,
      reviewCount: 4,
      images: ['trans1.jpg'],
      seoScore: 68,
      competitorPrice: 13500,
      marketDemand: 65,
      profitMargin: 22.8,
      createdAt: '2024-09-10T11:30:00Z',
      lastUpdated: '2024-12-10T09:20:00Z',
      isOptimized: false,
      aiRecommendations: [
        isArabic ? 'تحسين العنوان للمحركات البحث' : 'Optimize title for search engines',
        isArabic ? 'زيادة المخزون لتلبية الطلب' : 'Increase stock to meet demand',
      ],
    },
  ]);

  const [bulkOperations] = useState<BulkOperation[]>([
    {
      type: 'price_update',
      name: isArabic ? 'تحديث الأسعار' : 'Update Prices',
      description: isArabic ? 'تحديث أسعار متعددة بنسبة مئوية' : 'Update multiple prices by percentage',
      icon: DollarSign,
      count: selectedListings.length,
    },
    {
      type: 'status_change',
      name: isArabic ? 'تغيير الحالة' : 'Change Status',
      description: isArabic ? 'تفعيل أو إيقاف منتجات متعددة' : 'Activate or pause multiple products',
      icon: Settings,
      count: selectedListings.length,
    },
    {
      type: 'bulk_edit',
      name: isArabic ? 'تحرير جماعي' : 'Bulk Edit',
      description: isArabic ? 'تحديث معلومات متعددة معاً' : 'Update multiple fields together',
      icon: Edit,
      count: selectedListings.length,
    },
    {
      type: 'duplicate',
      name: isArabic ? 'تكرار المنتجات' : 'Duplicate Products',
      description: isArabic ? 'إنشاء نسخ من المنتجات المحددة' : 'Create copies of selected products',
      icon: Copy,
      count: selectedListings.length,
    },
  ]);

  const [pricingStrategies] = useState<PricingStrategy[]>([
    {
      id: '1',
      name: isArabic ? 'التسعير التنافسي' : 'Competitive Pricing',
      type: 'competitive',
      description: isArabic ? 'تعديل الأسعار بناءً على أسعار المنافسين' : 'Adjust prices based on competitor pricing',
      rules: [
        {
          condition: isArabic ? 'إذا كان سعر المنافس أقل بـ 10%' : 'If competitor price is 10% lower',
          action: isArabic ? 'خفض السعر بـ 5%' : 'Reduce price by 5%',
        },
        {
          condition: isArabic ? 'إذا كان سعر المنافس أعلى بـ 15%' : 'If competitor price is 15% higher',
          action: isArabic ? 'زيادة السعر بـ 8%' : 'Increase price by 8%',
        },
      ],
      isActive: true,
      performance: {
        revenue: 25400,
        orders: 34,
        conversion: 2.8,
      },
    },
    {
      id: '2',
      name: isArabic ? 'التسعير الديناميكي' : 'Dynamic Pricing',
      type: 'dynamic',
      description: isArabic ? 'تعديل الأسعار بناءً على الطلب والمخزون' : 'Adjust prices based on demand and inventory',
      rules: [
        {
          condition: isArabic ? 'إذا كان المخزون أقل من 3 قطع' : 'If stock is below 3 units',
          action: isArabic ? 'زيادة السعر بـ 10%' : 'Increase price by 10%',
        },
        {
          condition: isArabic ? 'إذا لم تكن هناك مبيعات لأسبوع' : 'If no sales for 1 week',
          action: isArabic ? 'خفض السعر بـ 5%' : 'Reduce price by 5%',
        },
      ],
      isActive: false,
      performance: {
        revenue: 18900,
        orders: 22,
        conversion: 2.1,
      },
    },
  ]);

  const toggleListingSelection = (listingId: string) => {
    setSelectedListings(prev => 
      prev.includes(listingId) 
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    );
  };

  const selectAllListings = () => {
    setSelectedListings(listings.map(listing => listing.id));
  };

  const clearSelection = () => {
    setSelectedListings([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'paused':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'archived':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'used':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'refurbished':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.titleAr.includes(searchQuery);
    const matchesCategory = filterCategory === 'all' || listing.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || listing.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <SaudiHeader
          title={isArabic ? 'إدارة القوائم المتقدمة' : 'Advanced Listing Management'}
          subtitle={isArabic ? 'أدوات ذكية لإدارة وتحسين منتجاتك' : 'Smart tools to manage and optimize your products'}
          variant="green"
        />
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            {isArabic ? 'تحميل مجموعي' : 'Bulk Upload'}
          </Button>
          <Button>
            <Package className="h-4 w-4 mr-2" />
            {isArabic ? 'إضافة منتج' : 'Add Product'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="listings" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="listings">
            <Package className="h-4 w-4 mr-2" />
            {isArabic ? 'المنتجات' : 'Products'}
          </TabsTrigger>
          <TabsTrigger value="bulk">
            <Settings className="h-4 w-4 mr-2" />
            {isArabic ? 'عمليات جماعية' : 'Bulk Operations'}
          </TabsTrigger>
          <TabsTrigger value="pricing">
            <DollarSign className="h-4 w-4 mr-2" />
            {isArabic ? 'استراتيجيات التسعير' : 'Pricing Strategies'}
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            {isArabic ? 'التحليلات' : 'Analytics'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="space-y-6">
          {/* Search and Filters */}
          <SaudiCard variant="sky">
            <CardHeader>
              <CardTitle className="text-blue-800 dark:text-blue-300">
                {isArabic ? 'البحث والتصفية' : 'Search & Filters'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="md:col-span-2">
                  <Label htmlFor="search">{isArabic ? 'البحث' : 'Search'}</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder={isArabic ? 'البحث في المنتجات...' : 'Search products...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label>{isArabic ? 'الفئة' : 'Category'}</Label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{isArabic ? 'جميع الفئات' : 'All Categories'}</SelectItem>
                      <SelectItem value="engines">{isArabic ? 'محركات' : 'Engines'}</SelectItem>
                      <SelectItem value="brakes">{isArabic ? 'فرامل' : 'Brakes'}</SelectItem>
                      <SelectItem value="transmission">{isArabic ? 'ناقل حركة' : 'Transmission'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{isArabic ? 'الحالة' : 'Status'}</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{isArabic ? 'جميع الحالات' : 'All Statuses'}</SelectItem>
                      <SelectItem value="active">{isArabic ? 'نشط' : 'Active'}</SelectItem>
                      <SelectItem value="paused">{isArabic ? 'متوقف' : 'Paused'}</SelectItem>
                      <SelectItem value="draft">{isArabic ? 'مسودة' : 'Draft'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </SaudiCard>

          {/* Selection Controls */}
          {selectedListings.length > 0 && (
            <SaudiCard variant="gold">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="text-amber-700 dark:text-amber-300">
                      {selectedListings.length} {isArabic ? 'محدد' : 'selected'}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={clearSelection}>
                      {isArabic ? 'إلغاء التحديد' : 'Clear Selection'}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      {isArabic ? 'تحرير' : 'Edit'}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      {isArabic ? 'تكرار' : 'Duplicate'}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      {isArabic ? 'تصدير' : 'Export'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </SaudiCard>
          )}

          {/* Listings Table */}
          <SaudiCard variant="green">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-green-800 dark:text-green-300">
                  {isArabic ? 'قائمة المنتجات' : 'Product Listings'}
                </CardTitle>
                <Button variant="outline" size="sm" onClick={selectAllListings}>
                  {isArabic ? 'تحديد الكل' : 'Select All'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredListings.map((listing) => (
                  <div key={listing.id} className="p-4 border rounded-lg bg-gradient-to-r from-green-50/30 to-transparent dark:from-green-950/10">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedListings.includes(listing.id)}
                        onChange={() => toggleListingSelection(listing.id)}
                        className="mt-1"
                      />
                      
                      <div className="flex-1 grid gap-4 md:grid-cols-6">
                        {/* Product Info */}
                        <div className="md:col-span-2">
                          <h4 className="font-semibold text-green-900 dark:text-green-200 mb-1">
                            {isArabic ? listing.titleAr : listing.title}
                          </h4>
                          <div className="flex gap-2 mb-2">
                            <Badge className={getStatusColor(listing.status)}>
                              {listing.status === 'active' ? (isArabic ? 'نشط' : 'Active') :
                               listing.status === 'paused' ? (isArabic ? 'متوقف' : 'Paused') :
                               listing.status === 'draft' ? (isArabic ? 'مسودة' : 'Draft') :
                               (isArabic ? 'مؤرشف' : 'Archived')}
                            </Badge>
                            <Badge className={getConditionColor(listing.condition)}>
                              {listing.condition === 'new' ? (isArabic ? 'جديد' : 'New') :
                               listing.condition === 'used' ? (isArabic ? 'مستعمل' : 'Used') :
                               (isArabic ? 'مجدد' : 'Refurbished')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {listing.brand} • {isArabic ? 'المخزون:' : 'Stock:'} {listing.stock}
                          </p>
                        </div>

                        {/* Pricing */}
                        <div>
                          <div className="text-lg font-bold text-green-700 dark:text-green-400">
                            {listing.price.toLocaleString()} {isArabic ? 'ريال' : 'SAR'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {isArabic ? 'المنافس:' : 'Competitor:'} {listing.competitorPrice.toLocaleString()}
                          </div>
                          <div className="text-xs">
                            {isArabic ? 'الهامش:' : 'Margin:'} 
                            <span className="font-medium ml-1">{listing.profitMargin}%</span>
                          </div>
                        </div>

                        {/* Performance */}
                        <div>
                          <div className="text-sm font-medium">{listing.views.toLocaleString()} {isArabic ? 'مشاهدة' : 'views'}</div>
                          <div className="text-sm">{listing.orders} {isArabic ? 'طلب' : 'orders'}</div>
                          <div className="text-xs text-muted-foreground">
                            {listing.conversion}% {isArabic ? 'تحويل' : 'conversion'}
                          </div>
                        </div>

                        {/* Rating & SEO */}
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{listing.rating}</span>
                            <span className="text-xs text-muted-foreground">({listing.reviewCount})</span>
                          </div>
                          <div className="text-xs">
                            SEO: <span className="font-medium">{listing.seoScore}/100</span>
                          </div>
                          <Progress value={listing.seoScore} className="h-1 mt-1" />
                        </div>

                        {/* Market Demand */}
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">
                            {isArabic ? 'طلب السوق' : 'Market Demand'}
                          </div>
                          <Progress value={listing.marketDemand} className="h-2 mb-1" />
                          <div className="text-xs font-medium">{listing.marketDemand}%</div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3 mr-1" />
                            {isArabic ? 'تحرير' : 'Edit'}
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3 mr-1" />
                            {isArabic ? 'عرض' : 'View'}
                          </Button>
                          {listing.isOptimized ? (
                            <Badge variant="secondary" className="text-xs">
                              <Zap className="h-3 w-3 mr-1" />
                              {isArabic ? 'محسن' : 'Optimized'}
                            </Badge>
                          ) : (
                            <Button size="sm" variant="outline">
                              <Sparkles className="h-3 w-3 mr-1" />
                              {isArabic ? 'تحسين' : 'Optimize'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* AI Recommendations */}
                    {listing.aiRecommendations.length > 0 && (
                      <div className="mt-3 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                            {isArabic ? 'توصيات الذكاء الاصطناعي' : 'AI Recommendations'}
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {listing.aiRecommendations.map((recommendation, index) => (
                            <li key={index} className="text-xs text-blue-700 dark:text-blue-400 flex items-center gap-1">
                              <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                              {recommendation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </SaudiCard>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <SaudiCard variant="gold">
            <CardHeader>
              <CardTitle className="text-amber-800 dark:text-amber-300">
                {isArabic ? 'العمليات الجماعية' : 'Bulk Operations'}
              </CardTitle>
              <CardDescription>
                {isArabic ? 'تنفيذ إجراءات على عدة منتجات معاً' : 'Perform actions on multiple products at once'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {bulkOperations.map((operation) => {
                  const Icon = operation.icon;
                  return (
                    <div key={operation.type} className="p-4 border rounded-lg bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-amber-600" />
                          <div>
                            <h4 className="font-semibold text-amber-900 dark:text-amber-200">{operation.name}</h4>
                            <p className="text-sm text-muted-foreground">{operation.description}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {operation.count || 0} {isArabic ? 'منتج' : 'items'}
                        </Badge>
                      </div>
                      <Button className="w-full" variant="outline" disabled={!operation.count}>
                        {isArabic ? 'تنفيذ العملية' : 'Execute Operation'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </SaudiCard>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <SaudiCard variant="green">
            <CardHeader>
              <CardTitle className="text-green-800 dark:text-green-300">
                {isArabic ? 'استراتيجيات التسعير الذكية' : 'Smart Pricing Strategies'}
              </CardTitle>
              <CardDescription>
                {isArabic ? 'أتمتة تحديث الأسعار بناءً على قواعد ذكية' : 'Automate price updates based on intelligent rules'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {pricingStrategies.map((strategy) => (
                  <div key={strategy.id} className="p-4 border rounded-lg bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-950/20">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Switch checked={strategy.isActive} />
                        <div>
                          <h4 className="font-semibold text-green-900 dark:text-green-200">{strategy.name}</h4>
                          <p className="text-sm text-muted-foreground">{strategy.description}</p>
                        </div>
                      </div>
                      <Badge variant={strategy.type === 'competitive' ? 'default' : 'secondary'}>
                        {strategy.type}
                      </Badge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h5 className="text-sm font-medium mb-2">{isArabic ? 'القواعد' : 'Rules'}</h5>
                        <div className="space-y-2">
                          {strategy.rules.map((rule, index) => (
                            <div key={index} className="text-xs p-2 bg-muted/50 rounded">
                              <div className="font-medium">{rule.condition}</div>
                              <div className="text-muted-foreground mt-1">→ {rule.action}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium mb-2">{isArabic ? 'الأداء' : 'Performance'}</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{isArabic ? 'الإيرادات:' : 'Revenue:'}</span>
                            <span className="font-medium">{strategy.performance.revenue.toLocaleString()} SAR</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>{isArabic ? 'الطلبات:' : 'Orders:'}</span>
                            <span className="font-medium">{strategy.performance.orders}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>{isArabic ? 'التحويل:' : 'Conversion:'}</span>
                            <span className="font-medium">{strategy.performance.conversion}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </SaudiCard>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <SaudiCard variant="sky">
            <CardHeader>
              <CardTitle className="text-blue-800 dark:text-blue-300">
                {isArabic ? 'تحليلات المنتجات' : 'Product Analytics'}
              </CardTitle>
              <CardDescription>
                {isArabic ? 'رؤى شاملة حول أداء منتجاتك' : 'Comprehensive insights into your product performance'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="p-4 bg-gradient-to-br from-blue-50/50 to-sky-50/50 dark:from-blue-950/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-900 dark:text-blue-200">
                      {isArabic ? 'إجمالي المشاهدات' : 'Total Views'}
                    </h4>
                  </div>
                  <div className="text-2xl font-bold text-blue-800 dark:text-blue-300 mb-1">
                    {listings.reduce((sum, listing) => sum + listing.views, 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isArabic ? 'هذا الشهر' : 'This month'}
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingCart className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-900 dark:text-green-200">
                      {isArabic ? 'إجمالي الطلبات' : 'Total Orders'}
                    </h4>
                  </div>
                  <div className="text-2xl font-bold text-green-800 dark:text-green-300 mb-1">
                    {listings.reduce((sum, listing) => sum + listing.orders, 0)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isArabic ? 'هذا الشهر' : 'This month'}
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-amber-50/50 to-yellow-50/50 dark:from-amber-950/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-amber-600" />
                    <h4 className="font-semibold text-amber-900 dark:text-amber-200">
                      {isArabic ? 'متوسط التحويل' : 'Avg Conversion'}
                    </h4>
                  </div>
                  <div className="text-2xl font-bold text-amber-800 dark:text-amber-300 mb-1">
                    {(listings.reduce((sum, listing) => sum + listing.conversion, 0) / listings.length).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isArabic ? 'جميع المنتجات' : 'All products'}
                  </div>
                </div>
              </div>
            </CardContent>
          </SaudiCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdvancedListingManager;