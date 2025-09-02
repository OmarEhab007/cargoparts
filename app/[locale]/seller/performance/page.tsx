'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SARSymbol } from '@/components/ui/currency-symbol';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Zap,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Eye,
  ShoppingCart,
  Star,
  Lightbulb,
  Rocket,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Settings,
  RefreshCw,
  Download,
  Info,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Filter,
  Search,
  Globe,
  Smartphone,
  Monitor,
  Package,
  Truck,
  MessageCircle,
  Heart,
  Shield
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

interface PerformanceMetric {
  id: string;
  name: string;
  nameAr: string;
  current: number;
  target: number;
  previousMonth: number;
  trend: 'up' | 'down' | 'stable';
  category: 'sales' | 'customer' | 'operational' | 'quality';
  priority: 'high' | 'medium' | 'low';
  unit: string;
  description: string;
  descriptionAr: string;
}

interface Recommendation {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  category: 'sales' | 'marketing' | 'operations' | 'customer_service';
  estimatedROI: number;
  timeframe: string;
  timeframeAr: string;
  implemented: boolean;
}

interface CompetitorBenchmark {
  metric: string;
  metricAr: string;
  yourValue: number;
  marketAverage: number;
  topPerformer: number;
  unit: string;
}

const performanceMetrics: PerformanceMetric[] = [
  {
    id: '1',
    name: 'Conversion Rate',
    nameAr: 'معدل التحويل',
    current: 12.8,
    target: 15.0,
    previousMonth: 11.2,
    trend: 'up',
    category: 'sales',
    priority: 'high',
    unit: '%',
    description: 'Percentage of visitors who make a purchase',
    descriptionAr: 'نسبة الزوار الذين يقومون بعملية شراء'
  },
  {
    id: '2',
    name: 'Customer Satisfaction',
    nameAr: 'رضا العملاء',
    current: 4.6,
    target: 4.8,
    previousMonth: 4.4,
    trend: 'up',
    category: 'customer',
    priority: 'high',
    unit: '/5',
    description: 'Average customer rating across all orders',
    descriptionAr: 'متوسط تقييم العملاء لجميع الطلبات'
  },
  {
    id: '3',
    name: 'Response Time',
    nameAr: 'وقت الاستجابة',
    current: 12,
    target: 5,
    previousMonth: 18,
    trend: 'up',
    category: 'operational',
    priority: 'medium',
    unit: 'min',
    description: 'Average time to respond to customer inquiries',
    descriptionAr: 'متوسط الوقت للرد على استفسارات العملاء'
  },
  {
    id: '4',
    name: 'Return Rate',
    nameAr: 'معدل المرتجعات',
    current: 3.2,
    target: 2.0,
    previousMonth: 4.1,
    trend: 'up',
    category: 'quality',
    priority: 'high',
    unit: '%',
    description: 'Percentage of orders that are returned',
    descriptionAr: 'نسبة الطلبات التي يتم إرجاعها'
  },
  {
    id: '5',
    name: 'Average Order Value',
    nameAr: 'متوسط قيمة الطلب',
    current: 365,
    target: 400,
    previousMonth: 342,
    trend: 'up',
    category: 'sales',
    priority: 'medium',
    unit: 'SAR',
    description: 'Average monetary value per order',
    descriptionAr: 'متوسط القيمة النقدية لكل طلب'
  },
  {
    id: '6',
    name: 'Repeat Customer Rate',
    nameAr: 'معدل العملاء المتكررين',
    current: 34.5,
    target: 45.0,
    previousMonth: 31.2,
    trend: 'up',
    category: 'customer',
    priority: 'medium',
    unit: '%',
    description: 'Percentage of customers who make repeat purchases',
    descriptionAr: 'نسبة العملاء الذين يقومون بشراء متكرر'
  }
];

