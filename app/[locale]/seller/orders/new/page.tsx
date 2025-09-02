'use client';

import { useState } from 'react';
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
} from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  oemNumber: string;
  quantity: number;
  price: number;
  image: string;
  condition: string;
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
  status: 'new' | 'processing' | 'ready' | 'shipped' | 'completed' | 'cancelled' | 'returned';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod: string;
  createdAt: Date;
  expectedDelivery: Date;
  notes: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  timeLeft: string;
}

// Generate mock data for new orders
const generateMockOrders = (): Order[] => {
  const arabicNames = [
    'محمد الرشيد',
    'عبدالله السالم',
    'فهد المطيري',
    'سعود القحطاني',
    'خالد الدوسري',
  ];

  const cities = ['الرياض', 'جدة', 'الدمام', 'مكة المكرمة', 'المدينة المنورة'];
  
  const products = [
    { name: 'Brake Pads - Toyota Camry 2020', oemNumber: 'OEM-12345', condition: 'new' },
    { name: 'Air Filter - Honda Accord 2019', oemNumber: 'OEM-67890', condition: 'new' },
    { name: 'Oil Filter - Nissan Altima 2021', oemNumber: 'OEM-11223', condition: 'new' },
    { name: 'Spark Plugs Set - Ford F150 2020', oemNumber: 'OEM-44556', condition: 'new' },
    { name: 'Battery - Mercedes C300 2019', oemNumber: 'OEM-77889', condition: 'new' },
  ];

  return Array.from({ length: 5 }, (_, i) => ({
    id: `order-new-${i + 1}`,
    orderNumber: `ORD-2024${String(1000 + i).padStart(4, '0')}`,
    customer: {
      name: arabicNames[i],
      phone: `+966 5${Math.floor(10000000 + Math.random() * 90000000)}`,
      email: `customer${i + 1}@example.com`,
      city: cities[i],
      address: `شارع الملك فهد، حي ${['الورود', 'النخيل', 'الربوة', 'الملقا', 'العليا'][i]}`,
      vip: i === 0 || i === 2,
    },
    items: [
      {
        id: `item-${i}-1`,
        ...products[i],
        quantity: Math.floor(1 + Math.random() * 3),
        price: Math.floor(100 + Math.random() * 900),
        image: '',
      },
      ...(i % 2 === 0 ? [{
        id: `item-${i}-2`,
        ...products[(i + 1) % 5],
        quantity: 1,
        price: Math.floor(100 + Math.random() * 500),
        image: '',
      }] : []),
    ],
    subtotal: 0,
    shipping: 50,
    tax: 0,
    total: 0,
    status: 'new' as const,
    paymentStatus: 'pending' as const,
    paymentMethod: ['Credit Card', 'Bank Transfer', 'Cash on Delivery'][i % 3],
    createdAt: new Date(Date.now() - (i * 3600000)), // Stagger by hours
    expectedDelivery: new Date(Date.now() + (7 * 24 * 3600000)),
    notes: i === 1 ? 'عميل يطلب التوصيل السريع' : '',
    priority: (i === 0 ? 'urgent' : i === 1 ? 'high' : 'normal') as 'low' | 'normal' | 'high' | 'urgent',
    timeLeft: `${Math.floor(1 + Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`,
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

export default function NewOrdersPage() {
  const locale = useLocale();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(generateMockOrders());
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [orderToReject, setOrderToReject] = useState<string | null>(null);

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

  const handleAcceptOrder = (orderId: string) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: 'processing' as const }
        : order
    ).filter(order => order.status === 'new'));
    
    toast({
      title: isArabic ? 'تم قبول الطلب' : 'Order Accepted',
      description: isArabic 
        ? 'تم نقل الطلب إلى قسم المعالجة'
        : 'Order has been moved to processing',
    });
  };

  const handleRejectOrder = () => {
    if (!orderToReject || !rejectReason) return;

    setOrders(orders.filter(order => order.id !== orderToReject));
    
    toast({
      title: isArabic ? 'تم رفض الطلب' : 'Order Rejected',
      description: isArabic 
        ? 'تم إشعار العميل بالرفض'
        : 'Customer has been notified of rejection',
      variant: 'destructive',
    });

    setShowRejectDialog(false);
    setOrderToReject(null);
    setRejectReason('');
  };

  const handleBulkAccept = () => {
    if (selectedOrders.length === 0) return;

    setOrders(orders.filter(order => !selectedOrders.includes(order.id)));
    
    toast({
      title: isArabic ? 'تم قبول الطلبات' : 'Orders Accepted',
      description: isArabic 
        ? `تم قبول ${selectedOrders.length} طلبات`
        : `${selectedOrders.length} orders accepted`,
    });

    setSelectedOrders([]);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.name.includes(searchQuery) ||
                         order.customer.phone.includes(searchQuery);
    
    const matchesPriority = filterPriority === 'all' || order.priority === filterPriority;
    
    return matchesSearch && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      urgent: { ar: 'عاجل', en: 'Urgent' },
      high: { ar: 'مرتفع', en: 'High' },
      normal: { ar: 'عادي', en: 'Normal' },
    };
    return labels[priority as keyof typeof labels]?.[isArabic ? 'ar' : 'en'] || priority;
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
                  <ShoppingBag className="h-5 w-5 text-saudi-green" />
                  {isArabic ? 'الطلبات الجديدة' : 'New Orders'}
                  <Badge className="bg-red-500 text-white">
                    {orders.length}
                  </Badge>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isArabic 
                    ? 'طلبات تحتاج إلى الموافقة والمعالجة'
                    : 'Orders waiting for approval and processing'
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
                    onClick={handleBulkAccept}
                    className="bg-saudi-green hover:bg-saudi-green/90 text-white"
                  >
                    <CheckCheck className="h-4 w-4 me-2" />
                    {isArabic ? 'قبول المحدد' : 'Accept Selected'}
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
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[180px] border-slate-200">
                  <Filter className="h-4 w-4 me-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {isArabic ? 'جميع الأولويات' : 'All Priorities'}
                  </SelectItem>
                  <SelectItem value="urgent">
                    {isArabic ? 'عاجل' : 'Urgent'}
                  </SelectItem>
                  <SelectItem value="high">
                    {isArabic ? 'مرتفع' : 'High'}
                  </SelectItem>
                  <SelectItem value="normal">
                    {isArabic ? 'عادي' : 'Normal'}
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
                    <TableHead>{isArabic ? 'المنتجات' : 'Items'}</TableHead>
                    <TableHead>{isArabic ? 'المجموع' : 'Total'}</TableHead>
                    <TableHead>{isArabic ? 'الدفع' : 'Payment'}</TableHead>
                    <TableHead>{isArabic ? 'الأولوية' : 'Priority'}</TableHead>
                    <TableHead>{isArabic ? 'الوقت المتبقي' : 'Time Left'}</TableHead>
                    <TableHead className="text-end">{isArabic ? 'الإجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
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
                            {new Date(order.createdAt).toLocaleString(isArabic ? 'ar-SA' : 'en-US', {
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
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2 rtl:space-x-reverse">
                            {order.items.slice(0, 3).map((item, idx) => (
                              <div
                                key={item.id}
                                className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-900 flex items-center justify-center"
                              >
                                <Package className="h-4 w-4 text-slate-400" />
                              </div>
                            ))}
                          </div>
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {order.items.length} {isArabic ? 'منتج' : 'items'}
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
                        <div className="flex flex-col gap-1">
                          <Badge 
                            variant="outline" 
                            className="w-fit text-xs border-orange-200 text-orange-700 bg-orange-50"
                          >
                            {isArabic ? 'قيد الانتظار' : 'Pending'}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {order.paymentMethod}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", getPriorityColor(order.priority))}>
                          {getPriorityLabel(order.priority)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Timer className="h-4 w-4 text-orange-500" />
                          <span className="text-slate-600 dark:text-slate-400">
                            {order.timeLeft}
                          </span>
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
                            className="bg-saudi-green hover:bg-saudi-green/90 text-white"
                            onClick={() => handleAcceptOrder(order.id)}
                          >
                            <CheckCircle className="h-4 w-4 me-1" />
                            {isArabic ? 'قبول' : 'Accept'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setOrderToReject(order.id);
                              setShowRejectDialog(true);
                            }}
                          >
                            <XCircle className="h-4 w-4 me-1" />
                            {isArabic ? 'رفض' : 'Reject'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  {isArabic ? 'لا توجد طلبات جديدة' : 'No New Orders'}
                </h3>
                <p className="text-sm text-slate-500">
                  {isArabic 
                    ? 'سيتم عرض الطلبات الجديدة هنا عند وصولها'
                    : 'New orders will appear here when they arrive'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{isArabic ? 'تفاصيل الطلب' : 'Order Details'}</span>
              {selectedOrder && (
                <Badge className={cn("text-xs", getPriorityColor(selectedOrder.priority))}>
                  {getPriorityLabel(selectedOrder.priority)}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {isArabic ? 'معلومات العميل' : 'Customer Information'}
                </h4>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">{isArabic ? 'الاسم' : 'Name'}</span>
                    <span className="font-medium">{selectedOrder.customer.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">{isArabic ? 'الهاتف' : 'Phone'}</span>
                    <span className="font-medium" dir="ltr">{selectedOrder.customer.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">{isArabic ? 'البريد' : 'Email'}</span>
                    <span className="font-medium">{selectedOrder.customer.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">{isArabic ? 'العنوان' : 'Address'}</span>
                    <span className="font-medium text-end">{selectedOrder.customer.address}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {isArabic ? 'المنتجات' : 'Order Items'}
                </h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                      <div className="h-16 w-16 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <Package className="h-8 w-8 text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-slate-900 dark:text-white">{item.name}</h5>
                        <p className="text-sm text-slate-500">OEM: {item.oemNumber}</p>
                      </div>
                      <div className="text-end">
                        <div className="font-medium">
                          {item.quantity} x <SARSymbol className="h-3 w-3 inline" /> {item.price}
                        </div>
                        <div className="text-sm text-slate-500">
                          = <SARSymbol className="h-3 w-3 inline" /> {(item.quantity * item.price).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  {isArabic ? 'ملخص الطلب' : 'Order Summary'}
                </h4>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">{isArabic ? 'المجموع الفرعي' : 'Subtotal'}</span>
                    <span className="font-medium">
                      <SARSymbol className="h-3 w-3 inline" /> {selectedOrder.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">{isArabic ? 'الضريبة (15%)' : 'Tax (15%)'}</span>
                    <span className="font-medium">
                      <SARSymbol className="h-3 w-3 inline" /> {selectedOrder.tax.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">{isArabic ? 'الشحن' : 'Shipping'}</span>
                    <span className="font-medium">
                      <SARSymbol className="h-3 w-3 inline" /> {selectedOrder.shipping.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-medium">{isArabic ? 'المجموع الكلي' : 'Total'}</span>
                    <span className="font-bold text-saudi-green">
                      <SARSymbol className="h-4 w-4 inline" /> {selectedOrder.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {isArabic ? 'ملاحظات' : 'Notes'}
                  </h4>
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      {selectedOrder.notes}
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
                  variant="destructive"
                  onClick={() => {
                    setOrderToReject(selectedOrder.id);
                    setShowRejectDialog(true);
                    setSelectedOrder(null);
                  }}
                >
                  <XCircle className="h-4 w-4 me-2" />
                  {isArabic ? 'رفض الطلب' : 'Reject Order'}
                </Button>
                <Button
                  className="bg-saudi-green hover:bg-saudi-green/90"
                  onClick={() => {
                    handleAcceptOrder(selectedOrder.id);
                    setSelectedOrder(null);
                  }}
                >
                  <CheckCircle className="h-4 w-4 me-2" />
                  {isArabic ? 'قبول الطلب' : 'Accept Order'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Order Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">
              {isArabic ? 'رفض الطلب' : 'Reject Order'}
            </DialogTitle>
            <DialogDescription>
              {isArabic 
                ? 'يرجى تقديم سبب لرفض هذا الطلب. سيتم إرسال السبب إلى العميل.'
                : 'Please provide a reason for rejecting this order. The reason will be sent to the customer.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject-reason">
                {isArabic ? 'سبب الرفض' : 'Rejection Reason'}
              </Label>
              <Textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={isArabic 
                  ? 'مثال: المنتج غير متوفر حالياً'
                  : 'Example: Product is currently out of stock'
                }
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectOrder}
              disabled={!rejectReason}
            >
              <Send className="h-4 w-4 me-2" />
              {isArabic ? 'تأكيد الرفض' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}