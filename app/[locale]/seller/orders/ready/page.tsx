'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { SARSymbol } from '@/components/ui/currency-symbol';
import { cn } from '@/lib/utils';
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
  ArrowLeft, Package, MapPin, Search, Download, Eye, Truck, 
  PackageCheck, Clock, User, CheckCircle
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customer: { name: string; phone: string; city: string; vip: boolean };
  total: number;
  createdAt: Date;
  readyAt: Date;
  shippingProvider: string;
  trackingReady: boolean;
}

const generateMockOrders = (): Order[] => {
  const names = ['سارة الأحمد', 'عبدالرحمن المالك'];
  const cities = ['الرياض', 'جدة'];
  const providers = ['SMSA Express', 'Aramex'];
  
  return Array.from({ length: 2 }, (_, i) => ({
    id: `ready-${i + 1}`,
    orderNumber: `ORD-2024${String(3000 + i).padStart(4, '0')}`,
    customer: {
      name: names[i],
      phone: `+966 5${Math.floor(10000000 + Math.random() * 90000000)}`,
      city: cities[i],
      vip: i === 0,
    },
    total: Math.floor(500 + Math.random() * 1000),
    createdAt: new Date(Date.now() - ((i + 1) * 24 * 3600000)),
    readyAt: new Date(Date.now() - (i * 3600000)),
    shippingProvider: providers[i],
    trackingReady: i === 0,
  }));
};

export default function ReadyOrdersPage() {
  const locale = useLocale();
  const [orders, setOrders] = useState<Order[]>(generateMockOrders());
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const isArabic = locale === 'ar';

  const handleShipOrder = (orderId: string) => {
    setOrders(orders.filter(order => order.id !== orderId));
    toast({
      title: isArabic ? 'تم الشحن' : 'Order Shipped',
      description: isArabic ? 'تم تحديث حالة الطلب إلى مشحون' : 'Order status updated to shipped',
    });
  };

  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer.name.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-slate-200 dark:bg-slate-950/90 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/${locale}/seller/orders`}>
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
                  <ArrowLeft className="h-4 w-4 me-2" />
                  {isArabic ? 'جميع الطلبات' : 'All Orders'}
                </Button>
              </Link>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <PackageCheck className="h-5 w-5 text-saudi-green" />
                  {isArabic ? 'جاهز للشحن' : 'Ready to Ship'}
                  <Badge className="bg-green-500 text-white">{orders.length}</Badge>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isArabic ? 'طلبات جاهزة للشحن' : 'Orders ready for shipment'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-slate-200">
                <Download className="h-4 w-4 me-2" />
                {isArabic ? 'تصدير' : 'Export'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search */}
        <Card className="mb-6 border-slate-200 dark:border-slate-700">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isArabic ? 'البحث برقم الطلب أو اسم العميل...' : 'Search by order number or customer name...'}
                className="ps-10 border-slate-200"
              />
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
                    <TableHead>{isArabic ? 'رقم الطلب' : 'Order #'}</TableHead>
                    <TableHead>{isArabic ? 'العميل' : 'Customer'}</TableHead>
                    <TableHead>{isArabic ? 'المجموع' : 'Total'}</TableHead>
                    <TableHead>{isArabic ? 'جاهز منذ' : 'Ready Since'}</TableHead>
                    <TableHead>{isArabic ? 'شركة الشحن' : 'Shipping Provider'}</TableHead>
                    <TableHead>{isArabic ? 'الحالة' : 'Status'}</TableHead>
                    <TableHead className="text-end">{isArabic ? 'الإجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900 dark:text-white">{order.orderNumber}</span>
                          <span className="text-xs text-slate-500">
                            {new Date(order.readyAt).toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900 dark:text-white">{order.customer.name}</span>
                            {order.customer.vip && (
                              <Badge className="bg-desert-gold/20 text-desert-gold border-desert-gold/30 text-xs">VIP</Badge>
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
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-4 w-4 text-green-500" />
                          <span className="text-slate-600 dark:text-slate-400">
                            {Math.floor((Date.now() - order.readyAt.getTime()) / (1000 * 60 * 60))}h
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">{order.shippingProvider}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "text-xs",
                          order.trackingReady
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-orange-100 text-orange-800 border-orange-200"
                        )}>
                          {order.trackingReady
                            ? (isArabic ? 'جاهز للإرسال' : 'Ready to Ship')
                            : (isArabic ? 'إعداد التتبع' : 'Preparing Label')
                          }
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 me-1" />
                            {isArabic ? 'عرض' : 'View'}
                          </Button>
                          <Button
                            size="sm"
                            className="bg-saudi-green hover:bg-saudi-green/90 text-white"
                            onClick={() => handleShipOrder(order.id)}
                          >
                            <Truck className="h-4 w-4 me-1" />
                            {isArabic ? 'شحن' : 'Ship'}
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
                <PackageCheck className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  {isArabic ? 'لا توجد طلبات جاهزة للشحن' : 'No Orders Ready to Ship'}
                </h3>
                <p className="text-sm text-slate-500">
                  {isArabic ? 'سيتم عرض الطلبات الجاهزة للشحن هنا' : 'Orders ready for shipment will appear here'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}