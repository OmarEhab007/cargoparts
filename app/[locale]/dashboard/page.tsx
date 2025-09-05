import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { SessionService } from '@/lib/auth/session';
import { UserService } from '@/lib/auth/user-service';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  User, 
  Store, 
  ShoppingCart, 
  Package,
  Settings,
  Bell,
  Heart,
  Clock,
  Search,
  Star,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

export default async function DashboardPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Check authentication
  const session = await SessionService.getSession();
  if (!session?.user) {
    redirect(`/${locale}/auth`);
  }

  // Get full user data with role
  const user = await UserService.getUserById(session.user.id);
  if (!user) {
    redirect(`/${locale}/auth`);
  }

  const t = await getTranslations('dashboard');
  const tCommon = await getTranslations('common');
  const isArabic = locale === 'ar';

  // Redirect sellers to their specific dashboard
  if (user.role === 'SELLER') {
    redirect(`/${locale}/seller/dashboard`);
  }

  // Handle BUYER dashboard
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full mb-4">
          <User className="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isArabic ? `مرحباً ${user.name || user.email}` : `Welcome ${user.name || user.email}`}
          </h1>
          <p className="text-slate-600 mt-2">
            {isArabic 
              ? 'ابحث عن قطع الغيار المستعملة الأصلية من ساحات الخردة في المملكة العربية السعودية'
              : 'Find used OEM auto parts from Saudi Arabia scrapyards'
            }
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'عمليات البحث' : 'Searches'}
            </CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'هذا الشهر' : 'this month'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'المفضلة' : 'Favorites'}
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'قطع محفوظة' : 'saved parts'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'الطلبات' : 'Orders'}
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'إجمالي الطلبات' : 'total orders'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'نقاط المكافآت' : 'Reward Points'}
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'نقطة متاحة' : 'points available'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {isArabic ? 'إجراءات سريعة' : 'Quick Actions'}
          </CardTitle>
          <CardDescription>
            {isArabic 
              ? 'ابدأ البحث عن قطع الغيار التي تحتاجها'
              : 'Start searching for the parts you need'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Button asChild className="h-auto p-4 justify-start">
              <Link href={`/${locale}/shop`} className="flex flex-col items-start gap-2">
                <Search className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">
                    {isArabic ? 'البحث عن قطع الغيار' : 'Search for Parts'}
                  </div>
                  <div className="text-xs opacity-80">
                    {isArabic ? 'ابحث بالموديل أو رقم القطعة' : 'Search by model or part number'}
                  </div>
                </div>
                <ArrowRight className={`h-4 w-4 ml-auto ${isArabic ? 'rotate-180' : ''}`} />
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="h-auto p-4 justify-start">
              <Link href={`/${locale}/shop/cart`} className="flex flex-col items-start gap-2">
                <ShoppingCart className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">
                    {isArabic ? 'عرض السلة' : 'View Cart'}
                  </div>
                  <div className="text-xs opacity-80">
                    {isArabic ? 'راجع العناصر المضافة' : 'Review added items'}
                  </div>
                </div>
                <ArrowRight className={`h-4 w-4 ml-auto ${isArabic ? 'rotate-180' : ''}`} />
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="h-auto p-4 justify-start">
              <Link href={`/${locale}/profile`} className="flex flex-col items-start gap-2">
                <Settings className="h-6 w-6" />
                <div className="text-left">
                  <div className="font-semibold">
                    {isArabic ? 'إعدادات الحساب' : 'Account Settings'}
                  </div>
                  <div className="text-xs opacity-80">
                    {isArabic ? 'إدارة معلوماتك الشخصية' : 'Manage your personal info'}
                  </div>
                </div>
                <ArrowRight className={`h-4 w-4 ml-auto ${isArabic ? 'rotate-180' : ''}`} />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity & Getting Started */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {isArabic ? 'النشاط الأخير' : 'Recent Activity'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">
                {isArabic 
                  ? 'لا يوجد نشاط حديث. ابدأ بالبحث عن قطع الغيار!'
                  : 'No recent activity. Start by searching for parts!'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started / Help */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {isArabic ? 'البدء' : 'Getting Started'}
            </CardTitle>
            <CardDescription>
              {isArabic 
                ? 'نصائح لاستخدام المنصة بفعالية'
                : 'Tips for using the platform effectively'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-sm">
                  {isArabic ? 'أكمل ملفك الشخصي' : 'Complete your profile'}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {isArabic 
                    ? 'أضف معلومات سيارتك للحصول على نتائج أفضل'
                    : 'Add your car information for better results'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-sm">
                  {isArabic ? 'احفظ عمليات البحث' : 'Save your searches'}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {isArabic 
                    ? 'احصل على تنبيهات عند توفر قطع جديدة'
                    : 'Get alerts when new parts become available'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <h4 className="font-medium text-sm">
                  {isArabic ? 'اربط بحسابك البنكي' : 'Link your payment method'}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {isArabic 
                    ? 'للدفع السريع والآمن'
                    : 'For quick and secure payments'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Opportunity Banner */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Store className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900 mb-1">
                {isArabic ? 'هل لديك قطع غيار للبيع؟' : 'Have parts to sell?'}
              </h3>
              <p className="text-green-700 text-sm">
                {isArabic 
                  ? 'انضم إلى شبكة البائعين واربح أموالاً إضافية من قطع الغيار المستعملة'
                  : 'Join our seller network and earn extra money from your used parts'
                }
              </p>
            </div>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href={`/${locale}/auth?mode=register&role=seller`}>
                {isArabic ? 'ابدأ البيع' : 'Start Selling'}
                <ArrowRight className={`h-4 w-4 ml-2 ${isArabic ? 'rotate-180' : ''}`} />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}