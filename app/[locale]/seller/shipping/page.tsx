'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SARSymbol } from '@/components/ui/currency-symbol';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { 
  Truck,
  Package,
  MapPin,
  Clock,
  DollarSign,
  Calculator,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Download,
  Upload,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Navigation,
  Route,
  Zap,
  Target,
  TrendingUp,
  BarChart3,
  Users,
  Globe,
  Phone,
  Mail,
  Star,
  Award,
  Shield,
  Info,
  HelpCircle,
  ExternalLink,
  Calendar,
  FileText,
  Printer,
  Scan,
  Gift,
  MoreVertical
} from 'lucide-react';

interface ShippingProvider {
  id: string;
  name: string;
  nameAr: string;
  logo?: string;
  active: boolean;
  apiConnected: boolean;
  services: string[];
  coverage: string[];
  avgDeliveryTime: string;
  rating: number;
  commission: number;
  freeShippingThreshold?: number;
  settings: {
    autoBooking: boolean;
    autoTracking: boolean;
    smsNotifications: boolean;
    emailNotifications: boolean;
  };
}

interface ShippingZone {
  id: string;
  name: string;
  nameAr: string;
  regions: string[];
  deliveryTime: string;
  shippingCost: number;
  freeShippingThreshold?: number;
  active: boolean;
  restrictions?: string[];
}

interface ShipmentTracking {
  id: string;
  orderId: string;
  customerName: string;
  destination: string;
  provider: string;
  trackingNumber: string;
  status: 'preparing' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
  estimatedDelivery: string;
  actualDelivery?: string;
  cost: number;
  weight: number;
  dimensions: string;
  createdAt: string;
  updates: {
    timestamp: string;
    status: string;
    location: string;
    description: string;
  }[];
}

interface ShippingStats {
  totalShipments: number;
  activeShipments: number;
  deliveredToday: number;
  averageDeliveryTime: number;
  onTimeDeliveryRate: number;
  totalShippingRevenue: number;
  averageShippingCost: number;
  customerSatisfactionScore: number;
}

const saudiRegions = [
  { id: 'riyadh', nameAr: 'منطقة الرياض', nameEn: 'Riyadh Region', cities: ['الرياض', 'الخرج', 'الدوادمي', 'الزلفي', 'شقراء', 'المجمعة', 'القويعية', 'وادي الدواسر', 'الأفلاج', 'السليل', 'حوطة بني تميم'] },
  { id: 'makkah', nameAr: 'منطقة مكة المكرمة', nameEn: 'Makkah Region', cities: ['مكة المكرمة', 'جدة', 'الطائف', 'القنفذة', 'الليث', 'رابغ', 'خليص', 'الكامل', 'المويه', 'تربة', 'رنية', 'الخرمة', 'العرضيتين', 'الجموم', 'بحرة', 'الحجرة'] },
  { id: 'eastern', nameAr: 'المنطقة الشرقية', nameEn: 'Eastern Region', cities: ['الدمام', 'الخبر', 'الظهران', 'الأحساء', 'الجبيل', 'القطيف', 'حفر الباطن', 'الخفجي', 'رأس تنورة', 'بقيق', 'النعيرية', 'الرميلة'] },
  { id: 'asir', nameAr: 'منطقة عسير', nameEn: 'Asir Region', cities: ['أبها', 'خميس مشيط', 'النماص', 'تنومة', 'سراة عبيدة', 'رجال ألمع', 'محايل', 'البرك', 'بيشة', 'تثليث', 'وادي بن هشبل', 'طريب', 'الحرجة'] },
  { id: 'madinah', nameAr: 'منطقة المدينة المنورة', nameEn: 'Madinah Region', cities: ['المدينة المنورة', 'ينبع', 'العلا', 'مهد الذهب', 'الحناكية', 'بدر', 'خيبر', 'وادي الفرع', 'العيص'] },
  { id: 'qassim', nameAr: 'منطقة القصيم', nameEn: 'Qassim Region', cities: ['بريدة', 'عنيزة', 'الرس', 'المذنب', 'البكيرية', 'البدائع', 'رياض الخبراء', 'الشماسية', 'عيون الجواء', 'النبهانية', 'الأسياح', 'قصيباء', 'دخنة'] }
];

