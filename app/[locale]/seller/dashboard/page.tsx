'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SARSymbol } from '@/components/ui/currency-symbol';
import { 
  Package, 
  ShoppingCart,
  DollarSign,
  Users,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Download,
  BarChart3,
  ChevronRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Analytics data interfaces
interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  activeListings: number;
  listingsChange: number;
  viewsCount: number;
  viewsChange: number;
}

interface RecentOrder {
  id: string;
  buyerName: string;
  items: string[];
  total: number;
  status: string;
  createdAt: string;
}

interface TopListing {
  id: string;
  titleAr: string;
  titleEn: string | null;
  views: number;
  orders: number;
  revenue: number;
  photo?: string;
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const statusLabels: Record<string, Record<string, string>> = {
  PENDING: { ar: 'قيد الانتظار', en: 'Pending' },
  CONFIRMED: { ar: 'مؤكد', en: 'Confirmed' },
  SHIPPED: { ar: 'تم الشحن', en: 'Shipped' },
  DELIVERED: { ar: 'تم التسليم', en: 'Delivered' },
  CANCELLED: { ar: 'ملغي', en: 'Cancelled' },
};

import EnhancedDashboard from './enhanced-page';

export default function SellerDashboardPage() {
  return <EnhancedDashboard />;
}

// Keep the old dashboard component for reference
function OldSellerDashboardPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [stats] = useState<DashboardStats>({
    totalRevenue: 45280,
    revenueChange: 12.5,
    totalOrders: 28,
    ordersChange: 8.3,
    activeListings: 15,
    listingsChange: -2.1,
    viewsCount: 1234,
    viewsChange: 23.5,
  });
  
  // Mock data for charts
  const revenueData = [
    { name: isArabic ? 'الأحد' : 'Sun', revenue: 4500 },
    { name: isArabic ? 'الإثنين' : 'Mon', revenue: 5200 },
    { name: isArabic ? 'الثلاثاء' : 'Tue', revenue: 4800 },
    { name: isArabic ? 'الأربعاء' : 'Wed', revenue: 6300 },
    { name: isArabic ? 'الخميس' : 'Thu', revenue: 5800 },
    { name: isArabic ? 'الجمعة' : 'Fri', revenue: 8200 },
    { name: isArabic ? 'السبت' : 'Sat', revenue: 10480 },
  ];
  
  const categoryData = [
    { name: isArabic ? 'محركات' : 'Engines', value: 35, color: '#3b82f6' },
    { name: isArabic ? 'فرامل' : 'Brakes', value: 25, color: '#10b981' },
    { name: isArabic ? 'ناقل حركة' : 'Transmission', value: 20, color: '#f59e0b' },
    { name: isArabic ? 'كهرباء' : 'Electrical', value: 15, color: '#8b5cf6' },
    { name: isArabic ? 'أخرى' : 'Other', value: 5, color: '#6b7280' },
  ];
  
  const [recentOrders] = useState<RecentOrder[]>([
    {
      id: 'ORD001',
      buyerName: 'أحمد محمد',
      items: ['محرك تويوتا كامري 2015'],
      total: 8500,
      status: 'PENDING',
      createdAt: '2024-12-16T10:30:00Z',
    },
    {
      id: 'ORD002',
      buyerName: 'سالم العتيبي',
      items: ['فرامل هوندا أكورد', 'زيت محرك'],
      total: 2400,
      status: 'SHIPPED',
      createdAt: '2024-12-15T14:20:00Z',
    },
    {
      id: 'ORD003',
      buyerName: 'محمد الشمري',
      items: ['ناقل حركة نيسان ألتيما'],
      total: 12000,
      status: 'DELIVERED',
      createdAt: '2024-12-14T09:15:00Z',
    },
  ]);
  
