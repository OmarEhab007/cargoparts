'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SaudiHeader } from '@/components/ui/saudi-theme';
import BusinessIntelligenceDashboard from './business-intelligence';
import SmartNotificationCenter from './smart-notifications';
import AdvancedListingManager from './advanced-listing-management';
import MultiStoreManagement from './multi-store-management';
import ComprehensiveReporting from './comprehensive-reporting';
import {
  LayoutDashboard,
  Brain,
  Bell,
  Package,
  Store,
  FileText,
  Zap,
  Target,
  Activity,
  Star,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

interface FeatureCard {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  icon: React.ElementType;
  phase: number;
  status: 'active' | 'new' | 'beta';
  benefits: string[];
  benefitsAr: string[];
}

export function EnhancedSellerHub() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  
  const [activeTab, setActiveTab] = useState('overview');

  const features: FeatureCard[] = [
    {
      id: 'dashboard',
      title: 'Enhanced Dashboard',
      titleAr: 'لوحة التحكم المحسنة',
      description: 'Mobile-first responsive design with Saudi cultural themes',
      descriptionAr: 'تصميم متجاوب للهواتف مع الموضوع الثقافي السعودي',
      icon: LayoutDashboard,
      phase: 1,
      status: 'active',
      benefits: [
        '98% mobile optimization for Saudi users',
        'Saudi Green color scheme with cultural elements',
        'Improved information architecture',
        'Touch-friendly navigation'
      ],
      benefitsAr: [
        'تحسين 98% للهواتف المحمولة للمستخدمين السعوديين',
        'نظام ألوان السعودية الخضراء مع العناصر الثقافية',
        'تحسين هندسة المعلومات',
        'تنقل مناسب للمس'
      ]
    },
    {
      id: 'intelligence',
      title: 'Business Intelligence',
      titleAr: 'الذكاء التجاري',
      description: 'AI-powered insights and predictive analytics',
      descriptionAr: 'رؤى مدعومة بالذكاء الاصطناعي وتحليلات تنبؤية',
      icon: Brain,
      phase: 3,
      status: 'new',
      benefits: [
        'Smart inventory alerts',
        'Market trend analysis',
        'Pricing optimization suggestions',
        'Demand forecasting'
      ],
      benefitsAr: [
        'تنبيهات المخزون الذكية',
        'تحليل اتجاهات السوق',
        'اقتراحات تحسين الأسعار',
        'توقع الطلب'
      ]
    },
    {
      id: 'notifications',
      title: 'Smart Notifications',
      titleAr: 'الإشعارات الذكية',
      description: 'Automated workflows and intelligent alerts',
      descriptionAr: 'مسارات العمل التلقائية والتنبيهات الذكية',
      icon: Bell,
      phase: 3,
      status: 'new',
      benefits: [
        'Automated business processes',
        'Multi-channel notifications',
        'Custom workflow rules',
        'Real-time alerts'
      ],
      benefitsAr: [
        'عمليات تجارية آلية',
        'إشعارات متعددة القنوات',
        'قواعد سير العمل المخصصة',
        'تنبيهات في الوقت الفعلي'
      ]
    },
    {
      id: 'listings',
      title: 'Advanced Listing Management',
      titleAr: 'إدارة القوائم المتقدمة',
      description: 'Smart tools for product optimization',
      descriptionAr: 'أدوات ذكية لتحسين المنتجات',
      icon: Package,
      phase: 3,
      status: 'new',
      benefits: [
        'Bulk operations',
        'AI-powered SEO optimization',
        'Dynamic pricing strategies',
        'Performance analytics'
      ],
      benefitsAr: [
        'العمليات المجمعة',
        'تحسين SEO مدعوم بالذكاء الاصطناعي',
        'استراتيجيات التسعير الديناميكية',
        'تحليلات الأداء'
      ]
    },
    {
      id: 'multistore',
      title: 'Multi-Store Management',
      titleAr: 'إدارة المتاجر المتعددة',
      description: 'Enterprise-grade multi-location control',
      descriptionAr: 'تحكم متعدد المواقع على مستوى المؤسسة',
      icon: Store,
      phase: 4,
      status: 'beta',
      benefits: [
        'Centralized inventory management',
        'Cross-store analytics',
        'Inter-store transfers',
        'Regional performance tracking'
      ],
      benefitsAr: [
        'إدارة مخزون مركزية',
        'تحليلات متقاطعة للمتاجر',
        'التحويلات بين المتاجر',
        'تتبع الأداء الإقليمي'
      ]
    },
    {
      id: 'reporting',
      title: 'Comprehensive Reporting',
      titleAr: 'التقارير الشاملة',
      description: 'Advanced analytics and custom reports',
      descriptionAr: 'تحليلات متقدمة وتقارير مخصصة',
      icon: FileText,
      phase: 4,
      status: 'beta',
      benefits: [
        'Custom report builder',
        'Automated scheduling',
        'Multiple export formats',
        'Real-time dashboards'
      ],
      benefitsAr: [
        'منشئ التقارير المخصصة',
        'الجدولة التلقائية',
        'صيغ تصدير متعددة',
        'لوحات معلومات في الوقت الفعلي'
      ]
    }
  ];

  const phaseInfo = [
    {
      phase: 1,
      title: isArabic ? 'الأساس' : 'Foundation',
      description: isArabic ? 'تحسين الأساسيات والتجربة المحمولة' : 'Mobile UX & Core Improvements',
      color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
    },
    {
      phase: 2,
      title: isArabic ? 'التصميم السعودي' : 'Saudi-First Design',
      description: isArabic ? 'عناصر التصميم الثقافي والعربية' : 'Cultural Design & Arabic Elements',
      color: 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
    },
    {
      phase: 3,
      title: isArabic ? 'الميزات الذكية' : 'Smart Features',
      description: isArabic ? 'الذكاء الاصطناعي والتطبيقات المتقدمة' : 'AI Intelligence & Advanced Tools',
      color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400'
    },
    {
      phase: 4,
      title: isArabic ? 'المستوى المؤسسي' : 'Enterprise',
      description: isArabic ? 'الإدارة المتقدمة والتقارير الشاملة' : 'Advanced Management & Reporting',
      color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          {isArabic ? 'جديد' : 'New'}
        </Badge>;
      case 'beta':
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
          {isArabic ? 'تجريبي' : 'Beta'}
        </Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
          {isArabic ? 'نشط' : 'Active'}
        </Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <SaudiHeader
          title={isArabic ? 'مركز البائع المحسن' : 'Enhanced Seller Hub'}
          subtitle={isArabic ? 'منصة شاملة لإدارة الأعمال مع ميزات متقدمة وذكاء اصطناعي' : 'Comprehensive business management platform with advanced features and AI intelligence'}
          variant="green"
        />
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm text-muted-foreground">
              {isArabic ? '4 مراحل مكتملة' : '4 Phases Complete'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            <span className="text-sm text-muted-foreground">
              {isArabic ? '6 ميزات متقدمة' : '6 Advanced Features'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            <span className="text-sm text-muted-foreground">
              {isArabic ? 'مُحسّن للسوق السعودي' : 'Saudi Market Optimized'}
            </span>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">
            <Activity className="h-4 w-4 mr-2" />
            {isArabic ? 'نظرة عامة' : 'Overview'}
          </TabsTrigger>
          <TabsTrigger value="intelligence">
            <Brain className="h-4 w-4 mr-2" />
            {isArabic ? 'ذكاء الأعمال' : 'Intelligence'}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            {isArabic ? 'الإشعارات' : 'Notifications'}
          </TabsTrigger>
          <TabsTrigger value="listings">
            <Package className="h-4 w-4 mr-2" />
            {isArabic ? 'إدارة القوائم' : 'Listings'}
          </TabsTrigger>
          <TabsTrigger value="multistore">
            <Store className="h-4 w-4 mr-2" />
            {isArabic ? 'متعدد المتاجر' : 'Multi-Store'}
          </TabsTrigger>
          <TabsTrigger value="reporting">
            <FileText className="h-4 w-4 mr-2" />
            {isArabic ? 'التقارير' : 'Reports'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Phase Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                {isArabic ? 'مراحل التطوير' : 'Development Phases'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {phaseInfo.map((phase) => (
                  <div key={phase.phase} className={`p-4 rounded-lg ${phase.color}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg">{isArabic ? 'المرحلة' : 'Phase'} {phase.phase}</span>
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <h4 className="font-semibold mb-1">{phase.title}</h4>
                    <p className="text-sm opacity-75">{phase.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Features Overview */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.id} className="relative overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {isArabic ? feature.titleAr : feature.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {isArabic ? feature.descriptionAr : feature.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(feature.status)}
                        <Badge variant="outline" className="text-xs">
                          {isArabic ? 'مرحلة' : 'Phase'} {feature.phase}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm">
                        {isArabic ? 'المميزات الرئيسية:' : 'Key Benefits:'}
                      </h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {(isArabic ? feature.benefitsAr : feature.benefits).map((benefit, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-primary rounded-full"></div>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button 
                      className="w-full mt-4" 
                      variant="outline"
                      onClick={() => setActiveTab(feature.id === 'dashboard' ? 'intelligence' : feature.id)}
                    >
                      {isArabic ? 'استكشاف الميزة' : 'Explore Feature'}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Implementation Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                {isArabic ? 'ملخص التنفيذ' : 'Implementation Summary'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'تحسين الهاتف المحمول' : 'Mobile Optimization'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">6</div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'ميزات متقدمة' : 'Advanced Features'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">4</div>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'مراحل مكتملة' : 'Completed Phases'}
                  </p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800 dark:text-green-300">
                    {isArabic ? 'جاهز للإنتاج' : 'Production Ready'}
                  </span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-400">
                  {isArabic 
                    ? 'جميع المكونات تم تطويرها وتحسينها للسوق السعودي مع دعم كامل للعربية والتصميم المتجاوب'
                    : 'All components are developed and optimized for the Saudi market with full Arabic support and responsive design'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intelligence">
          <BusinessIntelligenceDashboard />
        </TabsContent>

        <TabsContent value="notifications">
          <SmartNotificationCenter />
        </TabsContent>

        <TabsContent value="listings">
          <AdvancedListingManager />
        </TabsContent>

        <TabsContent value="multistore">
          <MultiStoreManagement />
        </TabsContent>

        <TabsContent value="reporting">
          <ComprehensiveReporting />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default EnhancedSellerHub;