const shippingProviders: ShippingProvider[] = [
  {
    id: 'smsa',
    name: 'SMSA Express',
    nameAr: 'شركة البريد السريع',
    active: true,
    apiConnected: true,
    services: ['same_day', 'next_day', 'standard'],
    coverage: ['riyadh', 'makkah', 'eastern', 'asir'],
    avgDeliveryTime: '1-2 أيام',
    rating: 4.2,
    commission: 8,
    freeShippingThreshold: 200,
    settings: {
      autoBooking: true,
      autoTracking: true,
      smsNotifications: true,
      emailNotifications: true,
    },
  },
  {
    id: 'aramex',
    name: 'Aramex',
    nameAr: 'أرامكس',
    active: true,
    apiConnected: false,
    services: ['express', 'standard', 'economy'],
    coverage: ['riyadh', 'makkah', 'eastern', 'asir', 'madinah', 'qassim'],
    avgDeliveryTime: '2-3 أيام',
    rating: 4.0,
    commission: 10,
    settings: {
      autoBooking: false,
      autoTracking: false,
      smsNotifications: false,
      emailNotifications: true,
    },
  },
  {
    id: 'dhl',
    name: 'DHL Express',
    nameAr: 'دي إتش إل',
    active: false,
    apiConnected: false,
    services: ['express', 'premium'],
    coverage: ['riyadh', 'makkah', 'eastern'],
    avgDeliveryTime: '1-2 أيام',
    rating: 4.5,
    commission: 15,
    settings: {
      autoBooking: false,
      autoTracking: false,
      smsNotifications: false,
      emailNotifications: false,
    },
  },
];

const statusLabels = {
  preparing: { ar: 'قيد التحضير', en: 'Preparing' },
  picked_up: { ar: 'تم الاستلام', en: 'Picked Up' },
  in_transit: { ar: 'في الطريق', en: 'In Transit' },
  out_for_delivery: { ar: 'خارج للتسليم', en: 'Out for Delivery' },
  delivered: { ar: 'تم التسليم', en: 'Delivered' },
  failed: { ar: 'فشل التسليم', en: 'Delivery Failed' },
  returned: { ar: 'مرتجع', en: 'Returned' },
};

const statusColors = {
  preparing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  picked_up: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  in_transit: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  out_for_delivery: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  returned: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
};

