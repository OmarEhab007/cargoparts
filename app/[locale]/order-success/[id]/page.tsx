import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SARSymbol } from '@/components/ui/currency-symbol';
import { CheckCircle, Package, MapPin, Mail, Phone } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function OrderSuccessPage({ params }: PageProps) {
  const { id, locale } = await params;
  const isArabic = locale === 'ar';
  
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      buyer: true,
      items: {
        include: {
          listing: {
            include: {
              seller: true,
            },
          },
        },
      },
    },
  });
  
  if (!order) {
    notFound();
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Success Header */}
      <div className="mb-8 text-center">
        <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-600" />
        <h1 className="mb-2 text-3xl font-bold">
          {isArabic ? 'تم استلام طلبك بنجاح!' : 'Order Received Successfully!'}
        </h1>
        <p className="text-muted-foreground">
          {isArabic 
            ? 'شكراً لك على طلبك. سيتواصل معك البائع قريباً.'
            : 'Thank you for your order. The seller will contact you soon.'}
        </p>
      </div>
      
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Order Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{isArabic ? 'تفاصيل الطلب' : 'Order Details'}</CardTitle>
              <Badge variant="outline" className="text-lg">
                {isArabic ? 'قيد الانتظار' : 'Pending'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'رقم الطلب' : 'Order Number'}
                </p>
                <p className="font-mono text-sm">{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'تاريخ الطلب' : 'Order Date'}
                </p>
                <p className="text-sm">
                  {new Date(order.createdAt).toLocaleDateString(
                    isArabic ? 'ar-SA' : 'en-US',
                    { year: 'numeric', month: 'long', day: 'numeric' }
                  )}
                </p>
              </div>
            </div>
            
            <Separator />
            
            {/* Items */}
            <div>
              <h3 className="mb-3 font-semibold">
                {isArabic ? 'القطع المطلوبة' : 'Ordered Items'}
              </h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p className="font-medium">
                        {isArabic ? item.listing.titleAr : item.listing.titleEn || item.listing.titleAr}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isArabic ? 'الكمية:' : 'Quantity:'} {item.qty} • 
                        {' '}{isArabic ? 'البائع:' : 'Seller:'} {item.listing.seller.yardName}
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
            
            <Separator />
            
            {/* Total */}
            <div className="flex justify-between text-lg font-semibold">
              <span>{isArabic ? 'المجموع الكلي' : 'Total'}</span>
              <span className="flex items-center gap-1">
                {order.total.toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                <SARSymbol className="h-5 w-5" />
              </span>
            </div>
          </CardContent>
        </Card>
        
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? 'معلومات العميل' : 'Customer Information'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
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
          </CardContent>
        </Card>
        
        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? 'الخطوات التالية' : 'Next Steps'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="text-primary">1.</span>
                <span>
                  {isArabic 
                    ? 'سيتواصل معك البائع خلال 24 ساعة لتأكيد الطلب'
                    : 'The seller will contact you within 24 hours to confirm the order'}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">2.</span>
                <span>
                  {isArabic 
                    ? 'سيتم الاتفاق على طريقة الدفع والشحن مع البائع'
                    : 'Payment and shipping methods will be arranged with the seller'}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">3.</span>
                <span>
                  {isArabic 
                    ? 'سيتم شحن القطع بعد تأكيد الدفع'
                    : 'Parts will be shipped after payment confirmation'}
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Button size="lg" asChild>
            <Link href={`/${locale}/shop`}>
              {isArabic ? 'متابعة التسوق' : 'Continue Shopping'}
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href={`/${locale}`}>
              {isArabic ? 'الصفحة الرئيسية' : 'Go to Homepage'}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}