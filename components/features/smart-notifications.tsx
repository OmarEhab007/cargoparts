'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SaudiCard, SaudiHeader } from '@/components/ui/saudi-theme';
import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Bell,
  BellRing,
  Package,
  TrendingUp,
  Users,
  ShoppingCart,
  CheckCircle,
  Clock,
  MessageSquare,
  Target,
  Zap,
  Brain,
  Settings,
  Mail,
  Smartphone,
  Monitor,
} from 'lucide-react';

// Smart Notification Interfaces
interface NotificationData {
  productId?: string;
  currentStock?: number;
  predictedDays?: number;
  category?: string;
  growth?: number;
  brand?: string;
  customerId?: string;
  orderValue?: number;
  orderCount?: number;
}

interface SmartNotification {
  id: string;
  type: 'inventory' | 'sales' | 'customer' | 'market' | 'finance' | 'operations';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  action?: string;
  actionUrl?: string;
  data: NotificationData;
  isRead: boolean;
  isSmartGenerated: boolean;
  confidence?: number;
  createdAt: string;
  channels: ('push' | 'email' | 'sms' | 'dashboard')[];
}

interface NotificationSettings {
  smartNotifications: boolean;
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
    dashboard: boolean;
  };
  categories: {
    inventory: boolean;
    sales: boolean;
    customer: boolean;
    market: boolean;
    finance: boolean;
    operations: boolean;
  };
  thresholds: {
    lowStock: number;
    highValue: number;
    priceChange: number;
    demandSpike: number;
  };
}

interface AutomatedWorkflow {
  id: string;
  name: string;
  trigger: string;
  conditions: string[];
  actions: string[];
  isActive: boolean;
  executionCount: number;
  successRate: number;
}

