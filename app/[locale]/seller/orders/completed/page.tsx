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
import { ArrowLeft, MapPin, Search, Download, Eye, CheckCircle, FileText, Star } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customer: { name: string; city: string; vip: boolean };
  total: number;
  completedAt: Date;
  rating?: number;
  hasReview: boolean;
  canGenerateInvoice: boolean;
}

const generateMockOrders = () => {
  const names = ['علي الغانم', 'فاطمة السبيعي', 'محمد العنزي', 'نوال الحربي'];
  const cities = ['الرياض', 'جدة', 'الدمام', 'مكة المكرمة'];
  
  return Array.from({ length: 4 }, (_, i) => ({
    id: `completed-${i + 1}`,
    orderNumber: `ORD-2024${String(5000 + i).padStart(4, '0')}`,
    customer: { name: names[i], city: cities[i], vip: i % 2 === 0 },
    total: Math.floor(200 + Math.random() * 1000),
    completedAt: new Date(Date.now() - ((i + 1) * 2 * 24 * 3600000)),
    rating: i < 3 ? Math.floor(3 + Math.random() * 3) : undefined,
    hasReview: i < 2,
    canGenerateInvoice: true,
  }));
};

export default function CompletedOrdersPage() {
  const locale = useLocale();
  const [orders] = useState(generateMockOrders());
  const [searchQuery, setSearchQuery] = useState('');
  const isArabic = locale === 'ar';

  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer.name.includes(searchQuery)
  );

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-3 w-3",
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"
        )}
      />
    ));
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
                  <CheckCircle className="h-5 w-5 text-saudi-green" />
                  {isArabic ? 'الطلبات المكتملة' : 'Completed Orders'}
                  <Badge className="bg-green-500 text-white">{orders.length}</Badge>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isArabic ? 'طلبات تم تسليمها بنجاح' : 'Successfully delivered orders'}
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
                placeholder={isArabic ? 'البحث برقم الطلب أو اسم العميل...' : 'Search by order number or customer name...'}
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
                    <TableHead>{isArabic ? 'تاريخ الإكمال' : 'Completed Date'}</TableHead>
                    <TableHead>{isArabic ? 'التقييم' : 'Rating'}</TableHead>
                    <TableHead>{isArabic ? 'المراجعة' : 'Review'}</TableHead>
                    <TableHead className="text-end">{isArabic ? 'الإجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <span className="font-medium">{order.orderNumber}</span>
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
                          {new Date(order.completedAt).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                        </span>
                      </TableCell>
                      <TableCell>
                        {order.rating ? (
                          <div className="flex items-center gap-2">
                            <div className="flex">{renderStars(order.rating)}</div>
                            <span className="text-sm text-slate-600">{order.rating}/5</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">{isArabic ? 'لا يوجد تقييم' : 'No rating'}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {order.hasReview ? (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            {isArabic ? 'متوفر' : 'Available'}
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-400">{isArabic ? 'لا توجد مراجعة' : 'No review'}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 me-1" />
                            {isArabic ? 'عرض' : 'View'}
                          </Button>
                          {order.canGenerateInvoice && (
                            <Button size="sm" variant="outline">
                              <FileText className="h-4 w-4 me-1" />
                              {isArabic ? 'فاتورة' : 'Invoice'}
                            </Button>
                          )}
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