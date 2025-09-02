'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { SARSymbol } from '@/components/ui/currency-symbol';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, MapPin, Search, Download, Eye, Truck, ExternalLink, CheckCircle } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customer: { name: string; city: string; vip: boolean };
  total: number;
  shippedAt: Date;
  trackingNumber: string;
  shippingProvider: string;
  estimatedDelivery: Date;
  status: 'in_transit' | 'out_for_delivery' | 'delivered';
}

const generateMockOrders = () => {
  const names = ['يوسف الشمري', 'هند الزهراني', 'طارق النجدي'];
  const cities = ['الرياض', 'جدة', 'الدمام'];
  const providers = ['SMSA Express', 'Aramex', 'DHL'];
  const statuses = ['in_transit', 'out_for_delivery', 'delivered'] as const;
  
  return Array.from({ length: 3 }, (_, i) => ({
    id: `shipped-${i + 1}`,
    orderNumber: `ORD-2024${String(4000 + i).padStart(4, '0')}`,
    customer: { name: names[i], city: cities[i], vip: i === 1 },
    total: Math.floor(300 + Math.random() * 800),
    shippedAt: new Date(Date.now() - ((i + 1) * 24 * 3600000)),
    trackingNumber: `${providers[i].substring(0, 3).toUpperCase()}${Math.floor(100000 + Math.random() * 900000)}`,
    shippingProvider: providers[i],
    estimatedDelivery: new Date(Date.now() + ((3 - i) * 24 * 3600000)),
    status: statuses[i],
  }));
};

export default function ShippedOrdersPage() {
  const locale = useLocale();
  const [orders] = useState(generateMockOrders());
  const [searchQuery, setSearchQuery] = useState('');
  const isArabic = locale === 'ar';

  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer.name.includes(searchQuery) ||
    order.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_transit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'out_for_delivery':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      in_transit: { ar: 'في الطريق', en: 'In Transit' },
      out_for_delivery: { ar: 'خارج للتسليم', en: 'Out for Delivery' },
      delivered: { ar: 'تم التسليم', en: 'Delivered' },
    };
    return labels[status as keyof typeof labels]?.[isArabic ? 'ar' : 'en'] || status;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-slate-200 dark:bg-slate-950/90 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/${locale}/seller/orders`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 me-2" />
                  {isArabic ? 'جميع الطلبات' : 'All Orders'}
                </Button>
              </Link>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Truck className="h-5 w-5 text-saudi-green" />
                  {isArabic ? 'الطلبات المشحونة' : 'Shipped Orders'}
                  <Badge className="bg-blue-500 text-white">{orders.length}</Badge>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isArabic ? 'طلبات تم شحنها وقيد التسليم' : 'Orders that have been shipped and are in transit'}
                </p>
              </div>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 me-2" />
              {isArabic ? 'تصدير' : 'Export'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isArabic ? 'البحث برقم الطلب أو رقم التتبع...' : 'Search by order number or tracking number...'}
                className="ps-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{isArabic ? 'رقم الطلب' : 'Order #'}</TableHead>
                    <TableHead>{isArabic ? 'العميل' : 'Customer'}</TableHead>
                    <TableHead>{isArabic ? 'المجموع' : 'Total'}</TableHead>
                    <TableHead>{isArabic ? 'تاريخ الشحن' : 'Shipped Date'}</TableHead>
                    <TableHead>{isArabic ? 'رقم التتبع' : 'Tracking #'}</TableHead>
                    <TableHead>{isArabic ? 'الحالة' : 'Status'}</TableHead>
                    <TableHead className="text-end">{isArabic ? 'الإجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{order.orderNumber}</span>
                          <span className="text-xs text-slate-500">
                            {order.shippingProvider}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{order.customer.name}</span>
                            {order.customer.vip && (
                              <Badge className="bg-desert-gold/20 text-desert-gold text-xs">VIP</Badge>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {order.customer.city}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-medium">
                          <SARSymbol className="h-4 w-4" />
                          {order.total.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {new Date(order.shippedAt).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                          {order.trackingNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", getStatusColor(order.status))}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 me-1" />
                            {isArabic ? 'عرض' : 'View'}
                          </Button>
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-4 w-4 me-1" />
                            {isArabic ? 'تتبع' : 'Track'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}