'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SARSymbol } from '@/components/ui/currency-symbol';
import { 
  Package, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  Calendar,
  ChevronDown,
  ChevronUp,
  Truck,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface OrderItem {
  id: string;
  listing: {
    id: string;
    titleAr: string;
    titleEn: string | null;
    priceSar: number;
    make: string;
    model: string;
  };
  qty: number;
  priceSar: number;
}

interface Order {
  id: string;
  buyer: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  items: OrderItem[];
  total: number;
  status: string;
  address: string;
  createdAt: string;
}

const orderStatuses = [
  { value: 'PENDING', labelEn: 'Pending', labelAr: 'قيد الانتظار', color: 'secondary' },
  { value: 'PAID', labelEn: 'Paid', labelAr: 'مدفوع', color: 'default' },
  { value: 'SHIPPED', labelEn: 'Shipped', labelAr: 'تم الشحن', color: 'outline' },
  { value: 'DELIVERED', labelEn: 'Delivered', labelAr: 'تم التوصيل', color: 'success' },
  { value: 'CANCELLED', labelEn: 'Cancelled', labelAr: 'ملغى', color: 'destructive' },
];

import { Suspense } from 'react';
import { EnhancedOrderManagement } from '@/components/features/enhanced-order-management';
import { Skeleton } from '@/components/ui/skeleton';

export default function SellerOrdersPage() {
  return (
    <div className="p-6">
      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <Skeleton className="h-[600px] w-full" />
          </div>
        }
      >
        <EnhancedOrderManagement />
      </Suspense>
    </div>
  );
}

// Keep old component for reference
function OldSellerOrdersPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  useEffect(() => {
    fetchOrders();
  }, []);
  
  const fetchOrders = async () => {
    try {
      // For POC, fetch all orders (in real app, would filter by seller)
      const response = await fetch('/api/orders?buyerId=dummy');
      if (response.ok) {
        const data = await response.json();
        // Sort by newest first
        const sortedOrders = data.sort((a: Order, b: Order) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sortedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };
  
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    // In real app, this would make an API call to update the status
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };
  
  const getStatusLabel = (status: string) => {
    const statusObj = orderStatuses.find(s => s.value === status);
    return isArabic ? statusObj?.labelAr : statusObj?.labelEn;
  };
  
  const getStatusColor = (status: string) => {
    const statusObj = orderStatuses.find(s => s.value === status);
    return statusObj?.color || 'secondary';
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'PAID': return <CheckCircle className="h-4 w-4" />;
      case 'SHIPPED': return <Truck className="h-4 w-4" />;
      case 'DELIVERED': return <Package className="h-4 w-4" />;
      case 'CANCELLED': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };
  
  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);
  
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">
          {isArabic ? 'إدارة الطلبات' : 'Manage Orders'}
        </h1>
        
        {/* Filter Bar */}
        <div className="flex items-center gap-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {isArabic ? 'جميع الطلبات' : 'All Orders'}
              </SelectItem>
              {orderStatuses.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status.value)}
                    {isArabic ? status.labelAr : status.labelEn}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="text-sm text-muted-foreground">
            {isArabic 
              ? `${filteredOrders.length} طلب`
              : `${filteredOrders.length} order${filteredOrders.length !== 1 ? 's' : ''}`}
          </div>
        </div>
      </div>
      
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">
              {isArabic ? 'لا توجد طلبات' : 'No orders'}
            </h2>
            <p className="text-muted-foreground">
              {filterStatus === 'all'
                ? (isArabic ? 'لم تستلم أي طلبات بعد' : 'You haven\'t received any orders yet')
                : (isArabic ? 'لا توجد طلبات بهذه الحالة' : 'No orders with this status')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">
                        {isArabic ? `طلب #${order.id.slice(-6)}` : `Order #${order.id.slice(-6)}`}
                      </CardTitle>
                      <Badge variant={getStatusColor(order.status) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {getStatusLabel(order.status)}
                        </span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(order.createdAt).toLocaleDateString(
                          isArabic ? 'ar-SA' : 'en-US',
                          { year: 'numeric', month: 'short', day: 'numeric' }
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {order.buyer.name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-end">
                    <p className="text-2xl font-bold flex items-center gap-1 justify-end">
                      {order.total.toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                      <SARSymbol className="h-5 w-5" />
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.items.length} {isArabic ? 'قطعة' : `item${order.items.length !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <Collapsible
                open={expandedOrders.has(order.id)}
                onOpenChange={() => toggleOrderExpansion(order.id)}
              >
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between px-6 py-2">
                    <span className="text-sm">
                      {expandedOrders.has(order.id) 
                        ? (isArabic ? 'إخفاء التفاصيل' : 'Hide details')
                        : (isArabic ? 'عرض التفاصيل' : 'Show details')}
                    </span>
                    {expandedOrders.has(order.id) ? <ChevronUp /> : <ChevronDown />}
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-0">
                    {/* Order Items */}
                    <div>
                      <h3 className="font-semibold mb-3">
                        {isArabic ? 'القطع المطلوبة' : 'Ordered Items'}
                      </h3>
                      <div className="space-y-2">
                        {order.items.map(item => (
                          <div key={item.id} className="flex justify-between items-center rounded-lg border p-3">
                            <div>
                              <p className="font-medium">
                                {isArabic ? item.listing.titleAr : item.listing.titleEn || item.listing.titleAr}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {item.listing.make} {item.listing.model} • 
                                {' '}{isArabic ? 'الكمية:' : 'Qty:'} {item.qty}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {(item.priceSar * item.qty).toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                              <SARSymbol className="h-4 w-4" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Customer Information */}
                    <div>
                      <h3 className="font-semibold mb-3">
                        {isArabic ? 'معلومات العميل' : 'Customer Information'}
                      </h3>
                      <div className="rounded-lg border p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{order.buyer.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{order.buyer.email}</span>
                        </div>
                        {order.buyer.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span dir="ltr">{order.buyer.phone}</span>
                          </div>
                        )}
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <span>{order.address}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Update */}
                    <div>
                      <h3 className="font-semibold mb-3">
                        {isArabic ? 'تحديث الحالة' : 'Update Status'}
                      </h3>
                      <Select 
                        value={order.status} 
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {orderStatuses.map(status => (
                            <SelectItem key={status.value} value={status.value}>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(status.value)}
                                {isArabic ? status.labelAr : status.labelEn}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}