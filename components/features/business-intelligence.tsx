'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SaudiCard, SaudiHeader, saudiTheme } from '@/components/ui/saudi-theme';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Zap,
  Users,
  Package,
  DollarSign,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Lightbulb,
  TrendingUpIcon,
  Activity,
  Brain,
  Sparkles,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

// Business Intelligence Interfaces
interface BusinessInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'success' | 'trend';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  metric?: number;
  change?: number;
  timeframe: string;
}

interface MarketTrend {
  category: string;
  demand: number;
  growth: number;
  seasonality: 'high' | 'medium' | 'low';
  competition: number;
  priceOpportunity: number;
}

interface SmartAlert {
  id: string;
  type: 'inventory' | 'pricing' | 'demand' | 'competition';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  action: string;
  data: any;
  createdAt: string;
}

interface PredictiveAnalytics {
  nextWeekRevenue: {
    prediction: number;
    confidence: number;
    factors: string[];
  };
  inventoryNeeds: {
    product: string;
    predictedDemand: number;
    currentStock: number;
    daysUntilStockout: number;
    confidenceLevel: number;
  }[];
  seasonalTrends: {
    month: string;
    expectedGrowth: number;
    category: string;
  }[];
}

export function BusinessIntelligenceDashboard() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  
  // Mock business intelligence data
  const [insights] = useState<BusinessInsight[]>([
    {
      id: '1',
      type: 'opportunity',
      priority: 'high',
      title: isArabic ? 'فرصة زيادة أسعار محركات تويوتا' : 'Toyota Engine Pricing Opportunity',
      description: isArabic ? 'أسعار محركات تويوتا أقل من السوق بـ 15%' : 'Toyota engine prices are 15% below market average',
      impact: isArabic ? '+18,500 ريال شهرياً' : '+18,500 SAR monthly',
      recommendation: isArabic ? 'زيادة الأسعار بنسبة 12% تدريجياً' : 'Gradually increase prices by 12%',
      metric: 15,
      change: 12,
      timeframe: isArabic ? 'الأسبوع القادم' : 'Next week',
    },
    {
      id: '2',
      type: 'warning',
      priority: 'high',
      title: isArabic ? 'نفاد مخزون ناقلات الحركة' : 'Transmission Parts Stock Depletion',
      description: isArabic ? '6 منتجات ناقل حركة ستنفد خلال أسبوعين' : '6 transmission products will run out in 2 weeks',
      impact: isArabic ? 'فقدان 25,000 ريال مبيعات' : 'Loss of 25,000 SAR in sales',
      recommendation: isArabic ? 'طلب إعادة التخزين الفوري' : 'Place immediate restocking order',
      metric: 6,
      timeframe: isArabic ? 'أسبوعين' : '2 weeks',
    },
    {
      id: '3',
      type: 'success',
      priority: 'medium',
      title: isArabic ? 'نمو قطاع الفرامل' : 'Brake Parts Growth',
      description: isArabic ? 'نمو مبيعات الفرامل 35% خلال الشهر' : 'Brake parts sales grew 35% this month',
      impact: isArabic ? '+12,800 ريال' : '+12,800 SAR',
      recommendation: isArabic ? 'زيادة تنوع منتجات الفرامل' : 'Expand brake product variety',
      metric: 35,
      change: 35,
      timeframe: isArabic ? 'هذا الشهر' : 'This month',
    },
    {
      id: '4',
      type: 'trend',
      priority: 'medium',
      title: isArabic ? 'اتجاه الطلب على السيارات الهجينة' : 'Hybrid Vehicle Parts Demand Trend',
      description: isArabic ? 'زيادة طلبات قطع السيارات الهجينة 58%' : 'Hybrid vehicle parts demand increased 58%',
      impact: isArabic ? 'فرصة سوق جديدة' : 'New market opportunity',
      recommendation: isArabic ? 'إضافة قطع هجينة للمخزون' : 'Add hybrid parts to inventory',
      metric: 58,
      change: 58,
      timeframe: isArabic ? 'الربع الأخير' : 'Last quarter',
    },
  ]);

  const [marketTrends] = useState<MarketTrend[]>([
    {
      category: isArabic ? 'محركات' : 'Engines',
      demand: 85,
      growth: 12,
      seasonality: 'high',
      competition: 68,
      priceOpportunity: 15,
    },
    {
      category: isArabic ? 'فرامل' : 'Brakes',
      demand: 92,
      growth: 35,
      seasonality: 'medium',
      competition: 45,
      priceOpportunity: 8,
    },
    {
      category: isArabic ? 'ناقل حركة' : 'Transmission',
      demand: 78,
      growth: -5,
      seasonality: 'low',
      competition: 72,
      priceOpportunity: 22,
    },
    {
      category: isArabic ? 'كهرباء' : 'Electrical',
      demand: 88,
      growth: 28,
      seasonality: 'high',
      competition: 35,
      priceOpportunity: 18,
    },
  ]);

  const [smartAlerts] = useState<SmartAlert[]>([
    {
      id: '1',
      type: 'inventory',
      severity: 'critical',
      title: isArabic ? 'مخزون حرج' : 'Critical Stock Level',
      message: isArabic ? 'ناقل حركة نيسان ألتيما - متبقي قطعة واحدة فقط' : 'Nissan Altima Transmission - Only 1 unit left',
      action: isArabic ? 'طلب فوري' : 'Order Now',
      data: { productId: 'T-001', currentStock: 1, avgDailyDemand: 0.3 },
      createdAt: '2024-12-16T09:30:00Z',
    },
    {
      id: '2',
      type: 'pricing',
      severity: 'warning',
      title: isArabic ? 'فرصة تسعير' : 'Pricing Opportunity',
      message: isArabic ? 'فرامل هوندا أكورد - أسعار المنافسين أعلى 20%' : 'Honda Accord Brakes - Competitors 20% higher',
      action: isArabic ? 'تحديث السعر' : 'Update Price',
      data: { currentPrice: 450, suggestedPrice: 540, competitors: 3 },
      createdAt: '2024-12-16T08:15:00Z',
    },
  ]);

  const [predictiveData] = useState<PredictiveAnalytics>({
    nextWeekRevenue: {
      prediction: 148500,
      confidence: 87,
      factors: [
        isArabic ? 'نهاية الشهر - زيادة الطلب' : 'End of month - Increased demand',
        isArabic ? 'موسم الصيانة' : 'Maintenance season',
        isArabic ? 'عروض قطع تويوتا' : 'Toyota parts promotion',
      ],
    },
    inventoryNeeds: [
      {
        product: isArabic ? 'محرك تويوتا كامري 2018' : 'Toyota Camry 2018 Engine',
        predictedDemand: 3,
        currentStock: 2,
        daysUntilStockout: 12,
        confidenceLevel: 92,
      },
      {
        product: isArabic ? 'فرامل هوندا أكورد' : 'Honda Accord Brakes',
        predictedDemand: 8,
        currentStock: 15,
        daysUntilStockout: 28,
        confidenceLevel: 85,
      },
    ],
    seasonalTrends: [
      { month: isArabic ? 'يناير' : 'January', expectedGrowth: 15, category: isArabic ? 'محركات' : 'Engines' },
      { month: isArabic ? 'فبراير' : 'February', expectedGrowth: 8, category: isArabic ? 'فرامل' : 'Brakes' },
    ],
  });

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'trend':
        return <Activity className="h-5 w-5 text-purple-600" />;
      default:
        return <Lightbulb className="h-5 w-5 text-gray-600" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20';
      case 'warning':
        return 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20';
      case 'info':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20';
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <SaudiHeader
        title={isArabic ? 'الذكاء التجاري المتقدم' : 'Advanced Business Intelligence'}
        subtitle={isArabic ? 'رؤى ذكية وتحليلات تنبؤية لتنمية أعمالك' : 'Smart insights and predictive analytics to grow your business'}
        variant="green"
      />

      {/* Smart Alerts */}
      <SaudiCard variant="sky">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-blue-800 dark:text-blue-300">
              {isArabic ? 'التنبيهات الذكية' : 'Smart Alerts'}
            </CardTitle>
          </div>
          <CardDescription>
            {isArabic ? 'تنبيهات مدعومة بالذكاء الاصطناعي' : 'AI-powered business alerts'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {smartAlerts.map((alert) => (
              <Alert key={alert.id} className={getAlertColor(alert.severity)}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-semibold">{alert.title}</p>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      {alert.action}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </SaudiCard>

      {/* Business Insights */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SaudiCard variant="green">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
              <CardTitle className="text-green-800 dark:text-green-300">
                {isArabic ? 'الرؤى التجارية' : 'Business Insights'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map((insight) => (
                <div key={insight.id} className="p-4 border rounded-lg bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-950/20">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(insight.type)}
                      <Badge variant={insight.priority === 'high' ? 'destructive' : 'secondary'}>
                        {insight.priority === 'high' ? (isArabic ? 'عالي' : 'High') : 
                         insight.priority === 'medium' ? (isArabic ? 'متوسط' : 'Medium') : 
                         (isArabic ? 'منخفض' : 'Low')}
                      </Badge>
                    </div>
                    {insight.metric && (
                      <div className="flex items-center gap-1">
                        {insight.change && insight.change > 0 ? (
                          <ChevronUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-semibold">{insight.metric}%</span>
                      </div>
                    )}
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-green-700 dark:text-green-400">{insight.impact}</span>
                    <span className="text-muted-foreground">{insight.timeframe}</span>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
                    💡 {insight.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </SaudiCard>

        {/* Market Trends Analysis */}
        <SaudiCard variant="gold">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUpIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <CardTitle className="text-amber-800 dark:text-amber-300">
                {isArabic ? 'تحليل اتجاهات السوق' : 'Market Trends Analysis'}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {marketTrends.map((trend, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/20">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-amber-900 dark:text-amber-200">{trend.category}</h4>
                    <div className="flex items-center gap-1">
                      {trend.growth > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${trend.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trend.growth > 0 ? '+' : ''}{trend.growth}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">{isArabic ? 'الطلب' : 'Demand'}</span>
                      <Progress value={trend.demand} className="w-20 h-2" />
                      <span className="text-xs font-medium">{trend.demand}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">{isArabic ? 'المنافسة' : 'Competition'}</span>
                      <Progress value={trend.competition} className="w-20 h-2" />
                      <span className="text-xs font-medium">{trend.competition}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">{isArabic ? 'فرصة السعر' : 'Price Opportunity'}</span>
                      <Progress value={trend.priceOpportunity} className="w-20 h-2" />
                      <span className="text-xs font-medium">+{trend.priceOpportunity}%</span>
                    </div>
                  </div>
                  <Badge 
                    variant={trend.seasonality === 'high' ? 'default' : 'secondary'} 
                    className="mt-2 text-xs"
                  >
                    {trend.seasonality === 'high' ? (isArabic ? 'موسم عالي' : 'High Season') :
                     trend.seasonality === 'medium' ? (isArabic ? 'موسم متوسط' : 'Medium Season') :
                     (isArabic ? 'موسم منخفض' : 'Low Season')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </SaudiCard>
      </div>

      {/* Predictive Analytics */}
      <SaudiCard variant="sky">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-blue-800 dark:text-blue-300">
              {isArabic ? 'التحليلات التنبؤية' : 'Predictive Analytics'}
            </CardTitle>
          </div>
          <CardDescription>
            {isArabic ? 'توقعات مدعومة بالذكاء الاصطناعي لأعمالك' : 'AI-powered forecasts for your business'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Revenue Prediction */}
            <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50/50 to-sky-50/50 dark:from-blue-950/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200">
                  {isArabic ? 'توقع الإيرادات الأسبوعية' : 'Weekly Revenue Forecast'}
                </h4>
                <Badge variant="secondary" className="text-blue-700 dark:text-blue-400">
                  {predictiveData.nextWeekRevenue.confidence}% {isArabic ? 'ثقة' : 'confidence'}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-blue-800 dark:text-blue-300 mb-2">
                {predictiveData.nextWeekRevenue.prediction.toLocaleString()} {isArabic ? 'ريال' : 'SAR'}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground mb-2">
                  {isArabic ? 'العوامل المؤثرة:' : 'Contributing factors:'}
                </p>
                {predictiveData.nextWeekRevenue.factors.map((factor, index) => (
                  <div key={index} className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
                    {factor}
                  </div>
                ))}
              </div>
            </div>

            {/* Inventory Predictions */}
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-900 dark:text-blue-200">
                {isArabic ? 'توقعات المخزون' : 'Inventory Forecasts'}
              </h4>
              {predictiveData.inventoryNeeds.map((item, index) => (
                <div key={index} className="p-3 border rounded-lg bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm text-blue-900 dark:text-blue-200">{item.product}</p>
                    <Badge 
                      variant={item.daysUntilStockout <= 14 ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {item.daysUntilStockout} {isArabic ? 'يوم' : 'days'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">{isArabic ? 'المطلوب:' : 'Needed:'}</span>
                      <span className="font-medium ml-1">{item.predictedDemand}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{isArabic ? 'الحالي:' : 'Current:'}</span>
                      <span className="font-medium ml-1">{item.currentStock}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Progress 
                      value={item.confidenceLevel} 
                      className="h-2" 
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.confidenceLevel}% {isArabic ? 'دقة التوقع' : 'accuracy'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </SaudiCard>
    </div>
  );
}

export default BusinessIntelligenceDashboard;