'use client';

import React, { useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Clock,
  Package,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Download,
  Search,
  ChevronRight,
  MoreVertical,
  Truck,
  User,
  Calendar,
  DollarSign,
  Eye,
  CheckCheck,
  X,
  Timer,
  ShoppingBag,
  CreditCard,
  FileText,
  Send,
  PlayCircle,
  PauseCircle,
  FastForward,
  Zap,
  PackageCheck,
  Wrench,
  ClipboardList,
  MessageSquare,
} from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  oemNumber: string;
  quantity: number;
  price: number;
  image: string;
  condition: string;
  processed: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    city: string;
    address: string;
    vip: boolean;
  };
  items: OrderItem[];
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  status: 'processing';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod: string;
  createdAt: Date;
  processingStarted: Date;
  estimatedCompletion: Date;
  notes: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  progress: number;
  currentStep: 'picking' | 'packing' | 'quality_check' | 'ready';
  assignedTo: string;
  processingNotes: string;
}

// Generate mock data for processing orders
const generateMockOrders = (): Order[] => {
  const arabicNames = [
    'أحمد الغامدي',
    'نورا السعد',
    'محمد العتيبي',
  ];

  const cities = ['جدة', 'الدمام', 'مكة المكرمة'];
  const staff = ['أحمد محمد', 'فاطمة علي', 'خالد سعد'];
  const steps = ['picking', 'packing', 'quality_check'] as const;
  
  const products = [
    { name: 'Engine Oil Filter - Toyota Prius 2018', oemNumber: 'OEM-55667', condition: 'new' },
    { name: 'Brake Rotors Set - BMW X5 2020', oemNumber: 'OEM-88990', condition: 'refurbished' },
    { name: 'Air Intake System - Mercedes E-Class', oemNumber: 'OEM-33445', condition: 'new' },
  ];

  return Array.from({ length: 3 }, (_, i) => ({
    id: `order-processing-${i + 1}`,
    orderNumber: `ORD-2024${String(2000 + i).padStart(4, '0')}`,
    customer: {
      name: arabicNames[i],
      phone: `+966 5${Math.floor(10000000 + Math.random() * 90000000)}`,
      email: `customer${i + 5}@example.com`,
      city: cities[i],
      address: `شارع الملك عبدالعزيز، حي ${['الروضة', 'القدس', 'النهضة'][i]}`,
      vip: i === 1,
    },
    items: [
      {
        id: `item-${i}-1`,
        ...products[i],
        quantity: Math.floor(1 + Math.random() * 2),
        price: Math.floor(200 + Math.random() * 800),
        image: '',
        processed: Math.floor(Math.random() * 100),
      },
      {
        id: `item-${i}-2`,
        name: `Secondary Part ${i + 1}`,
        oemNumber: `OEM-${Math.floor(10000 + Math.random() * 90000)}`,
        condition: 'new',
        quantity: 1,
        price: Math.floor(100 + Math.random() * 300),
        image: '',
        processed: Math.floor(Math.random() * 100),
      },
    ],
    subtotal: 0,
    shipping: 75,
    tax: 0,
    total: 0,
    status: 'processing' as const,
    paymentStatus: 'paid' as const,
    paymentMethod: ['Credit Card', 'Bank Transfer', 'Cash on Delivery'][i % 3],
    createdAt: new Date(Date.now() - ((i + 5) * 3600000)),
    processingStarted: new Date(Date.now() - (i * 3600000)),
    estimatedCompletion: new Date(Date.now() + ((3 - i) * 3600000)),
    notes: '',
    priority: (i === 0 ? 'high' : 'normal') as 'low' | 'normal' | 'high' | 'urgent',
    progress: 25 + (i * 25),
    currentStep: steps[i % 3],
    assignedTo: staff[i],
    processingNotes: i === 1 ? 'العميل طلب تعبئة خاصة' : '',
  })).map(order => {
    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.15;
    return {
      ...order,
      subtotal,
      tax,
      total: subtotal + tax + order.shipping,
    };
  });
};

