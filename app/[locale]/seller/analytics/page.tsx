'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { SARSymbol } from '@/components/ui/currency-symbol';
import {
  AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, Line
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart,
  Users, MousePointer,
  Download, RefreshCw, AlertCircle, Clock,
  Zap, Award, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

// Note: revenueData removed - using API data instead

// Product performance data
const productPerformance = [
  { category: 'Engine Parts', sales: 4500, revenue: 450000, growth: 15 },
  { category: 'Body Parts', sales: 3200, revenue: 320000, growth: 8 },
  { category: 'Electrical', sales: 2800, revenue: 280000, growth: 22 },
  { category: 'Suspension', sales: 2100, revenue: 210000, growth: -5 },
  { category: 'Brakes', sales: 1900, revenue: 190000, growth: 12 },
  { category: 'Transmission', sales: 1500, revenue: 180000, growth: 18 },
];

// Customer behavior data
const customerBehavior = [
  { hour: '00', visits: 120, conversions: 8 },
  { hour: '02', visits: 80, conversions: 5 },
  { hour: '04', visits: 60, conversions: 3 },
  { hour: '06', visits: 150, conversions: 12 },
  { hour: '08', visits: 320, conversions: 28 },
  { hour: '10', visits: 450, conversions: 42 },
  { hour: '12', visits: 380, conversions: 35 },
  { hour: '14', visits: 420, conversions: 38 },
  { hour: '16', visits: 480, conversions: 45 },
  { hour: '18', visits: 520, conversions: 48 },
  { hour: '20', visits: 460, conversions: 40 },
  { hour: '22', visits: 280, conversions: 22 },
];

// Conversion funnel data
const conversionFunnel = [
  { stage: 'Page Views', value: 10000, fill: '#3b82f6' },
  { stage: 'Product Views', value: 6500, fill: '#6366f1' },
  { stage: 'Add to Cart', value: 3200, fill: '#8b5cf6' },
  { stage: 'Checkout', value: 1800, fill: '#a855f7' },
  { stage: 'Purchase', value: 1200, fill: '#c084fc' },
];

// Note: geographicData removed - can be added later if needed

// Performance metrics radar
const performanceMetrics = [
  { metric: 'Sales Volume', current: 85, target: 90 },
  { metric: 'Customer Satisfaction', current: 92, target: 95 },
  { metric: 'Response Time', current: 88, target: 85 },
  { metric: 'Conversion Rate', current: 78, target: 80 },
  { metric: 'Return Rate', current: 95, target: 92 },
  { metric: 'Inventory Turnover', current: 82, target: 85 },
];

interface AnalyticsData {
  overview: {
    totalViews: number;
    totalInquiries: number;
    totalOrders: number;
    totalRevenue: number;
    totalNewListings: number;
    activeListings: number;
    averageRating: number;
    totalReviews: number;
    totalSales: number;
    isVerified: boolean;
  };
  growth: {
    viewsGrowth: number;
    inquiriesGrowth: number;
    ordersGrowth: number;
    revenueGrowth: number;
  };
  chartData: Array<{
    date: string;
    views: number;
    inquiries: number;
    orders: number;
    revenue: number;
  }>;
  topListings: Array<{
    id: string;
    title: string;
    titleEn: string | null;
    views: number;
    price: number;
    image: string | null;
  }>;
  period: {
    startDate: string;
    endDate: string;
    period: string;
  };
}

export default function SellerAnalyticsPage() {
  const locale = useLocale();
  const router = useRouter();
  const isArabic = locale === 'ar';
  const { user, seller } = useAuth();
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  
  // TEMPORARY: Skip authentication check for development
  // useEffect(() => {
  //   if (!user || user.role !== 'SELLER') {
  //     router.push(`/${locale}/auth`);
  //     return;
  //   }
  //   if (!seller) {
  //     router.push(`/${locale}/seller/setup`);
  //     return;
  //   }
  // }, [user, seller, router, locale]);

  // Fetch analytics data
  useEffect(() => {
    // TEMPORARY: Use dummy seller ID for development
    const sellerId = 'dummy-seller-1';
    
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams({
          period: timeRange,
        });
        
        const response = await fetch(`/api/sellers/${sellerId}/analytics?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        
        const data = await response.json();
        setAnalyticsData(data.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setError('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, ['dummy-seller-1', timeRange]);

  const refreshData = () => {
    if (seller?.id) {
      const fetchAnalytics = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
          const params = new URLSearchParams({ period: timeRange });
          const response = await fetch(`/api/sellers/${sellerId}/analytics?${params.toString()}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch analytics data');
          }
          
          const data = await response.json();
          setAnalyticsData(data.data);
        } catch (error) {
          console.error('Error fetching analytics:', error);
          setError('Failed to load analytics data');
        } finally {
          setIsLoading(false);
        }
      };
      fetchAnalytics();
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString(isArabic ? 'ar-SA' : 'en-US');
  };

  // Note: COLORS constant removed - using inline colors instead

  // Loading state
  if (isLoading && !analyticsData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">
              {isArabic ? 'جاري تحميل التحليلات...' : 'Loading analytics...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <Button 
            onClick={refreshData} 
            className="mt-2"
            variant="outline"
          >
            {isArabic ? 'إعادة المحاولة' : 'Retry'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {isArabic ? 'التحليلات والأداء' : 'Analytics & Performance'}
          </h1>
          <p className="text-muted-foreground">
            {isArabic ? 'رؤى تفصيلية حول أداء متجرك' : 'Detailed insights into your store performance'}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">{isArabic ? 'أسبوع' : '7 Days'}</SelectItem>
              <SelectItem value="30d">{isArabic ? 'شهر' : '30 Days'}</SelectItem>
              <SelectItem value="90d">{isArabic ? 'ربع سنة' : '90 Days'}</SelectItem>
              <SelectItem value="1y">{isArabic ? 'سنة' : '1 Year'}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={refreshData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 me-2" />
            {isArabic ? 'تصدير' : 'Export'}
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      {analyticsData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isArabic ? 'إجمالي الإيرادات' : 'Total Revenue'}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-1">
                {formatCurrency(analyticsData.overview.totalRevenue)}
                <SARSymbol className="h-5 w-5" />
              </div>
              <div className="flex items-center mt-2">
                {analyticsData.growth.revenueGrowth >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500 me-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 me-1" />
                )}
                <span className={`text-sm ${analyticsData.growth.revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {analyticsData.growth.revenueGrowth >= 0 ? '+' : ''}{analyticsData.growth.revenueGrowth}%
                </span>
                <span className="text-sm text-muted-foreground ms-2">
                  {isArabic ? 'من الفترة السابقة' : 'from previous period'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isArabic ? 'إجمالي المشاهدات' : 'Total Views'}
              </CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.totalViews.toLocaleString()}</div>
              <div className="flex items-center mt-2">
                {analyticsData.growth.viewsGrowth >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500 me-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 me-1" />
                )}
                <span className={`text-sm ${analyticsData.growth.viewsGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {analyticsData.growth.viewsGrowth >= 0 ? '+' : ''}{analyticsData.growth.viewsGrowth}%
                </span>
                <span className="text-sm text-muted-foreground ms-2">
                  {isArabic ? 'تحسن' : 'change'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isArabic ? 'إجمالي الطلبات' : 'Total Orders'}
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData.overview.totalOrders}
              </div>
              <div className="flex items-center mt-2">
                {analyticsData.growth.ordersGrowth >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500 me-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 me-1" />
                )}
                <span className={`text-sm ${analyticsData.growth.ordersGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {analyticsData.growth.ordersGrowth >= 0 ? '+' : ''}{analyticsData.growth.ordersGrowth}%
                </span>
                <span className="text-sm text-muted-foreground ms-2">
                  {isArabic ? 'من الفترة السابقة' : 'from previous period'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isArabic ? 'التقييم' : 'Rating'}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.averageRating.toFixed(1)}/5</div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-muted-foreground">
                  {analyticsData.overview.totalReviews} {isArabic ? 'تقييم' : 'reviews'}
                </span>
                {analyticsData.overview.isVerified && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {isArabic ? 'موثق' : 'Verified'}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Analytics Tabs */}
      {analyticsData && (
        <>
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="revenue">{isArabic ? 'الإيرادات' : 'Revenue'}</TabsTrigger>
          <TabsTrigger value="products">{isArabic ? 'المنتجات' : 'Products'}</TabsTrigger>
          <TabsTrigger value="customers">{isArabic ? 'العملاء' : 'Customers'}</TabsTrigger>
          <TabsTrigger value="conversion">{isArabic ? 'التحويل' : 'Conversion'}</TabsTrigger>
          <TabsTrigger value="performance">{isArabic ? 'الأداء' : 'Performance'}</TabsTrigger>
        </TabsList>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? 'اتجاه الإيرادات' : 'Revenue Trend'}</CardTitle>
                  <CardDescription>
                    {isArabic ? 'تطور الإيرادات والمشاهدات والطلبات' : 'Revenue, views and orders evolution'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={analyticsData.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name={isArabic ? 'الإيرادات' : 'Revenue'} />
                      <Line yAxisId="right" type="monotone" dataKey="views" stroke="#10b981" name={isArabic ? 'المشاهدات' : 'Views'} />
                      <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#f59e0b" name={isArabic ? 'الطلبات' : 'Orders'} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? 'أفضل المنتجات' : 'Top Products'}</CardTitle>
                  <CardDescription>
                    {isArabic ? 'المنتجات الأكثر مشاهدة' : 'Most viewed products'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.topListings.map((listing, index) => (
                      <div key={listing.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{isArabic ? listing.title : (listing.titleEn || listing.title)}</p>
                            <p className="text-xs text-muted-foreground">
                              {listing.views} {isArabic ? 'مشاهدة' : 'views'}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm font-medium flex items-center gap-1">
                          {formatCurrency(listing.price)}
                          <SARSymbol className="h-3 w-3" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? 'تفاصيل الإيرادات' : 'Revenue Breakdown'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productPerformance.map((product) => (
                    <div key={product.category} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{product.category}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatCurrency(product.revenue)} SAR
                          </span>
                        </div>
                        <Progress value={(product.revenue / 450000) * 100} className="h-2" />
                      </div>
                      <div className="ms-4 flex items-center">
                        {product.growth > 0 ? (
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-sm ${product.growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {Math.abs(product.growth)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? 'أداء الفئات' : 'Category Performance'}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={productPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#3b82f6" name={isArabic ? 'المبيعات' : 'Sales'} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? 'المنتجات الأكثر مبيعاً' : 'Top Selling Products'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Toyota Camry Front Bumper 2018-2020', sales: 45, revenue: 22500 },
                    { name: 'Honda Accord Headlight Assembly 2019', sales: 38, revenue: 19000 },
                    { name: 'Nissan Altima Side Mirror 2017-2019', sales: 32, revenue: 9600 },
                    { name: 'Ford F-150 Tailgate 2018-2021', sales: 28, revenue: 14000 },
                    { name: 'Chevrolet Tahoe Grille 2020', sales: 25, revenue: 7500 },
                  ].map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.sales} {isArabic ? 'مبيعة' : 'sold'}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm font-medium flex items-center gap-1">
                        {formatCurrency(product.revenue)}
                        <SARSymbol className="h-3 w-3" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Inventory Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{isArabic ? 'معدل دوران المخزون' : 'Inventory Turnover'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.2x</div>
                <Progress value={82} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {isArabic ? 'أعلى من المتوسط بنسبة 15%' : '15% above average'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{isArabic ? 'المخزون البطيء' : 'Slow Moving Stock'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23</div>
                <p className="text-sm text-muted-foreground mt-1">{isArabic ? 'قطعة' : 'items'}</p>
                <Badge variant="secondary" className="mt-2">
                  {isArabic ? 'يحتاج مراجعة' : 'Needs Review'}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{isArabic ? 'نفاد المخزون' : 'Out of Stock'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7</div>
                <p className="text-sm text-muted-foreground mt-1">{isArabic ? 'منتجات' : 'products'}</p>
                <Badge variant="destructive" className="mt-2">
                  {isArabic ? 'عاجل' : 'Urgent'}
                </Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? 'سلوك العملاء' : 'Customer Behavior'}</CardTitle>
                <CardDescription>
                  {isArabic ? 'الزيارات والتحويلات حسب الوقت' : 'Visits and conversions by time'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={customerBehavior}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="visits" stackId="1" stroke="#3b82f6" fill="#3b82f6" name={isArabic ? 'الزيارات' : 'Visits'} />
                    <Area type="monotone" dataKey="conversions" stackId="1" stroke="#10b981" fill="#10b981" name={isArabic ? 'التحويلات' : 'Conversions'} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? 'تجزئة العملاء' : 'Customer Segmentation'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { segment: isArabic ? 'عملاء VIP' : 'VIP Customers', count: 125, value: 45, color: 'bg-purple-500' },
                    { segment: isArabic ? 'عملاء متكررون' : 'Repeat Customers', count: 340, value: 30, color: 'bg-blue-500' },
                    { segment: isArabic ? 'عملاء جدد' : 'New Customers', count: 520, value: 20, color: 'bg-green-500' },
                    { segment: isArabic ? 'عملاء خاملون' : 'Inactive Customers', count: 215, value: 5, color: 'bg-gray-500' },
                  ].map((segment) => (
                    <div key={segment.segment}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${segment.color}`} />
                          <span className="text-sm font-medium">{segment.segment}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {segment.count} ({segment.value}%)
                        </span>
                      </div>
                      <Progress value={segment.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{isArabic ? 'قيمة العميل' : 'Customer Lifetime Value'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-1">
                  {formatCurrency(2850)}
                  <SARSymbol className="h-5 w-5" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {isArabic ? 'متوسط على 12 شهر' : '12-month average'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{isArabic ? 'معدل الاحتفاظ' : 'Retention Rate'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">68%</div>
                <Progress value={68} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{isArabic ? 'رضا العملاء' : 'Customer Satisfaction'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.6/5</div>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div
                      key={star}
                      className={`h-4 w-4 ${
                        star <= 4.6 ? 'text-yellow-500' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{isArabic ? 'معدل الشكاوى' : 'Complaint Rate'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.3%</div>
                <Badge variant="outline" className="mt-2">
                  <TrendingDown className="h-3 w-3 me-1" />
                  {isArabic ? 'منخفض' : 'Low'}
                </Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'قمع التحويل' : 'Conversion Funnel'}</CardTitle>
              <CardDescription>
                {isArabic ? 'رحلة العميل من الزيارة إلى الشراء' : 'Customer journey from visit to purchase'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={conversionFunnel} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="stage" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6">
                    {conversionFunnel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{isArabic ? 'معدل التخلي عن السلة' : 'Cart Abandonment Rate'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">43.5%</div>
                <Progress value={43.5} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {isArabic ? '1,389 سلة متروكة' : '1,389 abandoned carts'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{isArabic ? 'معدل الارتداد' : 'Bounce Rate'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">35.2%</div>
                <Badge variant="outline" className="mt-2">
                  {isArabic ? 'متوسط' : 'Average'}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{isArabic ? 'الصفحات لكل جلسة' : 'Pages per Session'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.8</div>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 me-1" />
                  <span className="text-sm text-green-500">+0.6</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'مؤشرات الأداء الرئيسية' : 'Key Performance Indicators'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={performanceMetrics}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name={isArabic ? 'الحالي' : 'Current'} dataKey="current" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Radar name={isArabic ? 'الهدف' : 'Target'} dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? 'الأهداف الشهرية' : 'Monthly Goals'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { goal: isArabic ? 'المبيعات' : 'Sales', current: 85000, target: 100000 },
                    { goal: isArabic ? 'الطلبات' : 'Orders', current: 215, target: 250 },
                    { goal: isArabic ? 'العملاء الجدد' : 'New Customers', current: 45, target: 60 },
                    { goal: isArabic ? 'التقييمات' : 'Reviews', current: 28, target: 40 },
                  ].map((goal) => (
                    <div key={goal.goal}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{goal.goal}</span>
                        <span className="text-sm text-muted-foreground">
                          {goal.current}/{goal.target} ({Math.round((goal.current / goal.target) * 100)}%)
                        </span>
                      </div>
                      <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? 'أداء الفريق' : 'Team Performance'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { member: 'Ahmed Ali', score: 92, orders: 45 },
                    { member: 'Sara Mohammed', score: 88, orders: 38 },
                    { member: 'Omar Hassan', score: 85, orders: 32 },
                    { member: 'Fatima Abdullah', score: 90, orders: 41 },
                  ].map((member, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                          {member.member.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{member.member}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.orders} {isArabic ? 'طلب' : 'orders'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={member.score} className="w-20 h-2" />
                        <span className="text-sm font-medium">{member.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            {isArabic ? 'رؤى وتوصيات' : 'Insights & Recommendations'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">
                  {isArabic ? 'فرصة نمو' : 'Growth Opportunity'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isArabic 
                    ? 'منتجات الكهرباء تشهد نموًا بنسبة 22%. فكر في زيادة المخزون.' 
                    : 'Electrical products showing 22% growth. Consider increasing inventory.'}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">
                  {isArabic ? 'يحتاج اهتمام' : 'Needs Attention'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isArabic 
                    ? 'معدل التخلي عن السلة مرتفع. فكر في تحسين عملية الدفع.' 
                    : 'Cart abandonment rate is high. Consider optimizing checkout process.'}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">
                  {isArabic ? 'أفضل وقت' : 'Best Time'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isArabic 
                    ? 'ذروة النشاط بين 4-8 مساءً. خطط للعروض الترويجية في هذا الوقت.' 
                    : 'Peak activity between 4-8 PM. Schedule promotions during this time.'}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                <Award className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">
                  {isArabic ? 'أداء ممتاز' : 'Excellent Performance'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isArabic 
                    ? 'رضا العملاء 4.6/5. استمر في تقديم خدمة عالية الجودة.' 
                    : 'Customer satisfaction at 4.6/5. Keep delivering quality service.'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </>
      )}
    </div>
  );
}