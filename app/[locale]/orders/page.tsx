'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SARSymbol } from '@/components/ui/currency-symbol';
import { 
  Package, 
  ShoppingBag,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  RefreshCw,
  Eye
} from 'lucide-react';

interface OrderItem {
  id: string;
  listing: {
    id: string;
    titleAr: string;
    titleEn: string | null;
    priceSar: number;
    make: string;
    model: string;
    seller: {
      yardName: string;
    };
  };
  qty: number;
  priceSar: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: string;
  address: string;
  createdAt: string;
}

const orderStatuses = {
  PENDING: { labelEn: 'Pending', labelAr: 'قيد الانتظار', color: 'secondary', icon: Clock },
  PAID: { labelEn: 'Paid', labelAr: 'مدفوع', color: 'default', icon: CheckCircle },
  SHIPPED: { labelEn: 'Shipped', labelAr: 'تم الشحن', color: 'outline', icon: Truck },
  DELIVERED: { labelEn: 'Delivered', labelAr: 'تم التوصيل', color: 'success', icon: Package },
  CANCELLED: { labelEn: 'Cancelled', labelAr: 'ملغى', color: 'destructive', icon: XCircle },
};

export default function BuyerOrdersPage() {
  const locale = useLocale();
  const router = useRouter();
  const isArabic = locale === 'ar';
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    fetchOrders();
  }, []);
  
  const fetchOrders = async () => {
    try {
      // For POC, using dummy buyer ID
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
  
  const getStatusInfo = (status: string) => {
    return orderStatuses[status as keyof typeof orderStatuses] || orderStatuses.PENDING;
  };
  
  
  const activeOrders = orders.filter(order => 
    ['PENDING', 'PAID', 'SHIPPED'].includes(order.status)
  );
  
  const completedOrders = orders.filter(order => 
    ['DELIVERED', 'CANCELLED'].includes(order.status)
  );
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          {isArabic ? 'جاري التحميل...' : 'Loading...'}
        </div>
      </div>
    );
  }
  
  const OrderCard = ({ order }: { order: Order }) => {
    const statusInfo = getStatusInfo(order.status);
    const StatusIcon = statusInfo.icon;
    
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-base">
                  {isArabic ? `طلب #${order.id.slice(-6)}` : `Order #${order.id.slice(-6)}`}
                </CardTitle>
                <Badge variant={statusInfo.color as 'secondary' | 'default' | 'outline' | 'destructive'}>
                  <StatusIcon className="me-1 h-3 w-3" />
                  {isArabic ? statusInfo.labelAr : statusInfo.labelEn}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(order.createdAt).toLocaleDateString(
                  isArabic ? 'ar-SA' : 'en-US',
                  { year: 'numeric', month: 'long', day: 'numeric' }
                )}
              </div>
            </div>
            <div className="text-end">
              <p className="text-lg font-bold flex items-center gap-1 justify-end">
                {order.total.toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                <SARSymbol className="h-4 w-4" />
              </p>
              <p className="text-sm text-muted-foreground">
                {order.items.length} {isArabic ? 'قطعة' : `item${order.items.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Order Items Preview */}
          <div className="space-y-2">
            {order.items.slice(0, 2).map(item => (
              <div key={item.id} className="flex items-center gap-3 text-sm">
                <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium line-clamp-1">
                    {isArabic ? item.listing.titleAr : item.listing.titleEn || item.listing.titleAr}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.listing.make} {item.listing.model} • {item.listing.seller.yardName}
                  </p>
                </div>
                <div className="text-end">
                  <p className="font-medium flex items-center gap-1">
                    {(item.priceSar * item.qty).toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                    <SARSymbol className="h-3 w-3" />
                  </p>
                  {item.qty > 1 && (
                    <p className="text-xs text-muted-foreground">
                      {isArabic ? `${item.qty} قطعة` : `${item.qty} pcs`}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {order.items.length > 2 && (
              <p className="text-sm text-muted-foreground text-center">
                {isArabic 
                  ? `و ${order.items.length - 2} قطعة أخرى...`
                  : `and ${order.items.length - 2} more item${order.items.length - 2 !== 1 ? 's' : ''}...`}
              </p>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => router.push(`/${locale}/order-success/${order.id}`)}
            >
              <Eye className="me-2 h-4 w-4" />
              {isArabic ? 'عرض التفاصيل' : 'View Details'}
            </Button>
            {order.status === 'DELIVERED' && (
              <Button 
                variant="default" 
                size="sm" 
                className="flex-1"
              >
                <RefreshCw className="me-2 h-4 w-4" />
                {isArabic ? 'إعادة الطلب' : 'Reorder'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {isArabic ? 'طلباتي' : 'My Orders'}
        </h1>
        <p className="text-muted-foreground">
          {isArabic 
            ? `لديك ${orders.length} طلب في السجل`
            : `You have ${orders.length} order${orders.length !== 1 ? 's' : ''} in history`}
        </p>
      </div>
      
      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h2 className="mb-2 text-xl font-semibold">
              {isArabic ? 'لا توجد طلبات بعد' : 'No orders yet'}
            </h2>
            <p className="mb-6 text-muted-foreground">
              {isArabic 
                ? 'عندما تقوم بطلب قطع غيار، ستظهر هنا'
                : 'When you order spare parts, they will appear here'}
            </p>
            <Button asChild>
              <Link href={`/${locale}/shop`}>
                <ShoppingBag className="me-2 h-4 w-4" />
                {isArabic ? 'تصفح القطع' : 'Browse Parts'}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              {isArabic ? 'الكل' : 'All'} ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              {isArabic ? 'نشط' : 'Active'} ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              {isArabic ? 'مكتمل' : 'Completed'} ({completedOrders.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {orders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </TabsContent>
          
          <TabsContent value="active" className="space-y-4">
            {activeOrders.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    {isArabic ? 'لا توجد طلبات نشطة' : 'No active orders'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              activeOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            {completedOrders.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    {isArabic ? 'لا توجد طلبات مكتملة' : 'No completed orders'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              completedOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}