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
  AlertTriangle,
  TrendingDown,
  RefreshCw,
  ShoppingCart,
  Calendar,
  BarChart3,
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

const generateLowStockItems = (): InventoryItem[] => {
  const arabicTitles = [
    'مرشح زيت - تويوتا كامري 2020',
    'مساعدات امامية - هوندا اكورد 2019',
    'فرامل خلفية - نيسان التيما 2021',
  ];

  const englishTitles = [
    'Oil Filter - Toyota Camry 2020',
    'Front Shock Absorbers - Honda Accord 2019',
    'Rear Brake Pads - Nissan Altima 2021',
  ];

  const makes = ['Toyota', 'Honda', 'Nissan'];
  const models = ['Camry', 'Accord', 'Altima'];
  const conditions = ['NEW', 'REFURBISHED', 'USED'];

  return Array.from({ length: 3 }, (_, i) => ({
    id: `low-stock-${i + 1}`,
    titleAr: arabicTitles[i],
    titleEn: englishTitles[i],
    sku: `LSK-${1000 + i}`,
    priceSar: Math.floor(80 + Math.random() * 200),
    costSar: Math.floor(50 + Math.random() * 100),
    stock: i + 1, // 1, 2, 3 (all low stock)
    lowStockThreshold: Math.floor(5 + Math.random() * 10),
    make: makes[i],
    model: models[i],
    fromYear: 2018 + i,
    toYear: 2022 + i,
    condition: conditions[i % 3],
    status: 'active' as const,
    views: Math.floor(50 + Math.random() * 200),
    orders: Math.floor(5 + Math.random() * 20),
    revenue: Math.floor(500 + Math.random() * 2000),
    lastSold: i === 0 ? new Date(Date.now() - 2 * 24 * 3600000).toISOString() : 
              i === 1 ? new Date(Date.now() - 5 * 24 * 3600000).toISOString() : null,
    createdAt: new Date(Date.now() - (30 + i * 10) * 24 * 3600000).toISOString(),
    updatedAt: new Date().toISOString(),
    photos: [{ url: '' }],
  }));
};

