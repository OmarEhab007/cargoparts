'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SaudiCard, SaudiHeader } from '@/components/ui/saudi-theme';
import {
  Store,
  MapPin,
  Users,
  Package,
  BarChart3,
  DollarSign,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Target,
  Star,
  Truck,
  Warehouse,
  Building,
  Globe,
  Calendar,
  Activity,
  Zap,
  RefreshCw,
  Filter,
  Download,
  Upload,
  Copy,
  Share,
} from 'lucide-react';

// Multi-Store Management Interfaces
interface Store {
  id: string;
  name: string;
  nameAr: string;
  location: {
    city: string;
    cityAr: string;
    region: string;
    regionAr: string;
    address: string;
    addressAr: string;
    coordinates: { lat: number; lng: number };
  };
  manager: {
    name: string;
    email: string;
    phone: string;
  };
  metrics: {
    revenue: number;
    revenueChange: number;
    orders: number;
    ordersChange: number;
    inventory: number;
    customers: number;
    rating: number;
    fulfillmentRate: number;
  };
  status: 'active' | 'inactive' | 'maintenance';
  type: 'flagship' | 'branch' | 'warehouse' | 'popup';
  openingHours: {
    [key: string]: { open: string; close: string; isOpen: boolean };
  };
  permissions: string[];
  createdAt: string;
  lastActivity: string;
}

interface CrossStoreAnalytics {
  totalRevenue: number;
  totalOrders: number;
  totalInventory: number;
  averageRating: number;
  topPerformingStore: string;
  lowPerformingStore: string;
  inventoryDistribution: {
    storeId: string;
    storeName: string;
    percentage: number;
    value: number;
  }[];
  regionalPerformance: {
    region: string;
    regionAr: string;
    stores: number;
    revenue: number;
    growth: number;
  }[];
}

interface InventoryTransfer {
  id: string;
  fromStore: string;
  toStore: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    value: number;
  }[];
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  requestedBy: string;
  requestedAt: string;
  completedAt?: string;
  totalValue: number;
  notes?: string;
}