export default function ShippingPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  
  const [activeTab, setActiveTab] = useState('overview');
  const [providers, setProviders] = useState<ShippingProvider[]>(shippingProviders);
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [shipments, setShipments] = useState<ShipmentTracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [stats] = useState<ShippingStats>({
    totalShipments: 1247,
    activeShipments: 89,
    deliveredToday: 23,
    averageDeliveryTime: 2.3,
    onTimeDeliveryRate: 94.5,
    totalShippingRevenue: 45230,
    averageShippingCost: 36.5,
    customerSatisfactionScore: 4.6,
  });
  
  // Mock data initialization
  useEffect(() => {
    const mockZones: ShippingZone[] = [
      {
        id: '1',
        name: 'Riyadh Metro',
        nameAr: 'منطقة الرياض الكبرى',
        regions: ['الرياض', 'الخرج'],
        deliveryTime: '24 ساعة',
        shippingCost: 25,
        freeShippingThreshold: 200,
        active: true,
      },
      {
        id: '2',
        name: 'Western Region',
        nameAr: 'المنطقة الغربية',
        regions: ['جدة', 'مكة المكرمة', 'المدينة المنورة'],
        deliveryTime: '48-72 ساعة',
        shippingCost: 35,
        freeShippingThreshold: 300,
        active: true,
      },
      {
        id: '3',
        name: 'Eastern Region',
        nameAr: 'المنطقة الشرقية',
        regions: ['الدمام', 'الخبر', 'الأحساء'],
        deliveryTime: '48-72 ساعة',
        shippingCost: 40,
        active: true,
      },
    ];
    
    const mockShipments: ShipmentTracking[] = [
      {
        id: '1',
        orderId: 'ORD-2024-001',
        customerName: 'أحمد محمد العتيبي',
        destination: 'الرياض، منطقة الرياض',
        provider: 'SMSA Express',
        trackingNumber: 'SMSA1234567890',
        status: 'in_transit',
        estimatedDelivery: '2024-12-17T14:00:00Z',
        cost: 25,
        weight: 2.5,
        dimensions: '30x20x15 سم',
        createdAt: '2024-12-15T10:30:00Z',
        updates: [
          {
            timestamp: '2024-12-15T10:30:00Z',
            status: 'preparing',
            location: 'متجر قطع الغيار',
            description: 'تم استلام الطلب وجاري التحضير'
          },
          {
            timestamp: '2024-12-15T16:20:00Z',
            status: 'picked_up',
            location: 'الرياض - مركز التوزيع',
            description: 'تم استلام الشحنة من المتجر'
          },
          {
            timestamp: '2024-12-16T08:15:00Z',
            status: 'in_transit',
            location: 'في الطريق إلى الرياض',
            description: 'الشحنة في طريقها للمدينة المقصودة'
          }
        ]
      },
      {
        id: '2',
        orderId: 'ORD-2024-002',
        customerName: 'فاطمة السلمي',
        destination: 'جدة، منطقة مكة المكرمة',
        provider: 'Aramex',
        trackingNumber: 'ARX9876543210',
        status: 'delivered',
        estimatedDelivery: '2024-12-16T16:00:00Z',
        actualDelivery: '2024-12-16T15:30:00Z',
        cost: 35,
        weight: 1.8,
        dimensions: '25x15x10 سم',
        createdAt: '2024-12-14T09:00:00Z',
        updates: [
          {
            timestamp: '2024-12-16T15:30:00Z',
            status: 'delivered',
            location: 'جدة - العنوان المطلوب',
            description: 'تم التسليم بنجاح للعميل'
          }
        ]
      },
    ];
    
    setZones(mockZones);
    setShipments(mockShipments);
    setLoading(false);
  }, []);
  
  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = searchQuery === '' ||
      shipment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
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
  
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const getStatusBadge = (status: string) => {
    return (
      <Badge className={statusColors[status as keyof typeof statusColors]} variant="outline">
        {statusLabels[status as keyof typeof statusLabels]?.[locale as 'ar' | 'en'] || status}
      </Badge>
    );
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          {isArabic ? 'جاري التحميل...' : 'Loading...'}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold card-title-enhanced mb-2">
            {isArabic ? 'الشحن واللوجستيات' : 'Shipping & Logistics'}
          </h1>
          <p className="text-muted-foreground text-label">
            {isArabic 
              ? `${stats.activeShipments} شحنة نشطة • معدل التسليم في الوقت ${stats.onTimeDeliveryRate}%`
              : `${stats.activeShipments} active shipments • ${stats.onTimeDeliveryRate}% on-time delivery`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="me-2 h-4 w-4" />
            {isArabic ? 'تحديث' : 'Refresh'}
          </Button>
          <Button variant="outline">
            <Download className="me-2 h-4 w-4" />
            {isArabic ? 'تصدير' : 'Export'}
          </Button>
          <Button>
            <Plus className="me-2 h-4 w-4" />
            {isArabic ? 'شحنة جديدة' : 'New Shipment'}
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shipping-card-gradient">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-label font-semibold text-muted-foreground">
                {isArabic ? 'الشحنات النشطة' : 'Active Shipments'}
              </CardTitle>
              <Truck className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-price text-blue-600">{stats.activeShipments}</div>
            <p className="text-detail text-muted-foreground mt-1">
              {isArabic ? 'في الطريق' : 'in transit'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="shipping-card-gradient">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-label font-semibold text-muted-foreground">
                {isArabic ? 'معدل التسليم' : 'Delivery Rate'}
              </CardTitle>
              <Target className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-price text-green-600">{stats.onTimeDeliveryRate}%</div>
            <div className="flex items-center gap-1 text-detail mt-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-green-600">+2.1%</span>
              <span className="text-detail text-muted-foreground">
                {isArabic ? 'تحسن' : 'improved'}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shipping-card-gradient">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-label font-semibold text-muted-foreground">
                {isArabic ? 'متوسط التكلفة' : 'Avg Cost'}
              </CardTitle>
              <Calculator className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-price text-orange-600 flex items-center gap-1">
              {formatCurrency(stats.averageShippingCost)}
              <SARSymbol className="h-5 w-5" />
            </div>
            <p className="text-detail text-muted-foreground mt-1">
              {isArabic ? 'لكل شحنة' : 'per shipment'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="shipping-card-gradient">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-label font-semibold text-muted-foreground">
                {isArabic ? 'رضا العملاء' : 'Customer Satisfaction'}
              </CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-price text-yellow-600">{stats.customerSatisfactionScore}/5</div>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star}
                  className={`h-3 w-3 ${
                    star <= stats.customerSatisfactionScore 
                      ? 'text-yellow-500 fill-yellow-500' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">{isArabic ? 'نظرة عامة' : 'Overview'}</TabsTrigger>
          <TabsTrigger value="providers">{isArabic ? 'شركات الشحن' : 'Providers'}</TabsTrigger>
          <TabsTrigger value="zones">{isArabic ? 'المناطق' : 'Zones'}</TabsTrigger>
          <TabsTrigger value="tracking">{isArabic ? 'التتبع' : 'Tracking'}</TabsTrigger>
          <TabsTrigger value="analytics">{isArabic ? 'التحليلات' : 'Analytics'}</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? 'الإجراءات السريعة' : 'Quick Actions'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full justify-start" variant="outline">
                    <Package className="mr-2 h-4 w-4" />
                    {isArabic ? 'إنشاء شحنة جديدة' : 'Create New Shipment'}
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Printer className="mr-2 h-4 w-4" />
                    {isArabic ? 'طباعة ملصقات الشحن' : 'Print Shipping Labels'}
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    {isArabic ? 'رفع ملف CSV للشحنات' : 'Bulk Upload Shipments'}
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    {isArabic ? 'تقرير الشحن' : 'Shipping Report'}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{isArabic ? 'النشاط الأخير' : 'Recent Activity'}</CardTitle>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 me-1" />
                    {isArabic ? 'عرض الكل' : 'View All'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {isArabic ? 'تم تسليم الطلب #ORD-789' : 'Order #ORD-789 delivered'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isArabic ? 'منذ 30 دقيقة' : '30 minutes ago'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {isArabic ? '5 شحنات جديدة تم إنشاؤها' : '5 new shipments created'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isArabic ? 'منذ ساعتين' : '2 hours ago'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/50 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {isArabic ? 'تأخير في التسليم - الطلب #ORD-456' : 'Delivery delay - Order #ORD-456'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isArabic ? 'منذ 4 ساعات' : '4 hours ago'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Performance Overview */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{isArabic ? 'إجمالي الشحنات' : 'Total Shipments'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalShipments}</div>
                <Progress value={85} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {isArabic ? 'هدف الشهر: 1500' : 'Monthly target: 1,500'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{isArabic ? 'متوسط وقت التسليم' : 'Avg Delivery Time'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageDeliveryTime} {isArabic ? 'أيام' : 'days'}</div>
                <div className="flex items-center gap-1 text-sm text-green-600 mt-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>{isArabic ? 'تحسن بـ 0.3 يوم' : 'Improved by 0.3 days'}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{isArabic ? 'إيرادات الشحن' : 'Shipping Revenue'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center gap-1">
                  {formatCurrency(stats.totalShippingRevenue)}
                  <SARSymbol className="h-5 w-5" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {isArabic ? 'هذا الشهر' : 'This month'}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Providers Tab */}
        <TabsContent value="providers" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{isArabic ? 'شركات الشحن' : 'Shipping Providers'}</CardTitle>
                <Button>
                  <Plus className="me-2 h-4 w-4" />
                  {isArabic ? 'إضافة شركة' : 'Add Provider'}
                </Button>
              </div>
              <CardDescription>
                {isArabic 
                  ? 'إدارة شركات الشحن وإعداداتها'
                  : 'Manage your shipping providers and their settings'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providers.map((provider) => (
                  <Card key={provider.id} className="relative">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                            <Truck className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{isArabic ? provider.nameAr : provider.name}</h3>
                              {provider.active && (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  <CheckCircle className="h-3 w-3 me-1" />
                                  {isArabic ? 'نشط' : 'Active'}
                                </Badge>
                              )}
                              {provider.apiConnected && (
                                <Badge variant="outline" className="text-blue-600 border-blue-600">
                                  <Zap className="h-3 w-3 me-1" />
                                  {isArabic ? 'متصل' : 'Connected'}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{provider.avgDeliveryTime}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>{provider.rating}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                <span>{provider.commission}% {isArabic ? 'عمولة' : 'commission'}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {provider.services.map((service) => (
                                <Badge key={service} variant="secondary" className="text-xs">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{isArabic ? 'الإعدادات' : 'Settings'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                {isArabic ? 'تعديل' : 'Edit'}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <BarChart3 className="mr-2 h-4 w-4" />
                                {isArabic ? 'الإحصائيات' : 'Statistics'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                {provider.active ? (
                                  <>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    {isArabic ? 'إلغاء التفعيل' : 'Deactivate'}
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    {isArabic ? 'تفعيل' : 'Activate'}
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      {/* Coverage Map */}
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <h4 className="text-sm font-medium mb-2">
                          {isArabic ? 'التغطية الجغرافية' : 'Coverage Areas'}
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {saudiRegions
                            .filter(region => provider.coverage.includes(region.id))
                            .map((region) => (
                              <Badge key={region.id} variant="outline" className="text-xs">
                                {isArabic ? region.nameAr : region.nameEn}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Zones Tab */}
        <TabsContent value="zones" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{isArabic ? 'مناطق الشحن' : 'Shipping Zones'}</CardTitle>
                <Button>
                  <Plus className="me-2 h-4 w-4" />
                  {isArabic ? 'إضافة منطقة' : 'Add Zone'}
                </Button>
              </div>
              <CardDescription>
                {isArabic 
                  ? 'إدارة مناطق الشحن وأسعارها'
                  : 'Manage shipping zones and their pricing'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {zones.map((zone) => (
                  <Card key={zone.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{isArabic ? zone.nameAr : zone.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{zone.deliveryTime}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                <span>{zone.shippingCost} {isArabic ? 'ريال' : 'SAR'}</span>
                              </div>
                              {zone.freeShippingThreshold && (
                                <div className="flex items-center gap-1">
                                  <Gift className="h-3 w-3" />
                                  <span>
                                    {isArabic ? 'شحن مجاني فوق' : 'Free shipping above'} {zone.freeShippingThreshold} {isArabic ? 'ريال' : 'SAR'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Switch checked={zone.active} />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                {isArabic ? 'تعديل' : 'Edit'}
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="mr-2 h-4 w-4" />
                                {isArabic ? 'نسخ' : 'Duplicate'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                {isArabic ? 'حذف' : 'Delete'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-sm text-muted-foreground mb-2">
                          {isArabic ? 'المدن المشمولة:' : 'Covered cities:'}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {zone.regions.slice(0, 3).map((region, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {region}
                            </Badge>
                          ))}
                          {zone.regions.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{zone.regions.length - 3} {isArabic ? 'المزيد' : 'more'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Tracking Tab */}
        <TabsContent value="tracking" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'تتبع الشحنات' : 'Shipment Tracking'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={isArabic ? 'البحث بالعميل، رقم الطلب، رقم التتبع...' : 'Search by customer, order ID, tracking number...'}
                    className="ps-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={isArabic ? 'حالة الشحنة' : 'Shipment Status'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isArabic ? 'جميع الحالات' : 'All Status'}</SelectItem>
                    <SelectItem value="preparing">{statusLabels.preparing[locale as 'ar' | 'en']}</SelectItem>
                    <SelectItem value="in_transit">{statusLabels.in_transit[locale as 'ar' | 'en']}</SelectItem>
                    <SelectItem value="delivered">{statusLabels.delivered[locale as 'ar' | 'en']}</SelectItem>
                    <SelectItem value="failed">{statusLabels.failed[locale as 'ar' | 'en']}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4">
                {filteredShipments.map((shipment) => (
                  <Card key={shipment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{shipment.orderId}</h3>
                            {getStatusBadge(shipment.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {isArabic ? 'العميل:' : 'Customer:'} {shipment.customerName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {isArabic ? 'الوجهة:' : 'Destination:'} {shipment.destination}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground mb-1">
                            {isArabic ? 'رقم التتبع' : 'Tracking Number'}
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                              {shipment.trackingNumber}
                            </code>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-3 mb-4">
                        <div>
                          <div className="text-sm text-muted-foreground">
                            {isArabic ? 'شركة الشحن' : 'Provider'}
                          </div>
                          <div className="font-medium">{shipment.provider}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">
                            {isArabic ? 'التسليم المتوقع' : 'Expected Delivery'}
                          </div>
                          <div className="font-medium">
                            {formatDateTime(shipment.estimatedDelivery)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">
                            {isArabic ? 'التكلفة' : 'Cost'}
                          </div>
                          <div className="font-medium flex items-center gap-1">
                            {formatCurrency(shipment.cost)}
                            <SARSymbol className="h-3 w-3" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Tracking Timeline */}
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-medium mb-3">
                          {isArabic ? 'تتبع الشحنة' : 'Tracking History'}
                        </h4>
                        <div className="space-y-3">
                          {shipment.updates.map((update, index) => (
                            <div key={index} className="flex gap-3">
                              <div className="h-2 w-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium">{update.description}</p>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDateTime(update.timestamp)}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground">{update.location}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? 'أداء التسليم' : 'Delivery Performance'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{isArabic ? 'التسليم في الوقت' : 'On-time delivery'}</span>
                    <span className="font-semibold">{stats.onTimeDeliveryRate}%</span>
                  </div>
                  <Progress value={stats.onTimeDeliveryRate} />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{isArabic ? 'متوسط وقت التسليم' : 'Avg delivery time'}</span>
                    <span className="font-semibold">{stats.averageDeliveryTime} {isArabic ? 'أيام' : 'days'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{isArabic ? 'رضا العملاء' : 'Customer satisfaction'}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{stats.customerSatisfactionScore}/5</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? 'التكاليف والإيرادات' : 'Costs & Revenue'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{isArabic ? 'إجمالي الإيرادات' : 'Total revenue'}</span>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{formatCurrency(stats.totalShippingRevenue)}</span>
                      <SARSymbol className="h-3 w-3" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{isArabic ? 'متوسط التكلفة' : 'Average cost'}</span>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{formatCurrency(stats.averageShippingCost)}</span>
                      <SARSymbol className="h-3 w-3" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{isArabic ? 'هامش الربح' : 'Profit margin'}</span>
                    <span className="font-semibold text-green-600">18.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'التوصيات والتحسينات' : 'Recommendations & Improvements'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertTitle>
                    {isArabic ? 'فرصة تحسين' : 'Improvement Opportunity'}
                  </AlertTitle>
                  <AlertDescription>
                    {isArabic 
                      ? 'يمكن تقليل تكاليف الشحن بنسبة 15% عبر تحسين التعبئة والتغليف للمناطق البعيدة.'
                      : 'You can reduce shipping costs by 15% by optimizing packaging for distant regions.'}
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>
                    {isArabic ? 'توصية أمان' : 'Security Recommendation'}
                  </AlertTitle>
                  <AlertDescription>
                    {isArabic 
                      ? 'فعل التتبع التلقائي لجميع شركات الشحن لتحسين تجربة العملاء.'
                      : 'Enable automatic tracking for all shipping providers to improve customer experience.'}
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}