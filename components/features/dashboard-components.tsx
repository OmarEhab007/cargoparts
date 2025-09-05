'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SaudiMetricCard } from '@/components/ui/saudi-theme';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart,
} from 'recharts';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Dashboard Metric Card Component
interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  variant?: 'revenue' | 'orders' | 'customers' | 'performance';
  showProgress?: boolean;
  progressValue?: number;
  badge?: string | number;
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  variant = 'revenue',
  showProgress = false,
  progressValue,
  badge,
  className
}: MetricCardProps) {
  return (
    <SaudiMetricCard
      title={title}
      value={value}
      change={change}
      icon={Icon}
      variant={variant}
      showProgress={showProgress}
      progressValue={progressValue}
      badge={badge}
      className={className}
    />
  );
}

// Revenue Chart Component
interface RevenueChartProps {
  data: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  period: '7d' | '30d';
  onPeriodChange: (period: '7d' | '30d') => void;
}

export function RevenueChart({ data, period, onPeriodChange }: RevenueChartProps) {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  return (
    <Card className="bg-gradient-to-br from-green-50/50 via-white to-green-50/30 dark:from-green-950/10 dark:via-background dark:to-green-950/5 border-green-200/50 dark:border-green-800/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-green-800 dark:text-green-200">
              {isArabic ? 'اتجاه الإيرادات' : 'Revenue Trend'}
            </CardTitle>
            <CardDescription className="text-green-600/70 dark:text-green-400/70">
              {isArabic ? 'تطور المبيعات خلال الفترة المحددة' : 'Sales performance over selected period'}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={period === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPeriodChange('7d')}
              className={cn(
                period === '7d' && 'bg-green-600 hover:bg-green-700 text-white'
              )}
            >
              {isArabic ? '7 أيام' : '7 Days'}
            </Button>
            <Button
              variant={period === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPeriodChange('30d')}
              className={cn(
                period === '30d' && 'bg-green-600 hover:bg-green-700 text-white'
              )}
            >
              {isArabic ? '30 يوم' : '30 Days'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value.toLocaleString()}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-md">
                        <p className="text-sm font-medium">{label}</p>
                        <div className="mt-2 space-y-1">
                          {payload.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-sm">
                                {entry.dataKey === 'revenue'
                                  ? `${isArabic ? 'الإيرادات' : 'Revenue'}: ${entry.value?.toLocaleString()} SAR`
                                  : `${isArabic ? 'الطلبات' : 'Orders'}: ${entry.value}`
                                }
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#16a34a"
                fillOpacity={1}
                fill="url(#revenueGradient)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Orders Table Component
interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  items: number;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'READY_TO_SHIP' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
}

interface OrdersTableProps {
  orders: Order[];
  showActions?: boolean;
}

export function OrdersTable({ orders, showActions = true }: OrdersTableProps) {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      PENDING: {
        variant: 'destructive' as const,
        labelAr: 'في الانتظار',
        labelEn: 'Pending',
        icon: Clock,
      },
      CONFIRMED: {
        variant: 'default' as const,
        labelAr: 'مؤكد',
        labelEn: 'Confirmed',
        icon: CheckCircle2,
      },
      PROCESSING: {
        variant: 'secondary' as const,
        labelAr: 'قيد التحضير',
        labelEn: 'Processing',
        icon: Package,
      },
      READY_TO_SHIP: {
        variant: 'outline' as const,
        labelAr: 'جاهز للشحن',
        labelEn: 'Ready to Ship',
        icon: Package,
      },
      SHIPPED: {
        variant: 'secondary' as const,
        labelAr: 'تم الشحن',
        labelEn: 'Shipped',
        icon: TrendingUp,
      },
      DELIVERED: {
        variant: 'default' as const,
        labelAr: 'تم التسليم',
        labelEn: 'Delivered',
        icon: CheckCircle2,
      },
      CANCELLED: {
        variant: 'destructive' as const,
        labelAr: 'ملغي',
        labelEn: 'Cancelled',
        icon: AlertTriangle,
      },
    };

    const config = statusConfig[status];
    const StatusIcon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <StatusIcon className="h-3 w-3" />
        {isArabic ? config.labelAr : config.labelEn}
      </Badge>
    );
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50/50 via-white to-blue-50/30 dark:from-blue-950/10 dark:via-background dark:to-blue-950/5 border-blue-200/50 dark:border-blue-800/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-blue-800 dark:text-blue-200">
              {isArabic ? 'الطلبات الحديثة' : 'Recent Orders'}
            </CardTitle>
            <CardDescription className="text-blue-600/70 dark:text-blue-400/70">
              {isArabic ? 'آخر الطلبات الواردة' : 'Latest incoming orders'}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            {isArabic ? 'عرض الكل' : 'View All'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{isArabic ? 'رقم الطلب' : 'Order #'}</TableHead>
              <TableHead>{isArabic ? 'العميل' : 'Customer'}</TableHead>
              <TableHead>{isArabic ? 'العناصر' : 'Items'}</TableHead>
              <TableHead>{isArabic ? 'المبلغ' : 'Total'}</TableHead>
              <TableHead>{isArabic ? 'الحالة' : 'Status'}</TableHead>
              <TableHead>{isArabic ? 'التاريخ' : 'Date'}</TableHead>
              {showActions && <TableHead>{isArabic ? 'الإجراءات' : 'Actions'}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-950/20">
                <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
                <TableCell className="font-medium">{order.customerName}</TableCell>
                <TableCell>{order.items}</TableCell>
                <TableCell className="font-semibold">{order.total.toLocaleString()} SAR</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                </TableCell>
                {showActions && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Quick Actions Component
interface QuickActionsProps {
  onAddProduct: () => void;
  onViewMessages: () => void;
  onViewAnalytics: () => void;
  onManageOrders: () => void;
}

export function QuickActions({
  onAddProduct,
  onViewMessages,
  onViewAnalytics,
  onManageOrders,
}: QuickActionsProps) {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const actions = [
    {
      id: 'add-product',
      titleAr: 'إضافة منتج جديد',
      titleEn: 'Add New Product',
      descriptionAr: 'أضف قطعة غيار جديدة للمتجر',
      descriptionEn: 'Add a new auto part to your store',
      icon: Plus,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: onAddProduct,
    },
    {
      id: 'manage-orders',
      titleAr: 'إدارة الطلبات',
      titleEn: 'Manage Orders',
      descriptionAr: 'راجع وحدث حالة الطلبات',
      descriptionEn: 'Review and update order status',
      icon: ShoppingCart,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: onManageOrders,
    },
    {
      id: 'view-messages',
      titleAr: 'الرسائل الجديدة',
      titleEn: 'New Messages',
      descriptionAr: 'رد على استفسارات العملاء',
      descriptionEn: 'Respond to customer inquiries',
      icon: MessageSquare,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: onViewMessages,
    },
    {
      id: 'view-analytics',
      titleAr: 'تحليلات المبيعات',
      titleEn: 'Sales Analytics',
      descriptionAr: 'اطلع على تقارير الأداء',
      descriptionEn: 'View performance reports',
      icon: TrendingUp,
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: onViewAnalytics,
    },
  ];

  return (
    <Card className="bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 dark:from-amber-950/10 dark:via-background dark:to-amber-950/5 border-amber-200/50 dark:border-amber-800/20">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-amber-800 dark:text-amber-200">
          {isArabic ? 'الإجراءات السريعة' : 'Quick Actions'}
        </CardTitle>
        <CardDescription className="text-amber-600/70 dark:text-amber-400/70">
          {isArabic ? 'المهام الشائعة للبائعين' : 'Common seller tasks'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action) => {
            const ActionIcon = action.icon;
            return (
              <Button
                key={action.id}
                variant="outline"
                className="h-auto p-4 flex-col gap-3 hover:shadow-lg transition-all duration-200"
                onClick={action.onClick}
              >
                <div className={cn('p-3 rounded-full text-white', action.color)}>
                  <ActionIcon className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-sm">
                    {isArabic ? action.titleAr : action.titleEn}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isArabic ? action.descriptionAr : action.descriptionEn}
                  </p>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Activity Feed Component
interface ActivityItem {
  id: string;
  type: 'order' | 'message' | 'product' | 'review';
  title: string;
  description: string;
  timestamp: string;
  urgent?: boolean;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'order':
        return ShoppingCart;
      case 'message':
        return MessageSquare;
      case 'product':
        return Package;
      case 'review':
        return Users;
      default:
        return Clock;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'order':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'message':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      case 'product':
        return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'review':
        return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold">
          {isArabic ? 'النشاط الحديث' : 'Recent Activity'}
        </CardTitle>
        <CardDescription>
          {isArabic ? 'آخر التحديثات على متجرك' : 'Latest updates on your store'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const ActivityIcon = getActivityIcon(activity.type);
            return (
              <div
                key={activity.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border',
                  activity.urgent
                    ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800/30'
                    : 'bg-muted/20 border-muted'
                )}
              >
                <div className={cn('p-2 rounded-full', getActivityColor(activity.type))}>
                  <ActivityIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">{activity.title}</h4>
                    {activity.urgent && (
                      <Badge variant="destructive" className="text-xs">
                        {isArabic ? 'عاجل' : 'Urgent'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(activity.timestamp).toLocaleString(
                      isArabic ? 'ar-SA' : 'en-US'
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}