  const [topListings] = useState<TopListing[]>([
    {
      id: '1',
      titleAr: 'محرك تويوتا كامري 2015-2018',
      titleEn: 'Toyota Camry Engine 2015-2018',
      views: 456,
      orders: 12,
      revenue: 102000,
    },
    {
      id: '2',
      titleAr: 'ناقل حركة هوندا أكورد',
      titleEn: 'Honda Accord Transmission',
      views: 312,
      orders: 8,
      revenue: 64000,
    },
    {
      id: '3',
      titleAr: 'فرامل نيسان ألتيما أمامية',
      titleEn: 'Nissan Altima Front Brakes',
      views: 289,
      orders: 15,
      revenue: 18000,
    },
  ]);
  
  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);
  
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(isArabic ? 'ar-SA' : 'en-US');
  };
  
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(isArabic ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          {isArabic ? 'جاري التحميل...' : 'Loading...'}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 card-title-enhanced">
            {isArabic ? 'لوحة تحكم البائع' : 'Seller Dashboard'}
          </h1>
          <p className="text-label text-muted-foreground">
            {isArabic ? 'مرحباً بك في لوحة التحكم' : 'Welcome to your dashboard'}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">{isArabic ? 'اليوم' : 'Today'}</SelectItem>
              <SelectItem value="week">{isArabic ? 'هذا الأسبوع' : 'This Week'}</SelectItem>
              <SelectItem value="month">{isArabic ? 'هذا الشهر' : 'This Month'}</SelectItem>
              <SelectItem value="year">{isArabic ? 'هذه السنة' : 'This Year'}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="me-2 h-4 w-4" />
            {isArabic ? 'تصدير' : 'Export'}
          </Button>
          <Button asChild>
            <Link href={`/${locale}/seller/listings/new`}>
              <Plus className="me-2 h-4 w-4" />
              {isArabic ? 'إضافة قطعة' : 'Add Part'}
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-label font-semibold text-muted-foreground">
                {isArabic ? 'إجمالي الإيرادات' : 'Total Revenue'}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-price flex items-center gap-1">
              {formatCurrency(stats.totalRevenue)}
              <SARSymbol className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1 text-detail mt-1">
              {stats.revenueChange > 0 ? (
                <>
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">+{stats.revenueChange}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                  <span className="text-red-600">{stats.revenueChange}%</span>
                </>
              )}
              <span className="text-detail text-muted-foreground">
                {isArabic ? 'من الأسبوع الماضي' : 'from last week'}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-label font-semibold text-muted-foreground">
                {isArabic ? 'الطلبات' : 'Orders'}
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-price">{stats.totalOrders}</div>
            <div className="flex items-center gap-1 text-detail mt-1">
              {stats.ordersChange > 0 ? (
                <>
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">+{stats.ordersChange}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                  <span className="text-red-600">{stats.ordersChange}%</span>
                </>
              )}
              <span className="text-detail text-muted-foreground">
                {isArabic ? 'من الأسبوع الماضي' : 'from last week'}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-label font-semibold text-muted-foreground">
                {isArabic ? 'القطع النشطة' : 'Active Listings'}
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-price">{stats.activeListings}</div>
            <div className="flex items-center gap-1 text-detail mt-1">
              {stats.listingsChange > 0 ? (
                <>
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">+{stats.listingsChange}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                  <span className="text-red-600">{stats.listingsChange}%</span>
                </>
              )}
              <span className="text-detail text-muted-foreground">
                {isArabic ? 'من الأسبوع الماضي' : 'from last week'}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-label font-semibold text-muted-foreground">
                {isArabic ? 'المشاهدات' : 'Views'}
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-price">{formatCurrency(stats.viewsCount)}</div>
            <div className="flex items-center gap-1 text-detail mt-1">
              {stats.viewsChange > 0 ? (
                <>
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">+{stats.viewsChange}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                  <span className="text-red-600">{stats.viewsChange}%</span>
                </>
              )}
              <span className="text-detail text-muted-foreground">
                {isArabic ? 'من الأسبوع الماضي' : 'from last week'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-3 mb-8">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{isArabic ? 'الإيرادات' : 'Revenue'}</CardTitle>
            <CardDescription>
              {isArabic ? 'إيرادات الأسبوع الحالي' : 'This week\'s revenue'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? 'توزيع الفئات' : 'Category Distribution'}</CardTitle>
            <CardDescription>
              {isArabic ? 'المبيعات حسب الفئة' : 'Sales by category'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Tables Row */}
      <div className="grid gap-4 lg:grid-cols-2 mb-8">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{isArabic ? 'أحدث الطلبات' : 'Recent Orders'}</CardTitle>
                <CardDescription>
                  {isArabic ? 'آخر الطلبات المستلمة' : 'Latest orders received'}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/${locale}/seller/orders`}>
                  {isArabic ? 'عرض الكل' : 'View All'}
                  <ChevronRight className="ms-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-label font-semibold">#{order.id}</span>
                      <Badge className={`${statusColors[order.status]} badge-text badge-modern`}>
                        {statusLabels[order.status]?.[locale as 'ar' | 'en']}
                      </Badge>
                    </div>
                    <p className="text-detail text-muted-foreground">
                      {order.buyerName} • {order.items[0]}
                      {order.items.length > 1 && ` +${order.items.length - 1}`}
                    </p>
                    <p className="text-detail text-muted-foreground mt-1">
                      {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-end">
                    <div className="text-price flex items-center gap-1 justify-end">
                      {formatCurrency(order.total)}
                      <SARSymbol className="h-4 w-4" />
                    </div>
                    <Button variant="ghost" size="sm" className="mt-1">
                      {isArabic ? 'عرض' : 'View'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Top Performing Listings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{isArabic ? 'أفضل القطع' : 'Top Listings'}</CardTitle>
                <CardDescription>
                  {isArabic ? 'القطع الأكثر مبيعاً' : 'Best performing parts'}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/${locale}/seller/listings`}>
                  {isArabic ? 'عرض الكل' : 'View All'}
                  <ChevronRight className="ms-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topListings.map((listing, index) => (
                <div key={listing.id} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-label font-semibold card-title-enhanced line-clamp-1">
                      {isArabic ? listing.titleAr : listing.titleEn || listing.titleAr}
                    </p>
                    <div className="flex items-center gap-3 text-detail text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {listing.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <ShoppingCart className="h-3 w-3" />
                        {listing.orders}
                      </span>
                      <span className="flex items-center gap-1">
                        {formatCurrency(listing.revenue)}
                        <SARSymbol className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? 'إجراءات سريعة' : 'Quick Actions'}</CardTitle>
          <CardDescription>
            {isArabic ? 'إدارة متجرك بسرعة' : 'Manage your store quickly'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="justify-start" asChild>
              <Link href={`/${locale}/seller/listings/new`}>
                <Plus className="me-2 h-4 w-4" />
                {isArabic ? 'إضافة قطعة جديدة' : 'Add New Part'}
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href={`/${locale}/seller/orders`}>
                <Package className="me-2 h-4 w-4" />
                {isArabic ? 'إدارة الطلبات' : 'Manage Orders'}
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href={`/${locale}/seller/analytics`}>
                <BarChart3 className="me-2 h-4 w-4" />
                {isArabic ? 'التحليلات المتقدمة' : 'Advanced Analytics'}
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href={`/${locale}/seller/settings`}>
                <Users className="me-2 h-4 w-4" />
                {isArabic ? 'إعدادات المتجر' : 'Store Settings'}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}