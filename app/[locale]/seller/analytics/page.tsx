'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { SARSymbol } from '@/components/ui/currency-symbol';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, ScatterChart, Scatter, FunnelChart, Funnel, LabelList
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package,
  Users, Eye, MousePointer, Target, Activity, Calendar,
  Download, Filter, RefreshCw, Info, AlertCircle, Clock,
  Zap, Award, Globe, Percent, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

// Revenue trend data
const revenueData = [
  { month: 'Jan', revenue: 45000, orders: 120, avgOrderValue: 375 },
  { month: 'Feb', revenue: 52000, orders: 145, avgOrderValue: 358 },
  { month: 'Mar', revenue: 48000, orders: 130, avgOrderValue: 369 },
  { month: 'Apr', revenue: 61000, orders: 175, avgOrderValue: 348 },
  { month: 'May', revenue: 58000, orders: 160, avgOrderValue: 362 },
  { month: 'Jun', revenue: 72000, orders: 200, avgOrderValue: 360 },
  { month: 'Jul', revenue: 68000, orders: 185, avgOrderValue: 367 },
  { month: 'Aug', revenue: 75000, orders: 210, avgOrderValue: 357 },
  { month: 'Sep', revenue: 82000, orders: 225, avgOrderValue: 364 },
  { month: 'Oct', revenue: 79000, orders: 215, avgOrderValue: 367 },
  { month: 'Nov', revenue: 86000, orders: 240, avgOrderValue: 358 },
  { month: 'Dec', revenue: 92000, orders: 260, avgOrderValue: 353 },
];

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

// Geographic distribution
const geographicData = [
  { city: 'Riyadh', sales: 35, revenue: 320000 },
  { city: 'Jeddah', sales: 28, revenue: 250000 },
  { city: 'Dammam', sales: 15, revenue: 140000 },
  { city: 'Mecca', sales: 12, revenue: 110000 },
  { city: 'Medina', sales: 10, revenue: 90000 },
];

// Performance metrics radar
const performanceMetrics = [
  { metric: 'Sales Volume', current: 85, target: 90 },
  { metric: 'Customer Satisfaction', current: 92, target: 95 },
  { metric: 'Response Time', current: 88, target: 85 },
  { metric: 'Conversion Rate', current: 78, target: 80 },
  { metric: 'Return Rate', current: 95, target: 92 },
  { metric: 'Inventory Turnover', current: 82, target: 85 },
];

export default function SellerAnalyticsPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [timeRange, setTimeRange] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString(isArabic ? 'ar-SA' : 'en-US');
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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
              <SelectItem value="week">{isArabic ? 'أسبوع' : 'Week'}</SelectItem>
              <SelectItem value="month">{isArabic ? 'شهر' : 'Month'}</SelectItem>
              <SelectItem value="quarter">{isArabic ? 'ربع سنة' : 'Quarter'}</SelectItem>
              <SelectItem value="year">{isArabic ? 'سنة' : 'Year'}</SelectItem>
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
              {formatCurrency(748000)}
              <SARSymbol className="h-5 w-5" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 me-1" />
              <span className="text-sm text-green-500">+12.5%</span>
              <span className="text-sm text-muted-foreground ms-2">
                {isArabic ? 'من الشهر الماضي' : 'from last month'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'معدل التحويل' : 'Conversion Rate'}
            </CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.8%</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 me-1" />
              <span className="text-sm text-green-500">+2.3%</span>
              <span className="text-sm text-muted-foreground ms-2">
                {isArabic ? 'تحسن' : 'improvement'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'متوسط قيمة الطلب' : 'Average Order Value'}
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {formatCurrency(365)}
              <SARSymbol className="h-5 w-5" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingDown className="h-4 w-4 text-red-500 me-1" />
              <span className="text-sm text-red-500">-3.2%</span>
              <span className="text-sm text-muted-foreground ms-2">
                {isArabic ? 'من الشهر الماضي' : 'from last month'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'العملاء المتكررون' : 'Repeat Customers'}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34.5%</div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 me-1" />
              <span className="text-sm text-green-500">+5.1%</span>
              <span className="text-sm text-muted-foreground ms-2">
                {isArabic ? 'زيادة' : 'increase'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
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
                  {isArabic ? 'الإيرادات الشهرية ومتوسط قيمة الطلب' : 'Monthly revenue and average order value'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name={isArabic ? 'الإيرادات' : 'Revenue'} />
                    <Line yAxisId="right" type="monotone" dataKey="avgOrderValue" stroke="#10b981" name={isArabic ? 'متوسط القيمة' : 'Avg Value'} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? 'التوزيع الجغرافي' : 'Geographic Distribution'}</CardTitle>
                <CardDescription>
                  {isArabic ? 'المبيعات حسب المدينة' : 'Sales by city'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={geographicData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ city, sales }) => `${city}: ${sales}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="sales"
                    >
                      {geographicData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Breakdown */}
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

        {/* Products Tab */}
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

        {/* Customers Tab */}
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

        {/* Conversion Tab */}
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

        {/* Performance Tab */}
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
    </div>
  );
}