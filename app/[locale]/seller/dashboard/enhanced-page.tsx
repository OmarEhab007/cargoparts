'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SARSymbol } from '@/components/ui/currency-symbol';
import { SaudiHeader, SaudiCard, SaudiMetricCard } from '@/components/ui/saudi-theme';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Download,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Star,
  MessageSquare,
  RefreshCw,
  BarChart3,
  Activity,
  Target,
  Zap,
  Award,
  Calendar,
  Filter,
  Info,
  Truck,
  CreditCard,
  ShoppingBag,
  UserCheck,
  Bell,
  Brain,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

// Enhanced interfaces
interface DashboardMetrics {
  revenue: {
    current: number;
    previous: number;
    change: number;
    target: number;
    achievement: number;
  };
  orders: {
    current: number;
    previous: number;
    change: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
  };
  inventory: {
    total: number;
    active: number;
    lowStock: number;
    outOfStock: number;
    value: number;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    satisfaction: number;
  };
  performance: {
    conversionRate: number;
    averageOrderValue: number;
    fulfillmentRate: number;
    returnRate: number;
  };
}

interface TimeSeriesData {
  date: string;
  revenue: number;
  orders: number;
  visitors: number;
  conversion: number;
}

interface ProductPerformance {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  stock: number;
  trend: 'up' | 'down' | 'stable';
  margin: number;
}

interface RecentActivity {
  id: string;
  type: 'order' | 'review' | 'question' | 'return' | 'stock';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  value?: number;
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  description: string;
  action?: string;
  actionLabel?: string;
}

const CHART_COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
  cyan: '#06b6d4',
  gray: '#6b7280',
};

