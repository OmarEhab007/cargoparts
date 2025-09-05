'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { SaudiCard, SaudiHeader } from '@/components/ui/saudi-theme';
import { SARSymbol } from '@/components/ui/currency-symbol';
import {
  Receipt,
  Calendar as CalendarIcon,
  Truck,
  FileText,
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calculator,
  Download,
  Upload,
  Eye,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  Flag,
  Shield,
  Award,
  Target,
  Activity,
  BarChart3,
  PieChart,
  TrendingUp,
  Settings,
  Filter,
  Search,
  RefreshCw,
  Save,
  Send,
  Printer,
  Copy,
  Share,
  ExternalLink,
  Package,
  CreditCard,
  DollarSign,
  Users,
  Crown,
  Zap,
  AlertTriangle,
  Info
} from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { ar } from 'date-fns/locale';

interface VATReport {
  id: string;
  period: string;
  periodHijri: string;
  startDate: string;
  endDate: string;
  totalSales: number;
  vatableAmount: number;
  vatAmount: number;
  exemptAmount: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: string;
  approvedAt?: string;
  rejectionReason?: string;
  transactions: VATTransaction[];
}

interface VATTransaction {
  id: string;
  date: string;
  description: string;
  customerName: string;
  invoiceNumber: string;
  amount: number;
  vatRate: number;
  vatAmount: number;
  category: 'standard' | 'exempt' | 'zero_rated';
}

interface ShippingProvider {
  id: string;
  name: string;
  nameAr: string;
  logo: string;
  isActive: boolean;
  services: {
    id: string;
    name: string;
    nameAr: string;
    deliveryTime: string;
    regions: string[];
    pricing: {
      baseRate: number;
      perKgRate: number;
      freeShippingThreshold?: number;
    };
  }[];
  coverage: {
    cities: string[];
    regions: string[];
    restrictedAreas?: string[];
  };
  trackingUrl: string;
  supportPhone: string;
  apiIntegrated: boolean;
}

interface HijriCalendarEvent {
  id: string;
  title: string;
  titleAr: string;
  hijriDate: string;
  gregorianDate: string;
  type: 'holiday' | 'business' | 'reminder' | 'religious';
  description?: string;
  isRecurring: boolean;
}

