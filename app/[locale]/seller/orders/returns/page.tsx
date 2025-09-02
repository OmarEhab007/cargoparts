'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import {
  ArrowLeft, MapPin, Search, Download, Eye, RotateCcw, 
  AlertTriangle, CheckCircle, XCircle, DollarSign, Package
} from 'lucide-react';

interface ReturnOrder {
  id: string;
  orderNumber: string;
  customer: { name: string; city: string; vip: boolean };
  total: number;
  refundAmount: number;
  returnedAt: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'refunded';
  returnType: 'defective' | 'wrong_item' | 'not_as_described' | 'customer_changed_mind';
  hasPhotos: boolean;
}

const generateMockOrders = (): ReturnOrder[] => {
  const names = ['أسامة الحارثي'];
  const cities = ['جدة'];
  const reasons = ['المنتج معيب'];
  const types = ['defective'] as const;
  const statuses = ['pending'] as const;
  
  return Array.from({ length: 1 }, (_, i) => ({
    id: `return-${i + 1}`,
    orderNumber: `ORD-2024${String(6000 + i).padStart(4, '0')}`,
    customer: { name: names[i], city: cities[i], vip: false },
    total: Math.floor(400 + Math.random() * 600),
    refundAmount: Math.floor(300 + Math.random() * 500),
    returnedAt: new Date(Date.now() - ((i + 1) * 24 * 3600000)),
    reason: reasons[i],
    status: statuses[i],
    returnType: types[i],
    hasPhotos: i === 0,
  }));
};

