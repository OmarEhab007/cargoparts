'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  MetricCard,
  RevenueChart,
  OrdersTable,
  QuickActions,
  ActivityFeed,
} from '@/components/features/dashboard-components';
import { SaudiHeader } from '@/components/ui/saudi-theme';
import {
  DollarSign,
  ShoppingCart,
  Package,
  MessageSquare,
  TrendingUp,
  Eye,
  AlertTriangle,
  Star,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import type { SellerDashboard, SellerCounts } from '@/lib/types/seller-api';

// Using imported types from seller-api.ts

export default function SellerDashboard() {
  const locale = useLocale();
  const router = useRouter();
  const isArabic = locale === 'ar';
  const { user, seller, isLoading: authLoading, isLoggedIn } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'7d' | '30d'>('7d');
  const [dashboardData, setDashboardData] = useState<SellerDashboard | null>(null);
  const [counts, setCounts] = useState<SellerCounts | null>(null);

  // Transform chart data for the revenue chart
  const revenueChartData = useMemo(() => {
    if (!dashboardData) return [];
    return dashboardData.chartData.map(item => ({
      date: item.date,
      revenue: item.revenue,
      orders: item.orders
    }));
  }, [dashboardData]);

  // Transform recent orders for the orders table
  const recentOrders = useMemo(() => {
    if (!dashboardData) return [];
    return dashboardData.recentOrders.map(order => ({
      ...order,
      customerName: order.buyerName,
      status: order.status as any
    }));
  }, [dashboardData]);

  // Create activity feed items from various sources
  const activities = useMemo(() => [
    ...(counts?.orders.pending ? [{
      id: 'pending-orders',
      title: isArabic ? 'طلبات جديدة' : 'New Orders',
      description: isArabic 
        ? `${counts.orders.pending} ${counts.orders.pending === 1 ? 'طلب جديد' : 'طلبات جديدة'} تحتاج للمراجعة`
        : `${counts.orders.pending} new ${counts.orders.pending === 1 ? 'order' : 'orders'} need your attention`,
      time: isArabic ? 'الآن' : 'now',
      type: 'order' as const,
      priority: 'high' as const
    }] : []),
    ...(counts?.messages ? [{
      id: 'unread-messages',
      title: isArabic ? 'رسائل جديدة' : 'New Messages',
      description: isArabic 
        ? `${counts.messages} ${counts.messages === 1 ? 'رسالة جديدة' : 'رسائل جديدة'} من العملاء`
        : `${counts.messages} new ${counts.messages === 1 ? 'message' : 'messages'} from customers`,
      time: isArabic ? 'منذ قليل' : 'few minutes ago',
      type: 'message' as const,
      priority: 'medium' as const
    }] : []),
    ...(counts?.inventory.lowStock ? [{
      id: 'low-stock',
      title: isArabic ? 'مخزون منخفض' : 'Low Stock Alert',
      description: isArabic 
        ? `${counts.inventory.lowStock} ${counts.inventory.lowStock === 1 ? 'منتج' : 'منتجات'} بحاجة لإعادة التموين`
        : `${counts.inventory.lowStock} ${counts.inventory.lowStock === 1 ? 'item' : 'items'} running low on stock`,
      time: isArabic ? 'اليوم' : 'today',
      type: 'alert' as const,
      priority: 'medium' as const
    }] : []),
  ].slice(0, 10), [counts, isArabic]);

  // Redirect non-sellers to appropriate page with race condition fix
  useEffect(() => {
    if (authLoading) return; // Don't redirect while loading
    
    if (!isLoggedIn) {
      router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    
    if (user?.role !== 'SELLER') {
      router.push(`/${locale}/`);
      return;
    }
  }, [authLoading, isLoggedIn, user, router, locale]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!seller?.id || authLoading) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch dashboard data
        const [dashboardResponse, countsResponse] = await Promise.all([
          fetch(`/api/sellers/${seller.id}/dashboard?period=${period}`),
          fetch(`/api/sellers/${seller.id}/counts`)
        ]);

        if (!dashboardResponse.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const dashboardResult = await dashboardResponse.json();
        setDashboardData(dashboardResult.data);

        if (countsResponse.ok) {
          const countsResult = await countsResponse.json();
          setCounts(countsResult.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [seller?.id, period, authLoading]);

  const handlePeriodChange = (newPeriod: '7d' | '30d') => {
    setPeriod(newPeriod);
  };

  const handleAddProduct = () => {
    router.push(`/${locale}/seller/inventory/new`);
  };

  const handleViewMessages = () => {
    router.push(`/${locale}/seller/messages`);
  };

  const handleViewAnalytics = () => {
    router.push(`/${locale}/seller/analytics`);
  };

  const handleManageOrders = () => {
    router.push(`/${locale}/seller/orders`);
  };

  // Show loading for authentication or data
  if (authLoading || loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  // Don't render if authentication is still loading or user is being redirected
  if (!authLoading && (!isLoggedIn || user?.role !== 'SELLER' || !seller)) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">
              {isArabic ? 'إعادة توجيه...' : 'Redirecting...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-sm text-red-800 hover:text-red-900 underline"
          >
            {isArabic ? 'إعادة المحاولة' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }


  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SaudiHeader
          title={isArabic ? 'لوحة التحكم' : 'Dashboard'}
          subtitle={isArabic ? 'نظرة عامة على أداء متجرك' : 'Overview of your store performance'}
          variant="green"
        />
        <div className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title={isArabic ? 'إجمالي الإيرادات' : 'Total Revenue'}
          value={`${dashboardData.overview.totalRevenue.toLocaleString()} SAR`}
          change={dashboardData.growth.revenueGrowth}
          icon={DollarSign}
          variant="revenue"
          showProgress={true}
          progressValue={75}
        />
        <MetricCard
          title={isArabic ? 'الطلبات' : 'Orders'}
          value={dashboardData.overview.totalOrders}
          change={dashboardData.growth.ordersGrowth}
          icon={ShoppingCart}
          variant="orders"
          badge={counts?.orders.pending ? `${counts.orders.pending} ${isArabic ? 'جديد' : 'New'}` : undefined}
        />
        <MetricCard
          title={isArabic ? 'المنتجات النشطة' : 'Active Products'}
          value={dashboardData.overview.activeListings}
          change={0}
          icon={Package}
          variant="customers"
          badge={counts?.inventory.lowStock ? `${counts.inventory.lowStock} ${isArabic ? 'منخفض' : 'Low'}` : undefined}
        />
        <MetricCard
          title={isArabic ? 'المشاهدات' : 'Views'}
          value={dashboardData.overview.totalViews}
          change={dashboardData.growth.viewsGrowth}
          icon={Eye}
          variant="performance"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title={isArabic ? 'الاستفسارات' : 'Inquiries'}
          value={dashboardData.overview.totalInquiries}
          change={dashboardData.growth.inquiriesGrowth}
          icon={MessageSquare}
          variant="customers"
        />
        <MetricCard
          title={isArabic ? 'التقييم المتوسط' : 'Average Rating'}
          value={`${dashboardData.overview.averageRating}`}
          icon={Star}
          variant="performance"
          badge={`${dashboardData.overview.totalReviews} ${isArabic ? 'تقييم' : 'reviews'}`}
        />
        <MetricCard
          title={isArabic ? 'إجراءات عاجلة' : 'Urgent Actions'}
          value={counts?.summary.urgentActions || 0}
          icon={AlertTriangle}
          variant="orders"
          badge={counts?.summary.urgentActions ? (isArabic ? 'يتطلب انتباه' : 'Needs Attention') : (isArabic ? 'جيد' : 'Good')}
        />
      </div>

      {/* Revenue Chart */}
      <RevenueChart
        data={revenueChartData}
        period={period}
        onPeriodChange={handlePeriodChange}
      />

      {/* Orders and Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <OrdersTable orders={recentOrders.slice(0, 5)} />
        <ActivityFeed activities={activities} />
      </div>

      {/* Quick Actions */}
      <QuickActions
        onAddProduct={handleAddProduct}
        onViewMessages={handleViewMessages}
        onViewAnalytics={handleViewAnalytics}
        onManageOrders={handleManageOrders}
      />
    </div>
  );
}