export function SaudiCompliance() {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const [activeTab, setActiveTab] = useState('vat');
  const [vatReports, setVatReports] = useState<VATReport[]>([]);
  const [shippingProviders, setShippingProviders] = useState<ShippingProvider[]>([]);
  const [hijriEvents, setHijriEvents] = useState<HijriCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVATReport, setSelectedVATReport] = useState<VATReport | null>(null);
  const [showVATReportDialog, setShowVATReportDialog] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState('2024-Q4');

  // Initialize mock data
  useEffect(() => {
    const mockVATReports: VATReport[] = [
      {
        id: '1',
        period: '2024-Q4',
        periodHijri: '1446 ربيع الأول - ربيع الثاني',
        startDate: '2024-10-01',
        endDate: '2024-12-31',
        totalSales: 485000,
        vatableAmount: 421739,
        vatAmount: 63261,
        exemptAmount: 0,
        status: 'draft',
        transactions: [
          {
            id: '1',
            date: '2024-12-15',
            description: 'Toyota Camry Engine Parts',
            customerName: 'أحمد العتيبي',
            invoiceNumber: 'INV-001',
            amount: 8500,
            vatRate: 15,
            vatAmount: 1275,
            category: 'standard',
          },
          {
            id: '2',
            date: '2024-12-14',
            description: 'Honda Accord Brake Set',
            customerName: 'فاطمة السلمي',
            invoiceNumber: 'INV-002',
            amount: 1200,
            vatRate: 15,
            vatAmount: 180,
            category: 'standard',
          },
        ],
      },
      {
        id: '2',
        period: '2024-Q3',
        periodHijri: '1446 محرم - صفر',
        startDate: '2024-07-01',
        endDate: '2024-09-30',
        totalSales: 425000,
        vatableAmount: 369565,
        vatAmount: 55435,
        exemptAmount: 0,
        status: 'approved',
        submittedAt: '2024-10-15T10:00:00Z',
        approvedAt: '2024-10-20T14:30:00Z',
        transactions: [],
      },
    ];

    const mockShippingProviders: ShippingProvider[] = [
      {
        id: '1',
        name: 'Saudi Post',
        nameAr: 'البريد السعودي',
        logo: '/logos/saudi-post.png',
        isActive: true,
        services: [
          {
            id: '1',
            name: 'Standard Delivery',
            nameAr: 'التوصيل العادي',
            deliveryTime: '3-5 أيام عمل',
            regions: ['الرياض', 'جدة', 'الدمام'],
            pricing: {
              baseRate: 25,
              perKgRate: 5,
              freeShippingThreshold: 500,
            },
          },
          {
            id: '2',
            name: 'Express Delivery',
            nameAr: 'التوصيل السريع',
            deliveryTime: '1-2 أيام عمل',
            regions: ['الرياض', 'جدة', 'الدمام', 'المدينة'],
            pricing: {
              baseRate: 50,
              perKgRate: 8,
            },
          },
        ],
        coverage: {
          cities: ['الرياض', 'جدة', 'الدمام', 'المدينة المنورة', 'الطائف'],
          regions: ['منطقة الرياض', 'منطقة مكة المكرمة', 'المنطقة الشرقية'],
        },
        trackingUrl: 'https://www.sp.com.sa/tracking',
        supportPhone: '920001777',
        apiIntegrated: true,
      },
      {
        id: '2',
        name: 'SMSA Express',
        nameAr: 'سمسا للشحن السريع',
        logo: '/logos/smsa.png',
        isActive: true,
        services: [
          {
            id: '1',
            name: 'Same Day',
            nameAr: 'نفس اليوم',
            deliveryTime: 'خلال 24 ساعة',
            regions: ['الرياض', 'جدة'],
            pricing: {
              baseRate: 100,
              perKgRate: 15,
            },
          },
          {
            id: '2',
            name: 'Next Day',
            nameAr: 'اليوم التالي',
            deliveryTime: '1-2 أيام عمل',
            regions: ['جميع المدن الرئيسية'],
            pricing: {
              baseRate: 60,
              perKgRate: 10,
            },
          },
        ],
        coverage: {
          cities: ['جميع المدن السعودية'],
          regions: ['جميع المناطق'],
        },
        trackingUrl: 'https://www.smsaexpress.com/tracking',
        supportPhone: '920000580',
        apiIntegrated: true,
      },
    ];

    const mockHijriEvents: HijriCalendarEvent[] = [
      {
        id: '1',
        title: 'Saudi National Day',
        titleAr: 'اليوم الوطني السعودي',
        hijriDate: '1446/02/28',
        gregorianDate: '2024-09-23',
        type: 'holiday',
        description: 'National holiday - All business activities suspended',
        isRecurring: true,
      },
      {
        id: '2',
        title: 'VAT Return Deadline',
        titleAr: 'موعد تقديم إقرار ضريبة القيمة المضافة',
        hijriDate: '1446/04/15',
        gregorianDate: '2024-10-28',
        type: 'business',
        description: 'Quarterly VAT return submission deadline',
        isRecurring: true,
      },
      {
        id: '3',
        title: 'Ramadan Start',
        titleAr: 'بداية شهر رمضان',
        hijriDate: '1446/09/01',
        gregorianDate: '2025-02-28',
        type: 'religious',
        description: 'Reduced working hours during Ramadan',
        isRecurring: true,
      },
    ];

    setVatReports(mockVATReports);
    setShippingProviders(mockShippingProviders);
    setHijriEvents(mockHijriEvents);
    setLoading(false);
  }, []);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(isArabic ? 'ar-SA' : 'en-US');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getVATStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: isArabic ? 'مسودة' : 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
      submitted: { label: isArabic ? 'مقدم' : 'Submitted', color: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200' },
      approved: { label: isArabic ? 'موافق عليه' : 'Approved', color: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200' },
      rejected: { label: isArabic ? 'مرفوض' : 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const generateVATReport = () => {
    console.log('Generating VAT report for period:', currentPeriod);
    // In a real app, this would generate the report
  };

  const submitVATReport = (reportId: string) => {
    console.log('Submitting VAT report:', reportId);
    // In a real app, this would submit to ZATCA
  };

  const exportVATReport = (reportId: string) => {
    console.log('Exporting VAT report:', reportId);
    // In a real app, this would generate PDF/Excel export
  };

  const VATReportCard = ({ report }: { report: VATReport }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{report.period}</CardTitle>
            <CardDescription className="text-sm">
              {report.periodHijri}
            </CardDescription>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(report.startDate)} - {formatDate(report.endDate)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {getVATStatusBadge(report.status)}
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Financial Summary */}
        <div className="grid gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{isArabic ? 'إجمالي المبيعات:' : 'Total Sales:'}</span>
            <div className="font-semibold flex items-center gap-1">
              {formatCurrency(report.totalSales)}
              <SARSymbol className="h-3 w-3" />
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{isArabic ? 'المبلغ الخاضع للضريبة:' : 'Taxable Amount:'}</span>
            <div className="font-semibold flex items-center gap-1">
              {formatCurrency(report.vatableAmount)}
              <SARSymbol className="h-3 w-3" />
            </div>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-medium">{isArabic ? 'ضريبة القيمة المضافة:' : 'VAT Amount:'}</span>
            <div className="font-bold text-green-600 flex items-center gap-1">
              {formatCurrency(report.vatAmount)}
              <SARSymbol className="h-3 w-3" />
            </div>
          </div>
        </div>

        {/* Status Info */}
        {report.status === 'approved' && report.approvedAt && (
          <div className="text-xs text-green-600 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            {isArabic ? 'موافق عليه في:' : 'Approved on:'} {formatDate(report.approvedAt)}
          </div>
        )}

        {report.status === 'rejected' && report.rejectionReason && (
          <Alert className="py-2">
            <AlertCircle className="h-3 w-3" />
            <AlertDescription className="text-xs">
              <strong>{isArabic ? 'سبب الرفض:' : 'Rejection Reason:'}</strong> {report.rejectionReason}
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button size="sm" variant="outline" onClick={() => setSelectedVATReport(report)}>
            <Eye className="h-3 w-3 me-1" />
            {isArabic ? 'عرض' : 'View'}
          </Button>
          {report.status === 'draft' && (
            <Button size="sm" onClick={() => submitVATReport(report.id)}>
              <Send className="h-3 w-3 me-1" />
              {isArabic ? 'إرسال' : 'Submit'}
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => exportVATReport(report.id)}>
            <Download className="h-3 w-3 me-1" />
            {isArabic ? 'تصدير' : 'Export'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <SaudiHeader
        title={isArabic ? 'الامتثال السعودي' : 'Saudi Compliance'}
        subtitle={isArabic ? 'إدارة ضريبة القيمة المضافة والامتثال للأنظمة السعودية' : 'Manage VAT and compliance with Saudi regulations'}
        variant="gold"
      />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vat" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            {isArabic ? 'ضريبة القيمة المضافة' : 'VAT Management'}
          </TabsTrigger>
          <TabsTrigger value="shipping" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            {isArabic ? 'شركات الشحن' : 'Shipping Providers'}
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            {isArabic ? 'التقويم الهجري' : 'Hijri Calendar'}
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {isArabic ? 'الامتثال' : 'Compliance'}
          </TabsTrigger>
        </TabsList>

        {/* VAT Management Tab */}
        <TabsContent value="vat" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold">
                {isArabic ? 'إدارة ضريبة القيمة المضافة' : 'VAT Management'}
              </h2>
              <p className="text-muted-foreground">
                {isArabic ? 'إدارة التقارير الضريبية والامتثال لهيئة الزكاة والضريبة والجمارك' : 'Manage tax reports and ZATCA compliance'}
              </p>
            </div>
            <Button onClick={generateVATReport}>
              <Plus className="h-4 w-4 me-2" />
              {isArabic ? 'إنشاء تقرير جديد' : 'Generate New Report'}
            </Button>
          </div>

          {/* VAT Summary */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SaudiCard variant="gold">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Receipt className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    {isArabic ? 'هذا الربع' : 'This Quarter'}
                  </span>
                </div>
                <div className="text-2xl font-bold text-amber-900 dark:text-amber-200 mb-1">
                  {formatCurrency(vatReports[0]?.vatAmount || 0)}
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <SARSymbol className="h-3 w-3" />
                  <span className="text-muted-foreground">{isArabic ? 'ضريبة مستحقة' : 'VAT Due'}</span>
                </div>
              </CardContent>
            </SaudiCard>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">
                    {isArabic ? 'مبيعات خاضعة للضريبة' : 'Taxable Sales'}
                  </span>
                </div>
                <div className="text-2xl font-bold mb-1">
                  {formatCurrency(vatReports[0]?.vatableAmount || 0)}
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <SARSymbol className="h-3 w-3" />
                  <span className="text-muted-foreground">{isArabic ? 'هذا الربع' : 'this quarter'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">
                    {isArabic ? 'معدل الضريبة' : 'VAT Rate'}
                  </span>
                </div>
                <div className="text-2xl font-bold mb-1">15%</div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'النسبة القياسية' : 'Standard rate'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">
                    {isArabic ? 'الموعد النهائي' : 'Next Deadline'}
                  </span>
                </div>
                <div className="text-2xl font-bold mb-1">
                  {isArabic ? '28' : '28'}
                </div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'يوم متبق' : 'days remaining'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* VAT Reports */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {isArabic ? 'التقارير الضريبية' : 'VAT Reports'}
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {vatReports.map((report) => (
                <VATReportCard key={report.id} report={report} />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Shipping Providers Tab */}
        <TabsContent value="shipping" className="space-y-6">
          <SaudiCard variant="sky">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-blue-800 dark:text-blue-300">
                    {isArabic ? 'شركات الشحن السعودية' : 'Saudi Shipping Providers'}
                  </CardTitle>
                  <CardDescription>
                    {isArabic ? 'إدارة شركات الشحن والتوصيل المتكاملة' : 'Manage integrated shipping and delivery providers'}
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 me-2" />
                  {isArabic ? 'إضافة مزود' : 'Add Provider'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shippingProviders.map((provider) => (
                  <div key={provider.id} className="p-4 border rounded-lg bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded bg-white border flex items-center justify-center">
                          <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-900 dark:text-blue-200">
                            {isArabic ? provider.nameAr : provider.name}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Phone className="h-3 w-3" />
                            <span>{provider.supportPhone}</span>
                            {provider.apiIntegrated && (
                              <Badge variant="outline" className="text-xs">
                                {isArabic ? 'متكامل' : 'API Integrated'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={provider.isActive} />
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Services */}
                    <div className="space-y-3">
                      <h5 className="font-medium text-blue-800 dark:text-blue-300">
                        {isArabic ? 'الخدمات المتاحة' : 'Available Services'}
                      </h5>
                      <div className="grid gap-3 md:grid-cols-2">
                        {provider.services.map((service) => (
                          <div key={service.id} className="p-3 bg-blue-50/50 dark:bg-blue-950/10 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h6 className="font-medium text-sm">
                                {isArabic ? service.nameAr : service.name}
                              </h6>
                              <div className="text-right text-xs">
                                <div className="font-semibold flex items-center gap-1">
                                  {formatCurrency(service.pricing.baseRate)}
                                  <SARSymbol className="h-3 w-3" />
                                </div>
                                <div className="text-muted-foreground">
                                  +{service.pricing.perKgRate}/kg
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {isArabic ? 'مدة التوصيل:' : 'Delivery:'} {service.deliveryTime}
                            </p>
                            {service.pricing.freeShippingThreshold && (
                              <p className="text-xs text-green-600 mt-1">
                                {isArabic ? 'شحن مجاني عند:' : 'Free shipping over:'} {formatCurrency(service.pricing.freeShippingThreshold)} SAR
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Coverage */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <h6 className="font-medium text-sm text-blue-800 dark:text-blue-300 mb-2">
                            {isArabic ? 'المدن المشمولة' : 'Covered Cities'}
                          </h6>
                          <div className="flex flex-wrap gap-1">
                            {provider.coverage.cities.slice(0, 3).map((city, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {city}
                              </Badge>
                            ))}
                            {provider.coverage.cities.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{provider.coverage.cities.length - 3} {isArabic ? 'أخرى' : 'more'}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button size="sm" variant="outline">
                              <ExternalLink className="h-3 w-3 me-1" />
                              {isArabic ? 'تتبع' : 'Track'}
                            </Button>
                            <Button size="sm" variant="outline">
                              <Settings className="h-3 w-3 me-1" />
                              {isArabic ? 'إعداد' : 'Configure'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </SaudiCard>
        </TabsContent>

        {/* Hijri Calendar Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <SaudiCard variant="green">
              <CardHeader>
                <CardTitle className="text-green-800 dark:text-green-300">
                  {isArabic ? 'المناسبات والأعياد' : 'Events & Holidays'}
                </CardTitle>
                <CardDescription>
                  {isArabic ? 'التقويم الهجري والمناسبات المهمة للأعمال' : 'Hijri calendar and important business events'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hijriEvents.map((event) => (
                    <div key={event.id} className="p-4 border rounded-lg bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-950/20">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-green-900 dark:text-green-200">
                            {isArabic ? event.titleAr : event.title}
                          </h4>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span>{event.hijriDate}</span>
                            <span>•</span>
                            <span>{formatDate(event.gregorianDate)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            event.type === 'holiday' ? 'destructive' :
                            event.type === 'business' ? 'default' :
                            event.type === 'religious' ? 'secondary' : 'outline'
                          }>
                            {event.type === 'holiday' && (isArabic ? 'عطلة' : 'Holiday')}
                            {event.type === 'business' && (isArabic ? 'عمل' : 'Business')}
                            {event.type === 'religious' && (isArabic ? 'ديني' : 'Religious')}
                            {event.type === 'reminder' && (isArabic ? 'تذكير' : 'Reminder')}
                          </Badge>
                          {event.isRecurring && (
                            <Badge variant="outline" className="text-xs">
                              {isArabic ? 'متكرر' : 'Recurring'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </SaudiCard>

            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? 'التقويم' : 'Calendar View'}</CardTitle>
                <CardDescription>
                  {isArabic ? 'عرض التقويم الهجري والميلادي' : 'Hijri and Gregorian calendar view'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  className="rounded-md border"
                />
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">
                    {isArabic ? 'اليوم' : 'Today'}
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">{isArabic ? 'هجري:' : 'Hijri:'}</span> 1446/04/02
                    </p>
                    <p>
                      <span className="text-muted-foreground">{isArabic ? 'ميلادي:' : 'Gregorian:'}</span> {format(new Date(), 'PPP', { locale: isArabic ? ar : undefined })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'حالة الامتثال' : 'Compliance Status'}</CardTitle>
              <CardDescription>
                {isArabic ? 'مراجعة امتثالك للأنظمة السعودية' : 'Review your compliance with Saudi regulations'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Compliance Checklist */}
                <div className="space-y-4">
                  <h4 className="font-semibold">{isArabic ? 'قائمة الامتثال' : 'Compliance Checklist'}</h4>
                  <div className="space-y-3">
                    {[
                      { 
                        item: isArabic ? 'السجل التجاري' : 'Commercial Registration',
                        status: 'completed',
                        description: isArabic ? 'سجل تجاري ساري المفعول' : 'Valid commercial registration'
                      },
                      {
                        item: isArabic ? 'شهادة الزكاة والضريبة' : 'Zakat & Tax Certificate',
                        status: 'completed',
                        description: isArabic ? 'شهادة سارية من هيئة الزكاة والضريبة' : 'Valid ZATCA certificate'
                      },
                      {
                        item: isArabic ? 'تسجيل ضريبة القيمة المضافة' : 'VAT Registration',
                        status: 'completed',
                        description: isArabic ? 'مسجل في ضريبة القيمة المضافة' : 'Registered for VAT'
                      },
                      {
                        item: isArabic ? 'الفوترة الإلكترونية' : 'E-Invoicing',
                        status: 'pending',
                        description: isArabic ? 'تنفيذ نظام الفوترة الإلكترونية' : 'E-invoicing system implementation'
                      },
                      {
                        item: isArabic ? 'سياسة الخصوصية' : 'Privacy Policy',
                        status: 'completed',
                        description: isArabic ? 'سياسة خصوصية متوافقة مع قانون حماية البيانات' : 'PDPL compliant privacy policy'
                      },
                    ].map((compliance, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {compliance.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : compliance.status === 'pending' ? (
                            <Clock className="h-5 w-5 text-yellow-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-600" />
                          )}
                          <div>
                            <p className="font-medium">{compliance.item}</p>
                            <p className="text-sm text-muted-foreground">{compliance.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {compliance.status === 'completed' && (
                            <Badge variant="outline" className="text-green-600">
                              {isArabic ? 'مكتمل' : 'Completed'}
                            </Badge>
                          )}
                          {compliance.status === 'pending' && (
                            <Badge variant="outline" className="text-yellow-600">
                              {isArabic ? 'قيد التنفيذ' : 'Pending'}
                            </Badge>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Compliance Score */}
                <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-lg">{isArabic ? 'نقاط الامتثال' : 'Compliance Score'}</h4>
                    <div className="text-3xl font-bold text-green-600">85/100</div>
                  </div>
                  <Progress value={85} className="h-3 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'امتثال جيد - يمكن تحسين بعض النقاط' : 'Good compliance - some areas can be improved'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}