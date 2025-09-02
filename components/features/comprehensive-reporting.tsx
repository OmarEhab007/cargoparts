'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SaudiCard, SaudiHeader } from '@/components/ui/saudi-theme';
import {
  FileText,
  Download,
  Share,
  Calendar as CalendarIcon,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  Star,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Filter,
  Settings,
  Eye,
  Mail,
  Printer,
  Save,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Copy,
  Bookmark,
  Activity,
  Zap,
  Brain,
} from 'lucide-react';
import { format, addDays, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

// Comprehensive Reporting Interfaces
interface Report {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  type: 'sales' | 'inventory' | 'financial' | 'customer' | 'performance' | 'compliance';
  format: 'pdf' | 'excel' | 'csv' | 'json';
  schedule: 'manual' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  recipients: string[];
  lastGenerated: string;
  nextScheduled?: string;
  status: 'active' | 'paused' | 'error';
  metrics: ReportMetric[];
  filters: ReportFilter[];
  visualizations: ReportVisualization[];
}

interface ReportMetric {
  id: string;
  name: string;
  nameAr: string;
  value: number;
  previousValue: number;
  change: number;
  target?: number;
  format: 'currency' | 'number' | 'percentage';
  trend: 'up' | 'down' | 'stable';
}

interface ReportFilter {
  id: string;
  field: string;
  operator: string;
  value: string | number | Date;
  label: string;
  labelAr: string;
}

interface ReportVisualization {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'area' | 'table';
  title: string;
  titleAr: string;
  data: any[];
  config: any;
}

interface CustomReportBuilder {
  name: string;
  nameAr: string;
  dateRange: { from: Date; to: Date };
  metrics: string[];
  dimensions: string[];
  filters: ReportFilter[];
  groupBy: string;
  sortBy: string;
  limit: number;
  includeVisualizations: boolean;
}

interface ReportTemplate {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  metrics: string[];
  defaultFilters: ReportFilter[];
  isBuiltIn: boolean;
  usageCount: number;
}

export function ComprehensiveReporting() {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const [selectedDateRange, setSelectedDateRange] = useState<{from: Date | undefined, to: Date | undefined}>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });

  const [customReport, setCustomReport] = useState<CustomReportBuilder>({
    name: '',
    nameAr: '',
    dateRange: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) },
    metrics: [],
    dimensions: [],
    filters: [],
    groupBy: 'date',
    sortBy: 'date',
    limit: 1000,
    includeVisualizations: true,
  });

  // Mock reporting data
  const [reports] = useState<Report[]>([
    {
      id: '1',
      name: 'Monthly Sales Report',
      nameAr: 'تقرير المبيعات الشهري',
      description: 'Comprehensive monthly sales analysis with trends and comparisons',
      descriptionAr: 'تحليل شامل للمبيعات الشهرية مع الاتجاهات والمقارنات',
      type: 'sales',
      format: 'pdf',
      schedule: 'monthly',
      recipients: ['manager@cargoparts.sa', 'finance@cargoparts.sa'],
      lastGenerated: '2024-12-01T09:00:00Z',
      nextScheduled: '2025-01-01T09:00:00Z',
      status: 'active',
      metrics: [
        {
          id: '1',
          name: 'Total Revenue',
          nameAr: 'إجمالي الإيرادات',
          value: 245600,
          previousValue: 218400,
          change: 12.4,
          target: 250000,
          format: 'currency',
          trend: 'up',
        },
        {
          id: '2',
          name: 'Orders Count',
          nameAr: 'عدد الطلبات',
          value: 342,
          previousValue: 298,
          change: 14.8,
          target: 350,
          format: 'number',
          trend: 'up',
        },
      ],
      filters: [],
      visualizations: [],
    },
    {
      id: '2',
      name: 'Inventory Status Report',
      nameAr: 'تقرير حالة المخزون',
      description: 'Current inventory levels, low stock alerts, and turnover analysis',
      descriptionAr: 'مستويات المخزون الحالية، تنبيهات انخفاض المخزون، وتحليل دوران المخزون',
      type: 'inventory',
      format: 'excel',
      schedule: 'weekly',
      recipients: ['inventory@cargoparts.sa'],
      lastGenerated: '2024-12-16T08:00:00Z',
      nextScheduled: '2024-12-23T08:00:00Z',
      status: 'active',
      metrics: [
        {
          id: '3',
          name: 'Total Inventory Value',
          nameAr: 'قيمة المخزون الإجمالية',
          value: 1250000,
          previousValue: 1180000,
          change: 5.9,
          format: 'currency',
          trend: 'up',
        },
        {
          id: '4',
          name: 'Low Stock Items',
          nameAr: 'المنتجات منخفضة المخزون',
          value: 18,
          previousValue: 22,
          change: -18.2,
          format: 'number',
          trend: 'down',
        },
      ],
      filters: [],
      visualizations: [],
    },
    {
      id: '3',
      name: 'Customer Analytics Report',
      nameAr: 'تقرير تحليلات العملاء',
      description: 'Customer behavior, retention, and satisfaction metrics',
      descriptionAr: 'سلوك العملاء، الاحتفاظ بهم، ومقاييس الرضا',
      type: 'customer',
      format: 'pdf',
      schedule: 'quarterly',
      recipients: ['marketing@cargoparts.sa'],
      lastGenerated: '2024-10-01T10:00:00Z',
      nextScheduled: '2025-01-01T10:00:00Z',
      status: 'active',
      metrics: [
        {
          id: '5',
          name: 'Total Customers',
          nameAr: 'إجمالي العملاء',
          value: 2845,
          previousValue: 2654,
          change: 7.2,
          format: 'number',
          trend: 'up',
        },
        {
          id: '6',
          name: 'Customer Satisfaction',
          nameAr: 'رضا العملاء',
          value: 4.8,
          previousValue: 4.6,
          change: 4.3,
          format: 'number',
          trend: 'up',
        },
      ],
      filters: [],
      visualizations: [],
    },
  ]);

  const [reportTemplates] = useState<ReportTemplate[]>([
    {
      id: '1',
      name: 'Daily Performance Dashboard',
      nameAr: 'لوحة الأداء اليومية',
      description: 'Key performance indicators for daily operations',
      descriptionAr: 'مؤشرات الأداء الرئيسية للعمليات اليومية',
      category: 'performance',
      metrics: ['revenue', 'orders', 'inventory_alerts', 'customer_satisfaction'],
      defaultFilters: [],
      isBuiltIn: true,
      usageCount: 156,
    },
    {
      id: '2',
      name: 'Financial Summary',
      nameAr: 'الملخص المالي',
      description: 'Comprehensive financial overview with P&L analysis',
      descriptionAr: 'نظرة عامة مالية شاملة مع تحليل الأرباح والخسائر',
      category: 'financial',
      metrics: ['revenue', 'profit', 'expenses', 'cash_flow'],
      defaultFilters: [],
      isBuiltIn: true,
      usageCount: 89,
    },
    {
      id: '3',
      name: 'Sales Analysis',
      nameAr: 'تحليل المبيعات',
      description: 'Detailed sales breakdown by products, regions, and time periods',
      descriptionAr: 'تفصيل مفصل للمبيعات حسب المنتجات والمناطق والفترات الزمنية',
      category: 'sales',
      metrics: ['sales_revenue', 'units_sold', 'conversion_rate', 'avg_order_value'],
      defaultFilters: [],
      isBuiltIn: true,
      usageCount: 234,
    },
    {
      id: '4',
      name: 'Inventory Optimization',
      nameAr: 'تحسين المخزون',
      description: 'Inventory turnover, stock levels, and reorder recommendations',
      descriptionAr: 'دوران المخزون، مستويات المخزون، وتوصيات إعادة الطلب',
      category: 'inventory',
      metrics: ['inventory_turnover', 'stock_levels', 'reorder_points', 'carrying_cost'],
      defaultFilters: [],
      isBuiltIn: true,
      usageCount: 67,
    },
  ]);

  const availableMetrics = [
    { id: 'revenue', name: isArabic ? 'الإيرادات' : 'Revenue' },
    { id: 'orders', name: isArabic ? 'الطلبات' : 'Orders' },
    { id: 'customers', name: isArabic ? 'العملاء' : 'Customers' },
    { id: 'inventory_value', name: isArabic ? 'قيمة المخزون' : 'Inventory Value' },
    { id: 'profit_margin', name: isArabic ? 'هامش الربح' : 'Profit Margin' },
    { id: 'conversion_rate', name: isArabic ? 'معدل التحويل' : 'Conversion Rate' },
    { id: 'avg_order_value', name: isArabic ? 'متوسط قيمة الطلب' : 'Average Order Value' },
    { id: 'customer_satisfaction', name: isArabic ? 'رضا العملاء' : 'Customer Satisfaction' },
  ];

  const availableDimensions = [
    { id: 'date', name: isArabic ? 'التاريخ' : 'Date' },
    { id: 'category', name: isArabic ? 'الفئة' : 'Category' },
    { id: 'brand', name: isArabic ? 'العلامة التجارية' : 'Brand' },
    { id: 'region', name: isArabic ? 'المنطقة' : 'Region' },
    { id: 'store', name: isArabic ? 'المتجر' : 'Store' },
    { id: 'customer_segment', name: isArabic ? 'شريحة العملاء' : 'Customer Segment' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'paused':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sales':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'inventory':
        return <Package className="h-4 w-4 text-blue-600" />;
      case 'financial':
        return <DollarSign className="h-4 w-4 text-amber-600" />;
      case 'customer':
        return <Users className="h-4 w-4 text-purple-600" />;
      case 'performance':
        return <Target className="h-4 w-4 text-red-600" />;
      case 'compliance':
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatMetricValue = (metric: ReportMetric) => {
    switch (metric.format) {
      case 'currency':
        return `${metric.value.toLocaleString()} SAR`;
      case 'percentage':
        return `${metric.value}%`;
      default:
        return metric.value.toLocaleString();
    }
  };

  const generateReport = () => {
    // Logic to generate custom report
    console.log('Generating report with:', customReport);
  };

  const scheduleReport = (reportId: string) => {
    // Logic to schedule report
    console.log('Scheduling report:', reportId);
  };

  const exportReport = (reportId: string, format: string) => {
    // Logic to export report
    console.log('Exporting report:', reportId, 'in format:', format);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <SaudiHeader
          title={isArabic ? 'نظام التقارير الشامل' : 'Comprehensive Reporting System'}
          subtitle={isArabic ? 'تقارير متقدمة وتحليلات مخصصة لأعمالك' : 'Advanced reports and custom analytics for your business'}
          variant="green"
        />
        <div className="flex gap-2">
          <Button variant="outline">
            <Brain className="h-4 w-4 mr-2" />
            {isArabic ? 'تقرير ذكي' : 'Smart Report'}
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {isArabic ? 'تقرير جديد' : 'New Report'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="scheduled" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scheduled">
            <Clock className="h-4 w-4 mr-2" />
            {isArabic ? 'التقارير المجدولة' : 'Scheduled Reports'}
          </TabsTrigger>
          <TabsTrigger value="custom">
            <Settings className="h-4 w-4 mr-2" />
            {isArabic ? 'منشئ التقارير' : 'Report Builder'}
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Bookmark className="h-4 w-4 mr-2" />
            {isArabic ? 'القوالب' : 'Templates'}
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            {isArabic ? 'التحليلات السريعة' : 'Quick Analytics'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scheduled" className="space-y-6">
          <SaudiCard variant="green">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-green-800 dark:text-green-300">
                  {isArabic ? 'التقارير المجدولة والتلقائية' : 'Scheduled & Automated Reports'}
                </CardTitle>
                <Badge variant="secondary">
                  {reports.length} {isArabic ? 'تقرير' : 'reports'}
                </Badge>
              </div>
              <CardDescription>
                {isArabic ? 'تقارير تُنشأ وتُرسل تلقائياً حسب الجدولة المحددة' : 'Reports that are automatically generated and sent on schedule'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="p-4 border rounded-lg bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-950/20">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        {getTypeIcon(report.type)}
                        <div>
                          <h4 className="font-semibold text-green-900 dark:text-green-200">
                            {isArabic ? report.nameAr : report.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {isArabic ? report.descriptionAr : report.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {report.schedule === 'daily' ? (isArabic ? 'يومي' : 'Daily') :
                               report.schedule === 'weekly' ? (isArabic ? 'أسبوعي' : 'Weekly') :
                               report.schedule === 'monthly' ? (isArabic ? 'شهري' : 'Monthly') :
                               report.schedule === 'quarterly' ? (isArabic ? 'ربع سنوي' : 'Quarterly') :
                               (isArabic ? 'سنوي' : 'Yearly')}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {report.format.toUpperCase()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {report.recipients.length} {isArabic ? 'مستقبل' : 'recipients'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(report.status)}>
                          {report.status === 'active' ? (isArabic ? 'نشط' : 'Active') :
                           report.status === 'paused' ? (isArabic ? 'متوقف' : 'Paused') :
                           (isArabic ? 'خطأ' : 'Error')}
                        </Badge>
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 mb-4">
                      {report.metrics.map((metric) => (
                        <div key={metric.id} className="p-3 bg-green-50/50 dark:bg-green-950/20 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">
                              {isArabic ? metric.nameAr : metric.name}
                            </span>
                            <div className="flex items-center gap-1">
                              {metric.trend === 'up' ? (
                                <TrendingUp className="h-3 w-3 text-green-600" />
                              ) : metric.trend === 'down' ? (
                                <TrendingDown className="h-3 w-3 text-red-600" />
                              ) : (
                                <div className="h-3 w-3" />
                              )}
                              <span className={`text-xs ${metric.change > 0 ? 'text-green-600' : metric.change < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                {metric.change > 0 ? '+' : ''}{metric.change}%
                              </span>
                            </div>
                          </div>
                          <div className="text-sm font-bold text-green-800 dark:text-green-300">
                            {formatMetricValue(metric)}
                          </div>
                          {metric.target && (
                            <div className="text-xs text-muted-foreground">
                              {isArabic ? 'الهدف:' : 'Target:'} {formatMetricValue({ ...metric, value: metric.target })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Last Generated & Next Scheduled */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <span>
                        {isArabic ? 'آخر إنشاء:' : 'Last generated:'} {new Date(report.lastGenerated).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                      </span>
                      {report.nextScheduled && (
                        <span>
                          {isArabic ? 'التالي:' : 'Next:'} {new Date(report.nextScheduled).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t">
                      <Button size="sm" variant="outline" onClick={() => exportReport(report.id, 'pdf')}>
                        <Download className="h-3 w-3 mr-1" />
                        {isArabic ? 'تحميل' : 'Download'}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        {isArabic ? 'معاينة' : 'Preview'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => scheduleReport(report.id)}>
                        <RefreshCw className="h-3 w-3 mr-1" />
                        {isArabic ? 'إنشاء الآن' : 'Generate Now'}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3 mr-1" />
                        {isArabic ? 'تحرير' : 'Edit'}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share className="h-3 w-3 mr-1" />
                        {isArabic ? 'مشاركة' : 'Share'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </SaudiCard>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <SaudiCard variant="sky">
            <CardHeader>
              <CardTitle className="text-blue-800 dark:text-blue-300">
                {isArabic ? 'منشئ التقارير المخصصة' : 'Custom Report Builder'}
              </CardTitle>
              <CardDescription>
                {isArabic ? 'إنشاء تقارير مخصصة حسب احتياجاتك' : 'Create custom reports tailored to your specific needs'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Report Name */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="reportName">{isArabic ? 'اسم التقرير' : 'Report Name'}</Label>
                    <Input
                      id="reportName"
                      placeholder={isArabic ? 'مثال: تقرير المبيعات المخصص' : 'e.g., Custom Sales Report'}
                      value={customReport.name}
                      onChange={(e) => setCustomReport({...customReport, name: e.target.value})}
                    />
                  </div>
                  {isArabic && (
                    <div>
                      <Label htmlFor="reportNameAr">اسم التقرير بالعربية</Label>
                      <Input
                        id="reportNameAr"
                        placeholder="مثال: تقرير المبيعات المخصص"
                        value={customReport.nameAr}
                        onChange={(e) => setCustomReport({...customReport, nameAr: e.target.value})}
                      />
                    </div>
                  )}
                </div>

                {/* Date Range */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>{isArabic ? 'من تاريخ' : 'From Date'}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {customReport.dateRange.from ? (
                            format(customReport.dateRange.from, 'PPP', { locale: isArabic ? ar : enUS })
                          ) : (
                            <span>{isArabic ? 'اختر تاريخ البداية' : 'Pick start date'}</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={customReport.dateRange.from}
                          onSelect={(date) => setCustomReport({...customReport, dateRange: {...customReport.dateRange, from: date!}})}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>{isArabic ? 'إلى تاريخ' : 'To Date'}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {customReport.dateRange.to ? (
                            format(customReport.dateRange.to, 'PPP', { locale: isArabic ? ar : enUS })
                          ) : (
                            <span>{isArabic ? 'اختر تاريخ النهاية' : 'Pick end date'}</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={customReport.dateRange.to}
                          onSelect={(date) => setCustomReport({...customReport, dateRange: {...customReport.dateRange, to: date!}})}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Metrics Selection */}
                <div>
                  <Label className="text-base font-semibold">{isArabic ? 'المقاييس' : 'Metrics'}</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    {isArabic ? 'اختر المقاييس التي تريد تضمينها في التقرير' : 'Select the metrics to include in your report'}
                  </p>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {availableMetrics.map((metric) => (
                      <div key={metric.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`metric-${metric.id}`}
                          checked={customReport.metrics.includes(metric.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCustomReport({...customReport, metrics: [...customReport.metrics, metric.id]});
                            } else {
                              setCustomReport({...customReport, metrics: customReport.metrics.filter(m => m !== metric.id)});
                            }
                          }}
                        />
                        <Label htmlFor={`metric-${metric.id}`} className="text-sm font-normal">
                          {metric.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dimensions Selection */}
                <div>
                  <Label className="text-base font-semibold">{isArabic ? 'الأبعاد' : 'Dimensions'}</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    {isArabic ? 'اختر كيف تريد تجميع البيانات' : 'Select how you want to group your data'}
                  </p>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {availableDimensions.map((dimension) => (
                      <div key={dimension.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`dimension-${dimension.id}`}
                          checked={customReport.dimensions.includes(dimension.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCustomReport({...customReport, dimensions: [...customReport.dimensions, dimension.id]});
                            } else {
                              setCustomReport({...customReport, dimensions: customReport.dimensions.filter(d => d !== dimension.id)});
                            }
                          }}
                        />
                        <Label htmlFor={`dimension-${dimension.id}`} className="text-sm font-normal">
                          {dimension.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Report Configuration */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label>{isArabic ? 'ترتيب حسب' : 'Sort By'}</Label>
                    <Select value={customReport.sortBy} onValueChange={(value) => setCustomReport({...customReport, sortBy: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">{isArabic ? 'التاريخ' : 'Date'}</SelectItem>
                        <SelectItem value="value">{isArabic ? 'القيمة' : 'Value'}</SelectItem>
                        <SelectItem value="name">{isArabic ? 'الاسم' : 'Name'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{isArabic ? 'عدد النتائج' : 'Limit Results'}</Label>
                    <Input
                      type="number"
                      value={customReport.limit}
                      onChange={(e) => setCustomReport({...customReport, limit: parseInt(e.target.value) || 1000})}
                    />
                  </div>
                  <div className="flex items-center space-x-2 mt-6">
                    <input
                      type="checkbox"
                      id="includeVisualizations"
                      checked={customReport.includeVisualizations}
                      onChange={(e) => setCustomReport({...customReport, includeVisualizations: e.target.checked})}
                    />
                    <Label htmlFor="includeVisualizations">
                      {isArabic ? 'تضمين المخططات البيانية' : 'Include Visualizations'}
                    </Label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t">
                  <Button onClick={generateReport} className="flex-1">
                    <Zap className="h-4 w-4 mr-2" />
                    {isArabic ? 'إنشاء التقرير' : 'Generate Report'}
                  </Button>
                  <Button variant="outline">
                    <Save className="h-4 w-4 mr-2" />
                    {isArabic ? 'حفظ كقالب' : 'Save as Template'}
                  </Button>
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    {isArabic ? 'معاينة' : 'Preview'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </SaudiCard>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <SaudiCard variant="gold">
            <CardHeader>
              <CardTitle className="text-amber-800 dark:text-amber-300">
                {isArabic ? 'قوالب التقارير' : 'Report Templates'}
              </CardTitle>
              <CardDescription>
                {isArabic ? 'قوالب جاهزة لإنشاء التقارير بسرعة' : 'Ready-made templates for quick report generation'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reportTemplates.map((template) => (
                  <div key={template.id} className="p-4 border rounded-lg bg-gradient-to-br from-amber-50/50 to-yellow-50/50 dark:from-amber-950/20">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-amber-900 dark:text-amber-200">
                          {isArabic ? template.nameAr : template.name}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {isArabic ? template.descriptionAr : template.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {template.isBuiltIn && (
                          <Badge variant="secondary" className="text-xs">
                            {isArabic ? 'مدمج' : 'Built-in'}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{isArabic ? 'الفئة:' : 'Category:'}</span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {template.category}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{isArabic ? 'الاستخدام:' : 'Usage:'}</span>
                        <span className="font-medium">{template.usageCount}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Zap className="h-3 w-3 mr-1" />
                        {isArabic ? 'استخدام' : 'Use Template'}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </SaudiCard>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <SaudiCard variant="sky">
            <CardHeader>
              <CardTitle className="text-blue-800 dark:text-blue-300">
                {isArabic ? 'التحليلات السريعة' : 'Quick Analytics Dashboard'}
              </CardTitle>
              <CardDescription>
                {isArabic ? 'رؤى فورية ومقاييس أداء رئيسية' : 'Instant insights and key performance indicators'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Performance Overview */}
                <div className="p-4 bg-gradient-to-br from-blue-50/50 to-sky-50/50 dark:from-blue-950/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-900 dark:text-blue-200">
                      {isArabic ? 'نظرة عامة على الأداء' : 'Performance Overview'}
                    </h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{isArabic ? 'الإيرادات:' : 'Revenue:'}</span>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">245.6K SAR</span>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{isArabic ? 'الطلبات:' : 'Orders:'}</span>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">342</span>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{isArabic ? 'العملاء:' : 'Customers:'}</span>
                      <span className="font-semibold">2,845</span>
                    </div>
                  </div>
                </div>

                {/* Top Categories */}
                <div className="p-4 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <PieChart className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-900 dark:text-green-200">
                      {isArabic ? 'أفضل الفئات' : 'Top Categories'}
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{isArabic ? 'محركات' : 'Engines'}</span>
                      <span className="font-semibold">35%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>{isArabic ? 'فرامل' : 'Brakes'}</span>
                      <span className="font-semibold">28%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>{isArabic ? 'ناقل حركة' : 'Transmission'}</span>
                      <span className="font-semibold">22%</span>
                    </div>
                  </div>
                </div>

                {/* Recent Trends */}
                <div className="p-4 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <h4 className="font-semibold text-purple-900 dark:text-purple-200">
                      {isArabic ? 'الاتجاهات الحديثة' : 'Recent Trends'}
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span>{isArabic ? 'نمو المبيعات 18%' : '18% Sales Growth'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span>{isArabic ? 'زيادة العملاء الجدد' : 'New Customer Growth'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <span>{isArabic ? 'انخفاض المرتجعات' : 'Reduced Returns'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </SaudiCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ComprehensiveReporting;