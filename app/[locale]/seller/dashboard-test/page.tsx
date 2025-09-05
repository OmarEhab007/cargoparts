'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
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
import type { SellerDashboard, SellerCounts } from '@/lib/types/seller-api';

// Mock data for testing
const mockDashboardData: SellerDashboard = {
  overview: {
    totalViews: 1250,
    totalInquiries: 89,
    totalOrders: 23,
    totalRevenue: 45600,
    totalNewListings: 5,
    activeListings: 42,
    averageRating: 4.5,
    totalReviews: 18,
    totalSales: 156,
    isVerified: true,
  },
  growth: {
    viewsGrowth: 12.5,
    inquiriesGrowth: 8.3,
    ordersGrowth: 15.7,
    revenueGrowth: 22.1,
  },
  chartData: [
    { date: 'Sep 1', views: 45, inquiries: 3, orders: 1, revenue: 1200 },
    { date: 'Sep 2', views: 52, inquiries: 4, orders: 2, revenue: 2100 },
    { date: 'Sep 3', views: 38, inquiries: 2, orders: 1, revenue: 850 },
    { date: 'Sep 4', views: 61, inquiries: 5, orders: 3, revenue: 3200 },
    { date: 'Sep 5', views: 48, inquiries: 4, orders: 2, revenue: 1800 },
  ],
  topListings: [
    { id: '1', title: 'محرك كامري 2018', views: 125, price: 8500, image: null },
    { id: '2', title: 'جير أكورد 2020', views: 98, price: 5500, image: null },
    { id: '3', title: 'مكينة ألتيما 2019', views: 87, price: 6500, image: null },
  ],
  recentOrders: [
    { id: '1', orderNumber: 'ORD-001', buyerName: 'أحمد محمد', items: 2, total: 3200, status: 'PENDING', createdAt: '2025-09-05T10:30:00Z' },
    { id: '2', orderNumber: 'ORD-002', buyerName: 'خالد العلي', items: 1, total: 8500, status: 'CONFIRMED', createdAt: '2025-09-04T14:15:00Z' },
    { id: '3', orderNumber: 'ORD-003', buyerName: 'سارة أحمد', items: 3, total: 1850, status: 'SHIPPED', createdAt: '2025-09-03T09:45:00Z' },
  ]
};

const mockCounts: SellerCounts = {
  orders: {
    pending: 3,
    processing: 2,
    ready: 1,
    shipped: 5,
    completed: 12,
    returns: 0,
    total: 23,
  },
  inventory: {
    total: 42,
    draft: 3,
    lowStock: 5,
    outOfStock: 2,
    archived: 0,
  },
  messages: {
    unread: 4,
  },
  activity: {
    recentViews: 48,
    recentInquiries: 6,
    newCustomers: 2,
  },
  summary: {
    activeOrders: 11,
    urgentActions: 8,
    totalProducts: 42,
  },
};