const recommendations: Recommendation[] = [
  {
    id: '1',
    title: 'Optimize Product Images',
    titleAr: 'تحسين صور المنتجات',
    description: 'Add more high-quality images for products with low conversion rates. Professional photos can increase sales by up to 30%.',
    descriptionAr: 'إضافة المزيد من الصور عالية الجودة للمنتجات ذات معدل التحويل المنخفض. الصور الاحترافية يمكن أن تزيد المبيعات بنسبة تصل إلى 30%.',
    impact: 'high',
    effort: 'medium',
    category: 'marketing',
    estimatedROI: 25,
    timeframe: '2-3 weeks',
    timeframeAr: '2-3 أسابيع',
    implemented: false
  },
  {
    id: '2',
    title: 'Implement Live Chat',
    titleAr: 'تطبيق المحادثة المباشرة',
    description: 'Add live chat support to reduce response time and improve customer satisfaction. This could increase conversion rates by 15-20%.',
    descriptionAr: 'إضافة دعم المحادثة المباشرة لتقليل وقت الاستجابة وتحسين رضا العملاء. هذا يمكن أن يزيد معدل التحويل بنسبة 15-20%.',
    impact: 'high',
    effort: 'high',
    category: 'customer_service',
    estimatedROI: 18,
    timeframe: '1-2 months',
    timeframeAr: '1-2 شهر',
    implemented: false
  },
  {
    id: '3',
    title: 'Bundle Related Products',
    titleAr: 'تجميع المنتجات ذات الصلة',
    description: 'Create product bundles for commonly purchased together items to increase average order value.',
    descriptionAr: 'إنشاء حزم المنتجات للعناصر التي عادة ما تُشترى معًا لزيادة متوسط قيمة الطلب.',
    impact: 'medium',
    effort: 'low',
    category: 'sales',
    estimatedROI: 12,
    timeframe: '1 week',
    timeframeAr: 'أسبوع واحد',
    implemented: false
  },
  {
    id: '4',
    title: 'Implement SMS Notifications',
    titleAr: 'تطبيق إشعارات الرسائل النصية',
    description: 'Send SMS updates for order status to improve customer experience and reduce support inquiries.',
    descriptionAr: 'إرسال تحديثات الرسائل النصية لحالة الطلب لتحسين تجربة العملاء وتقليل استفسارات الدعم.',
    impact: 'medium',
    effort: 'medium',
    category: 'operations',
    estimatedROI: 8,
    timeframe: '2-4 weeks',
    timeframeAr: '2-4 أسابيع',
    implemented: true
  }
];

const competitorBenchmarks: CompetitorBenchmark[] = [
  {
    metric: 'Response Time',
    metricAr: 'وقت الاستجابة',
    yourValue: 12,
    marketAverage: 8,
    topPerformer: 3,
    unit: 'min'
  },
  {
    metric: 'Conversion Rate',
    metricAr: 'معدل التحويل',
    yourValue: 12.8,
    marketAverage: 11.2,
    topPerformer: 18.5,
    unit: '%'
  },
  {
    metric: 'Customer Satisfaction',
    metricAr: 'رضا العملاء',
    yourValue: 4.6,
    marketAverage: 4.3,
    topPerformer: 4.9,
    unit: '/5'
  },
  {
    metric: 'Average Order Value',
    metricAr: 'متوسط قيمة الطلب',
    yourValue: 365,
    marketAverage: 320,
    topPerformer: 450,
    unit: 'SAR'
  }
];

const monthlyTrends = [
  { month: 'Jan', sales: 85, satisfaction: 4.2, conversion: 10.5 },
  { month: 'Feb', sales: 88, satisfaction: 4.3, conversion: 11.2 },
  { month: 'Mar', sales: 92, satisfaction: 4.4, conversion: 11.8 },
  { month: 'Apr', sales: 89, satisfaction: 4.1, conversion: 10.9 },
  { month: 'May', sales: 95, satisfaction: 4.5, conversion: 12.1 },
  { month: 'Jun', sales: 98, satisfaction: 4.6, conversion: 12.8 },
];