export default function LowStockPage() {
  const locale = useLocale();
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>(generateLowStockItems());
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showRestockDialog, setShowRestockDialog] = useState(false);
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
    
    setItems(items.map(item => 
      targetItems.includes(item.id)
        ? { ...item, stock: item.stock + restockQuantity }
        : item
    ));

    toast({
      title: isArabic ? 'تم تحديث المخزون' : 'Stock Updated',
      description: isArabic 
        ? `تم إضافة ${restockQuantity} قطعة للمنتجات المحددة`
        : `Added ${restockQuantity} units to selected items`,
      variant: 'success',
    });

    setShowRestockDialog(false);
    setSelectedItems([]);
    setRestockQuantity(10);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.titleAr.includes(searchQuery) || 
                         item.titleEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCondition = conditionFilter === 'all' || item.condition === conditionFilter;
    
    return matchesSearch && matchesCondition && item.stock <= item.lowStockThreshold;
  });

  const getStockStatusColor = (stock: number, threshold: number) => {
    if (stock === 0) return 'text-red-600';
    if (stock <= threshold * 0.5) return 'text-orange-600';
    return 'text-yellow-600';
  };

  const getUrgencyLevel = (stock: number, threshold: number) => {
    if (stock === 0) return { level: isArabic ? 'نفدت الكمية' : 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (stock <= threshold * 0.3) return { level: isArabic ? 'حرج جداً' : 'Critical', color: 'bg-red-100 text-red-800' };
    if (stock <= threshold * 0.6) return { level: isArabic ? 'منخفض' : 'Low', color: 'bg-orange-100 text-orange-800' };
    return { level: isArabic ? 'تحذير' : 'Warning', color: 'bg-yellow-100 text-yellow-800' };
  };

  const getDaysUntilOutOfStock = (stock: number, dailySales: number) => {
    if (dailySales === 0) return '∞';
    return Math.floor(stock / dailySales);
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
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  {isArabic ? 'مخزون منخفض' : 'Low Stock Items'}
                  <Badge className="bg-orange-500 text-white">
                    {filteredItems.length}
                  </Badge>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isArabic 
                    ? 'منتجات تحتاج إلى إعادة تخزين'
                    : 'Items that need restocking attention'
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
                    <Plus className="h-4 w-4 me-2" />
                    {isArabic ? 'إعادة تخزين' : 'Restock Selected'}
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
                    {isArabic ? 'إجمالي المنتجات' : 'Total Items'}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {filteredItems.length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {isArabic ? 'قيمة المخزون' : 'Stock Value'}
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    <SARSymbol className="h-4 w-4" />
                    {filteredItems.reduce((sum, item) => sum + (item.stock * item.priceSar), 0).toLocaleString()}
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
                    {isArabic ? 'حالة حرجة' : 'Critical Items'}
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {filteredItems.filter(item => item.stock <= item.lowStockThreshold * 0.3).length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {isArabic ? 'متوسط المبيعات' : 'Avg. Daily Sales'}
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.floor(filteredItems.reduce((sum, item) => sum + item.orders, 0) / 30)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
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
              <Select value={conditionFilter} onValueChange={setConditionFilter}>
                <SelectTrigger className="w-[180px] border-slate-200">
                  <Filter className="h-4 w-4 me-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {isArabic ? 'جميع الحالات' : 'All Conditions'}
                  </SelectItem>
                  {Object.entries(conditionLabels).map(([key, labels]) => (
                    <SelectItem key={key} value={key}>
                      {labels[isArabic ? 'ar' : 'en']}
                    </SelectItem>
                  ))}
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
                    <TableHead>{isArabic ? 'المخزون الحالي' : 'Current Stock'}</TableHead>
                    <TableHead>{isArabic ? 'الحد الأدنى' : 'Min. Threshold'}</TableHead>
                    <TableHead>{isArabic ? 'مستوى الخطر' : 'Urgency Level'}</TableHead>
                    <TableHead>{isArabic ? 'آخر بيع' : 'Last Sold'}</TableHead>
                    <TableHead>{isArabic ? 'السعر' : 'Price'}</TableHead>
                    <TableHead className="text-end">{isArabic ? 'الإجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const urgency = getUrgencyLevel(item.stock, item.lowStockThreshold);
                    const dailySales = item.orders / 30;
                    const daysLeft = getDaysUntilOutOfStock(item.stock, dailySales);
                    
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
                            <span className={cn(
                              "text-2xl font-bold",
                              getStockStatusColor(item.stock, item.lowStockThreshold)
                            )}>
                              {item.stock}
                            </span>
                            <span className="text-xs text-slate-500">
                              {daysLeft === Infinity ? '∞' : `~${daysLeft}`} {isArabic ? 'يوم' : 'days left'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{item.lowStockThreshold}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("text-xs", urgency.color)}>
                            {urgency.level}
                          </Badge>
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
                            <Button
                              size="sm"
                              className="bg-saudi-green hover:bg-saudi-green/90 text-white"
                              onClick={() => {
                                setSelectedItem(item);
                                setShowRestockDialog(true);
                              }}
                            >
                              <Plus className="h-4 w-4 me-1" />
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
                <AlertTriangle className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  {isArabic ? 'لا توجد منتجات بمخزون منخفض' : 'No Low Stock Items'}
                </h3>
                <p className="text-sm text-slate-500">
                  {isArabic 
                    ? 'جميع منتجاتك لديها مخزون كافي'
                    : 'All your products have sufficient stock'
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
                  <span className="font-medium">{selectedItem.stock}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{isArabic ? 'بعد الإضافة:' : 'After Adding:'}</span>
                  <span className="font-medium text-saudi-green">{selectedItem.stock + restockQuantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{isArabic ? 'الحد الأدنى:' : 'Min. Threshold:'}</span>
                  <span className="font-medium">{selectedItem.lowStockThreshold}</span>
                </div>
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
    </div>
  );
}