export function MultiStoreManagement() {
  const locale = useLocale();
  const isArabic = locale === 'ar';

  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock multi-store data
  const [stores] = useState<Store[]>([
    {
      id: '1',
      name: 'CargoParts Riyadh Central',
      nameAr: 'كارجو بارتس الرياض الوسط',
      location: {
        city: 'Riyadh',
        cityAr: 'الرياض',
        region: 'Riyadh Region',
        regionAr: 'منطقة الرياض',
        address: 'King Fahd Road, Al Olaya District',
        addressAr: 'طريق الملك فهد، حي العليا',
        coordinates: { lat: 24.7136, lng: 46.6753 },
      },
      manager: {
        name: 'Ahmed Al-Rashid',
        email: 'ahmed@cargoparts.sa',
        phone: '+966501234567',
      },
      metrics: {
        revenue: 245600,
        revenueChange: 18.5,
        orders: 342,
        ordersChange: 12.3,
        inventory: 1250,
        customers: 2845,
        rating: 4.8,
        fulfillmentRate: 94.2,
      },
      status: 'active',
      type: 'flagship',
      openingHours: {
        sunday: { open: '08:00', close: '18:00', isOpen: true },
        monday: { open: '08:00', close: '18:00', isOpen: true },
        tuesday: { open: '08:00', close: '18:00', isOpen: true },
        wednesday: { open: '08:00', close: '18:00', isOpen: true },
        thursday: { open: '08:00', close: '18:00', isOpen: true },
        friday: { open: '00:00', close: '00:00', isOpen: false },
        saturday: { open: '09:00', close: '15:00', isOpen: true },
      },
      permissions: ['inventory_manage', 'orders_process', 'analytics_view', 'staff_manage'],
      createdAt: '2024-01-15T08:00:00Z',
      lastActivity: '2024-12-16T14:30:00Z',
    },
    {
      id: '2',
      name: 'CargoParts Jeddah Port',
      nameAr: 'كارجو بارتس جدة الميناء',
      location: {
        city: 'Jeddah',
        cityAr: 'جدة',
        region: 'Makkah Region',
        regionAr: 'منطقة مكة المكرمة',
        address: 'Port Area, Industrial District',
        addressAr: 'منطقة الميناء، الحي الصناعي',
        coordinates: { lat: 21.4858, lng: 39.1925 },
      },
      manager: {
        name: 'Omar Al-Ghamdi',
        email: 'omar@cargoparts.sa',
        phone: '+966502345678',
      },
      metrics: {
        revenue: 189300,
        revenueChange: 8.2,
        orders: 278,
        ordersChange: 5.7,
        inventory: 980,
        customers: 1924,
        rating: 4.6,
        fulfillmentRate: 91.8,
      },
      status: 'active',
      type: 'branch',
      openingHours: {
        sunday: { open: '08:00', close: '17:00', isOpen: true },
        monday: { open: '08:00', close: '17:00', isOpen: true },
        tuesday: { open: '08:00', close: '17:00', isOpen: true },
        wednesday: { open: '08:00', close: '17:00', isOpen: true },
        thursday: { open: '08:00', close: '17:00', isOpen: true },
        friday: { open: '00:00', close: '00:00', isOpen: false },
        saturday: { open: '09:00', close: '14:00', isOpen: true },
      },
      permissions: ['inventory_manage', 'orders_process', 'analytics_view'],
      createdAt: '2024-03-20T10:00:00Z',
      lastActivity: '2024-12-16T13:45:00Z',
    },
    {
      id: '3',
      name: 'CargoParts Dammam Warehouse',
      nameAr: 'مستودع كارجو بارتس الدمام',
      location: {
        city: 'Dammam',
        cityAr: 'الدمام',
        region: 'Eastern Province',
        regionAr: 'المنطقة الشرقية',
        address: 'Second Industrial City',
        addressAr: 'المدينة الصناعية الثانية',
        coordinates: { lat: 26.4207, lng: 50.0888 },
      },
      manager: {
        name: 'Khalid Al-Otaibi',
        email: 'khalid@cargoparts.sa',
        phone: '+966503456789',
      },
      metrics: {
        revenue: 156800,
        revenueChange: -3.1,
        orders: 198,
        ordersChange: -8.4,
        inventory: 2150,
        customers: 1245,
        rating: 4.4,
        fulfillmentRate: 88.5,
      },
      status: 'maintenance',
      type: 'warehouse',
      openingHours: {
        sunday: { open: '07:00', close: '19:00', isOpen: true },
        monday: { open: '07:00', close: '19:00', isOpen: true },
        tuesday: { open: '07:00', close: '19:00', isOpen: true },
        wednesday: { open: '07:00', close: '19:00', isOpen: true },
        thursday: { open: '07:00', close: '19:00', isOpen: true },
        friday: { open: '00:00', close: '00:00', isOpen: false },
        saturday: { open: '08:00', close: '16:00', isOpen: true },
      },
      permissions: ['inventory_manage', 'orders_process'],
      createdAt: '2024-02-10T09:30:00Z',
      lastActivity: '2024-12-15T16:20:00Z',
    },
  ]);

  const [crossStoreAnalytics] = useState<CrossStoreAnalytics>({
    totalRevenue: 591700,
    totalOrders: 818,
    totalInventory: 4380,
    averageRating: 4.6,
    topPerformingStore: 'CargoParts Riyadh Central',
    lowPerformingStore: 'CargoParts Dammam Warehouse',
    inventoryDistribution: [
      { storeId: '1', storeName: 'Riyadh Central', percentage: 28.5, value: 1250000 },
      { storeId: '2', storeName: 'Jeddah Port', percentage: 22.4, value: 980000 },
      { storeId: '3', storeName: 'Dammam Warehouse', percentage: 49.1, value: 2150000 },
    ],
    regionalPerformance: [
      { region: 'Riyadh Region', regionAr: 'منطقة الرياض', stores: 1, revenue: 245600, growth: 18.5 },
      { region: 'Makkah Region', regionAr: 'منطقة مكة المكرمة', stores: 1, revenue: 189300, growth: 8.2 },
      { region: 'Eastern Province', regionAr: 'المنطقة الشرقية', stores: 1, revenue: 156800, growth: -3.1 },
    ],
  });

  const [inventoryTransfers] = useState<InventoryTransfer[]>([
    {
      id: 'T001',
      fromStore: 'CargoParts Riyadh Central',
      toStore: 'CargoParts Jeddah Port',
      items: [
        { productId: 'E001', productName: isArabic ? 'محرك تويوتا كامري' : 'Toyota Camry Engine', quantity: 2, value: 17000 },
        { productId: 'B002', productName: isArabic ? 'فرامل هوندا أكورد' : 'Honda Accord Brakes', quantity: 5, value: 2250 },
      ],
      status: 'in_transit',
      requestedBy: 'Omar Al-Ghamdi',
      requestedAt: '2024-12-15T10:00:00Z',
      totalValue: 19250,
      notes: isArabic ? 'نقل عاجل لتلبية الطلب' : 'Urgent transfer to meet demand',
    },
    {
      id: 'T002',
      fromStore: 'CargoParts Dammam Warehouse',
      toStore: 'CargoParts Riyadh Central',
      items: [
        { productId: 'T001', productName: isArabic ? 'ناقل حركة نيسان' : 'Nissan Transmission', quantity: 1, value: 12000 },
      ],
      status: 'completed',
      requestedBy: 'Ahmed Al-Rashid',
      requestedAt: '2024-12-10T14:30:00Z',
      completedAt: '2024-12-12T11:00:00Z',
      totalValue: 12000,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'maintenance':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flagship':
        return <Building className="h-5 w-5 text-blue-600" />;
      case 'branch':
        return <Store className="h-5 w-5 text-green-600" />;
      case 'warehouse':
        return <Warehouse className="h-5 w-5 text-amber-600" />;
      case 'popup':
        return <Globe className="h-5 w-5 text-purple-600" />;
      default:
        return <Store className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTransferStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'in_transit':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const toggleStoreSelection = (storeId: string) => {
    setSelectedStores(prev => 
      prev.includes(storeId) 
        ? prev.filter(id => id !== storeId)
        : [...prev, storeId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <SaudiHeader
          title={isArabic ? 'إدارة المتاجر المتعددة' : 'Multi-Store Management'}
          subtitle={isArabic ? 'إدارة شاملة لجميع فروعك ومستودعاتك' : 'Comprehensive management for all your stores and warehouses'}
          variant="green"
        />
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {isArabic ? 'تصدير البيانات' : 'Export Data'}
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {isArabic ? 'إضافة متجر' : 'Add Store'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            {isArabic ? 'النظرة العامة' : 'Overview'}
          </TabsTrigger>
          <TabsTrigger value="stores">
            <Store className="h-4 w-4 mr-2" />
            {isArabic ? 'المتاجر' : 'Stores'}
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <Package className="h-4 w-4 mr-2" />
            {isArabic ? 'نقل المخزون' : 'Inventory Transfer'}
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <Activity className="h-4 w-4 mr-2" />
            {isArabic ? 'التحليلات' : 'Analytics'}
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            {isArabic ? 'الإعدادات' : 'Settings'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Cross-Store Analytics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SaudiCard variant="green">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-400">
                    {isArabic ? 'إجمالي الإيرادات' : 'Total Revenue'}
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-800 dark:text-green-300 mb-2">
                  {crossStoreAnalytics.totalRevenue.toLocaleString()} SAR
                </div>
                <div className="text-sm text-muted-foreground">
                  {isArabic ? 'عبر جميع المتاجر' : 'Across all stores'}
                </div>
              </CardContent>
            </SaudiCard>

            <SaudiCard variant="sky">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                    {isArabic ? 'إجمالي الطلبات' : 'Total Orders'}
                  </CardTitle>
                  <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-800 dark:text-blue-300 mb-2">
                  {crossStoreAnalytics.totalOrders}
                </div>
                <div className="text-sm text-muted-foreground">
                  {isArabic ? 'هذا الشهر' : 'This month'}
                </div>
              </CardContent>
            </SaudiCard>

            <SaudiCard variant="gold">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                    {isArabic ? 'المخزون الإجمالي' : 'Total Inventory'}
                  </CardTitle>
                  <Warehouse className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-800 dark:text-amber-300 mb-2">
                  {crossStoreAnalytics.totalInventory.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {isArabic ? 'قطعة غيار' : 'items'}
                </div>
              </CardContent>
            </SaudiCard>

            <SaudiCard variant="cultural">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-400">
                    {isArabic ? 'متوسط التقييم' : 'Average Rating'}
                  </CardTitle>
                  <Star className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-800 dark:text-purple-300 mb-2">
                  {crossStoreAnalytics.averageRating}
                </div>
                <div className="text-sm text-muted-foreground">
                  {isArabic ? 'من 5 نجوم' : 'out of 5 stars'}
                </div>
              </CardContent>
            </SaudiCard>
          </div>

          {/* Regional Performance */}
          <SaudiCard variant="green">
            <CardHeader>
              <CardTitle className="text-green-800 dark:text-green-300">
                {isArabic ? 'الأداء حسب المنطقة' : 'Regional Performance'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {crossStoreAnalytics.regionalPerformance.map((region, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-950/20 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-900 dark:text-green-200">
                          {isArabic ? region.regionAr : region.region}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {region.stores} {isArabic ? 'متجر' : 'stores'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-800 dark:text-green-300">
                        {region.revenue.toLocaleString()} SAR
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        {region.growth > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className={region.growth > 0 ? 'text-green-600' : 'text-red-600'}>
                          {region.growth > 0 ? '+' : ''}{region.growth}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </SaudiCard>
        </TabsContent>

        <TabsContent value="stores" className="space-y-6">
          {/* Store View Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Label>{isArabic ? 'العرض:' : 'View:'}</Label>
              <Select value={viewMode} onValueChange={(value: 'grid' | 'list') => setViewMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">{isArabic ? 'شبكة' : 'Grid'}</SelectItem>
                  <SelectItem value="list">{isArabic ? 'قائمة' : 'List'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedStores.length > 0 && (
              <Badge variant="secondary">
                {selectedStores.length} {isArabic ? 'محدد' : 'selected'}
              </Badge>
            )}
          </div>

          {/* Stores Grid/List */}
          <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
            {stores.map((store) => (
              <SaudiCard key={store.id} variant="sky" className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedStores.includes(store.id)}
                        onChange={() => toggleStoreSelection(store.id)}
                        className="mt-1"
                      />
                      <div>
                        {getTypeIcon(store.type)}
                      </div>
                      <div>
                        <CardTitle className="text-blue-800 dark:text-blue-300">
                          {isArabic ? store.nameAr : store.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {isArabic ? store.location.addressAr : store.location.address}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(store.status)}>
                      {store.status === 'active' ? (isArabic ? 'نشط' : 'Active') :
                       store.status === 'inactive' ? (isArabic ? 'غير نشط' : 'Inactive') :
                       (isArabic ? 'صيانة' : 'Maintenance')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-lg font-bold text-blue-800 dark:text-blue-300">
                          {store.metrics.revenue.toLocaleString()} SAR
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isArabic ? 'الإيرادات الشهرية' : 'Monthly Revenue'}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {store.metrics.revenueChange > 0 ? (
                            <TrendingUp className="h-3 w-3 text-green-600" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-600" />
                          )}
                          <span className={`text-xs ${store.metrics.revenueChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {store.metrics.revenueChange > 0 ? '+' : ''}{store.metrics.revenueChange}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-800 dark:text-blue-300">
                          {store.metrics.orders}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isArabic ? 'الطلبات الشهرية' : 'Monthly Orders'}
                        </div>
                      </div>
                    </div>

                    {/* Manager Info */}
                    <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                          {isArabic ? 'المدير' : 'Manager'}
                        </span>
                      </div>
                      <p className="text-sm">{store.manager.name}</p>
                      <p className="text-xs text-muted-foreground">{store.manager.email}</p>
                    </div>

                    {/* Key Metrics */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{isArabic ? 'المخزون:' : 'Inventory:'}</span>
                        <span className="font-medium">{store.metrics.inventory} {isArabic ? 'قطعة' : 'items'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>{isArabic ? 'التقييم:' : 'Rating:'}</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{store.metrics.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>{isArabic ? 'معدل التنفيذ:' : 'Fulfillment:'}</span>
                        <span className="font-medium">{store.metrics.fulfillmentRate}%</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        {isArabic ? 'عرض' : 'View'}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3 mr-1" />
                        {isArabic ? 'تحرير' : 'Edit'}
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3 mr-1" />
                        {isArabic ? 'إعدادات' : 'Settings'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </SaudiCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <SaudiCard variant="gold">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-amber-800 dark:text-amber-300">
                  {isArabic ? 'نقل المخزون بين المتاجر' : 'Inter-Store Inventory Transfers'}
                </CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {isArabic ? 'نقل جديد' : 'New Transfer'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventoryTransfers.map((transfer) => (
                  <div key={transfer.id} className="p-4 border rounded-lg bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/20">
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">#{transfer.id}</Badge>
                          <Badge className={getTransferStatusColor(transfer.status)}>
                            {transfer.status === 'pending' ? (isArabic ? 'معلق' : 'Pending') :
                             transfer.status === 'in_transit' ? (isArabic ? 'في الطريق' : 'In Transit') :
                             transfer.status === 'completed' ? (isArabic ? 'مكتمل' : 'Completed') :
                             (isArabic ? 'ملغى' : 'Cancelled')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{transfer.fromStore}</span>
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{transfer.toStore}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {isArabic ? 'طلبه:' : 'Requested by:'} {transfer.requestedBy}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-amber-800 dark:text-amber-300">
                          {transfer.totalValue.toLocaleString()} SAR
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {transfer.items.length} {isArabic ? 'منتج' : 'items'}
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-1 mb-3">
                      {transfer.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded">
                          <span>{item.productName}</span>
                          <div className="flex items-center gap-2">
                            <span>{isArabic ? 'الكمية:' : 'Qty:'} {item.quantity}</span>
                            <span>{item.value.toLocaleString()} SAR</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {isArabic ? 'تم الطلب:' : 'Requested:'} {new Date(transfer.requestedAt).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                      </span>
                      {transfer.completedAt && (
                        <span>
                          {isArabic ? 'تم الاكتمال:' : 'Completed:'} {new Date(transfer.completedAt).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                        </span>
                      )}
                    </div>

                    {transfer.notes && (
                      <p className="text-sm text-muted-foreground mt-2 p-2 bg-muted/20 rounded">
                        💬 {transfer.notes}
                      </p>
                    )}
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
                {isArabic ? 'تحليلات متقدمة للمتاجر المتعددة' : 'Advanced Multi-Store Analytics'}
              </CardTitle>
              <CardDescription>
                {isArabic ? 'رؤى شاملة لأداء جميع فروعك ومستودعاتك' : 'Comprehensive insights across all your locations'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Store Performance Comparison */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300">
                    {isArabic ? 'مقارنة أداء المتاجر' : 'Store Performance Comparison'}
                  </h4>
                  {stores.map((store) => (
                    <div key={store.id} className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{isArabic ? store.nameAr : store.name}</span>
                        <div className="flex items-center gap-1">
                          {store.metrics.revenueChange > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <span className={`text-sm ${store.metrics.revenueChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {store.metrics.revenueChange > 0 ? '+' : ''}{store.metrics.revenueChange}%
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>{isArabic ? 'الإيرادات' : 'Revenue'}</span>
                          <span>{store.metrics.revenue.toLocaleString()} SAR</span>
                        </div>
                        <Progress 
                          value={(store.metrics.revenue / crossStoreAnalytics.totalRevenue) * 100} 
                          className="h-2" 
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Inventory Distribution */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300">
                    {isArabic ? 'توزيع المخزون' : 'Inventory Distribution'}
                  </h4>
                  {crossStoreAnalytics.inventoryDistribution.map((item) => (
                    <div key={item.storeId} className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{item.storeName}</span>
                        <span className="text-sm font-bold">{item.percentage}%</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>{isArabic ? 'قيمة المخزون' : 'Inventory Value'}</span>
                          <span>{item.value.toLocaleString()} SAR</span>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </SaudiCard>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <SaudiCard variant="green">
            <CardHeader>
              <CardTitle className="text-green-800 dark:text-green-300">
                {isArabic ? 'إعدادات النظام المتعدد المتاجر' : 'Multi-Store System Settings'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-green-900 dark:text-green-200">
                    {isArabic ? 'الإعدادات العامة' : 'General Settings'}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">
                          {isArabic ? 'المزامنة التلقائية للمخزون' : 'Auto Inventory Sync'}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {isArabic ? 'مزامنة المخزون بين جميع المتاجر' : 'Sync inventory across all stores'}
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">
                          {isArabic ? 'التحويلات التلقائية' : 'Auto Transfers'}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {isArabic ? 'تحويل المخزون تلقائياً عند النفاد' : 'Auto transfer inventory when out of stock'}
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">
                          {isArabic ? 'التقارير المركزية' : 'Centralized Reporting'}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {isArabic ? 'تجميع تقارير جميع المتاجر' : 'Consolidate reports from all stores'}
                        </p>
                      </div>
                      <Switch defaultChecked />
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

export default MultiStoreManagement;