// Enhanced Dashboard with all 4 phases integrated
export default function EnhancedDashboardPage() {
  const locale = useLocale();
  const router = useRouter();
  const isArabic = locale === 'ar';
  
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  
  // Enhanced mock data
  const [metrics] = useState<DashboardMetrics>({
    revenue: {
      current: 125840,
      previous: 98320,
      change: 28.0,
      target: 150000,
      achievement: 83.9,
    },
    orders: {
      current: 156,
      previous: 128,
      change: 21.9,
      pending: 12,
      processing: 8,
      shipped: 15,
      delivered: 121,
    },
    inventory: {
      total: 342,
      active: 318,
      lowStock: 18,
      outOfStock: 6,
      value: 1250000,
    },
    customers: {
      total: 1234,
      new: 89,
      returning: 67,
      satisfaction: 4.7,
    },
    performance: {
      conversionRate: 3.8,
      averageOrderValue: 806.7,
      fulfillmentRate: 94.2,
      returnRate: 2.1,
    },
  });
  
  // Quick stats for mobile summary
  const quickStats = useMemo(() => ({
    pendingOrders: metrics.orders.pending,
    lowStockItems: metrics.inventory.lowStock,
  }), [metrics.orders.pending, metrics.inventory.lowStock]);
  
  // Time series data for charts
  const timeSeriesData: TimeSeriesData[] = [
    { date: isArabic ? 'الأحد' : 'Sun', revenue: 15200, orders: 18, visitors: 450, conversion: 4.0 },
    { date: isArabic ? 'الإثنين' : 'Mon', revenue: 18500, orders: 22, visitors: 520, conversion: 4.2 },
    { date: isArabic ? 'الثلاثاء' : 'Tue', revenue: 16800, orders: 20, visitors: 480, conversion: 4.1 },
    { date: isArabic ? 'الأربعاء' : 'Wed', revenue: 22300, orders: 28, visitors: 610, conversion: 4.6 },
    { date: isArabic ? 'الخميس' : 'Thu', revenue: 19800, orders: 24, visitors: 550, conversion: 4.4 },
    { date: isArabic ? 'الجمعة' : 'Fri', revenue: 28200, orders: 35, visitors: 780, conversion: 4.5 },
    { date: isArabic ? 'السبت' : 'Sat', revenue: 25040, orders: 31, visitors: 690, conversion: 4.5 },
  ];
  
  // Category performance data
  const categoryData = [
    { name: isArabic ? 'محركات' : 'Engines', value: 35, revenue: 45000, count: 42 },
    { name: isArabic ? 'فرامل' : 'Brakes', value: 25, revenue: 28000, count: 78 },
    { name: isArabic ? 'ناقل حركة' : 'Transmission', value: 20, revenue: 32000, count: 35 },
    { name: isArabic ? 'كهرباء' : 'Electrical', value: 15, revenue: 15000, count: 92 },
    { name: isArabic ? 'أخرى' : 'Other', value: 5, revenue: 5840, count: 45 },
  ];
  
  // Product performance
  const [topProducts] = useState<ProductPerformance[]>([
    {
      id: '1',
      name: isArabic ? 'محرك تويوتا كامري 2015-2018' : 'Toyota Camry Engine 2015-2018',
      sales: 42,
      revenue: 357000,
      stock: 3,
      trend: 'up',
      margin: 28.5,
    },
    {
      id: '2',
      name: isArabic ? 'فرامل هوندا أكورد' : 'Honda Accord Brakes',
      sales: 78,
      revenue: 93600,
      stock: 15,
      trend: 'up',
      margin: 35.2,
    },
    {
      id: '3',
      name: isArabic ? 'ناقل حركة نيسان ألتيما' : 'Nissan Altima Transmission',
      sales: 18,
      revenue: 216000,
      stock: 1,
      trend: 'down',
      margin: 22.8,
    },
    {
      id: '4',
      name: isArabic ? 'مصابيح LED فورد F-150' : 'Ford F-150 LED Headlights',
      sales: 56,
      revenue: 196000,
      stock: 8,
      trend: 'stable',
      margin: 42.1,
    },
  ]);
  
  // Recent activities
  const [recentActivities] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'order',
      title: isArabic ? 'طلب جديد #ORD-2024-156' : 'New Order #ORD-2024-156',
      description: isArabic ? 'محرك تويوتا كامري - أحمد محمد' : 'Toyota Camry Engine - Ahmed Mohammed',
      timestamp: '5 دقائق',
      status: 'pending',
      value: 8500,
    },
    {
      id: '2',
      type: 'review',
      title: isArabic ? 'تقييم جديد ⭐⭐⭐⭐⭐' : 'New Review ⭐⭐⭐⭐⭐',
      description: isArabic ? 'خدمة ممتازة وقطع أصلية' : 'Excellent service and genuine parts',
      timestamp: '32 دقيقة',
    },
    {
      id: '3',
      type: 'stock',
      title: isArabic ? 'تنبيه مخزون منخفض' : 'Low Stock Alert',
      description: isArabic ? 'ناقل حركة نيسان - متبقي 1 فقط' : 'Nissan Transmission - Only 1 left',
      timestamp: 'ساعة',
      status: 'warning',
    },
    {
      id: '4',
      type: 'question',
      title: isArabic ? 'سؤال من عميل' : 'Customer Question',
      description: isArabic ? 'استفسار عن توفر قطع هيونداي' : 'Inquiry about Hyundai parts availability',
      timestamp: '2 ساعات',
    },
  ]);
  
  // System alerts
  const [alerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'warning',
      title: isArabic ? 'مخزون منخفض' : 'Low Inventory',
      description: isArabic ? '6 منتجات تحتاج إعادة تخزين فوري' : '6 products need immediate restocking',
      action: '/seller/inventory/low-stock',
      actionLabel: isArabic ? 'عرض المنتجات' : 'View Products',
    },
    {
      id: '2',
      type: 'success',
      title: isArabic ? 'هدف المبيعات' : 'Sales Target',
      description: isArabic ? 'حققت 84% من هدف الشهر' : "You've achieved 84% of monthly target",
      action: '/seller/analytics',
      actionLabel: isArabic ? 'عرض التفاصيل' : 'View Details',
    },
    {
      id: '3',
      type: 'info',
      title: isArabic ? 'تحديث النظام' : 'System Update',
      description: isArabic ? 'ميزات جديدة متاحة في لوحة التحكم' : 'New features available in dashboard',
      action: '/seller/help',
      actionLabel: isArabic ? 'معرفة المزيد' : 'Learn More',
    },
  ]);
  
  // Performance radar data
  const performanceData = [
    { metric: isArabic ? 'المبيعات' : 'Sales', value: 85, fullMark: 100 },
    { metric: isArabic ? 'الجودة' : 'Quality', value: 92, fullMark: 100 },
    { metric: isArabic ? 'السرعة' : 'Speed', value: 78, fullMark: 100 },
    { metric: isArabic ? 'الخدمة' : 'Service', value: 95, fullMark: 100 },
    { metric: isArabic ? 'السعر' : 'Price', value: 70, fullMark: 100 },
    { metric: isArabic ? 'التوفر' : 'Availability', value: 88, fullMark: 100 },
  ];
  
  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
    
    // Auto refresh logic
    if (autoRefresh) {
      const interval = setInterval(() => {
        console.log('Refreshing dashboard data...');
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);
  
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(isArabic ? 'ar-SA' : 'en-US');
  };
  
  const getChangeIcon = (change: number) => {
    return change > 0 ? (
      <ArrowUpRight className="h-4 w-4 text-green-600" />
    ) : (
      <ArrowDownRight className="h-4 w-4 text-red-600" />
    );
  };
  
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="h-4 w-4 text-blue-500" />;
      case 'review':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'question':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'return':
        return <Package className="h-4 w-4 text-red-500" />;
      case 'stock':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">
              {isArabic ? 'جاري تحميل البيانات...' : 'Loading dashboard...'}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header - Mobile Optimized */}
      <div className="mb-6">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <SaudiHeader
              title={isArabic ? 'مراقبة الأعمال' : 'Business Overview'}
              subtitle={isArabic 
                ? `أهلاً بك مرة أخرى! إحصائيات متجرك اليوم`
                : 'Welcome back! Your store performance today'}
              variant="green"
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-full sm:w-[140px] min-w-[120px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">{isArabic ? 'اليوم' : 'Today'}</SelectItem>
                <SelectItem value="week">{isArabic ? 'هذا الأسبوع' : 'This Week'}</SelectItem>
                <SelectItem value="month">{isArabic ? 'هذا الشهر' : 'This Month'}</SelectItem>
                <SelectItem value="quarter">{isArabic ? 'هذا الربع' : 'This Quarter'}</SelectItem>
                <SelectItem value="year">{isArabic ? 'هذه السنة' : 'This Year'}</SelectItem>
                <SelectItem value="custom">{isArabic ? 'مخصص' : 'Custom'}</SelectItem>
              </SelectContent>
            </Select>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={autoRefresh ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setAutoRefresh(!autoRefresh)}
                  >
                    <RefreshCw className={cn("h-4 w-4", autoRefresh && "animate-spin")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isArabic ? 'تحديث تلقائي' : 'Auto Refresh'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              {isArabic ? 'فلاتر' : 'Filters'}
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              {isArabic ? 'تصدير' : 'Export'}
            </Button>
            <Button asChild className="flex-1 sm:flex-none">
              <Link href={`/${locale}/seller/inventory/new`}>
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{isArabic ? 'إضافة منتج' : 'Add Product'}</span>
                <span className="sm:hidden">{isArabic ? 'إضافة' : 'Add'}</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* System Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6 space-y-3">
          {alerts.map((alert) => (
            <Card key={alert.id} className="border-l-4" style={{
              borderLeftColor: 
                alert.type === 'warning' ? '#f59e0b' :
                alert.type === 'error' ? '#ef4444' :
                alert.type === 'success' ? '#10b981' : '#3b82f6'
            }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    {getAlertIcon(alert.type)}
                    <div>
                      <p className="font-semibold text-label">{alert.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                    </div>
                  </div>
                  {alert.action && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={alert.action}>
                        {alert.actionLabel}
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Key Metrics - Mobile Optimized Grid */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* Revenue Card - Saudi Theme */}
        <SaudiMetricCard
          title={isArabic ? 'إجمالي الإيرادات' : 'Total Revenue'}
          value={`${formatCurrency(metrics.revenue.current)} SAR`}
          change={metrics.revenue.change}
          icon={DollarSign}
          variant="revenue"
          showProgress
          progressValue={metrics.revenue.achievement}
        />
        
        {/* Orders Card - Saudi Theme */}
        <SaudiMetricCard
          title={isArabic ? 'إجمالي الطلبات' : 'Total Orders'}
          value={metrics.orders.current}
          change={metrics.orders.change}
          icon={ShoppingCart}
          variant="orders"
          badge={`${metrics.orders.pending} ${isArabic ? 'عاجل' : 'urgent'}`}
        />
        
        {/* Customers Card - Saudi Theme */}
        <SaudiMetricCard
          title={isArabic ? 'قاعدة العملاء' : 'Customer Base'}
          value={formatCurrency(metrics.customers.total)}
          icon={Users}
          variant="customers"
          badge={`+${metrics.customers.new} ${isArabic ? 'جديد' : 'new'}`}
        />
        
        {/* Performance Card - Saudi Theme */}
        <SaudiCard variant="cultural" className="">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                {isArabic ? 'مؤشرات الأداء' : 'Key Metrics'}
              </CardTitle>
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50/80 to-yellow-50/80 dark:from-amber-950/40 dark:to-yellow-950/40 rounded-lg border border-amber-200/30 dark:border-amber-800/30">
                <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                  {isArabic ? 'معدل تحويل' : 'Conversion Rate'}
                </span>
                <span className="text-sm font-bold text-amber-800 dark:text-amber-200">
                  {metrics.performance.conversionRate}%
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50/80 to-yellow-50/80 dark:from-amber-950/40 dark:to-yellow-950/40 rounded-lg border border-amber-200/30 dark:border-amber-800/30">
                <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                  {isArabic ? 'متوسط قيمة الطلب' : 'Average Order Value'}
                </span>
                <span className="text-sm font-bold text-amber-800 dark:text-amber-200">
                  {formatCurrency(metrics.performance.averageOrderValue)} SAR
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50/80 to-yellow-50/80 dark:from-amber-950/40 dark:to-yellow-950/40 rounded-lg border border-amber-200/30 dark:border-amber-800/30">
                <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                  {isArabic ? 'معدل تنفيذ الطلبات' : 'Order Fulfillment'}
                </span>
                <span className="text-sm font-bold text-amber-800 dark:text-amber-200">
                  {metrics.performance.fulfillmentRate}%
                </span>
              </div>
            </div>
          </CardContent>
        </SaudiCard>
      </div>
      
      {/* Charts Section - Saudi Theme */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Revenue Trend Chart */}
        <SaudiCard variant="green" className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{isArabic ? 'اتجاه الإيرادات' : 'Revenue Trend'}</CardTitle>
                <CardDescription>
                  {isArabic ? 'الإيرادات والطلبات خلال الأسبوع' : 'Revenue and orders over the week'}
                </CardDescription>
              </div>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">{isArabic ? 'الإيرادات' : 'Revenue'}</SelectItem>
                  <SelectItem value="orders">{isArabic ? 'الطلبات' : 'Orders'}</SelectItem>
                  <SelectItem value="both">{isArabic ? 'كلاهما' : 'Both'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                {(selectedMetric === 'revenue' || selectedMetric === 'both') && (
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={CHART_COLORS.primary}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    strokeWidth={2}
                  />
                )}
                {(selectedMetric === 'orders' || selectedMetric === 'both') && (
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke={CHART_COLORS.success}
                    fillOpacity={1}
                    fill="url(#colorOrders)"
                    strokeWidth={2}
                    yAxisId={selectedMetric === 'both' ? 'right' : undefined}
                  />
                )}
                {selectedMetric === 'both' && (
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    className="text-xs"
                    tick={{ fill: 'currentColor' }}
                  />
                )}
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </SaudiCard>

        {/* Performance Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? 'مؤشرات الأداء' : 'Performance Metrics'}</CardTitle>
            <CardDescription>
              {isArabic ? 'تقييم شامل للأداء' : 'Overall performance assessment'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={performanceData}>
                <PolarGrid stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} />
                <PolarAngleAxis 
                  dataKey="metric" 
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]}
                  className="text-xs"
                  tick={{ fill: 'currentColor' }}
                />
                <Radar
                  name={isArabic ? 'الأداء' : 'Performance'}
                  dataKey="value"
                  stroke={CHART_COLORS.primary}
                  fill={CHART_COLORS.primary}
                  fillOpacity={0.5}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Quick Stats Summary - Mobile Addition */}
        <Card className="lg:hidden">
          <CardHeader>
            <CardTitle className="text-lg">
              {isArabic ? 'ملخص سريع' : 'Quick Summary'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                  {quickStats.pendingOrders}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  {isArabic ? 'طلبات معلقة' : 'Pending Orders'}
                </div>
              </div>
              <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                <div className="text-lg font-bold text-amber-700 dark:text-amber-300">
                  {quickStats.lowStockItems}
                </div>
                <div className="text-xs text-amber-600 dark:text-amber-400">
                  {isArabic ? 'مخزون منخفض' : 'Low Stock Items'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Additional Charts Row - Mobile Optimized */}
      <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6 mb-6">
        {/* Category Distribution - Enhanced */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {isArabic ? 'فئات المنتجات' : 'Product Categories'}
            </CardTitle>
            <CardDescription className="text-sm">
              {isArabic ? 'توزيع المبيعات والإيرادات' : 'Sales distribution and revenue breakdown'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {categoryData.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length] }}
                    />
                    <span className="text-sm">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {category.count} {isArabic ? 'منتج' : 'items'}
                    </span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(category.revenue)} SAR
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Conversion Funnel - Enhanced */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {isArabic ? 'قمع التحويل' : 'Sales Funnel'}
            </CardTitle>
            <CardDescription className="text-sm">
              {isArabic ? 'مسار العميل من الزيارة للشراء' : 'Customer conversion journey analysis'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{isArabic ? 'الزوار' : 'Visitors'}</span>
                  <span className="text-sm font-semibold">4,080</span>
                </div>
                <Progress value={100} className="h-8" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{isArabic ? 'مشاهدة المنتج' : 'Product Views'}</span>
                  <span className="text-sm font-semibold">2,856 (70%)</span>
                </div>
                <Progress value={70} className="h-8" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{isArabic ? 'إضافة للسلة' : 'Add to Cart'}</span>
                  <span className="text-sm font-semibold">857 (21%)</span>
                </div>
                <Progress value={21} className="h-8" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{isArabic ? 'بدء الدفع' : 'Checkout'}</span>
                  <span className="text-sm font-semibold">343 (8.4%)</span>
                </div>
                <Progress value={8.4} className="h-8" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{isArabic ? 'إتمام الشراء' : 'Purchase'}</span>
                  <span className="text-sm font-semibold">156 (3.8%)</span>
                </div>
                <Progress value={3.8} className="h-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Products */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{isArabic ? 'أفضل المنتجات' : 'Top Products'}</CardTitle>
                <CardDescription>
                  {isArabic ? 'المنتجات الأكثر أداءً' : 'Best performing products'}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/${locale}/seller/analytics/products`}>
                  {isArabic ? 'عرض الكل' : 'View All'}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold line-clamp-1">{product.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {product.sales} {isArabic ? 'مبيعة' : 'sold'}
                        </span>
                        <Badge variant={product.stock <= 3 ? 'destructive' : 'secondary'} className="text-xs">
                          {product.stock} {isArabic ? 'في المخزون' : 'in stock'}
                        </Badge>
                        {product.trend === 'up' && (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        )}
                        {product.trend === 'down' && (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatCurrency(product.revenue)} SAR
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.margin}% {isArabic ? 'هامش' : 'margin'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{isArabic ? 'النشاط الأخير' : 'Recent Activity'}</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {isArabic ? 'مباشر' : 'Live'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {activity.timestamp}
                      </span>
                      {activity.value && (
                        <span className="text-xs font-semibold">
                          {formatCurrency(activity.value)} SAR
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Advanced Features Promotion */}
      <SaudiCard variant="cultural" className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl text-amber-800 dark:text-amber-300">
                {isArabic ? 'استكشف الميزات المتقدمة' : 'Discover Advanced Features'}
              </CardTitle>
              <CardDescription className="text-sm text-amber-600 dark:text-amber-400">
                {isArabic ? 'ميزات جديدة لتحسين أداء عملك' : 'New features to enhance your business performance'}
              </CardDescription>
            </div>
            <Badge className="bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 text-amber-800 dark:text-amber-300 border-amber-300">
              {isArabic ? 'جديد' : 'New'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="justify-start h-auto p-4 bg-gradient-to-br from-blue-50/50 to-transparent hover:from-blue-100/70 dark:from-blue-950/30 dark:hover:from-blue-950/50 border-blue-200/50 dark:border-blue-800/30" asChild>
              <Link href={`/${locale}/seller/intelligence`}>
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-blue-800 dark:text-blue-200">
                      {isArabic ? 'الذكاء التجاري' : 'Business Intelligence'}
                    </p>
                    <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                      {isArabic ? 'رؤى ذكية وتحليلات' : 'AI insights & analytics'}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-blue-600/50 dark:text-blue-400/50" />
                </div>
              </Link>
            </Button>
            
            <Button variant="outline" className="justify-start h-auto p-4 bg-gradient-to-br from-purple-50/50 to-transparent hover:from-purple-100/70 dark:from-purple-950/30 dark:hover:from-purple-950/50 border-purple-200/50 dark:border-purple-800/30" asChild>
              <Link href={`/${locale}/seller/notifications`}>
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg relative">
                    <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white">
                      3
                    </Badge>
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-purple-800 dark:text-purple-200">
                      {isArabic ? 'الإشعارات الذكية' : 'Smart Notifications'}
                    </p>
                    <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">
                      {isArabic ? 'تنبيهات آلية ذكية' : 'Automated smart alerts'}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-purple-600/50 dark:text-purple-400/50" />
                </div>
              </Link>
            </Button>
            
            <Button variant="outline" className="justify-start h-auto p-4 bg-gradient-to-br from-emerald-50/50 to-transparent hover:from-emerald-100/70 dark:from-emerald-950/30 dark:hover:from-emerald-950/50 border-emerald-200/50 dark:border-emerald-800/30" asChild>
              <Link href={`/${locale}/seller/hub`}>
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                    <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-emerald-800 dark:text-emerald-200">
                      {isArabic ? 'مركز البائع المحسن' : 'Enhanced Seller Hub'}
                    </p>
                    <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1">
                      {isArabic ? 'جميع الميزات المتقدمة' : 'All advanced features'}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-emerald-600/50 dark:text-emerald-400/50" />
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </SaudiCard>
      
      {/* Quick Actions - Mobile Optimized */}
      <SaudiCard variant="green" className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl text-green-800 dark:text-green-300">
            {isArabic ? 'إجراءات سريعة' : 'Quick Actions'}
          </CardTitle>
          <CardDescription className="text-sm text-green-600 dark:text-green-400">
            {isArabic ? 'وصول فوري للمهام المهمة' : 'Instant access to essential business tasks'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="justify-start h-auto p-4 bg-gradient-to-br from-green-50/50 to-transparent hover:from-green-100/70 dark:from-green-950/30 dark:hover:from-green-950/50 border-green-200/50 dark:border-green-800/30" asChild>
              <Link href={`/${locale}/seller/inventory/new`}>
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                    <Plus className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-green-800 dark:text-green-200">
                      {isArabic ? 'إضافة منتج' : 'Add Product'}
                    </p>
                    <p className="text-xs text-green-600/70 dark:text-green-400/70 mt-1">
                      {isArabic ? 'منتج جديد للمتجر' : 'New item to store'}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-green-600/50 dark:text-green-400/50" />
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4 bg-gradient-to-br from-amber-50/50 to-transparent hover:from-amber-100/70 dark:from-amber-950/30 dark:hover:from-amber-950/50 border-amber-200/50 dark:border-amber-800/30" asChild>
              <Link href={`/${locale}/seller/orders`}>
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg relative">
                    <Package className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    {metrics.orders.pending > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white">
                        {metrics.orders.pending}
                      </Badge>
                    )}
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-amber-800 dark:text-amber-200">
                      {isArabic ? 'معالجة الطلبات' : 'Process Orders'}
                    </p>
                    <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">
                      {metrics.orders.pending} {isArabic ? 'عاجلة' : 'urgent orders'}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-amber-600/50 dark:text-amber-400/50" />
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4 bg-gradient-to-br from-purple-50/50 to-transparent hover:from-purple-100/70 dark:from-purple-950/30 dark:hover:from-purple-950/50 border-purple-200/50 dark:border-purple-800/30" asChild>
              <Link href={`/${locale}/seller/customers/messages`}>
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg relative">
                    <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-blue-500 text-white">
                      3
                    </Badge>
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-purple-800 dark:text-purple-200">
                      {isArabic ? 'رسائل العملاء' : 'Customer Messages'}
                    </p>
                    <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">
                      3 {isArabic ? 'غير مقروءة' : 'unread messages'}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-purple-600/50 dark:text-purple-400/50" />
                </div>
              </Link>
            </Button>
            <Button variant="outline" className="justify-start h-auto p-4 bg-gradient-to-br from-blue-50/50 to-transparent hover:from-blue-100/70 dark:from-blue-950/30 dark:hover:from-blue-950/50 border-blue-200/50 dark:border-blue-800/30" asChild>
              <Link href={`/${locale}/seller/analytics`}>
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-blue-800 dark:text-blue-200">
                      {isArabic ? 'التحليلات' : 'Business Analytics'}
                    </p>
                    <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-1">
                      {isArabic ? 'تقارير مفصلة' : 'Detailed insights'}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-blue-600/50 dark:text-blue-400/50" />
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </SaudiCard>
    </div>
  );
}