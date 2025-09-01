'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
  Package,
  ShoppingCart,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  FileText,
  Download,
  Printer,
  Eye,
  Edit,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
  RefreshCw,
  MessageSquare,
  Star,
  DollarSign,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Send,
  Archive,
  Copy,
  ExternalLink,
  Info,
  BarChart3,
  Hash,
  Barcode,
  Tag,
  Receipt,
  CheckSquare,
  Square,
  Ban,
  Timer,
  TrendingUp,
} from 'lucide-react';

// Enhanced interfaces
interface OrderItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
  image?: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  joinedDate: string;
  rating: number;
}

interface ShippingInfo {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  method: string;
  carrier?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  cost: number;
}

interface PaymentInfo {
  method: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionId?: string;
  paidAt?: string;
  amount: number;
}

interface OrderTimeline {
  status: string;
  timestamp: string;
  note?: string;
  user?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  paymentInfo: PaymentInfo;
  shippingInfo: ShippingInfo;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  notes?: string;
  timeline: OrderTimeline[];
  createdAt: string;
  updatedAt: string;
}

interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  returned: number;
  todayOrders: number;
  todayRevenue: number;
}

const statusConfig = {
  pending: {
    label: { ar: 'قيد الانتظار', en: 'Pending' },
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  confirmed: {
    label: { ar: 'مؤكد', en: 'Confirmed' },
    color: 'bg-blue-100 text-blue-800',
    icon: CheckSquare,
  },
  processing: {
    label: { ar: 'قيد المعالجة', en: 'Processing' },
    color: 'bg-purple-100 text-purple-800',
    icon: Package,
  },
  shipped: {
    label: { ar: 'تم الشحن', en: 'Shipped' },
    color: 'bg-indigo-100 text-indigo-800',
    icon: Truck,
  },
  delivered: {
    label: { ar: 'تم التسليم', en: 'Delivered' },
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  cancelled: {
    label: { ar: 'ملغي', en: 'Cancelled' },
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
  returned: {
    label: { ar: 'مرتجع', en: 'Returned' },
    color: 'bg-gray-100 text-gray-800',
    icon: Archive,
  },
};

const paymentStatusConfig = {
  pending: { label: { ar: 'معلق', en: 'Pending' }, color: 'secondary' },
  paid: { label: { ar: 'مدفوع', en: 'Paid' }, color: 'success' },
  failed: { label: { ar: 'فشل', en: 'Failed' }, color: 'destructive' },
  refunded: { label: { ar: 'مسترد', en: 'Refunded' }, color: 'outline' },
};

export default function EnhancedOrdersPage() {
  const locale = useLocale();
  const router = useRouter();
  const isArabic = locale === 'ar';
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [selectedBulkAction, setSelectedBulkAction] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const [stats] = useState<OrderStats>({
    total: 286,
    pending: 12,
    processing: 8,
    shipped: 15,
    delivered: 238,
    cancelled: 10,
    returned: 3,
    todayOrders: 18,
    todayRevenue: 42500,
  });
  
  // Mock orders data
  useEffect(() => {
    const mockOrders: Order[] = [
      {
        id: '1',
        orderNumber: 'ORD-2024-0156',
        customer: {
          id: 'cust1',
          name: 'أحمد محمد السعيد',
          email: 'ahmed@example.com',
          phone: '+966501234567',
          totalOrders: 12,
          totalSpent: 45280,
          joinedDate: '2024-01-15',
          rating: 4.8,
        },
        items: [
          {
            id: 'item1',
            productId: 'prod1',
            name: 'محرك تويوتا كامري 2015-2018',
            sku: 'TCE-2015-001',
            price: 8500,
            quantity: 1,
            total: 8500,
          },
          {
            id: 'item2',
            productId: 'prod2',
            name: 'فلتر هواء تويوتا',
            sku: 'TAF-2015-002',
            price: 150,
            quantity: 2,
            total: 300,
          },
        ],
        status: 'pending',
        paymentInfo: {
          method: 'credit_card',
          status: 'pending',
          amount: 8800,
        },
        shippingInfo: {
          address: 'شارع الملك فهد، مبنى 123',
          city: 'الرياض',
          state: 'الرياض',
          zipCode: '11564',
          country: 'السعودية',
          method: 'express',
          cost: 50,
        },
        subtotal: 8800,
        tax: 0,
        shipping: 50,
        discount: 50,
        total: 8800,
        notes: 'عميل VIP - يرجى التعامل بأولوية',
        timeline: [
          {
            status: 'pending',
            timestamp: '2024-12-17T10:30:00Z',
            note: 'تم استلام الطلب',
            user: 'System',
          },
        ],
        createdAt: '2024-12-17T10:30:00Z',
        updatedAt: '2024-12-17T10:30:00Z',
      },
      {
        id: '2',
        orderNumber: 'ORD-2024-0155',
        customer: {
          id: 'cust2',
          name: 'سارة عبدالله',
          email: 'sara@example.com',
          phone: '+966502345678',
          totalOrders: 5,
          totalSpent: 12450,
          joinedDate: '2024-03-20',
          rating: 4.5,
        },
        items: [
          {
            id: 'item3',
            productId: 'prod3',
            name: 'فرامل هوندا أكورد أمامية',
            sku: 'HAB-2020-002',
            price: 1200,
            quantity: 2,
            total: 2400,
          },
        ],
        status: 'processing',
        paymentInfo: {
          method: 'bank_transfer',
          status: 'paid',
          transactionId: 'TXN-123456',
          paidAt: '2024-12-16T14:20:00Z',
          amount: 2400,
        },
        shippingInfo: {
          address: 'حي النسيم، شارع 15',
          city: 'جدة',
          state: 'مكة المكرمة',
          zipCode: '21432',
          country: 'السعودية',
          method: 'standard',
          cost: 0,
        },
        subtotal: 2400,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: 2400,
        timeline: [
          {
            status: 'pending',
            timestamp: '2024-12-16T14:00:00Z',
            note: 'تم استلام الطلب',
            user: 'System',
          },
          {
            status: 'confirmed',
            timestamp: '2024-12-16T14:20:00Z',
            note: 'تم تأكيد الدفع',
            user: 'System',
          },
          {
            status: 'processing',
            timestamp: '2024-12-16T15:00:00Z',
            note: 'جاري تجهيز الطلب',
            user: 'Ahmed Ali',
          },
        ],
        createdAt: '2024-12-16T14:00:00Z',
        updatedAt: '2024-12-16T15:00:00Z',
      },
      {
        id: '3',
        orderNumber: 'ORD-2024-0154',
        customer: {
          id: 'cust3',
          name: 'محمد الشمري',
          email: 'mohammed@example.com',
          phone: '+966503456789',
          totalOrders: 18,
          totalSpent: 156000,
          joinedDate: '2023-11-10',
          rating: 4.9,
        },
        items: [
          {
            id: 'item4',
            productId: 'prod4',
            name: 'ناقل حركة نيسان ألتيما',
            sku: 'NAT-2019-003',
            price: 12000,
            quantity: 1,
            total: 12000,
          },
        ],
        status: 'shipped',
        paymentInfo: {
          method: 'credit_card',
          status: 'paid',
          transactionId: 'TXN-789012',
          paidAt: '2024-12-15T09:15:00Z',
          amount: 12000,
        },
        shippingInfo: {
          address: 'حي الملك فيصل، شارع الأمير سلطان',
          city: 'الدمام',
          state: 'الشرقية',
          zipCode: '31952',
          country: 'السعودية',
          method: 'express',
          carrier: 'Aramex',
          trackingNumber: 'ARX123456789',
          estimatedDelivery: '2024-12-19',
          cost: 75,
        },
        subtotal: 12000,
        tax: 0,
        shipping: 75,
        discount: 75,
        total: 12000,
        timeline: [
          {
            status: 'pending',
            timestamp: '2024-12-15T09:00:00Z',
            note: 'تم استلام الطلب',
            user: 'System',
          },
          {
            status: 'confirmed',
            timestamp: '2024-12-15T09:15:00Z',
            note: 'تم تأكيد الدفع',
            user: 'System',
          },
          {
            status: 'processing',
            timestamp: '2024-12-15T10:00:00Z',
            note: 'جاري تجهيز الطلب',
            user: 'Ahmed Ali',
          },
          {
            status: 'shipped',
            timestamp: '2024-12-16T11:00:00Z',
            note: 'تم الشحن مع Aramex',
            user: 'Logistics Team',
          },
        ],
        createdAt: '2024-12-15T09:00:00Z',
        updatedAt: '2024-12-16T11:00:00Z',
      },
    ];
    
    setOrders(mockOrders);
    setLoading(false);
  }, []);
  
  // Filter and sort logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery === '' ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.phone.includes(searchQuery);
    
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesPayment = filterPayment === 'all' || order.paymentInfo.status === filterPayment;
    
    const matchesTab = activeTab === 'all' ||
      (activeTab === 'pending' && order.status === 'pending') ||
      (activeTab === 'processing' && ['confirmed', 'processing'].includes(order.status)) ||
      (activeTab === 'shipped' && order.status === 'shipped') ||
      (activeTab === 'completed' && order.status === 'delivered') ||
      (activeTab === 'cancelled' && ['cancelled', 'returned'].includes(order.status));
    
    return matchesSearch && matchesStatus && matchesPayment && matchesTab;
  });
  
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'orderNumber':
        comparison = a.orderNumber.localeCompare(b.orderNumber);
        break;
      case 'customer':
        comparison = a.customer.name.localeCompare(b.customer.name);
        break;
      case 'total':
        comparison = a.total - b.total;
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);
  
  // Helper functions
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
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(new Set(paginatedOrders.map(order => order.id)));
    } else {
      setSelectedOrders(new Set());
    }
  };
  
  const handleSelectOrder = (orderId: string, checked: boolean) => {
    const newSelected = new Set(selectedOrders);
    if (checked) {
      newSelected.add(orderId);
    } else {
      newSelected.delete(orderId);
    }
    setSelectedOrders(newSelected);
  };
  
  const handleBulkAction = (action: string) => {
    setSelectedBulkAction(action);
    setBulkActionDialogOpen(true);
  };
  
  const executeBulkAction = () => {
    console.log(`Executing ${selectedBulkAction} on ${selectedOrders.size} orders`);
    setBulkActionDialogOpen(false);
    setSelectedOrders(new Set());
  };
  
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };
  
  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    console.log(`Updating order ${orderId} to status ${newStatus}`);
    // Update order status logic
  };
  
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };
  
  const getStatusIcon = (status: string) => {
    const StatusIcon = statusConfig[status as keyof typeof statusConfig]?.icon || Clock;
    return <StatusIcon className="h-4 w-4" />;
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">
              {isArabic ? 'جاري تحميل الطلبات...' : 'Loading orders...'}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold card-title-enhanced">
              {isArabic ? 'إدارة الطلبات' : 'Order Management'}
            </h1>
            <p className="text-muted-foreground text-label mt-1">
              {isArabic 
                ? `${stats.total} طلب إجمالي • ${stats.todayOrders} طلب اليوم`
                : `${stats.total} total orders • ${stats.todayOrders} today`}
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
              <Printer className="me-2 h-4 w-4" />
              {isArabic ? 'طباعة' : 'Print'}
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
                {isArabic ? 'إيرادات اليوم' : 'Today\'s Revenue'}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-price flex items-center gap-1">
              {formatCurrency(stats.todayRevenue)}
              <SARSymbol className="h-5 w-5" />
            </div>
            <p className="text-detail text-muted-foreground mt-1">
              {stats.todayOrders} {isArabic ? 'طلب' : 'orders'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-label font-semibold text-muted-foreground">
                {isArabic ? 'طلبات معلقة' : 'Pending Orders'}
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-price text-amber-600">{stats.pending}</div>
            <p className="text-detail text-muted-foreground mt-1">
              {isArabic ? 'بحاجة للمعالجة' : 'Need processing'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-label font-semibold text-muted-foreground">
                {isArabic ? 'قيد الشحن' : 'In Transit'}
              </CardTitle>
              <Truck className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-price text-blue-600">{stats.shipped}</div>
            <p className="text-detail text-muted-foreground mt-1">
              {isArabic ? 'في الطريق للعملاء' : 'On the way to customers'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-label font-semibold text-muted-foreground">
                {isArabic ? 'معدل الإنجاز' : 'Fulfillment Rate'}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-price text-green-600">94.2%</div>
            <p className="text-detail text-muted-foreground mt-1">
              {stats.delivered} {isArabic ? 'تم التسليم' : 'delivered'}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all">
            {isArabic ? 'الكل' : 'All'} ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="pending">
            {isArabic ? 'معلق' : 'Pending'} ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="processing">
            {isArabic ? 'قيد المعالجة' : 'Processing'} ({stats.processing})
          </TabsTrigger>
          <TabsTrigger value="shipped">
            {isArabic ? 'مشحون' : 'Shipped'} ({stats.shipped})
          </TabsTrigger>
          <TabsTrigger value="completed">
            {isArabic ? 'مكتمل' : 'Completed'} ({stats.delivered})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            {isArabic ? 'ملغي' : 'Cancelled'} ({stats.cancelled + stats.returned})
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={isArabic ? 'البحث برقم الطلب، العميل، البريد الإلكتروني...' : 'Search by order number, customer, email...'}
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
            {Object.entries(statusConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label[locale as 'ar' | 'en']}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPayment} onValueChange={setFilterPayment}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={isArabic ? 'الدفع' : 'Payment'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isArabic ? 'جميع الحالات' : 'All Payment'}</SelectItem>
            {Object.entries(paymentStatusConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label[locale as 'ar' | 'en']}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterDateRange} onValueChange={setFilterDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={isArabic ? 'الفترة' : 'Date Range'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isArabic ? 'جميع الأوقات' : 'All Time'}</SelectItem>
            <SelectItem value="today">{isArabic ? 'اليوم' : 'Today'}</SelectItem>
            <SelectItem value="week">{isArabic ? 'هذا الأسبوع' : 'This Week'}</SelectItem>
            <SelectItem value="month">{isArabic ? 'هذا الشهر' : 'This Month'}</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="me-2 h-4 w-4" />
          {isArabic ? 'فلاتر متقدمة' : 'Advanced Filters'}
        </Button>
      </div>
      
      {/* Bulk Actions */}
      {selectedOrders.size > 0 && (
        <div className="mb-4 p-4 bg-muted/50 rounded-lg flex items-center justify-between">
          <p className="text-sm font-medium">
            {selectedOrders.size} {isArabic ? 'طلب محدد' : 'orders selected'}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleBulkAction('confirm')}>
              <CheckSquare className="me-2 h-4 w-4" />
              {isArabic ? 'تأكيد' : 'Confirm'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkAction('process')}>
              <Package className="me-2 h-4 w-4" />
              {isArabic ? 'معالجة' : 'Process'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkAction('ship')}>
              <Truck className="me-2 h-4 w-4" />
              {isArabic ? 'شحن' : 'Ship'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkAction('print')}>
              <Printer className="me-2 h-4 w-4" />
              {isArabic ? 'طباعة' : 'Print'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-destructive"
              onClick={() => handleBulkAction('cancel')}
            >
              <Ban className="me-2 h-4 w-4" />
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        </div>
      )}
      
      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedOrders.size === paginatedOrders.length && paginatedOrders.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3"
                      onClick={() => handleSort('orderNumber')}
                    >
                      {isArabic ? 'رقم الطلب' : 'Order #'}
                      {sortBy === 'orderNumber' ? (
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
                      onClick={() => handleSort('customer')}
                    >
                      {isArabic ? 'العميل' : 'Customer'}
                      {sortBy === 'customer' ? (
                        sortOrder === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>{isArabic ? 'المنتجات' : 'Products'}</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3"
                      onClick={() => handleSort('total')}
                    >
                      {isArabic ? 'الإجمالي' : 'Total'}
                      {sortBy === 'total' ? (
                        sortOrder === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                      ) : (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>{isArabic ? 'الدفع' : 'Payment'}</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-3"
                      onClick={() => handleSort('status')}
                    >
                      {isArabic ? 'الحالة' : 'Status'}
                      {sortBy === 'status' ? (
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
                      {isArabic ? 'التاريخ' : 'Date'}
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
                {paginatedOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={selectedOrders.has(order.id)}
                        onCheckedChange={(checked) => handleSelectOrder(order.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Hash className="h-3 w-3 text-muted-foreground" />
                        <code className="text-sm font-semibold">{order.orderNumber}</code>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-label font-semibold">{order.customer.name}</p>
                        <p className="text-detail text-muted-foreground">{order.customer.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {order.customer.totalOrders} {isArabic ? 'طلب' : 'orders'}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{order.customer.rating}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium line-clamp-1">
                          {order.items[0].name}
                        </p>
                        {order.items.length > 1 && (
                          <p className="text-xs text-muted-foreground">
                            +{order.items.length - 1} {isArabic ? 'منتج آخر' : 'more items'}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-label font-semibold flex items-center gap-1">
                          {formatCurrency(order.total)}
                          <SARSymbol className="h-3 w-3" />
                        </p>
                        {order.discount > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {isArabic ? 'خصم: ' : 'Discount: '}
                            {formatCurrency(order.discount)} SAR
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge 
                          variant={paymentStatusConfig[order.paymentInfo.status].color as any}
                          className="badge-text"
                        >
                          {paymentStatusConfig[order.paymentInfo.status].label[locale as 'ar' | 'en']}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {order.paymentInfo.method === 'credit_card' && (isArabic ? 'بطاقة ائتمان' : 'Credit Card')}
                          {order.paymentInfo.method === 'bank_transfer' && (isArabic ? 'تحويل بنكي' : 'Bank Transfer')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <Badge 
                          className={cn(
                            statusConfig[order.status as keyof typeof statusConfig].color,
                            "badge-text"
                          )}
                        >
                          {statusConfig[order.status as keyof typeof statusConfig].label[locale as 'ar' | 'en']}
                        </Badge>
                      </div>
                      {order.shippingInfo.trackingNumber && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {order.shippingInfo.trackingNumber}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{formatDate(order.createdAt)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleTimeString(isArabic ? 'ar-SA' : 'en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
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
                          <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                            <Eye className="mr-2 h-4 w-4" />
                            {isArabic ? 'عرض التفاصيل' : 'View Details'}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            {isArabic ? 'تعديل' : 'Edit'}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Printer className="mr-2 h-4 w-4" />
                            {isArabic ? 'طباعة الفاتورة' : 'Print Invoice'}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Receipt className="mr-2 h-4 w-4" />
                            {isArabic ? 'طباعة بوليصة الشحن' : 'Print Label'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>{isArabic ? 'تحديث الحالة' : 'Update Status'}</DropdownMenuLabel>
                          {Object.entries(statusConfig).map(([key, config]) => (
                            <DropdownMenuItem 
                              key={key}
                              onClick={() => handleUpdateStatus(order.id, key)}
                              disabled={order.status === key}
                            >
                              {React.createElement(config.icon, { className: "mr-2 h-4 w-4" })}
                              {config.label[locale as 'ar' | 'en']}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            {isArabic ? 'رسالة العميل' : 'Message Customer'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Ban className="mr-2 h-4 w-4" />
                            {isArabic ? 'إلغاء الطلب' : 'Cancel Order'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t px-4 py-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {isArabic 
                  ? `عرض ${(currentPage - 1) * itemsPerPage + 1} إلى ${Math.min(currentPage * itemsPerPage, sortedOrders.length)} من ${sortedOrders.length} طلب`
                  : `Showing ${(currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, sortedOrders.length)} of ${sortedOrders.length} orders`}
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
      
      {/* Order Details Dialog */}
      <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{isArabic ? 'تفاصيل الطلب' : 'Order Details'}</span>
                  <Badge className={statusConfig[selectedOrder.status as keyof typeof statusConfig].color}>
                    {statusConfig[selectedOrder.status as keyof typeof statusConfig].label[locale as 'ar' | 'en']}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  {isArabic ? 'رقم الطلب: ' : 'Order #'}{selectedOrder.orderNumber}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {isArabic ? 'معلومات العميل' : 'Customer Information'}
                  </h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isArabic ? 'الاسم:' : 'Name:'}</span>
                      <span className="font-medium">{selectedOrder.customer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isArabic ? 'البريد:' : 'Email:'}</span>
                      <span className="font-medium">{selectedOrder.customer.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isArabic ? 'الهاتف:' : 'Phone:'}</span>
                      <span className="font-medium" dir="ltr">{selectedOrder.customer.phone}</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Order Items */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    {isArabic ? 'المنتجات' : 'Products'}
                  </h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <ImagePlaceholder className="w-12 h-12 rounded" type="part" size="sm" />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(item.total)} SAR
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} × {formatCurrency(item.price)} SAR
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                {/* Shipping Info */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    {isArabic ? 'معلومات الشحن' : 'Shipping Information'}
                  </h4>
                  <div className="grid gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">{isArabic ? 'العنوان:' : 'Address:'}</span>
                      <p className="font-medium mt-1">
                        {selectedOrder.shippingInfo.address}<br />
                        {selectedOrder.shippingInfo.city}, {selectedOrder.shippingInfo.state} {selectedOrder.shippingInfo.zipCode}<br />
                        {selectedOrder.shippingInfo.country}
                      </p>
                    </div>
                    {selectedOrder.shippingInfo.trackingNumber && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{isArabic ? 'رقم التتبع:' : 'Tracking:'}</span>
                        <code className="font-medium">{selectedOrder.shippingInfo.trackingNumber}</code>
                      </div>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                {/* Order Summary */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    {isArabic ? 'ملخص الطلب' : 'Order Summary'}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isArabic ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                      <span>{formatCurrency(selectedOrder.subtotal)} SAR</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{isArabic ? 'الخصم:' : 'Discount:'}</span>
                        <span className="text-green-600">-{formatCurrency(selectedOrder.discount)} SAR</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isArabic ? 'الشحن:' : 'Shipping:'}</span>
                      <span>{formatCurrency(selectedOrder.shipping)} SAR</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>{isArabic ? 'الإجمالي:' : 'Total:'}</span>
                      <span>{formatCurrency(selectedOrder.total)} SAR</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOrderDetailsOpen(false)}>
                  {isArabic ? 'إغلاق' : 'Close'}
                </Button>
                <Button>
                  <Printer className="mr-2 h-4 w-4" />
                  {isArabic ? 'طباعة' : 'Print'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Bulk Action Confirmation */}
      <AlertDialog open={bulkActionDialogOpen} onOpenChange={setBulkActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isArabic ? 'تأكيد الإجراء' : 'Confirm Action'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isArabic 
                ? `سيتم تطبيق "${selectedBulkAction}" على ${selectedOrders.size} طلب محدد.`
                : `This will apply "${selectedBulkAction}" to ${selectedOrders.size} selected orders.`}
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

// Add missing import
import { cn } from '@/lib/utils';
import React from 'react';