export default function ProcessingOrdersPage() {
  const locale = useLocale();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(generateMockOrders());
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStep, setFilterStep] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updateNotes, setUpdateNotes] = useState('');
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState<string | null>(null);

  const isArabic = locale === 'ar';

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(orders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders([...selectedOrders, orderId]);
    } else {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    }
  };

  const handleMarkReady = (orderId: string) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: 'processing' as const, currentStep: 'ready' as const, progress: 100 }
        : order
    ).filter(order => order.currentStep !== 'ready'));
    
    toast({
      title: isArabic ? 'جاهز للشحن' : 'Ready for Shipping',
      description: isArabic 
        ? 'تم نقل الطلب إلى قسم الشحن'
        : 'Order has been moved to shipping queue',
    });
  };

  const handleUpdateOrder = () => {
    if (!orderToUpdate) return;

    // Simulate order update
    toast({
      title: isArabic ? 'تم تحديث الطلب' : 'Order Updated',
      description: isArabic 
        ? 'تم حفظ الملاحظات وإشعار العميل'
        : 'Notes saved and customer notified',
    });

    setShowUpdateDialog(false);
    setOrderToUpdate(null);
    setUpdateNotes('');
  };

  const handleBulkMarkReady = () => {
    if (selectedOrders.length === 0) return;

    setOrders(orders.filter(order => !selectedOrders.includes(order.id)));
    
    toast({
      title: isArabic ? 'جاهز للشحن' : 'Ready for Shipping',
      description: isArabic 
        ? `تم تحضير ${selectedOrders.length} طلبات للشحن`
        : `${selectedOrders.length} orders prepared for shipping`,
    });

    setSelectedOrders([]);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.name.includes(searchQuery) ||
                         order.customer.phone.includes(searchQuery);
    
    const matchesStep = filterStep === 'all' || order.currentStep === filterStep;
    
    return matchesSearch && matchesStep;
  });

  const getStepColor = (step: string) => {
    switch (step) {
      case 'picking':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'packing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'quality_check':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStepLabel = (step: string) => {
    const labels = {
      picking: { ar: 'تجميع المنتجات', en: 'Picking Items' },
      packing: { ar: 'التعبئة والتغليف', en: 'Packing' },
      quality_check: { ar: 'فحص الجودة', en: 'Quality Check' },
      ready: { ar: 'جاهز للشحن', en: 'Ready to Ship' },
    };
    return labels[step as keyof typeof labels]?.[isArabic ? 'ar' : 'en'] || step;
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'picking':
        return ClipboardList;
      case 'packing':
        return Package;
      case 'quality_check':
        return CheckCircle;
      case 'ready':
        return PackageCheck;
      default:
        return Package;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-slate-200 dark:bg-slate-950/90 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/${locale}/seller/orders`}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                >
                  <ArrowLeft className="h-4 w-4 me-2" />
                  {isArabic ? 'جميع الطلبات' : 'All Orders'}
                </Button>
              </Link>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-saudi-green" />
                  {isArabic ? 'قيد المعالجة' : 'Processing Orders'}
                  <Badge className="bg-blue-500 text-white">
                    {orders.length}
                  </Badge>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isArabic 
                    ? 'طلبات قيد التحضير والتجهيز'
                    : 'Orders being prepared and processed'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {selectedOrders.length > 0 && (
                <>
                  <Badge variant="outline" className="text-saudi-green">
                    {isArabic 
                      ? `${selectedOrders.length} محدد`
                      : `${selectedOrders.length} selected`
                    }
                  </Badge>
                  <Button
                    onClick={handleBulkMarkReady}
                    className="bg-saudi-green hover:bg-saudi-green/90 text-white"
                  >
                    <PackageCheck className="h-4 w-4 me-2" />
                    {isArabic ? 'جاهز للشحن' : 'Mark Ready'}
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
        {/* Filters and Search */}
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
                      ? 'البحث برقم الطلب أو اسم العميل...'
                      : 'Search by order number or customer name...'
                    }
                    className="ps-10 border-slate-200"
                  />
                </div>
              </div>
              <Select value={filterStep} onValueChange={setFilterStep}>
                <SelectTrigger className="w-[200px] border-slate-200">
                  <Filter className="h-4 w-4 me-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {isArabic ? 'جميع المراحل' : 'All Steps'}
                  </SelectItem>
                  <SelectItem value="picking">
                    {isArabic ? 'تجميع المنتجات' : 'Picking Items'}
                  </SelectItem>
                  <SelectItem value="packing">
                    {isArabic ? 'التعبئة والتغليف' : 'Packing'}
                  </SelectItem>
                  <SelectItem value="quality_check">
                    {isArabic ? 'فحص الجودة' : 'Quality Check'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 dark:border-slate-700">
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedOrders.length === orders.length && orders.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>{isArabic ? 'رقم الطلب' : 'Order #'}</TableHead>
                    <TableHead>{isArabic ? 'العميل' : 'Customer'}</TableHead>
                    <TableHead>{isArabic ? 'المجموع' : 'Total'}</TableHead>
                    <TableHead>{isArabic ? 'المرحلة الحالية' : 'Current Step'}</TableHead>
                    <TableHead>{isArabic ? 'التقدم' : 'Progress'}</TableHead>
                    <TableHead>{isArabic ? 'المسؤول' : 'Assigned To'}</TableHead>
                    <TableHead>{isArabic ? 'الوقت المتبقي' : 'ETA'}</TableHead>
                    <TableHead className="text-end">{isArabic ? 'الإجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const StepIcon = getStepIcon(order.currentStep);
                    return (
                      <TableRow 
                        key={order.id}
                        className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedOrders.includes(order.id)}
                            onCheckedChange={(checked) => handleSelectOrder(order.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900 dark:text-white">
                              {order.orderNumber}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(order.processingStarted).toLocaleString(isArabic ? 'ar-SA' : 'en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900 dark:text-white">
                                {order.customer.name}
                              </span>
                              {order.customer.vip && (
                                <Badge className="bg-desert-gold/20 text-desert-gold border-desert-gold/30 text-xs">
                                  VIP
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {order.customer.city}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 font-medium text-slate-900 dark:text-white">
                            <SARSymbol className="h-4 w-4" />
                            {order.total.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("text-xs flex items-center gap-1", getStepColor(order.currentStep))}>
                            <StepIcon className="h-3 w-3" />
                            {getStepLabel(order.currentStep)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <Progress value={order.progress} className="h-2" />
                            <span className="text-xs text-slate-500">
                              {order.progress}% {isArabic ? 'مكتمل' : 'complete'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-saudi-green/20 flex items-center justify-center">
                              <User className="h-3 w-3 text-saudi-green" />
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {order.assignedTo}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {new Date(order.estimatedCompletion).toLocaleString(isArabic ? 'ar-SA' : 'en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setOrderToUpdate(order.id);
                                setShowUpdateDialog(true);
                              }}
                            >
                              <MessageSquare className="h-4 w-4 me-1" />
                              {isArabic ? 'تحديث' : 'Update'}
                            </Button>
                            <Button
                              size="sm"
                              className="bg-saudi-green hover:bg-saudi-green/90 text-white"
                              onClick={() => handleMarkReady(order.id)}
                            >
                              <PackageCheck className="h-4 w-4 me-1" />
                              {isArabic ? 'جاهز' : 'Ready'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <Wrench className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  {isArabic ? 'لا توجد طلبات قيد المعالجة' : 'No Processing Orders'}
                </h3>
                <p className="text-sm text-slate-500">
                  {isArabic 
                    ? 'سيتم عرض الطلبات قيد المعالجة هنا'
                    : 'Processing orders will appear here'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{isArabic ? 'تفاصيل الطلب قيد المعالجة' : 'Processing Order Details'}</span>
              {selectedOrder && (
                <Badge className={cn("text-xs flex items-center gap-1", getStepColor(selectedOrder.currentStep))}>
                  {React.createElement(getStepIcon(selectedOrder.currentStep), { className: "h-3 w-3" })}
                  {getStepLabel(selectedOrder.currentStep)}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Progress Overview */}
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  {isArabic ? 'تقدم المعالجة' : 'Processing Progress'}
                </h4>
                <div className="space-y-4">
                  <Progress value={selectedOrder.progress} className="h-3" />
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { step: 'picking', icon: ClipboardList, label: isArabic ? 'تجميع' : 'Picking' },
                      { step: 'packing', icon: Package, label: isArabic ? 'تعبئة' : 'Packing' },
                      { step: 'quality_check', icon: CheckCircle, label: isArabic ? 'فحص' : 'Quality' },
                      { step: 'ready', icon: PackageCheck, label: isArabic ? 'جاهز' : 'Ready' },
                    ].map(({ step, icon: Icon, label }) => (
                      <div
                        key={step}
                        className={cn(
                          "flex flex-col items-center p-3 rounded-lg border",
                          selectedOrder.currentStep === step
                            ? "bg-saudi-green/10 border-saudi-green/30 text-saudi-green"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        )}
                      >
                        <Icon className="h-5 w-5 mb-1" />
                        <span className="text-xs font-medium">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Processing Details */}
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {isArabic ? 'تفاصيل المعالجة' : 'Processing Details'}
                </h4>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-slate-500">{isArabic ? 'المسؤول' : 'Assigned To'}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-6 w-6 rounded-full bg-saudi-green/20 flex items-center justify-center">
                          <User className="h-3 w-3 text-saudi-green" />
                        </div>
                        <span className="font-medium">{selectedOrder.assignedTo}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500">{isArabic ? 'بدء المعالجة' : 'Processing Started'}</span>
                      <p className="font-medium mt-1">
                        {new Date(selectedOrder.processingStarted).toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500">{isArabic ? 'الانتهاء المتوقع' : 'Expected Completion'}</span>
                      <p className="font-medium mt-1">
                        {new Date(selectedOrder.estimatedCompletion).toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-slate-500">{isArabic ? 'التقدم' : 'Progress'}</span>
                      <p className="font-medium mt-1">{selectedOrder.progress}% {isArabic ? 'مكتمل' : 'complete'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Progress */}
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {isArabic ? 'تقدم المنتجات' : 'Items Progress'}
                </h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                      <div className="h-16 w-16 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <Package className="h-8 w-8 text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-slate-900 dark:text-white">{item.name}</h5>
                        <p className="text-sm text-slate-500">
                          {isArabic ? 'الكمية:' : 'Quantity:'} {item.quantity} • OEM: {item.oemNumber}
                        </p>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>{isArabic ? 'التقدم' : 'Progress'}</span>
                            <span>{item.processed}%</span>
                          </div>
                          <Progress value={item.processed} className="h-1.5" />
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="font-medium">
                          <SARSymbol className="h-3 w-3 inline" /> {(item.quantity * item.price).toFixed(2)}
                        </div>
                        <Badge 
                          variant="outline"
                          className={cn(
                            "text-xs mt-1",
                            item.processed === 100
                              ? "border-green-200 text-green-700 bg-green-50"
                              : "border-blue-200 text-blue-700 bg-blue-50"
                          )}
                        >
                          {item.processed === 100 
                            ? (isArabic ? 'مكتمل' : 'Complete')
                            : (isArabic ? 'قيد المعالجة' : 'Processing')
                          }
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Processing Notes */}
              {selectedOrder.processingNotes && (
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {isArabic ? 'ملاحظات المعالجة' : 'Processing Notes'}
                  </h4>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {selectedOrder.processingNotes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>
              {isArabic ? 'إغلاق' : 'Close'}
            </Button>
            {selectedOrder && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setOrderToUpdate(selectedOrder.id);
                    setShowUpdateDialog(true);
                    setSelectedOrder(null);
                  }}
                >
                  <MessageSquare className="h-4 w-4 me-2" />
                  {isArabic ? 'إضافة تحديث' : 'Add Update'}
                </Button>
                <Button
                  className="bg-saudi-green hover:bg-saudi-green/90"
                  onClick={() => {
                    handleMarkReady(selectedOrder.id);
                    setSelectedOrder(null);
                  }}
                >
                  <PackageCheck className="h-4 w-4 me-2" />
                  {isArabic ? 'جاهز للشحن' : 'Mark Ready'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Order Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-saudi-green">
              {isArabic ? 'تحديث حالة الطلب' : 'Update Order Status'}
            </DialogTitle>
            <DialogDescription>
              {isArabic 
                ? 'أضف تحديثاً أو ملاحظة حول تقدم معالجة هذا الطلب.'
                : 'Add an update or note about the progress of this order.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="update-notes">
                {isArabic ? 'تفاصيل التحديث' : 'Update Details'}
              </Label>
              <Textarea
                id="update-notes"
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
                placeholder={isArabic 
                  ? 'مثال: تم الانتهاء من تجميع جميع المنتجات، جاري التعبئة'
                  : 'Example: All items picked, proceeding with packing'
                }
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              className="bg-saudi-green hover:bg-saudi-green/90"
              onClick={handleUpdateOrder}
              disabled={!updateNotes}
            >
              <Send className="h-4 w-4 me-2" />
              {isArabic ? 'إرسال التحديث' : 'Send Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}