export default function DashboardTest() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [period, setPeriod] = useState<'7d' | '30d'>('7d');

  const handlePeriodChange = (newPeriod: '7d' | '30d') => {
    setPeriod(newPeriod);
  };

  const handleAddProduct = () => {
    console.log('Add product clicked');
  };

  const handleViewMessages = () => {
    console.log('View messages clicked');
  };

  const handleViewAnalytics = () => {
    console.log('View analytics clicked');
  };

  const handleManageOrders = () => {
    console.log('Manage orders clicked');
  };

  // Transform chart data for the revenue chart
  const revenueChartData = mockDashboardData.chartData.map(item => ({
    date: item.date,
    revenue: item.revenue,
    orders: item.orders
  }));

  // Transform recent orders for the orders table
  const recentOrders = mockDashboardData.recentOrders.map(order => ({
    ...order,
    customerName: order.buyerName,
    status: order.status as any
  }));

  // Create activity feed items from various sources
  const activities = [
    ...(mockCounts.orders.pending ? [{
      id: 'pending-orders',
      type: 'order' as const,
      title: isArabic ? `${mockCounts.orders.pending} طلبات جديدة` : `${mockCounts.orders.pending} new orders`,
      description: isArabic ? 'تحتاج إلى المعالجة' : 'Need processing',
      timestamp: new Date().toISOString(),
      urgent: true
    }] : []),
    ...(mockCounts.inventory.lowStock ? [{
      id: 'low-stock',
      type: 'product' as const,
      title: isArabic ? `${mockCounts.inventory.lowStock} منتجات منخفضة المخزون` : `${mockCounts.inventory.lowStock} low stock items`,
      description: isArabic ? 'تحتاج إلى إعادة تخزين' : 'Need restocking',
      timestamp: new Date().toISOString(),
      urgent: true
    }] : []),
    ...(mockCounts.messages.unread ? [{
      id: 'unread-messages',
      type: 'message' as const,
      title: isArabic ? `${mockCounts.messages.unread} رسائل غير مقروءة` : `${mockCounts.messages.unread} unread messages`,
      description: isArabic ? 'من العملاء' : 'From customers',
      timestamp: new Date().toISOString()
    }] : []),
    ...(mockDashboardData.overview.totalReviews > 0 ? [{
      id: 'reviews',
      type: 'review' as const,
      title: isArabic ? `${mockDashboardData.overview.averageRating} تقييم متوسط` : `${mockDashboardData.overview.averageRating} average rating`,
      description: isArabic ? `من ${mockDashboardData.overview.totalReviews} تقييمات` : `From ${mockDashboardData.overview.totalReviews} reviews`,
      timestamp: new Date().toISOString()
    }] : [])
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SaudiHeader
          title={isArabic ? 'لوحة التحكم (تجريبية)' : 'Dashboard (Test)'}
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
          value={`${mockDashboardData.overview.totalRevenue.toLocaleString()} SAR`}
          change={mockDashboardData.growth.revenueGrowth}
          icon={DollarSign}
          variant="revenue"
          showProgress={true}
          progressValue={75}
        />
        <MetricCard
          title={isArabic ? 'الطلبات' : 'Orders'}
          value={mockDashboardData.overview.totalOrders}
          change={mockDashboardData.growth.ordersGrowth}
          icon={ShoppingCart}
          variant="orders"
          badge={mockCounts.orders.pending ? `${mockCounts.orders.pending} ${isArabic ? 'جديد' : 'New'}` : undefined}
        />
        <MetricCard
          title={isArabic ? 'المنتجات النشطة' : 'Active Products'}
          value={mockDashboardData.overview.activeListings}
          change={0}
          icon={Package}
          variant="customers"
          badge={mockCounts.inventory.lowStock ? `${mockCounts.inventory.lowStock} ${isArabic ? 'منخفض' : 'Low'}` : undefined}
        />
        <MetricCard
          title={isArabic ? 'المشاهدات' : 'Views'}
          value={mockDashboardData.overview.totalViews}
          change={mockDashboardData.growth.viewsGrowth}
          icon={Eye}
          variant="performance"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title={isArabic ? 'الاستفسارات' : 'Inquiries'}
          value={mockDashboardData.overview.totalInquiries}
          change={mockDashboardData.growth.inquiriesGrowth}
          icon={MessageSquare}
          variant="customers"
        />
        <MetricCard
          title={isArabic ? 'التقييم المتوسط' : 'Average Rating'}
          value={`${mockDashboardData.overview.averageRating}`}
          icon={Star}
          variant="performance"
          badge={`${mockDashboardData.overview.totalReviews} ${isArabic ? 'تقييم' : 'reviews'}`}
        />
        <MetricCard
          title={isArabic ? 'إجراءات عاجلة' : 'Urgent Actions'}
          value={mockCounts.summary.urgentActions || 0}
          icon={AlertTriangle}
          variant="orders"
          badge={mockCounts.summary.urgentActions ? (isArabic ? 'يتطلب انتباه' : 'Needs Attention') : (isArabic ? 'جيد' : 'Good')}
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