export function SmartNotificationCenter() {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const [notifications, setNotifications] = useState<SmartNotification[]>([
    {
      id: '1',
      type: 'inventory',
      priority: 'high',
      title: isArabic ? 'تنبيه مخزون ذكي' : 'Smart Inventory Alert',
      message: isArabic ? 'محرك تويوتا كامري 2018 سينفد خلال 8 أيام بناءً على معدل الطلب' : 'Toyota Camry 2018 engine will run out in 8 days based on demand pattern',
      action: isArabic ? 'طلب إعادة تخزين' : 'Reorder Now',
      actionUrl: '/seller/inventory/reorder',
      data: { productId: 'ENG-TOY-001', currentStock: 2, predictedDays: 8 },
      isRead: false,
      isSmartGenerated: true,
      confidence: 92,
      createdAt: '2024-12-16T10:30:00Z',
      channels: ['push', 'email', 'dashboard'],
    },
    {
      id: '2',
      type: 'sales',
      priority: 'medium',
      title: isArabic ? 'فرصة زيادة المبيعات' : 'Sales Opportunity Detected',
      message: isArabic ? 'ارتفاع الطلب على فرامل هوندا 45% هذا الأسبوع' : 'Honda brake parts demand increased 45% this week',
      action: isArabic ? 'زيادة المخزون' : 'Increase Stock',
      data: { category: 'brakes', growth: 45, brand: 'Honda' },
      isRead: false,
      isSmartGenerated: true,
      confidence: 87,
      createdAt: '2024-12-16T09:15:00Z',
      channels: ['dashboard', 'push'],
    },
    {
      id: '3',
      type: 'customer',
      priority: 'low',
      title: isArabic ? 'عميل VIP جديد' : 'New VIP Customer',
      message: isArabic ? 'عميل جديد مع 3 طلبات بقيمة 15,000 ريال هذا الأسبوع' : 'New customer with 3 orders worth 15,000 SAR this week',
      action: isArabic ? 'إرسال عرض خاص' : 'Send Special Offer',
      data: { customerId: 'C-001', orderValue: 15000, orderCount: 3 },
      isRead: true,
      isSmartGenerated: true,
      confidence: 95,
      createdAt: '2024-12-16T08:00:00Z',
      channels: ['dashboard'],
    },
  ]);

  const [settings, setSettings] = useState<NotificationSettings>({
    smartNotifications: true,
    channels: {
      push: true,
      email: true,
      sms: false,
      dashboard: true,
    },
    categories: {
      inventory: true,
      sales: true,
      customer: true,
      market: false,
      finance: true,
      operations: true,
    },
    thresholds: {
      lowStock: 5,
      highValue: 10000,
      priceChange: 10,
      demandSpike: 30,
    },
  });

  const [workflows] = useState<AutomatedWorkflow[]>([
    {
      id: '1',
      name: isArabic ? 'إعادة طلب المخزون التلقائي' : 'Auto Inventory Reordering',
      trigger: isArabic ? 'مخزون أقل من 3 قطع' : 'Stock below 3 units',
      conditions: [
        isArabic ? 'معدل البيع > 1 قطعة/أسبوع' : 'Sales rate > 1 unit/week',
        isArabic ? 'قيمة القطعة > 1000 ريال' : 'Part value > 1000 SAR',
      ],
      actions: [
        isArabic ? 'إرسال تنبيه للمورد' : 'Send alert to supplier',
        isArabic ? 'إنشاء طلب شراء' : 'Create purchase order',
        isArabic ? 'تنبيه المدير' : 'Notify manager',
      ],
      isActive: true,
      executionCount: 23,
      successRate: 91,
    },
    {
      id: '2',
      name: isArabic ? 'تحسين الأسعار التلقائي' : 'Dynamic Price Optimization',
      trigger: isArabic ? 'تغيير أسعار المنافسين' : 'Competitor price change',
      conditions: [
        isArabic ? 'فرق السعر > 15%' : 'Price difference > 15%',
        isArabic ? 'لا يوجد طلبات خلال 48 ساعة' : 'No orders in 48 hours',
      ],
      actions: [
        isArabic ? 'تحديث السعر تلقائياً' : 'Auto-update price',
        isArabic ? 'إرسال إشعار للعملاء' : 'Notify customers',
      ],
      isActive: false,
      executionCount: 12,
      successRate: 78,
    },
    {
      id: '3',
      name: isArabic ? 'متابعة العملاء الجدد' : 'New Customer Follow-up',
      trigger: isArabic ? 'عميل جديد بطلب > 5000 ريال' : 'New customer with order > 5000 SAR',
      conditions: [
        isArabic ? 'أول طلب للعميل' : 'Customer\'s first order',
        isArabic ? 'طلب مكتمل بنجاح' : 'Order completed successfully',
      ],
      actions: [
        isArabic ? 'إرسال رسالة ترحيب' : 'Send welcome message',
        isArabic ? 'عرض خصم للطلب القادم' : 'Offer discount for next order',
        isArabic ? 'طلب تقييم' : 'Request review',
      ],
      isActive: true,
      executionCount: 8,
      successRate: 100,
    },
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'inventory':
        return <Package className="h-5 w-5 text-amber-600" />;
      case 'sales':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'customer':
        return <Users className="h-5 w-5 text-blue-600" />;
      case 'market':
        return <Target className="h-5 w-5 text-purple-600" />;
      case 'finance':
        return <ShoppingCart className="h-5 w-5 text-emerald-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20';
      case 'medium':
        return 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20';
      case 'low':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/20';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => notif.id === id ? { ...notif, isRead: true } : notif)
    );
  };

  const updateSettings = (key: keyof NotificationSettings, value: NotificationSettings[keyof NotificationSettings]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SaudiHeader
          title={isArabic ? 'مركز الإشعارات الذكية' : 'Smart Notification Center'}
          subtitle={isArabic ? 'إشعارات مخصصة ومسارات عمل آلية' : 'Personalized alerts and automated workflows'}
          variant="sky"
        />
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <BellRing className="h-3 w-3" />
            {unreadCount} {isArabic ? 'غير مقروء' : 'unread'}
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            {isArabic ? 'الإعدادات' : 'Settings'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            {isArabic ? 'الإشعارات' : 'Notifications'}
          </TabsTrigger>
          <TabsTrigger value="workflows">
            <Zap className="h-4 w-4 mr-2" />
            {isArabic ? 'المسارات الآلية' : 'Workflows'}
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            {isArabic ? 'الإعدادات' : 'Settings'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <SaudiCard variant="sky">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                <Brain className="h-5 w-5" />
                {isArabic ? 'الإشعارات الذكية' : 'Smart Notifications'}
              </CardTitle>
              <CardDescription>
                {isArabic ? 'إشعارات مدعومة بالذكاء الاصطناعي لتحسين أداء عملك' : 'AI-powered notifications to optimize your business performance'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                      notification.isRead ? 'opacity-60' : ''
                    } ${getPriorityColor(notification.priority)}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getNotificationIcon(notification.type)}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{notification.title}</h4>
                            {notification.isSmartGenerated && (
                              <Badge variant="secondary" className="text-xs">
                                <Brain className="h-3 w-3 mr-1" />
                                {isArabic ? 'ذكي' : 'AI'}
                              </Badge>
                            )}
                            {notification.confidence && (
                              <Badge variant="outline" className="text-xs">
                                {notification.confidence}%
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={notification.priority === 'high' ? 'destructive' : 'secondary'}>
                          {notification.priority === 'high' ? (isArabic ? 'عالي' : 'High') : 
                           notification.priority === 'medium' ? (isArabic ? 'متوسط' : 'Medium') : 
                           (isArabic ? 'منخفض' : 'Low')}
                        </Badge>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(notification.createdAt).toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                      </div>
                      {notification.action && (
                        <Button size="sm" variant="outline">
                          {notification.action}
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {notification.channels.includes('push') && <Smartphone className="h-3 w-3 text-muted-foreground" />}
                      {notification.channels.includes('email') && <Mail className="h-3 w-3 text-muted-foreground" />}
                      {notification.channels.includes('dashboard') && <Monitor className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </SaudiCard>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <SaudiCard variant="green">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-300">
                <Zap className="h-5 w-5" />
                {isArabic ? 'المسارات الآلية' : 'Automated Workflows'}
              </CardTitle>
              <CardDescription>
                {isArabic ? 'أتمتة المهام الروتينية لتوفير الوقت وتحسين الكفاءة' : 'Automate routine tasks to save time and improve efficiency'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflows.map((workflow) => (
                  <div key={workflow.id} className="p-4 border rounded-lg bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-950/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Switch checked={workflow.isActive} />
                        <div>
                          <h4 className="font-semibold text-green-900 dark:text-green-200">{workflow.name}</h4>
                          <p className="text-sm text-muted-foreground">{workflow.trigger}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-700 dark:text-green-400">
                          {workflow.successRate}% {isArabic ? 'نجاح' : 'success'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {workflow.executionCount} {isArabic ? 'تنفيذ' : 'executions'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          {isArabic ? 'الشروط:' : 'Conditions:'}
                        </p>
                        <ul className="text-xs space-y-1">
                          {workflow.conditions.map((condition, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              {condition}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          {isArabic ? 'الإجراءات:' : 'Actions:'}
                        </p>
                        <ul className="text-xs space-y-1">
                          {workflow.actions.map((action, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <Zap className="h-3 w-3 text-blue-600" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </SaudiCard>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <SaudiCard variant="gold">
              <CardHeader>
                <CardTitle className="text-amber-800 dark:text-amber-300">
                  {isArabic ? 'قنوات الإشعارات' : 'Notification Channels'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <Label>{isArabic ? 'إشعارات الهاتف' : 'Push Notifications'}</Label>
                  </div>
                  <Switch checked={settings.channels.push} onCheckedChange={(checked) => 
                    updateSettings('channels', { ...settings.channels, push: checked })} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <Label>{isArabic ? 'البريد الإلكتروني' : 'Email'}</Label>
                  </div>
                  <Switch checked={settings.channels.email} onCheckedChange={(checked) => 
                    updateSettings('channels', { ...settings.channels, email: checked })} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <Label>{isArabic ? 'الرسائل النصية' : 'SMS'}</Label>
                  </div>
                  <Switch checked={settings.channels.sms} onCheckedChange={(checked) => 
                    updateSettings('channels', { ...settings.channels, sms: checked })} />
                </div>
              </CardContent>
            </SaudiCard>

            <SaudiCard variant="sky">
              <CardHeader>
                <CardTitle className="text-blue-800 dark:text-blue-300">
                  {isArabic ? 'فئات الإشعارات' : 'Notification Categories'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(settings.categories).map(([category, enabled]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getNotificationIcon(category)}
                      <Label className="capitalize">{
                        category === 'inventory' ? (isArabic ? 'المخزون' : 'Inventory') :
                        category === 'sales' ? (isArabic ? 'المبيعات' : 'Sales') :
                        category === 'customer' ? (isArabic ? 'العملاء' : 'Customers') :
                        category === 'market' ? (isArabic ? 'السوق' : 'Market') :
                        category === 'finance' ? (isArabic ? 'المالية' : 'Finance') :
                        (isArabic ? 'العمليات' : 'Operations')
                      }</Label>
                    </div>
                    <Switch checked={enabled} onCheckedChange={(checked) => 
                      updateSettings('categories', { ...settings.categories, [category]: checked })} />
                  </div>
                ))}
              </CardContent>
            </SaudiCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SmartNotificationCenter;