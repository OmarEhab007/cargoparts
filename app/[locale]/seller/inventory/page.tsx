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
import { cn } from '@/lib/utils';
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
  quantity: number;
  make: string;
  model: string;
  fromYear: number;
  toYear: number;
  condition: string;
  status: string;
  viewCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  photos: { url: string; alt?: string }[];
  isLowStock: boolean;
  daysSinceCreated: number;
  reviewCount: number;
}

interface InventoryStats {
  overview: {
    totalListings: number;
    published: number;
    draft: number;
    sold: number;
    suspended: number;
    totalQuantity: number;
    totalViews: number;
  };
  stockAlerts: {
    lowStock: number;
    outOfStock: number;
  };
  activity: {
    newListingsThisMonth: number;
  };
  topPerformers: Array<{
    id: string;
    title: string;
    views: number;
    price: number;
    image: string | null;
  }>;
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
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sellerId, setSellerId] = useState<string | null>(null);
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
  
  // Fetch seller information and inventory
  useEffect(() => {
    const fetchSellerInfo = async () => {
      try {
        // Get current user and seller info from the server
        const userResponse = await fetch('/api/auth/me');
        if (!userResponse.ok) {
          router.push(`/${locale}/auth/login`);
          return;
        }
        
        const userData = await userResponse.json();
        if (userData.user.role !== 'SELLER') {
          router.push(`/${locale}`);
          return;
        }

        // Get seller profile to get seller ID
        const sellerResponse = await fetch('/api/sellers/me');
        if (!sellerResponse.ok) {
          console.error('Failed to fetch seller profile');
          return;
        }
        
        const sellerData = await sellerResponse.json();
        setSellerId(sellerData.data.id);
        
      } catch (error) {
        console.error('Error fetching seller info:', error);
        router.push(`/${locale}/auth/login`);
      }
    };

    fetchSellerInfo();
  }, [locale, router]);

  // Fetch inventory data when seller ID is available
  useEffect(() => {
    if (!sellerId) return;
    
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
          ...(searchQuery && { search: searchQuery }),
          ...(filterStatus !== 'all' && { status: filterStatus }),
          ...(filterCondition !== 'all' && { condition: filterCondition }),
          ...(activeTab === 'low-stock' && { lowStock: 'true' }),
          sortBy,
          sortOrder
        });
        
        const response = await fetch(`/api/sellers/${sellerId}/inventory?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch inventory');
        }
        
        const data = await response.json();
        setInventory(data.data || []);
        setStats(data.metadata?.metrics || null);
        
      } catch (error) {
        console.error('Error fetching inventory:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [sellerId, currentPage, itemsPerPage, searchQuery, filterStatus, filterCondition, activeTab, sortBy, sortOrder]);
  
  // Since filtering and sorting is handled server-side, we can use the inventory directly
  // Client-side filtering is only needed for local search
  const paginatedInventory = inventory;
  const totalPages = 1; // Server handles pagination
  
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
    if (item.quantity === 0) {
      return { label: isArabic ? 'نفذ المخزون' : 'Out of Stock', color: 'destructive' };
    } else if (item.isLowStock) {
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
              {stats && isArabic 
                ? `${stats.overview.totalListings} قطعة في المخزون (${stats.overview.totalQuantity} كمية)`
                : `${stats?.overview.totalListings || 0} items (${stats?.overview.totalQuantity || 0} quantity)`}
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
            <div className="text-price">{stats?.overview.totalListings || 0}</div>
            <p className="text-detail text-muted-foreground mt-1">
              {stats?.overview.published || 0} {isArabic ? 'نشط' : 'active'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-label font-semibold text-muted-foreground">
                {isArabic ? 'إجمالي المشاهدات' : 'Total Views'}
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-price">
              {formatCurrency(stats?.overview.totalViews || 0)}
            </div>
            <p className="text-detail text-muted-foreground mt-1">
              {isArabic ? 'إجمالي المشاهدات' : 'Total views'}
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
            <div className="text-price text-amber-600">{stats?.stockAlerts.lowStock || 0}</div>
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
            <div className="text-price text-red-600">{stats?.stockAlerts.outOfStock || 0}</div>
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
            {isArabic ? 'الكل' : 'All'} ({stats?.overview.totalListings || 0})
          </TabsTrigger>
          <TabsTrigger value="low-stock">
            {isArabic ? 'مخزون منخفض' : 'Low Stock'} ({stats?.stockAlerts.lowStock || 0})
          </TabsTrigger>
          <TabsTrigger value="out-of-stock">
            {isArabic ? 'نفذ المخزون' : 'Out of Stock'} ({stats?.stockAlerts.outOfStock || 0})
          </TabsTrigger>
          <TabsTrigger value="archived">
            {isArabic ? 'مؤرشف' : 'Archived'} (0)
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
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setCurrentPage(1); // Reset to first page when searching
              }
            }}
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
                      onClick={() => handleSort('viewCount')}
                    >
                      {isArabic ? 'المشاهدات' : 'Views'}
                      {sortBy === 'viewCount' ? (
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
                      onClick={() => handleSort('createdAt')}
                    >
                      {isArabic ? 'العمر' : 'Age'}
                      {sortBy === 'createdAt' ? (
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
                            {formatCurrency(item.priceSar / 100)}
                            <SARSymbol className="h-3 w-3" />
                          </p>
                          <p className="text-detail text-muted-foreground">
                            {isArabic ? 'SKU: ' : 'SKU: '}{item.sku}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-label font-semibold",
                            item.quantity === 0 && "text-red-600",
                            item.isLowStock && item.quantity > 0 && "text-amber-600"
                          )}>
                            {item.quantity}
                          </span>
                          <Badge variant={stockStatus.color as any} className="badge-text">
                            {stockStatus.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          item.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                          item.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                          item.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800',
                          "badge-text"
                        )}>
                          {item.status === 'PUBLISHED' && (isArabic ? 'منشور' : 'Published')}
                          {item.status === 'DRAFT' && (isArabic ? 'مسودة' : 'Draft')}
                          {item.status === 'SOLD' && (isArabic ? 'مباع' : 'Sold')}
                          {item.status === 'SUSPENDED' && (isArabic ? 'معلق' : 'Suspended')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-label font-semibold">{item.reviewCount || 0}</p>
                          <p className="text-detail text-muted-foreground flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {item.viewCount}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-label font-medium">
                            {item.daysSinceCreated} {isArabic ? 'يوم' : 'days'}
                          </p>
                          {item.publishedAt && (
                            <p className="text-detail text-muted-foreground">
                              {formatDate(item.publishedAt)}
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