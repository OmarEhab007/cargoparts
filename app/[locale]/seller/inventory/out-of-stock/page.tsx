'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  Edit,
  Plus,
  Eye,
  Package,
  XCircle,
  AlertTriangle,
  TrendingDown,
  RefreshCw,
  ShoppingCart,
  Calendar,
  BarChart3,
  Clock,
  Archive,
  Trash2,
  MessageCircle,
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
  outOfStockSince: string;
  demandScore: number;
  waitlistCount: number;
  createdAt: string;
  updatedAt: string;
  photos: { url: string }[];
}

const generateOutOfStockItems = (): InventoryItem[] => {
  const arabicTitles = [
    'بطارية - BMW X5 2022',
    'مصابيح أمامية - مرسيدس C-Class 2021',
    'إطارات - أودي A4 2020',
    'مكيف هواء - لكزس ES 2019',
    'نظام GPS - كاديلاك CTS 2020',
    'فرامل ABS - إنفينيتي Q50 2021',
  ];

  const englishTitles = [
    'Battery - BMW X5 2022',
    'Headlights - Mercedes C-Class 2021',
    'Tires Set - Audi A4 2020',
    'Air Conditioning - Lexus ES 2019',
    'GPS System - Cadillac CTS 2020',
    'ABS Brake System - Infiniti Q50 2021',
  ];

  const makes = ['BMW', 'Mercedes', 'Audi', 'Lexus', 'Cadillac', 'Infiniti'];
  const models = ['X5', 'C-Class', 'A4', 'ES', 'CTS', 'Q50'];
  const conditions = ['NEW', 'REFURBISHED', 'USED'];

  return Array.from({ length: 6 }, (_, i) => ({
    id: `out-of-stock-${i + 1}`,
    titleAr: arabicTitles[i],
    titleEn: englishTitles[i],
    sku: `OOS-${2000 + i}`,
    priceSar: Math.floor(200 + Math.random() * 800),
    costSar: Math.floor(150 + Math.random() * 400),
    stock: 0, // All out of stock
    lowStockThreshold: Math.floor(5 + Math.random() * 15),
    make: makes[i],
    model: models[i],
    fromYear: 2019 + i % 4,
    toYear: 2023,
    condition: conditions[i % 3],
    status: 'active' as const,
    views: Math.floor(100 + Math.random() * 500),
    orders: Math.floor(10 + Math.random() * 50),
    revenue: Math.floor(2000 + Math.random() * 8000),
    lastSold: new Date(Date.now() - (i + 5) * 24 * 3600000).toISOString(),
    outOfStockSince: new Date(Date.now() - (i + 1) * 24 * 3600000).toISOString(),
    demandScore: Math.floor(60 + Math.random() * 40), // 60-100 demand score
    waitlistCount: Math.floor(Math.random() * 15),
    createdAt: new Date(Date.now() - (60 + i * 10) * 24 * 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
    photos: [{ url: '' }],
  }));
};

export default function OutOfStockPage() {
  const locale = useLocale();
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>(generateOutOfStockItems());
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('demand');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showRestockDialog, setShowRestockDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [restockQuantity, setRestockQuantity] = useState<number>(10);

  const isArabic = locale === 'ar';

  const conditionLabels: Record<string, Record<string, string>> = {
    NEW: { ar: 'جديد', en: 'New' },
    REFURBISHED: { ar: 'مجدد', en: 'Refurbished' },
    USED: { ar: 'مستعمل', en: 'Used' },
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(items.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    }
  };

  const handleRestock = (itemId?: string) => {
    const targetItems = itemId ? [itemId] : selectedItems;
    
    setItems(items.filter(item => !targetItems.includes(item.id)));

    toast({
      title: isArabic ? 'تم تحديث المخزون' : 'Stock Updated',
      description: isArabic 
        ? `تم إعادة تخزين المنتجات وإزالتها من قائمة النفاد`
        : `Items restocked and removed from out-of-stock list`,
      variant: 'success',
    });

    setShowRestockDialog(false);
    setSelectedItems([]);
    setRestockQuantity(10);
  };

  const handleArchiveItems = () => {
    setItems(items.filter(item => !selectedItems.includes(item.id)));

    toast({
      title: isArabic ? 'تم أرشفة المنتجات' : 'Items Archived',
      description: isArabic 
        ? `تم أرشفة ${selectedItems.length} منتج`
        : `${selectedItems.length} items moved to archive`,
    });

    setShowArchiveDialog(false);
    setSelectedItems([]);
  };

  const sortedItems = [...items].sort((a, b) => {
    switch (sortBy) {
      case 'demand':
        return b.demandScore - a.demandScore;
      case 'waitlist':
        return b.waitlistCount - a.waitlistCount;
      case 'revenue':
        return b.revenue - a.revenue;
      case 'outOfStock':
        return new Date(a.outOfStockSince).getTime() - new Date(b.outOfStockSince).getTime();
      default:
        return 0;
    }
  });

  const filteredItems = sortedItems.filter(item => {
    const matchesSearch = item.titleAr.includes(searchQuery) || 
                         item.titleEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const getDemandLevel = (score: number) => {
    if (score >= 90) return { level: isArabic ? 'مرتفع جداً' : 'Very High', color: 'bg-red-100 text-red-800' };
    if (score >= 75) return { level: isArabic ? 'مرتفع' : 'High', color: 'bg-orange-100 text-orange-800' };
    if (score >= 60) return { level: isArabic ? 'متوسط' : 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    return { level: isArabic ? 'منخفض' : 'Low', color: 'bg-blue-100 text-blue-800' };
  };

  const getDaysOutOfStock = (outOfStockSince: string) => {
    return Math.floor((Date.now() - new Date(outOfStockSince).getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-slate-200 dark:bg-slate-950/90 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/${locale}/seller/inventory`}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  <ArrowLeft className="h-4 w-4 me-2" />
                  {isArabic ? 'جميع المنتجات' : 'All Products'}
                </Button>
              </Link>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  {isArabic ? 'نفدت الكمية' : 'Out of Stock'}
                  <Badge className="bg-red-500 text-white">
                    {filteredItems.length}
                  </Badge>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isArabic 
                    ? 'منتجات نفدت كمياتها وتحتاج إعادة تخزين'
                    : 'Products that are completely out of stock'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {selectedItems.length > 0 && (
                <>
                  <Badge variant="outline" className="text-saudi-green">
                    {isArabic 
                      ? `${selectedItems.length} محدد`
                      : `${selectedItems.length} selected`
                    }
                  </Badge>
                  <Button
                    onClick={() => setShowRestockDialog(true)}
                    className="bg-saudi-green hover:bg-saudi-green/90 text-white"
                  >
                    <RefreshCw className="h-4 w-4 me-2" />
                    {isArabic ? 'إعادة تخزين' : 'Restock'}
                  </Button>
                  <Button
                    onClick={() => setShowArchiveDialog(true)}
                    variant="outline"
                    className="border-slate-300"
                  >
                    <Archive className="h-4 w-4 me-2" />
                    {isArabic ? 'أرشفة' : 'Archive'}
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                className="border-slate-200"
              >
                <Download className="h-4 w-4 me-2" />
                {isArabic ? 'تصدير' : 'Export'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {isArabic ? 'إجمالي نفدت الكمية' : 'Total Out of Stock'}
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {filteredItems.length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {isArabic ? 'إيرادات محتملة' : 'Potential Revenue'}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    <SARSymbol className="h-4 w-4" />
                    {filteredItems.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {isArabic ? 'قوائم الانتظار' : 'Total Waitlist'}
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {filteredItems.reduce((sum, item) => sum + item.waitlistCount, 0)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {isArabic ? 'متوسط الطلب' : 'Avg. Demand Score'}
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {Math.floor(filteredItems.reduce((sum, item) => sum + item.demandScore, 0) / filteredItems.length)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isArabic 
                      ? 'البحث بالاسم أو رقم المنتج...'
                      : 'Search by name or SKU...'
                    }
                    className="ps-10 border-slate-200"
                  />
                </div>
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px] border-slate-200">
                  <Filter className="h-4 w-4 me-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="demand">
                    {isArabic ? 'حسب الطلب' : 'By Demand Score'}
                  </SelectItem>
                  <SelectItem value="waitlist">
                    {isArabic ? 'حسب قائمة الانتظار' : 'By Waitlist Count'}
                  </SelectItem>
                  <SelectItem value="revenue">
                    {isArabic ? 'حسب الإيرادات' : 'By Revenue Potential'}
                  </SelectItem>
                  <SelectItem value="outOfStock">
                    {isArabic ? 'حسب تاريخ النفاد' : 'By Out of Stock Date'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 dark:border-slate-700">
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>{isArabic ? 'المنتج' : 'Product'}</TableHead>
                    <TableHead>{isArabic ? 'نفدت منذ' : 'Out of Stock For'}</TableHead>
                    <TableHead>{isArabic ? 'مستوى الطلب' : 'Demand Level'}</TableHead>
                    <TableHead>{isArabic ? 'قائمة الانتظار' : 'Waitlist'}</TableHead>
                    <TableHead>{isArabic ? 'آخر بيع' : 'Last Sold'}</TableHead>
                    <TableHead>{isArabic ? 'السعر' : 'Price'}</TableHead>
                    <TableHead className="text-end">{isArabic ? 'الإجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const demand = getDemandLevel(item.demandScore);
                    const daysOut = getDaysOutOfStock(item.outOfStockSince);
                    
                    return (
                      <TableRow 
                        key={item.id}
                        className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                              <Package className="h-6 w-6 text-slate-400" />
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">
                                {isArabic ? item.titleAr : item.titleEn || item.titleAr}
                              </div>
                              <div className="text-sm text-slate-500">
                                {item.sku} • {item.make} {item.model} ({item.fromYear}-{item.toYear})
                              </div>
                              <Badge variant="outline" className="text-xs mt-1">
                                {conditionLabels[item.condition]?.[isArabic ? 'ar' : 'en'] || item.condition}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-lg font-bold text-red-600">
                              {daysOut} {isArabic ? 'يوم' : 'days'}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(item.outOfStockSince).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge className={cn("text-xs w-fit", demand.color)}>
                              {demand.level}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {item.demandScore}/100
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.waitlistCount > 0 ? (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-blue-500" />
                              <span className="font-medium text-blue-600">
                                {item.waitlistCount} {isArabic ? 'عميل' : 'customers'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm">{isArabic ? 'لا يوجد' : 'None'}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {item.lastSold ? (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-slate-400" />
                                {new Date(item.lastSold).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                              </div>
                            ) : (
                              <span className="text-slate-400">{isArabic ? 'لا يوجد' : 'No sales'}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 font-medium text-slate-900 dark:text-white">
                            <SARSymbol className="h-4 w-4" />
                            {item.priceSar.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedItem(item)}
                            >
                              <Eye className="h-4 w-4 me-1" />
                              {isArabic ? 'عرض' : 'View'}
                            </Button>
                            {item.waitlistCount > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                              >
                                <MessageCircle className="h-4 w-4 me-1" />
                                {isArabic ? 'إشعار العملاء' : 'Notify Waitlist'}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              className="bg-saudi-green hover:bg-saudi-green/90 text-white"
                              onClick={() => {
                                setSelectedItem(item);
                                setShowRestockDialog(true);
                              }}
                            >
                              <RefreshCw className="h-4 w-4 me-1" />
                              {isArabic ? 'إعادة تخزين' : 'Restock'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <XCircle className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  {isArabic ? 'لا توجد منتجات نفدت كمياتها' : 'No Out of Stock Items'}
                </h3>
                <p className="text-sm text-slate-500">
                  {isArabic 
                    ? 'جميع منتجاتك متوفرة في المخزون'
                    : 'All your products are currently in stock'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Restock Dialog */}
      <Dialog open={showRestockDialog} onOpenChange={setShowRestockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-saudi-green">
              {isArabic ? 'إعادة تخزين المنتج' : 'Restock Items'}
            </DialogTitle>
            <DialogDescription>
              {selectedItem ? (
                isArabic 
                  ? `إعادة تخزين: ${selectedItem.titleAr}`
                  : `Restocking: ${selectedItem.titleEn || selectedItem.titleAr}`
              ) : (
                isArabic 
                  ? `إعادة تخزين ${selectedItems.length} منتج`
                  : `Restocking ${selectedItems.length} items`
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="restock-quantity">
                {isArabic ? 'كمية الإضافة' : 'Quantity to Add'}
              </Label>
              <Input
                id="restock-quantity"
                type="number"
                min="1"
                value={restockQuantity}
                onChange={(e) => setRestockQuantity(parseInt(e.target.value) || 1)}
                className="mt-1"
              />
            </div>
            {selectedItem && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{isArabic ? 'المخزون الحالي:' : 'Current Stock:'}</span>
                  <span className="font-medium text-red-600">0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{isArabic ? 'بعد الإضافة:' : 'After Adding:'}</span>
                  <span className="font-medium text-saudi-green">{restockQuantity}</span>
                </div>
                {selectedItem.waitlistCount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>{isArabic ? 'قائمة الانتظار:' : 'Waitlist:'}</span>
                    <span className="font-medium text-blue-600">{selectedItem.waitlistCount} {isArabic ? 'عميل' : 'customers'}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestockDialog(false)}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              className="bg-saudi-green hover:bg-saudi-green/90"
              onClick={() => handleRestock(selectedItem?.id)}
            >
              <RefreshCw className="h-4 w-4 me-2" />
              {isArabic ? 'تحديث المخزون' : 'Update Stock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Dialog */}
      <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-amber-600">
              {isArabic ? 'أرشفة المنتجات' : 'Archive Items'}
            </DialogTitle>
            <DialogDescription>
              {isArabic 
                ? `هل تريد أرشفة ${selectedItems.length} منتج؟ يمكنك استعادتها لاحقاً من الأرشيف.`
                : `Are you sure you want to archive ${selectedItems.length} items? You can restore them later from the archive.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-800 dark:text-amber-200">
                {isArabic 
                  ? 'المنتجات المؤرشفة لن تظهر للعملاء ولكن ستبقى بياناتها محفوظة.'
                  : 'Archived items will not be visible to customers but their data will be preserved.'
                }
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowArchiveDialog(false)}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              variant="default"
              className="bg-amber-600 hover:bg-amber-700"
              onClick={handleArchiveItems}
            >
              <Archive className="h-4 w-4 me-2" />
              {isArabic ? 'تأكيد الأرشفة' : 'Confirm Archive'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}