'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
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
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SaudiCard, SaudiHeader } from '@/components/ui/saudi-theme';
import { SARSymbol } from '@/components/ui/currency-symbol';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Plus,
  Search,
  Filter,
  Download,
  ArrowRight,
  ArrowLeft,
  Star,
  MessageSquare,
  RefreshCw,
  Send,
  Printer,
  FileText,
  Copy,
  Ban,
  CheckCheck,
  PlayCircle,
  PauseCircle,
  XCircle,
  Activity,
  TrendingUp,
  AlertTriangle,
  Info,
  Zap,
  Target,
  Flag
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    city: string;
  };
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'processing' | 'ready_to_ship' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingMethod: string;
  trackingNumber?: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  total: number;
  currency: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  tags: string[];
}

interface OrderItem {
  id: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sku?: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  titleAr: string;
  status: Order['status'];
  color: string;
  orders: Order[];
  maxItems?: number;
}

const orderStatuses = [
  { value: 'pending', labelAr: 'في الانتظار', labelEn: 'Pending', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
  { value: 'confirmed', labelAr: 'مؤكد', labelEn: 'Confirmed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200' },
  { value: 'processing', labelAr: 'قيد التحضير', labelEn: 'Processing', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' },
  { value: 'ready_to_ship', labelAr: 'جاهز للشحن', labelEn: 'Ready to Ship', color: 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200' },
  { value: 'shipped', labelAr: 'تم الشحن', labelEn: 'Shipped', color: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200' },
  { value: 'delivered', labelAr: 'تم التسليم', labelEn: 'Delivered', color: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200' },
  { value: 'cancelled', labelAr: 'ملغى', labelEn: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200' },
  { value: 'returned', labelAr: 'مرتجع', labelEn: 'Returned', color: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200' },
];

const priorityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200',
};

export function EnhancedOrderManagement() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const { user, seller } = useAuth();
  
  const [viewMode, setViewMode] = useState<'kanban' | 'table' | 'cards'>('kanban');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);

  // Fetch real orders data
  useEffect(() => {
    if (!seller?.id) return;
    
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch orders for this seller
        const response = await fetch(`/api/orders?sellerId=${seller.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        
        // Transform orders data to match our interface
        const transformedOrders: Order[] = data.orders?.map((order: any) => ({
          id: order.id,
          orderNumber: order.orderNumber || `ORD-${order.id.slice(-6)}`,
          customer: {
            id: order.buyer.id,
            name: order.buyer.name,
            email: order.buyer.email,
            phone: order.buyer.phone,
            city: order.shippingAddress?.city || 'N/A',
          },
          items: order.items?.map((item: any) => ({
            id: item.id,
            productName: isArabic ? item.listing.titleAr : (item.listing.titleEn || item.listing.titleAr),
            quantity: item.qty,
            unitPrice: item.priceSar,
            totalPrice: item.priceSar * item.qty,
            sku: item.listing.sku,
            productImage: item.listing.photos?.[0]?.url,
          })) || [],
          status: order.status.toLowerCase() as Order['status'],
          priority: 'medium' as Order['priority'], // Default priority, can be enhanced based on business logic
          paymentStatus: order.paymentStatus?.toLowerCase() as Order['paymentStatus'] || 'pending',
          shippingMethod: order.shippingMethod || 'standard',
          trackingNumber: order.trackingNumber,
          subtotal: order.subtotal,
          taxAmount: order.taxAmount || 0,
          shippingAmount: order.shippingAmount || 0,
          total: order.total,
          currency: 'SAR',
          estimatedDelivery: order.estimatedDelivery,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          notes: order.notes,
          tags: [], // Can be enhanced to include order tags
        })) || [];
        
        setOrders(transformedOrders);
        
        // Initialize Kanban columns with real data
        const initialColumns: KanbanColumn[] = [
          {
            id: 'pending',
            title: 'Pending',
            titleAr: 'في الانتظار',
            status: 'pending',
            color: 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50',
            orders: transformedOrders.filter(order => order.status === 'pending'),
          },
          {
            id: 'confirmed',
            title: 'Confirmed',
            titleAr: 'مؤكد',
            status: 'confirmed',
            color: 'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/50',
            orders: transformedOrders.filter(order => order.status === 'confirmed'),
          },
          {
            id: 'processing',
            title: 'Processing',
            titleAr: 'قيد التحضير',
            status: 'processing',
            color: 'border-yellow-200 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/50',
            orders: transformedOrders.filter(order => order.status === 'processing'),
          },
          {
            id: 'ready_to_ship',
            title: 'Ready to Ship',
            titleAr: 'جاهز للشحن',
            status: 'ready_to_ship',
            color: 'border-orange-200 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/50',
            orders: transformedOrders.filter(order => order.status === 'ready_to_ship'),
          },
          {
            id: 'shipped',
            title: 'Shipped',
            titleAr: 'تم الشحن',
            status: 'shipped',
            color: 'border-purple-200 bg-purple-50 dark:border-purple-700 dark:bg-purple-900/50',
            orders: transformedOrders.filter(order => order.status === 'shipped'),
          },
          {
            id: 'delivered',
            title: 'Delivered',
            titleAr: 'تم التسليم',
            status: 'delivered',
            color: 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/50',
            orders: transformedOrders.filter(order => order.status === 'delivered'),
          },
        ];
        
        setColumns(initialColumns);
        
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to load orders data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [seller?.id, isArabic]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(isArabic ? 'ar-SA' : 'en-US');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = orderStatuses.find(s => s.value === status);
    return (
      <Badge className={statusConfig?.color || 'bg-gray-100 text-gray-800'}>
        {isArabic ? statusConfig?.labelAr : statusConfig?.labelEn}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    return (
      <Badge className={priorityColors[priority as keyof typeof priorityColors]}>
        {priority === 'urgent' && (isArabic ? 'عاجل' : 'Urgent')}
        {priority === 'high' && (isArabic ? 'عالي' : 'High')}
        {priority === 'medium' && (isArabic ? 'متوسط' : 'Medium')}
        {priority === 'low' && (isArabic ? 'منخفض' : 'Low')}
      </Badge>
    );
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high': return <Flag className="h-4 w-4 text-orange-600" />;
      case 'medium': return <Info className="h-4 w-4 text-yellow-600" />;
      default: return <Activity className="h-4 w-4 text-green-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-gray-600" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'processing': return <RefreshCw className="h-4 w-4 text-yellow-600" />;
      case 'ready_to_ship': return <Package className="h-4 w-4 text-orange-600" />;
      case 'shipped': return <Truck className="h-4 w-4 text-purple-600" />;
      case 'delivered': return <CheckCheck className="h-4 w-4 text-green-600" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'returned': return <ArrowLeft className="h-4 w-4 text-red-600" />;
      default: return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    // Update order status
    const updatedOrders = orders.map(order => {
      if (order.id === draggableId) {
        return { ...order, status: destination.droppableId as Order['status'] };
      }
      return order;
    });
    
    setOrders(updatedOrders);

    // Update columns
    const updatedColumns = columns.map(column => {
      if (column.id === source.droppableId) {
        return {
          ...column,
          orders: column.orders.filter(order => order.id !== draggableId)
        };
      }
      if (column.id === destination.droppableId) {
        const draggedOrder = orders.find(order => order.id === draggableId);
        if (draggedOrder) {
          const updatedOrder = { ...draggedOrder, status: destination.droppableId as Order['status'] };
          return {
            ...column,
            orders: [...column.orders, updatedOrder]
          };
        }
      }
      return column;
    });
    
    setColumns(updatedColumns);
  };

  const handleBulkStatusUpdate = (newStatus: Order['status']) => {
    const updatedOrders = orders.map(order => {
      if (selectedOrders.includes(order.id)) {
        return { ...order, status: newStatus };
      }
      return order;
    });
    
    setOrders(updatedOrders);
    setSelectedOrders([]);
    setShowBulkActions(false);
  };

  const OrderCard = ({ order, isDragging = false }: { order: Order; isDragging?: boolean }) => (
    <Card 
      className={`mb-3 transition-all duration-200 ${
        isDragging 
          ? 'rotate-2 shadow-lg scale-105' 
          : 'hover:shadow-md cursor-pointer'
      } ${
        selectedOrders.includes(order.id) ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => {
        if (!isDragging) {
          setSelectedOrder(order);
          setShowOrderDialog(true);
        }
      }}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-sm">{order.orderNumber}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {getPriorityIcon(order.priority)}
              {getStatusIcon(order.status)}
            </div>
          </div>

          {/* Customer */}
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={order.customer.avatar} />
              <AvatarFallback className="text-xs">
                {order.customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{order.customer.name}</p>
              <p className="text-xs text-muted-foreground">{order.customer.city}</p>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-1">
            {order.items.slice(0, 2).map((item, index) => (
              <div key={index} className="flex justify-between items-center text-xs">
                <span className="truncate flex-1 pr-2">{item.productName}</span>
                <span className="text-muted-foreground">×{item.quantity}</span>
              </div>
            ))}
            {order.items.length > 2 && (
              <p className="text-xs text-muted-foreground">
                +{order.items.length - 2} {isArabic ? 'منتجات أخرى' : 'more items'}
              </p>
            )}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold">{formatCurrency(order.total)}</span>
              <SARSymbol className="h-3 w-3" />
            </div>
            <div className="flex gap-1">
              {getPriorityBadge(order.priority)}
            </div>
          </div>

          {/* Tags */}
          {order.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {order.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          {isArabic ? 'جاري التحميل...' : 'Loading orders...'}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-2"
            variant="outline"
          >
            {isArabic ? 'إعادة المحاولة' : 'Retry'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <SaudiHeader
        title={isArabic ? 'إدارة الطلبات المتقدمة' : 'Enhanced Order Management'}
        subtitle={isArabic ? 'لوحة كانبان والعمليات المجمعة لإدارة الطلبات بكفاءة' : 'Kanban board and bulk operations for efficient order management'}
        variant="green"
      />

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search and Filters */}
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isArabic ? 'البحث برقم الطلب، اسم العميل...' : 'Search by order number, customer name...'}
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={isArabic ? 'الحالة' : 'Status'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isArabic ? 'جميع الحالات' : 'All Status'}</SelectItem>
              {orderStatuses.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {isArabic ? status.labelAr : status.labelEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={isArabic ? 'الأولوية' : 'Priority'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isArabic ? 'جميع الأولويات' : 'All Priorities'}</SelectItem>
              <SelectItem value="urgent">{isArabic ? 'عاجل' : 'Urgent'}</SelectItem>
              <SelectItem value="high">{isArabic ? 'عالي' : 'High'}</SelectItem>
              <SelectItem value="medium">{isArabic ? 'متوسط' : 'Medium'}</SelectItem>
              <SelectItem value="low">{isArabic ? 'منخفض' : 'Low'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          {selectedOrders.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowBulkActions(true)}
              className="gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              {isArabic ? `عمليات مجمعة (${selectedOrders.length})` : `Bulk Actions (${selectedOrders.length})`}
            </Button>
          )}
          
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className="rounded-r-none"
            >
              <Target className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="rounded-none border-x"
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="rounded-l-none"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <Button>
            <Plus className="h-4 w-4 me-2" />
            {isArabic ? 'طلب جديد' : 'New Order'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SaudiCard variant="sky">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                {isArabic ? 'في الانتظار' : 'Pending'}
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">
              {columns.find(c => c.id === 'pending')?.orders.length || 0}
            </div>
          </CardContent>
        </SaudiCard>

        <SaudiCard variant="gold">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                {isArabic ? 'قيد التحضير' : 'Processing'}
              </span>
            </div>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-200">
              {columns.find(c => c.id === 'processing')?.orders.length || 0}
            </div>
          </CardContent>
        </SaudiCard>

        <SaudiCard variant="green">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800 dark:text-green-300">
                {isArabic ? 'تم الشحن' : 'Shipped'}
              </span>
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-200">
              {columns.find(c => c.id === 'shipped')?.orders.length || 0}
            </div>
          </CardContent>
        </SaudiCard>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">
                {isArabic ? 'إجمالي القيمة' : 'Total Value'}
              </span>
            </div>
            <div className="text-2xl font-bold flex items-center gap-1">
              {formatCurrency(orders.reduce((sum, order) => sum + order.total, 0))}
              <SARSymbol className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-6 min-w-max">
              {columns.map((column) => (
                <div key={column.id} className="w-80">
                  <div className={`rounded-lg p-4 ${column.color} min-h-[600px]`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(column.status)}
                        <h3 className="font-semibold">
                          {isArabic ? column.titleAr : column.title}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {column.orders.length}
                        </Badge>
                      </div>
                    </div>
                    
                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`space-y-3 min-h-[500px] transition-colors ${
                            snapshot.isDraggingOver ? 'bg-white/50 dark:bg-white/10 rounded-lg p-2' : ''
                          }`}
                        >
                          {column.orders.map((order, index) => (
                            <Draggable key={order.id} draggableId={order.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <OrderCard order={order} isDragging={snapshot.isDragging} />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DragDropContext>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <Card>
          <CardContent className="p-0">
            <div className="text-center py-8">
              <FileText className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">
                {isArabic ? 'عرض الجدول' : 'Table View'}
              </h3>
              <p className="text-muted-foreground">
                {isArabic ? 'سيتم تطوير عرض الجدول قريباً' : 'Table view will be implemented soon'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedOrder && (
                <>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedOrder.status)}
                    <span>{selectedOrder.orderNumber}</span>
                  </div>
                  {getStatusBadge(selectedOrder.status)}
                  {getPriorityBadge(selectedOrder.priority)}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{isArabic ? 'معلومات العميل' : 'Customer Information'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedOrder.customer.avatar} />
                        <AvatarFallback>
                          {selectedOrder.customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedOrder.customer.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedOrder.customer.city}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <span>{selectedOrder.customer.email}</span>
                      </div>
                      {selectedOrder.customer.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-green-500" />
                          <span dir="ltr">{selectedOrder.customer.phone}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Order Summary */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{isArabic ? 'ملخص الطلب' : 'Order Summary'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isArabic ? 'المجموع الفرعي:' : 'Subtotal:'}</span>
                      <div className="flex items-center gap-1">
                        <span>{formatCurrency(selectedOrder.subtotal)}</span>
                        <SARSymbol className="h-3 w-3" />
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isArabic ? 'الضريبة:' : 'Tax:'}</span>
                      <div className="flex items-center gap-1">
                        <span>{formatCurrency(selectedOrder.taxAmount)}</span>
                        <SARSymbol className="h-3 w-3" />
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isArabic ? 'الشحن:' : 'Shipping:'}</span>
                      <div className="flex items-center gap-1">
                        <span>{formatCurrency(selectedOrder.shippingAmount)}</span>
                        <SARSymbol className="h-3 w-3" />
                      </div>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>{isArabic ? 'الإجمالي:' : 'Total:'}</span>
                      <div className="flex items-center gap-1">
                        <span>{formatCurrency(selectedOrder.total)}</span>
                        <SARSymbol className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{isArabic ? 'منتجات الطلب' : 'Order Items'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{item.productName}</p>
                          {item.sku && (
                            <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {item.quantity} × {formatCurrency(item.unitPrice)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {isArabic ? 'الإجمالي:' : 'Total:'} {formatCurrency(item.totalPrice)} SAR
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {selectedOrder.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{isArabic ? 'ملاحظات' : 'Notes'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{selectedOrder.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button size="sm">
                  <Edit className="h-4 w-4 me-1" />
                  {isArabic ? 'تحديث الحالة' : 'Update Status'}
                </Button>
                <Button size="sm" variant="outline">
                  <Printer className="h-4 w-4 me-1" />
                  {isArabic ? 'طباعة' : 'Print'}
                </Button>
                <Button size="sm" variant="outline">
                  <Send className="h-4 w-4 me-1" />
                  {isArabic ? 'إرسال إلى العميل' : 'Send to Customer'}
                </Button>
                <Button size="sm" variant="outline">
                  <MessageSquare className="h-4 w-4 me-1" />
                  {isArabic ? 'رسالة للعميل' : 'Message Customer'}
                </Button>
                {selectedOrder.status === 'shipped' && selectedOrder.trackingNumber && (
                  <Button size="sm" variant="outline">
                    <Truck className="h-4 w-4 me-1" />
                    {isArabic ? 'تتبع الشحنة' : 'Track Shipment'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Actions Dialog */}
      <Dialog open={showBulkActions} onOpenChange={setShowBulkActions}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isArabic ? 'العمليات المجمعة' : 'Bulk Actions'}
            </DialogTitle>
            <DialogDescription>
              {isArabic 
                ? `تطبيق إجراءات على ${selectedOrders.length} طلب محدد`
                : `Apply actions to ${selectedOrders.length} selected orders`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>{isArabic ? 'تحديث الحالة إلى:' : 'Update Status to:'}</Label>
              <div className="grid gap-2 grid-cols-2">
                {orderStatuses.map((status) => (
                  <Button
                    key={status.value}
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusUpdate(status.value as Order['status'])}
                    className="justify-start gap-2"
                  >
                    {getStatusIcon(status.value)}
                    {isArabic ? status.labelAr : status.labelEn}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkActions(false)}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}