export default function ReturnsPage() {
  const locale = useLocale();
  const [orders, setOrders] = useState<ReturnOrder[]>(generateMockOrders());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReturn, setSelectedReturn] = useState<ReturnOrder | null>(null);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [processingAction, setProcessingAction] = useState<'approve' | 'reject' | null>(null);
  const [processingNotes, setProcessingNotes] = useState('');
  const isArabic = locale === 'ar';

  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer.name.includes(searchQuery)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: { ar: 'في الانتظار', en: 'Pending' },
      approved: { ar: 'مقبول', en: 'Approved' },
      rejected: { ar: 'مرفوض', en: 'Rejected' },
      refunded: { ar: 'تم الاسترداد', en: 'Refunded' },
    };
    return labels[status as keyof typeof labels]?.[isArabic ? 'ar' : 'en'] || status;
  };

  const getReturnTypeLabel = (type: string) => {
    const labels = {
      defective: { ar: 'منتج معيب', en: 'Defective Product' },
      wrong_item: { ar: 'منتج خاطئ', en: 'Wrong Item' },
      not_as_described: { ar: 'غير مطابق للوصف', en: 'Not as Described' },
      customer_changed_mind: { ar: 'تغيير رأي العميل', en: 'Customer Changed Mind' },
    };
    return labels[type as keyof typeof labels]?.[isArabic ? 'ar' : 'en'] || type;
  };

  const handleProcessReturn = () => {
    if (!selectedReturn || !processingAction) return;

    const newStatus = processingAction === 'approve' ? 'approved' : 'rejected';
    
    setOrders(orders.map(order => 
      order.id === selectedReturn.id 
        ? { ...order, status: newStatus as any }
        : order
    ));

    toast({
      title: processingAction === 'approve' 
        ? (isArabic ? 'تم قبول الإرجاع' : 'Return Approved')
        : (isArabic ? 'تم رفض الإرجاع' : 'Return Rejected'),
      description: isArabic 
        ? 'تم إشعار العميل بالقرار'
        : 'Customer has been notified of the decision',
    });

    setShowProcessDialog(false);
    setSelectedReturn(null);
    setProcessingAction(null);
    setProcessingNotes('');
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
                  <RotateCcw className="h-5 w-5 text-saudi-green" />
                  {isArabic ? 'المرتجعات' : 'Returns'}
                  <Badge className="bg-orange-500 text-white">{orders.length}</Badge>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isArabic ? 'طلبات الإرجاع والاستبدال' : 'Return and refund requests'}
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
                    <TableHead>{isArabic ? 'مبلغ الاسترداد' : 'Refund Amount'}</TableHead>
                    <TableHead>{isArabic ? 'تاريخ الإرجاع' : 'Return Date'}</TableHead>
                    <TableHead>{isArabic ? 'السبب' : 'Reason'}</TableHead>
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
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3 text-slate-400" />
                            <span className="text-xs text-slate-500">
                              {getReturnTypeLabel(order.returnType)}
                            </span>
                          </div>
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
                        <div className="flex items-center gap-1 font-medium text-orange-600">
                          <SARSymbol className="h-4 w-4" />
                          {order.refundAmount.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {new Date(order.returnedAt).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[150px]">
                          <p className="text-sm text-slate-600 truncate" title={order.reason}>
                            {order.reason}
                          </p>
                          {order.hasPhotos && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {isArabic ? 'مع صور' : 'With Photos'}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", getStatusColor(order.status))}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedReturn(order)}
                          >
                            <Eye className="h-4 w-4 me-1" />
                            {isArabic ? 'عرض' : 'View'}
                          </Button>
                          {order.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => {
                                  setSelectedReturn(order);
                                  setProcessingAction('approve');
                                  setShowProcessDialog(true);
                                }}
                              >
                                <CheckCircle className="h-4 w-4 me-1" />
                                {isArabic ? 'قبول' : 'Approve'}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => {
                                  setSelectedReturn(order);
                                  setProcessingAction('reject');
                                  setShowProcessDialog(true);
                                }}
                              >
                                <XCircle className="h-4 w-4 me-1" />
                                {isArabic ? 'رفض' : 'Reject'}
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <RotateCcw className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  {isArabic ? 'لا توجد مرتجعات' : 'No Returns'}
                </h3>
                <p className="text-sm text-slate-500">
                  {isArabic ? 'سيتم عرض طلبات الإرجاع هنا' : 'Return requests will appear here'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Process Return Dialog */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={cn(
              processingAction === 'approve' ? 'text-green-600' : 'text-red-600'
            )}>
              {processingAction === 'approve'
                ? (isArabic ? 'قبول الإرجاع' : 'Approve Return')
                : (isArabic ? 'رفض الإرجاع' : 'Reject Return')
              }
            </DialogTitle>
            <DialogDescription>
              {processingAction === 'approve'
                ? (isArabic 
                    ? 'سيتم قبول طلب الإرجاع ومعالجة الاستبدال أو الاسترداد.'
                    : 'The return request will be approved and refund will be processed.'
                  )
                : (isArabic 
                    ? 'سيتم رفض طلب الإرجاع. يرجى تقديم سبب الرفض.'
                    : 'The return request will be rejected. Please provide a reason for rejection.'
                  )
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedReturn && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">{isArabic ? 'رقم الطلب:' : 'Order #:'}</span>
                    <p>{selectedReturn.orderNumber}</p>
                  </div>
                  <div>
                    <span className="font-medium">{isArabic ? 'العميل:' : 'Customer:'}</span>
                    <p>{selectedReturn.customer.name}</p>
                  </div>
                  <div>
                    <span className="font-medium">{isArabic ? 'مبلغ الاسترداد:' : 'Refund Amount:'}</span>
                    <p className="flex items-center gap-1">
                      <SARSymbol className="h-3 w-3" />
                      {selectedReturn.refundAmount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">{isArabic ? 'السبب:' : 'Reason:'}</span>
                    <p>{selectedReturn.reason}</p>
                  </div>
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="processing-notes">
                {processingAction === 'approve'
                  ? (isArabic ? 'ملاحظات (اختيارية)' : 'Notes (optional)')
                  : (isArabic ? 'سبب الرفض *' : 'Rejection Reason *')
                }
              </Label>
              <Textarea
                id="processing-notes"
                value={processingNotes}
                onChange={(e) => setProcessingNotes(e.target.value)}
                placeholder={processingAction === 'approve'
                  ? (isArabic ? 'ملاحظات إضافية...' : 'Additional notes...')
                  : (isArabic ? 'يرجى توضيح سبب رفض الإرجاع' : 'Please explain why the return is being rejected')
                }
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProcessDialog(false)}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              className={cn(
                processingAction === 'approve' 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-red-600 hover:bg-red-700"
              )}
              onClick={handleProcessReturn}
              disabled={processingAction === 'reject' && !processingNotes}
            >
              {processingAction === 'approve'
                ? (isArabic ? 'تأكيد القبول' : 'Confirm Approval')
                : (isArabic ? 'تأكيد الرفض' : 'Confirm Rejection')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}