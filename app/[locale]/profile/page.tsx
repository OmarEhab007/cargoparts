'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { SARSymbol } from '@/components/ui/currency-symbol';
import { 
  ShoppingBag, 
  Package, 
  Settings, 
  MapPin, 
  Phone, 
  Mail,
  Calendar,
  ChevronRight,
  Edit2,
  Save,
  X,
  CheckCircle,
  Clock,
  Truck,
  AlertCircle
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
  seller?: {
    yardName: string;
    city: string;
    verified: boolean;
  };
}

interface Order {
  id: string;
  total: number;
  status: string;
  address: string;
  createdAt: string;
  items: {
    id: string;
    qty: number;
    priceSar: number;
    listing: {
      titleAr: string;
      titleEn: string | null;
      photos: { url: string }[];
      make: string;
      model: string;
    };
  }[];
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const statusIcons: Record<string, React.ReactNode> = {
  PENDING: <Clock className="h-4 w-4" />,
  CONFIRMED: <CheckCircle className="h-4 w-4" />,
  SHIPPED: <Truck className="h-4 w-4" />,
  DELIVERED: <Package className="h-4 w-4" />,
  CANCELLED: <AlertCircle className="h-4 w-4" />,
};

const statusLabels: Record<string, Record<string, string>> = {
  PENDING: { ar: 'قيد الانتظار', en: 'Pending' },
  CONFIRMED: { ar: 'مؤكد', en: 'Confirmed' },
  SHIPPED: { ar: 'تم الشحن', en: 'Shipped' },
  DELIVERED: { ar: 'تم التسليم', en: 'Delivered' },
  CANCELLED: { ar: 'ملغي', en: 'Cancelled' },
};

export default function ProfilePage() {
  const locale = useLocale();
  const router = useRouter();
  const isArabic = locale === 'ar';
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [activeTab, setActiveTab] = useState('orders');
  
  useEffect(() => {
    fetchProfile();
    fetchOrders();
  }, []);
  
  const fetchProfile = async () => {
    try {
      // Mock data for now - replace with real API call
      const mockProfile: UserProfile = {
        id: 'user1',
        email: 'user@example.com',
        name: 'أحمد محمد',
        phone: '+966501234567',
        role: 'BUYER',
        createdAt: '2024-01-01T00:00:00Z',
      };
      setProfile(mockProfile);
      setEditedProfile(mockProfile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };
  
  const fetchOrders = async () => {
    try {
      // Mock data for now - replace with real API call
      const mockOrders: Order[] = [
        {
          id: 'order1',
          total: 2500,
          status: 'DELIVERED',
          address: 'الرياض، حي النسيم، شارع الملك فهد',
          createdAt: '2024-12-01T10:00:00Z',
          items: [
            {
              id: 'item1',
              qty: 1,
              priceSar: 2500,
              listing: {
                titleAr: 'محرك تويوتا كامري 2015',
                titleEn: 'Toyota Camry 2015 Engine',
                photos: [],
                make: 'Toyota',
                model: 'Camry',
              },
            },
          ],
        },
        {
          id: 'order2',
          total: 1200,
          status: 'SHIPPED',
          address: 'جدة، حي الصفا، شارع الأمير سلطان',
          createdAt: '2024-12-10T14:30:00Z',
          items: [
            {
              id: 'item2',
              qty: 2,
              priceSar: 600,
              listing: {
                titleAr: 'فرامل أمامية هوندا أكورد',
                titleEn: 'Honda Accord Front Brakes',
                photos: [],
                make: 'Honda',
                model: 'Accord',
              },
            },
          ],
        },
        {
          id: 'order3',
          total: 3800,
          status: 'PENDING',
          address: 'الدمام، حي الفيصلية',
          createdAt: '2024-12-15T09:15:00Z',
          items: [
            {
              id: 'item3',
              qty: 1,
              priceSar: 3800,
              listing: {
                titleAr: 'ناقل حركة نيسان ألتيما 2018',
                titleEn: 'Nissan Altima 2018 Transmission',
                photos: [],
                make: 'Nissan',
                model: 'Altima',
              },
            },
          ],
        },
      ];
      setOrders(mockOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveProfile = async () => {
    try {
      // API call to save profile
      setProfile(editedProfile as UserProfile);
      setEditMode(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };
  
  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="" />
                <AvatarFallback className="text-lg">
                  {getInitials(profile?.name || null)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold mb-1 card-title-enhanced">
                  {profile?.name || (isArabic ? 'مستخدم' : 'User')}
                </h1>
                <div className="space-y-1 text-label text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {profile?.email}
                  </div>
                  {profile?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span dir="ltr">{profile.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {isArabic ? 'عضو منذ' : 'Member since'} {formatDate(profile?.createdAt || '')}
                  </div>
                </div>
              </div>
            </div>
            {!editMode ? (
              <Button 
                variant="outline" 
                onClick={() => setEditMode(true)}
              >
                <Edit2 className="me-2 h-4 w-4" />
                {isArabic ? 'تعديل الملف الشخصي' : 'Edit Profile'}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveProfile}
                  size="icon"
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setEditMode(false);
                    setEditedProfile(profile || {});
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          {/* Edit Form */}
          {editMode && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">
                  {isArabic ? 'الاسم' : 'Name'}
                </Label>
                <Input
                  id="name"
                  value={editedProfile.name || ''}
                  onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">
                  {isArabic ? 'رقم الهاتف' : 'Phone'}
                </Label>
                <Input
                  id="phone"
                  value={editedProfile.phone || ''}
                  onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                  className="mt-1"
                  dir="ltr"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="email">
                  {isArabic ? 'البريد الإلكتروني' : 'Email'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={editedProfile.email || ''}
                  onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                  className="mt-1"
                  dir="ltr"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Quick Actions */}
      {profile?.role === 'SELLER' && (
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <Card>
            <CardContent className="p-4">
              <Button 
                className="w-full justify-between"
                variant="ghost"
                asChild
              >
                <Link href={`/${locale}/seller/dashboard`}>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    {isArabic ? 'لوحة التحكم' : 'Dashboard'}
                  </div>
                  <ChevronRight className="h-4 w-4 rotate-180 rtl:rotate-0" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Button 
                className="w-full justify-between"
                variant="ghost"
                asChild
              >
                <Link href={`/${locale}/seller/listings`}>
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    {isArabic ? 'إدارة القطع' : 'Manage Listings'}
                  </div>
                  <ChevronRight className="h-4 w-4 rotate-180 rtl:rotate-0" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Button 
                className="w-full justify-between"
                variant="ghost"
              >
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  {isArabic ? 'الإعدادات' : 'Settings'}
                </div>
                <ChevronRight className="h-4 w-4 rotate-180 rtl:rotate-0" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">
            {isArabic ? 'الطلبات' : 'Orders'}
          </TabsTrigger>
          <TabsTrigger value="addresses">
            {isArabic ? 'العناوين' : 'Addresses'}
          </TabsTrigger>
          <TabsTrigger value="settings">
            {isArabic ? 'الإعدادات' : 'Settings'}
          </TabsTrigger>
        </TabsList>
        
        {/* Orders Tab */}
        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic ? 'سجل الطلبات' : 'Order History'}
              </CardTitle>
              <CardDescription>
                {isArabic 
                  ? `لديك ${orders.length} طلبات`
                  : `You have ${orders.length} orders`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {isArabic ? 'لا توجد طلبات بعد' : 'No orders yet'}
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href={`/${locale}/shop`}>
                      {isArabic ? 'ابدأ التسوق' : 'Start Shopping'}
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-label font-semibold">
                              {isArabic ? 'رقم الطلب:' : 'Order #'} {order.id.slice(0, 8)}
                            </span>
                            <Badge className={`${statusColors[order.status]} badge-text badge-modern`}>
                              <span className="flex items-center gap-1">
                                {statusIcons[order.status]}
                                {statusLabels[order.status]?.[locale as 'ar' | 'en']}
                              </span>
                            </Badge>
                          </div>
                          <p className="text-detail text-muted-foreground">
                            {formatDateTime(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-end">
                          <div className="text-price flex items-center gap-1 justify-end">
                            {order.total.toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                            <SARSymbol className="h-5 w-5" />
                          </div>
                          <p className="text-detail text-muted-foreground">
                            {order.items.length} {isArabic ? 'قطعة' : 'item(s)'}
                          </p>
                        </div>
                      </div>
                      
                      <Separator className="my-3" />
                      
                      {/* Order Items */}
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                              {item.listing.photos[0] ? (
                                <Image 
                                  src={item.listing.photos[0].url}
                                  alt=""
                                  width={48}
                                  height={48}
                                  className="rounded object-cover"
                                />
                              ) : (
                                <Package className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-label font-semibold card-title-enhanced">
                                {isArabic 
                                  ? item.listing.titleAr 
                                  : item.listing.titleEn || item.listing.titleAr}
                              </p>
                              <p className="text-detail text-muted-foreground">
                                {item.listing.make} {item.listing.model} • 
                                {isArabic ? ` الكمية: ${item.qty}` : ` Qty: ${item.qty}`}
                              </p>
                            </div>
                            <div className="text-label font-semibold flex items-center gap-1">
                              {(item.priceSar * item.qty).toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                              <SARSymbol className="h-4 w-4" />
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <Separator className="my-3" />
                      
                      {/* Delivery Address */}
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="text-sm">
                          <p className="text-label font-semibold mb-1">
                            {isArabic ? 'عنوان التوصيل' : 'Delivery Address'}
                          </p>
                          <p className="text-muted-foreground">{order.address}</p>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          {isArabic ? 'عرض التفاصيل' : 'View Details'}
                        </Button>
                        {order.status === 'DELIVERED' && (
                          <Button variant="outline" size="sm" className="flex-1">
                            {isArabic ? 'إعادة الطلب' : 'Reorder'}
                          </Button>
                        )}
                        {order.status === 'SHIPPED' && (
                          <Button variant="outline" size="sm" className="flex-1">
                            {isArabic ? 'تتبع الشحنة' : 'Track Shipment'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Addresses Tab */}
        <TabsContent value="addresses" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic ? 'عناوين التوصيل' : 'Delivery Addresses'}
              </CardTitle>
              <CardDescription>
                {isArabic 
                  ? 'إدارة عناوين التوصيل الخاصة بك'
                  : 'Manage your delivery addresses'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-label font-semibold card-title-enhanced">
                        {isArabic ? 'المنزل' : 'Home'}
                      </p>
                      <p className="text-detail text-muted-foreground mt-1">
                        الرياض، حي النسيم، شارع الملك فهد، مبنى 123
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {isArabic ? 'افتراضي' : 'Default'}
                    </Badge>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm">
                      {isArabic ? 'تعديل' : 'Edit'}
                    </Button>
                    <Button variant="outline" size="sm">
                      {isArabic ? 'حذف' : 'Delete'}
                    </Button>
                  </div>
                </div>
                
                <Button className="w-full" variant="outline">
                  {isArabic ? 'إضافة عنوان جديد' : 'Add New Address'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic ? 'الإعدادات' : 'Settings'}
              </CardTitle>
              <CardDescription>
                {isArabic 
                  ? 'إدارة تفضيلات حسابك'
                  : 'Manage your account preferences'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-label font-semibold mb-3">
                  {isArabic ? 'التنبيهات' : 'Notifications'}
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-detail">
                      {isArabic ? 'تنبيهات الطلبات' : 'Order notifications'}
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-detail">
                      {isArabic ? 'العروض والخصومات' : 'Offers and discounts'}
                    </span>
                  </label>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-label font-semibold mb-3">
                  {isArabic ? 'اللغة' : 'Language'}
                </h3>
                <div className="flex gap-2">
                  <Button 
                    variant={isArabic ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => router.push('/ar/profile')}
                  >
                    العربية
                  </Button>
                  <Button 
                    variant={!isArabic ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => router.push('/en/profile')}
                  >
                    English
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-label font-semibold mb-3 text-destructive">
                  {isArabic ? 'منطقة الخطر' : 'Danger Zone'}
                </h3>
                <Button variant="destructive" size="sm">
                  {isArabic ? 'حذف الحساب' : 'Delete Account'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}