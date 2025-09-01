'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { SARSymbol } from '@/components/ui/currency-symbol';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Archive,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  BarChart3,
  Image as ImageIcon,
  Copy,
  ExternalLink,
  RefreshCw,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

interface InventoryItem {
  id: string;
  titleAr: string;
  titleEn: string | null;
  sku: string;
  priceSar: number;
  costSar: number;
  stock: number;
  lowStockThreshold: number;
  make: string;
  model: string;
  fromYear: number;
  toYear: number;
  condition: string;
  status: 'active' | 'inactive' | 'archived';
  views: number;
  orders: number;
  revenue: number;
  lastSold: string | null;
  createdAt: string;
  updatedAt: string;
  photos: { url: string }[];
}

interface InventoryStats {
  totalItems: number;
  activeItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
  potentialRevenue: number;
}

const conditionLabels: Record<string, Record<string, string>> = {
  NEW: { ar: 'جديد', en: 'New' },
  REFURBISHED: { ar: 'مجدد', en: 'Refurbished' },
  USED: { ar: 'مستعمل', en: 'Used' },
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  archived: 'bg-amber-100 text-amber-800',
};

export default function InventoryPage() {
  const locale = useLocale();
  const router = useRouter();
  const isArabic = locale === 'ar';
  
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCondition, setFilterCondition] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const [stats] = useState<InventoryStats>({
    totalItems: 156,
    activeItems: 143,
    lowStockItems: 8,
    outOfStockItems: 3,
    totalValue: 285000,
    potentialRevenue: 342000,
  });
  
  // Mock data
  useEffect(() => {
    const mockInventory: InventoryItem[] = [
      {
        id: '1',
        titleAr: 'محرك تويوتا كامري 2015-2018',
        titleEn: 'Toyota Camry Engine 2015-2018',
        sku: 'TCE-2015-001',
        priceSar: 8500,
        costSar: 6000,
        stock: 3,
        lowStockThreshold: 2,
        make: 'Toyota',
        model: 'Camry',
        fromYear: 2015,
        toYear: 2018,
        condition: 'REFURBISHED',
        status: 'active',
        views: 456,
        orders: 12,
        revenue: 102000,
        lastSold: '2024-12-15T10:30:00Z',
        createdAt: '2024-10-01T08:00:00Z',
        updatedAt: '2024-12-15T10:30:00Z',
        photos: [],
      },
      {
        id: '2',
        titleAr: 'فرامل هوندا أكورد أمامية',
        titleEn: 'Honda Accord Front Brakes',
        sku: 'HAB-2020-002',
        priceSar: 1200,
        costSar: 800,
        stock: 15,
        lowStockThreshold: 5,
        make: 'Honda',
        model: 'Accord',
        fromYear: 2018,
        toYear: 2022,
        condition: 'NEW',
        status: 'active',
        views: 234,
        orders: 8,
        revenue: 9600,
        lastSold: '2024-12-14T14:20:00Z',
        createdAt: '2024-09-15T09:30:00Z',
        updatedAt: '2024-12-14T14:20:00Z',
        photos: [],
      },
      {
        id: '3',
        titleAr: 'ناقل حركة نيسان ألتيما',
        titleEn: 'Nissan Altima Transmission',
        sku: 'NAT-2019-003',
        priceSar: 12000,
        costSar: 9000,
        stock: 1,
        lowStockThreshold: 2,
        make: 'Nissan',
        model: 'Altima',
        fromYear: 2016,
        toYear: 2020,
        condition: 'USED',
        status: 'active',
        views: 189,
        orders: 4,
        revenue: 48000,
        lastSold: '2024-12-10T16:45:00Z',
        createdAt: '2024-08-20T11:00:00Z',
        updatedAt: '2024-12-10T16:45:00Z',
        photos: [],
      },
      {
        id: '4',
        titleAr: 'مصابيح LED فورد F-150',
        titleEn: 'Ford F-150 LED Headlights',
        sku: 'FFH-2021-004',
        priceSar: 3500,
        costSar: 2500,
        stock: 0,
        lowStockThreshold: 3,
        make: 'Ford',
        model: 'F-150',
        fromYear: 2018,
        toYear: 2023,
        condition: 'NEW',
        status: 'active',
        views: 567,
        orders: 18,
        revenue: 63000,
        lastSold: '2024-12-16T09:15:00Z',
        createdAt: '2024-07-10T13:20:00Z',
        updatedAt: '2024-12-16T09:15:00Z',
        photos: [],
      },
    ];
    
    setInventory(mockInventory);
    setLoading(false);
  }, []);
  
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.titleEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.model.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesCondition = filterCondition === 'all' || item.condition === filterCondition;
    
    const matchesTab = activeTab === 'all' ||
      (activeTab === 'low-stock' && item.stock <= item.lowStockThreshold) ||
      (activeTab === 'out-of-stock' && item.stock === 0) ||
      (activeTab === 'archived' && item.status === 'archived');
    
    return matchesSearch && matchesStatus && matchesCondition && matchesTab;
  });
  
  const sortedInventory = [...filteredInventory].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'title':
        comparison = (isArabic ? a.titleAr : a.titleEn || a.titleAr)
          .localeCompare(isArabic ? b.titleAr : b.titleEn || b.titleAr);
        break;
      case 'price':
        comparison = a.priceSar - b.priceSar;
        break;
      case 'stock':
        comparison = a.stock - b.stock;
        break;
      case 'orders':
        comparison = a.orders - b.orders;
        break;
      case 'revenue':
        comparison = a.revenue - b.revenue;
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  const paginatedInventory = sortedInventory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(sortedInventory.length / itemsPerPage);
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(paginatedInventory.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };
  
  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };
  
  const handleBulkAction = (action: string) => {
    setSelectedAction(action);
    setBulkActionDialogOpen(true);
  };
  
  const executeBulkAction = () => {
    // Execute the bulk action
    console.log(`Executing ${selectedAction} on ${selectedItems.size} items`);
    setBulkActionDialogOpen(false);
    setSelectedItems(new Set());
  };
  
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };
  
  const getStockStatus = (item: InventoryItem) => {
    if (item.stock === 0) {
      return { label: isArabic ? 'نفذ المخزون' : 'Out of Stock', color: 'destructive' };
    } else if (item.stock <= item.lowStockThreshold) {
      return { label: isArabic ? 'مخزون منخفض' : 'Low Stock', color: 'warning' };
    }
    return { label: isArabic ? 'متوفر' : 'In Stock', color: 'success' };
  };
  
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
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold card-title-enhanced">
              {isArabic ? 'إدارة المخزون' : 'Inventory Management'}
            </h1>
            <p className="text-muted-foreground text-label mt-1">
              {isArabic 
                ? `${stats.totalItems} قطعة في المخزون بقيمة ${formatCurrency(stats.totalValue)} ريال`
                : `${stats.totalItems} items worth ${formatCurrency(stats.totalValue)} SAR`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="me-2 h-4 w-4" />
              {isArabic ? 'تحديث' : 'Refresh'}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="me-2 h-4 w-4" />
                  {isArabic ? 'تصدير' : 'Export'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  {isArabic ? 'تصدير كـ CSV' : 'Export as CSV'}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  {isArabic ? 'تصدير كـ Excel' : 'Export as Excel'}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  {isArabic ? 'تصدير كـ PDF' : 'Export as PDF'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline">
              <Upload className="me-2 h-4 w-4" />
              {isArabic ? 'استيراد' : 'Import'}
            </Button>
            <Button asChild>
              <Link href={`/${locale}/seller/inventory/new`}>
                <Plus className="me-2 h-4 w-4" />
                {isArabic ? 'إضافة قطعة' : 'Add Part'}
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-label font-semibold text-muted-foreground">
                {isArabic ? 'إجمالي القطع' : 'Total Items'}
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-price">{stats.totalItems}</div>
            <p className="text-detail text-muted-foreground mt-1">
              {stats.activeItems} {isArabic ? 'نشط' : 'active'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-label font-semibold text-muted-foreground">
                {isArabic ? 'قيمة المخزون' : 'Inventory Value'}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-price flex items-center gap-1">
              {formatCurrency(stats.totalValue)}
              <SARSymbol className="h-5 w-5" />
            </div>
            <p className="text-detail text-muted-foreground mt-1">
              {isArabic ? 'القيمة الإجمالية' : 'Total value'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-label font-semibold text-muted-foreground">
                {isArabic ? 'مخزون منخفض' : 'Low Stock'}
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-price text-amber-600">{stats.lowStockItems}</div>
            <p className="text-detail text-muted-foreground mt-1">
              {isArabic ? 'تحتاج إعادة تخزين' : 'Need restocking'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-label font-semibold text-muted-foreground">
                {isArabic ? 'نفذ المخزون' : 'Out of Stock'}
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-price text-red-600">{stats.outOfStockItems}</div>
            <p className="text-detail text-muted-foreground mt-1">
              {isArabic ? 'غير متوفر' : 'Unavailable'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">
            {isArabic ? 'الكل' : 'All'} ({stats.totalItems})
          </TabsTrigger>
          <TabsTrigger value="low-stock">
            {isArabic ? 'مخزون منخفض' : 'Low Stock'} ({stats.lowStockItems})
          </TabsTrigger>
          <TabsTrigger value="out-of-stock">
            {isArabic ? 'نفذ المخزون' : 'Out of Stock'} ({stats.outOfStockItems})
          </TabsTrigger>
          <TabsTrigger value="archived">
            {isArabic ? 'مؤرشف' : 'Archived'} (5)
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={isArabic ? 'البحث بالاسم، SKU، الشركة...' : 'Search by name, SKU, make...'}
            className="ps-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={isArabic ? 'الحالة' : 'Status'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isArabic ? 'جميع الحالات' : 'All Status'}</SelectItem>
            <SelectItem value="active">{isArabic ? 'نشط' : 'Active'}</SelectItem>
            <SelectItem value="inactive">{isArabic ? 'غير نشط' : 'Inactive'}</SelectItem>
            <SelectItem value="archived">{isArabic ? 'مؤرشف' : 'Archived'}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCondition} onValueChange={setFilterCondition}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={isArabic ? 'الحالة' : 'Condition'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isArabic ? 'جميع الحالات' : 'All Conditions'}</SelectItem>
            <SelectItem value="NEW">{conditionLabels.NEW[locale as 'ar' | 'en']}</SelectItem>
            <SelectItem value="REFURBISHED">{conditionLabels.REFURBISHED[locale as 'ar' | 'en']}</SelectItem>
            <SelectItem value="USED">{conditionLabels.USED[locale as 'ar' | 'en']}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="me-2 h-4 w-4" />
          {isArabic ? 'فلاتر متقدمة' : 'Advanced Filters'}
        </Button>
      </div>
      
      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <div className="mb-4 p-4 bg-muted/50 rounded-lg flex items-center justify-between">
          <p className="text-sm font-medium">
            {selectedItems.size} {isArabic ? 'عنصر محدد' : 'items selected'}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleBulkAction('activate')}>
              <CheckCircle className="me-2 h-4 w-4" />
              {isArabic ? 'تفعيل' : 'Activate'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkAction('deactivate')}>
              <XCircle className="me-2 h-4 w-4" />
              {isArabic ? 'إلغاء التفعيل' : 'Deactivate'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkAction('archive')}>
              <Archive className="me-2 h-4 w-4" />
              {isArabic ? 'أرشفة' : 'Archive'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-destructive"
              onClick={() => handleBulkAction('delete')}
            >
              <Trash2 className="me-2 h-4 w-4" />
              {isArabic ? 'حذف' : 'Delete'}
            </Button>
          </div>
        </div>
      )}
      
      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedItems.size === paginatedInventory.length && paginatedInventory.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-[80px]">{isArabic ? 'الصورة' : 'Image'}</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3"
                      onClick={() => handleSort('title')}
                    >
                      {isArabic ? 'القطعة' : 'Part'}
                      {sortBy === 'title' ? (
                        sortOrder === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>{isArabic ? 'SKU' : 'SKU'}</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3"
                      onClick={() => handleSort('price')}
                    >
                      {isArabic ? 'السعر' : 'Price'}
                      {sortBy === 'price' ? (
                        sortOrder === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3"
                      onClick={() => handleSort('stock')}
                    >
                      {isArabic ? 'المخزون' : 'Stock'}
                      {sortBy === 'stock' ? (
                        sortOrder === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>{isArabic ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3"
                      onClick={() => handleSort('orders')}
                    >
                      {isArabic ? 'الطلبات' : 'Orders'}
                      {sortBy === 'orders' ? (
                        sortOrder === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3"
                      onClick={() => handleSort('revenue')}
                    >
                      {isArabic ? 'الإيرادات' : 'Revenue'}
                      {sortBy === 'revenue' ? (
                        sortOrder === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">{isArabic ? 'الإجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInventory.map((item) => {
                  const stockStatus = getStockStatus(item);
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.has(item.id)}
                          onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        {item.photos.length > 0 ? (
                          <Image
                            src={item.photos[0].url}
                            alt=""
                            width={60}
                            height={60}
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          <ImagePlaceholder
                            className="w-[60px] h-[60px] rounded-lg"
                            type="part"
                            size="sm"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-label font-semibold card-title-enhanced line-clamp-1">
                            {isArabic ? item.titleAr : item.titleEn || item.titleAr}
                          </p>
                          <p className="text-detail text-muted-foreground">
                            {item.make} {item.model} • {item.fromYear}-{item.toYear}
                          </p>
                          <Badge variant="secondary" className="mt-1 badge-text">
                            {conditionLabels[item.condition]?.[locale as 'ar' | 'en']}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm">{item.sku}</code>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-label font-semibold flex items-center gap-1">
                            {formatCurrency(item.priceSar)}
                            <SARSymbol className="h-3 w-3" />
                          </p>
                          <p className="text-detail text-muted-foreground">
                            {isArabic ? 'التكلفة: ' : 'Cost: '}
                            {formatCurrency(item.costSar)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-label font-semibold",
                            item.stock === 0 && "text-red-600",
                            item.stock <= item.lowStockThreshold && item.stock > 0 && "text-amber-600"
                          )}>
                            {item.stock}
                          </span>
                          <Badge variant={stockStatus.color as any} className="badge-text">
                            {stockStatus.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(statusColors[item.status], "badge-text")}>
                          {item.status === 'active' && (isArabic ? 'نشط' : 'Active')}
                          {item.status === 'inactive' && (isArabic ? 'غير نشط' : 'Inactive')}
                          {item.status === 'archived' && (isArabic ? 'مؤرشف' : 'Archived')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-label font-semibold">{item.orders}</p>
                          <p className="text-detail text-muted-foreground flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {item.views}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-label font-semibold flex items-center gap-1">
                            {formatCurrency(item.revenue)}
                            <SARSymbol className="h-3 w-3" />
                          </p>
                          {item.lastSold && (
                            <p className="text-detail text-muted-foreground">
                              {formatDate(item.lastSold)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/${locale}/shop/listing/${item.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              {isArabic ? 'عرض' : 'View'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/${locale}/seller/inventory/${item.id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              {isArabic ? 'تعديل' : 'Edit'}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" />
                              {isArabic ? 'نسخ' : 'Duplicate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart3 className="mr-2 h-4 w-4" />
                              {isArabic ? 'التحليلات' : 'Analytics'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {item.status === 'active' ? (
                              <DropdownMenuItem>
                                <XCircle className="mr-2 h-4 w-4" />
                                {isArabic ? 'إلغاء التفعيل' : 'Deactivate'}
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {isArabic ? 'تفعيل' : 'Activate'}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Archive className="mr-2 h-4 w-4" />
                              {isArabic ? 'أرشفة' : 'Archive'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => setDeleteDialogOpen(true)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {isArabic ? 'حذف' : 'Delete'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t px-4 py-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {isArabic 
                  ? `عرض ${(currentPage - 1) * itemsPerPage + 1} إلى ${Math.min(currentPage * itemsPerPage, sortedInventory.length)} من ${sortedInventory.length} عنصر`
                  : `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, sortedInventory.length)} of ${sortedInventory.length} items`}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isArabic ? 'هل أنت متأكد؟' : 'Are you sure?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isArabic 
                ? 'لا يمكن التراجع عن هذا الإجراء. سيتم حذف القطعة نهائياً.'
                : 'This action cannot be undone. This will permanently delete the part.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground">
              {isArabic ? 'حذف' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Bulk Action Confirmation Dialog */}
      <AlertDialog open={bulkActionDialogOpen} onOpenChange={setBulkActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isArabic ? 'تأكيد الإجراء' : 'Confirm Action'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isArabic 
                ? `سيتم تطبيق "${selectedAction}" على ${selectedItems.size} عنصر محدد.`
                : `This will apply "${selectedAction}" to ${selectedItems.size} selected items.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction onClick={executeBulkAction}>
              {isArabic ? 'تأكيد' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}