export default function PerformancePage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showRecommendationDialog, setShowRecommendationDialog] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  
  const filteredMetrics = selectedCategory === 'all' 
    ? performanceMetrics 
    : performanceMetrics.filter(metric => metric.category === selectedCategory);
  
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(isArabic ? 'ar-SA' : 'en-US');
  };
  
  const getTrendIcon = (trend: string, current: number, target: number) => {
    if (trend === 'up') {
      return current >= target 
        ? <CheckCircle className="h-4 w-4 text-green-600" />
        : <TrendingUp className="h-4 w-4 text-blue-600" />;
    } else if (trend === 'down') {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <div className="h-4 w-4 rounded-full bg-gray-300" />;
  };
  
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  
  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  
  const calculateOverallScore = () => {
    const totalScore = performanceMetrics.reduce((sum, metric) => {
      return sum + (metric.current / metric.target) * 100;
    }, 0);
    return Math.round(totalScore / performanceMetrics.length);
  };
  
  const overallScore = calculateOverallScore();
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold card-title-enhanced mb-2">
            {isArabic ? 'تحسين الأداء' : 'Performance Optimization'}
          </h1>
          <p className="text-muted-foreground text-label">
            {isArabic 
              ? `درجة الأداء العامة: ${overallScore}% • ${recommendations.filter(r => !r.implemented).length} توصية متاحة`
              : `Overall performance score: ${overallScore}% • ${recommendations.filter(r => !r.implemented).length} recommendations available`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="me-2 h-4 w-4" />
            {isArabic ? 'تحديث' : 'Refresh'}
          </Button>
          <Button variant="outline">
            <Download className="me-2 h-4 w-4" />
            {isArabic ? 'تقرير الأداء' : 'Performance Report'}
          </Button>
        </div>
      </div>
      
      {/* Overall Performance Score */}
      <Card className="performance-card-gradient">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                {isArabic ? 'درجة الأداء العامة' : 'Overall Performance Score'}
              </CardTitle>
              <CardDescription className="mt-2">
                {isArabic 
                  ? 'مقياس شامل لأداء متجرك مقارنة بالأهداف المحددة'
                  : 'Comprehensive measure of your store performance against set targets'}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary mb-2">{overallScore}%</div>
              <div className="flex items-center gap-1">
                {overallScore >= 80 ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : overallScore >= 60 ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
                <span className={`text-sm font-medium ${
                  overallScore >= 80 ? 'text-green-600' : 
                  overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {overallScore >= 80 ? (isArabic ? 'ممتاز' : 'Excellent') :
                   overallScore >= 60 ? (isArabic ? 'جيد' : 'Good') : (isArabic ? 'يحتاج تحسين' : 'Needs Improvement')}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Progress value={overallScore} className="h-3 mb-2" />
              <p className="text-sm text-muted-foreground">
                {isArabic ? 'هدف الشهر القادم: 85%' : 'Next month target: 85%'}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600">{isArabic ? 'متفوق' : 'Excelling'}</span>
                <span className="font-medium">
                  {performanceMetrics.filter(m => m.current >= m.target).length}/{performanceMetrics.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-yellow-600">{isArabic ? 'يحتاج تحسين' : 'Needs Improvement'}</span>
                <span className="font-medium">
                  {performanceMetrics.filter(m => m.current < m.target).length}/{performanceMetrics.length}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">{isArabic ? 'المؤشرات' : 'Metrics'}</TabsTrigger>
          <TabsTrigger value="recommendations">{isArabic ? 'التوصيات' : 'Recommendations'}</TabsTrigger>
          <TabsTrigger value="benchmarks">{isArabic ? 'المقارنة' : 'Benchmarks'}</TabsTrigger>
          <TabsTrigger value="trends">{isArabic ? 'الاتجاهات' : 'Trends'}</TabsTrigger>
        </TabsList>
        
        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Performance Radar Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{isArabic ? 'خريطة الأداء' : 'Performance Radar'}</CardTitle>
                <CardDescription>
                  {isArabic ? 'نظرة شاملة على جميع مؤشرات الأداء' : 'Comprehensive view of all performance indicators'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={performanceMetrics.map(metric => ({
                    name: isArabic ? metric.nameAr : metric.name,
                    current: (metric.current / metric.target) * 100,
                    target: 100
                  }))}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis angle={90} domain={[0, 120]} />
                    <Radar
                      name={isArabic ? 'الأداء الحالي' : 'Current Performance'}
                      dataKey="current"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name={isArabic ? 'الهدف' : 'Target'}
                      dataKey="target"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.1}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? 'إجراءات سريعة' : 'Quick Actions'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Target className="mr-2 h-4 w-4" />
                  {isArabic ? 'تحديث الأهداف' : 'Update Targets'}
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  {isArabic ? 'تحليل مفصل' : 'Detailed Analysis'}
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Rocket className="mr-2 h-4 w-4" />
                  {isArabic ? 'خطة التحسين' : 'Improvement Plan'}
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Award className="mr-2 h-4 w-4" />
                  {isArabic ? 'تقرير الإنجازات' : 'Achievement Report'}
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMetrics.map((metric) => (
              <Card key={metric.id} className="relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {isArabic ? metric.nameAr : metric.name}
                    </CardTitle>
                    <Badge variant={metric.priority === 'high' ? 'destructive' : metric.priority === 'medium' ? 'default' : 'secondary'}>
                      {metric.priority === 'high' ? (isArabic ? 'عالية' : 'High') :
                       metric.priority === 'medium' ? (isArabic ? 'متوسطة' : 'Medium') :
                       (isArabic ? 'منخفضة' : 'Low')}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isArabic ? metric.descriptionAr : metric.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {metric.unit === 'SAR' ? formatCurrency(metric.current) : metric.current}
                        <span className="text-lg text-muted-foreground ml-1">{metric.unit}</span>
                      </div>
                      {getTrendIcon(metric.trend, metric.current, metric.target)}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {isArabic ? 'الهدف:' : 'Target:'} {metric.target}{metric.unit}
                        </span>
                        <span className={`font-medium ${
                          metric.current >= metric.target ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {Math.round((metric.current / metric.target) * 100)}%
                        </span>
                      </div>
                      <Progress value={(metric.current / metric.target) * 100} className="h-2" />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {isArabic ? 'الشهر الماضي:' : 'Last month:'} {metric.previousMonth}{metric.unit}
                      </span>
                      <div className="flex items-center gap-1">
                        {metric.trend === 'up' ? (
                          <ArrowUpRight className="h-3 w-3 text-green-600" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 text-red-600" />
                        )}
                        <span className={metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                          {Math.abs(((metric.current - metric.previousMonth) / metric.previousMonth) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                {/* Priority indicator */}
                <div className={`absolute top-0 right-0 w-2 h-full ${
                  metric.priority === 'high' ? 'bg-red-500' :
                  metric.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="space-y-4">
            {recommendations.map((recommendation) => (
              <Card key={recommendation.id} className="relative">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {isArabic ? recommendation.titleAr : recommendation.title}
                        </h3>
                        {recommendation.implemented && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle className="h-3 w-3 me-1" />
                            {isArabic ? 'تم التنفيذ' : 'Implemented'}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground mb-4">
                        {isArabic ? recommendation.descriptionAr : recommendation.description}
                      </p>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {isArabic ? 'التأثير:' : 'Impact:'}
                          </span>
                          <Badge className={`${getImpactColor(recommendation.impact)} badge-text`}>
                            {recommendation.impact === 'high' ? (isArabic ? 'عالي' : 'High') :
                             recommendation.impact === 'medium' ? (isArabic ? 'متوسط' : 'Medium') :
                             (isArabic ? 'منخفض' : 'Low')}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {isArabic ? 'الجهد:' : 'Effort:'}
                          </span>
                          <Badge className={`${getEffortColor(recommendation.effort)} badge-text`}>
                            {recommendation.effort === 'high' ? (isArabic ? 'عالي' : 'High') :
                             recommendation.effort === 'medium' ? (isArabic ? 'متوسط' : 'Medium') :
                             (isArabic ? 'منخفض' : 'Low')}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {isArabic ? 'العائد المتوقع:' : 'Est. ROI:'}
                          </span>
                          <span className="font-semibold text-green-600">+{recommendation.estimatedROI}%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            {isArabic ? recommendation.timeframeAr : recommendation.timeframe}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRecommendation(recommendation);
                              setShowRecommendationDialog(true);
                            }}
                          >
                            <Info className="h-4 w-4 me-1" />
                            {isArabic ? 'التفاصيل' : 'Details'}
                          </Button>
                          
                          {!recommendation.implemented && (
                            <Button size="sm">
                              <Rocket className="h-4 w-4 me-1" />
                              {isArabic ? 'تنفيذ' : 'Implement'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                {/* Priority indicator */}
                <div className={`absolute top-0 left-0 w-1 h-full ${
                  recommendation.impact === 'high' ? 'bg-red-500' :
                  recommendation.impact === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Benchmarks Tab */}
        <TabsContent value="benchmarks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'مقارنة مع السوق' : 'Market Benchmarking'}</CardTitle>
              <CardDescription>
                {isArabic 
                  ? 'مقارنة أداء متجرك مع متوسط السوق وأفضل المتاجر'
                  : 'Compare your store performance against market average and top performers'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {competitorBenchmarks.map((benchmark, index) => (
                  <div key={index} className="space-y-3">
                    <h4 className="font-medium">
                      {isArabic ? benchmark.metricAr : benchmark.metric}
                    </h4>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                          <span className="text-sm">{isArabic ? 'متجرك' : 'Your Store'}</span>
                        </div>
                        <span className="font-semibold">
                          {benchmark.yourValue}{benchmark.unit}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gray-400" />
                          <span className="text-sm">{isArabic ? 'متوسط السوق' : 'Market Average'}</span>
                        </div>
                        <span className="font-medium">
                          {benchmark.marketAverage}{benchmark.unit}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <span className="text-sm">{isArabic ? 'الأفضل في السوق' : 'Top Performer'}</span>
                        </div>
                        <span className="font-semibold text-green-600">
                          {benchmark.topPerformer}{benchmark.unit}
                        </span>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-blue-500 rounded-full"
                          style={{ width: `${(benchmark.yourValue / benchmark.topPerformer) * 100}%` }}
                        />
                      </div>
                      <div className="absolute top-0 left-0 w-full h-2 flex items-center">
                        <div 
                          className="w-0.5 h-4 bg-gray-400"
                          style={{ marginLeft: `${(benchmark.marketAverage / benchmark.topPerformer) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {benchmark.yourValue > benchmark.marketAverage ? (
                        <span className="text-green-600">
                          {isArabic ? 'أعلى من متوسط السوق' : 'Above market average'}
                        </span>
                      ) : (
                        <span className="text-red-600">
                          {isArabic ? 'أقل من متوسط السوق' : 'Below market average'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'اتجاهات الأداء' : 'Performance Trends'}</CardTitle>
              <CardDescription>
                {isArabic ? 'تتبع تحسن الأداء عبر الوقت' : 'Track performance improvement over time'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    name={isArabic ? 'المبيعات' : 'Sales'}
                  />
                  <Area
                    type="monotone"
                    dataKey="satisfaction"
                    stackId="2"
                    stroke="#10b981"
                    fill="#10b981"
                    name={isArabic ? 'الرضا' : 'Satisfaction'}
                  />
                  <Area
                    type="monotone"
                    dataKey="conversion"
                    stackId="3"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    name={isArabic ? 'التحويل' : 'Conversion'}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Recommendation Details Dialog */}
      <Dialog open={showRecommendationDialog} onOpenChange={setShowRecommendationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedRecommendation && (
                isArabic ? selectedRecommendation.titleAr : selectedRecommendation.title
              )}
            </DialogTitle>
            <DialogDescription>
              {isArabic ? 'تفاصيل التوصية وخطة التنفيذ' : 'Recommendation details and implementation plan'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecommendation && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                {isArabic ? selectedRecommendation.descriptionAr : selectedRecommendation.description}
              </p>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">+{selectedRecommendation.estimatedROI}%</div>
                  <div className="text-sm text-muted-foreground">
                    {isArabic ? 'العائد المتوقع' : 'Expected ROI'}
                  </div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-semibold">
                    {isArabic ? selectedRecommendation.timeframeAr : selectedRecommendation.timeframe}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isArabic ? 'الإطار الزمني' : 'Timeframe'}
                  </div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-semibold capitalize">
                    {selectedRecommendation.impact === 'high' ? (isArabic ? 'عالي' : 'High') :
                     selectedRecommendation.impact === 'medium' ? (isArabic ? 'متوسط' : 'Medium') :
                     (isArabic ? 'منخفض' : 'Low')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isArabic ? 'التأثير المتوقع' : 'Expected Impact'}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecommendationDialog(false)}>
              {isArabic ? 'إغلاق' : 'Close'}
            </Button>
            {selectedRecommendation && !selectedRecommendation.implemented && (
              <Button>
                <Rocket className="h-4 w-4 me-1" />
                {isArabic ? 'بدء التنفيذ' : 'Start Implementation'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}