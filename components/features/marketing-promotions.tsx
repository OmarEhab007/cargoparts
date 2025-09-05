'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { SaudiCard, SaudiHeader } from '@/components/ui/saudi-theme';
import { SARSymbol } from '@/components/ui/currency-symbol';
import {
  Gift,
  Tag,
  Target,
  TrendingUp,
  Users,
  Mail,
  MessageSquare,
  Calendar as CalendarIcon,
  Star,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Share,
  Download,
  Send,
  BarChart3,
  Zap,
  Crown,
  Percent,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  PlayCircle,
  PauseCircle,
  Settings,
  Filter,
  Search,
  RefreshCw,
  DollarSign,
  Activity,
  ShoppingCart,
  Package,
  FileText,
  Image,
  Link
} from 'lucide-react';
import { format, addDays, addWeeks, addMonths } from 'date-fns';

interface Promotion {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  type: 'discount' | 'bogo' | 'free_shipping' | 'bundle' | 'loyalty' | 'seasonal';
  discountType: 'percentage' | 'fixed' | 'buy_x_get_y';
  discountValue: number;
  minimumPurchase?: number;
  maxDiscount?: number;
  applicableProducts: 'all' | 'category' | 'specific';
  productIds?: string[];
  categoryIds?: string[];
  customerSegment: 'all' | 'new' | 'vip' | 'returning';
  usageLimit?: number;
  usageCount: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'paused' | 'expired' | 'scheduled';
  couponCode?: string;
  autoApply: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
  performance?: {
    views: number;
    uses: number;
    revenue: number;
    conversionRate: number;
  };
}

interface Campaign {
  id: string;
  name: string;
  nameAr: string;
  type: 'email' | 'sms' | 'whatsapp' | 'notification' | 'social';
  subject: string;
  subjectAr: string;
  content: string;
  contentAr: string;
  targetAudience: string[];
  scheduledDate?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'paused';
  metrics?: {
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
  };
  attachments?: string[];
  promotionId?: string;
  createdAt: string;
}

interface LoyaltyProgram {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  pointsPerSAR: number;
  rewardThresholds: {
    points: number;
    reward: string;
    rewardAr: string;
    value: number;
  }[];
  memberCount: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  isActive: boolean;
}

export function MarketingPromotions() {
  const locale = useLocale();
  const router = useRouter();
  const isArabic = locale === 'ar';
  const { user, seller } = useAuth();

  const [activeTab, setActiveTab] = useState('promotions');
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loyaltyProgram, setLoyaltyProgram] = useState<LoyaltyProgram | null>(null);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [showCampaignDialog, setShowCampaignDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New promotion form state
  const [newPromotion, setNewPromotion] = useState<Partial<Promotion>>({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    type: 'discount',
    discountType: 'percentage',
    discountValue: 0,
    applicableProducts: 'all',
    customerSegment: 'all',
    autoApply: false,
    priority: 1,
    status: 'draft',
  });

  // Authentication check
  useEffect(() => {
    if (!user || user.role !== 'SELLER') {
      router.push(`/${locale}/auth`);
      return;
    }
    if (!seller) {
      router.push(`/${locale}/seller/setup`);
      return;
    }
  }, [user, seller, router, locale]);

  // Fetch marketing data
  useEffect(() => {
    if (!seller?.id) return;
    
    const fetchMarketingData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/sellers/${seller.id}/campaigns`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch marketing data');
        }
        
        const data = await response.json();
        
        // For now, use mock data since the API is returning different structure
        // In production, you would adapt the API response to match the expected format
        const mockPromotions: Promotion[] = [
          {
            id: '1',
            name: 'Winter Sale 2024',
            nameAr: 'تخفيضات الشتاء 2024',
            description: '20% off on all engine parts',
            descriptionAr: 'خصم 20% على جميع قطع المحرك',
            type: 'discount',
            discountType: 'percentage',
            discountValue: 20,
            minimumPurchase: 500,
            applicableProducts: 'category',
            categoryIds: ['engines'],
            customerSegment: 'all',
            usageLimit: 1000,
            usageCount: 347,
            startDate: '2024-12-01T00:00:00Z',
            endDate: '2024-12-31T23:59:59Z',
            status: 'active',
            couponCode: 'WINTER20',
            autoApply: false,
            priority: 1,
            createdAt: '2024-11-15T10:00:00Z',
            updatedAt: '2024-12-16T14:30:00Z',
            performance: {
              views: 2456,
              uses: 347,
              revenue: 87500,
              conversionRate: 14.1,
            },
          },
          {
            id: '2',
            name: 'VIP Customer Exclusive',
            nameAr: 'عرض حصري لعملاء VIP',
            description: 'Free shipping for VIP customers',
            descriptionAr: 'شحن مجاني لعملاء VIP',
            type: 'free_shipping',
            discountType: 'fixed',
            discountValue: 0,
            applicableProducts: 'all',
            customerSegment: 'vip',
            usageCount: 89,
            startDate: '2024-01-01T00:00:00Z',
            endDate: '2025-12-31T23:59:59Z',
            status: 'active',
            autoApply: true,
            priority: 2,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-12-16T09:15:00Z',
            performance: {
              views: 456,
              uses: 89,
              revenue: 12400,
              conversionRate: 19.5,
            },
          },
        ];

        const mockCampaigns: Campaign[] = [
          {
            id: '1',
            name: 'Winter Sale Announcement',
            nameAr: 'إعلان تخفيضات الشتاء',
            type: 'email',
            subject: 'Huge Winter Discounts - Save up to 20%!',
            subjectAr: 'تخفيضات الشتاء الكبيرة - وفر حتى 20%!',
            content: 'Dear valued customer, our winter sale is now live with amazing discounts...',
            contentAr: 'عزيزنا العميل، تخفيضات الشتاء متاحة الآن مع خصومات مذهلة...',
            targetAudience: ['all_customers'],
            status: 'sent',
            metrics: {
              sent: 1247,
              opened: 623,
              clicked: 156,
              converted: 47,
            },
            promotionId: '1',
            createdAt: '2024-12-01T09:00:00Z',
          },
        ];

        const mockLoyaltyProgram: LoyaltyProgram = {
          id: '1',
          name: 'CargoParts Rewards',
          nameAr: 'مكافآت كارجو بارتس',
          description: 'Earn points on every purchase and redeem for discounts',
          descriptionAr: 'اكسب نقاطاً مع كل عملية شراء واستبدلها بخصومات',
          pointsPerSAR: 1,
          rewardThresholds: [
            { points: 100, reward: '5% Discount Coupon', rewardAr: 'كوبون خصم 5%', value: 50 },
            { points: 500, reward: '10% Discount Coupon', rewardAr: 'كوبون خصم 10%', value: 100 },
            { points: 1000, reward: 'Free Shipping Voucher', rewardAr: 'قسيمة شحن مجاني', value: 150 },
            { points: 2000, reward: '15% Discount Coupon', rewardAr: 'كوبون خصم 15%', value: 300 },
          ],
          memberCount: 892,
          totalPointsIssued: 45678,
          totalPointsRedeemed: 12456,
          isActive: true,
        };

        setPromotions(mockPromotions);
        setCampaigns(mockCampaigns);
        setLoyaltyProgram(mockLoyaltyProgram);
      } catch (error) {
        console.error('Error fetching marketing data:', error);
        setError('Failed to load marketing data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMarketingData();
  }, [seller?.id]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(isArabic ? 'ar-SA' : 'en-US');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: isArabic ? 'نشط' : 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200' },
      scheduled: { label: isArabic ? 'مجدول' : 'Scheduled', color: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200' },
      paused: { label: isArabic ? 'متوقف' : 'Paused', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' },
      expired: { label: isArabic ? 'منتهي' : 'Expired', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
      draft: { label: isArabic ? 'مسودة' : 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
      sent: { label: isArabic ? 'مرسل' : 'Sent', color: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'discount': return <Percent className="h-4 w-4 text-blue-600" />;
      case 'bogo': return <Gift className="h-4 w-4 text-green-600" />;
      case 'free_shipping': return <Package className="h-4 w-4 text-purple-600" />;
      case 'bundle': return <ShoppingCart className="h-4 w-4 text-orange-600" />;
      case 'loyalty': return <Star className="h-4 w-4 text-yellow-600" />;
      case 'seasonal': return <Tag className="h-4 w-4 text-red-600" />;
      default: return <Gift className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCampaignIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4 text-blue-600" />;
      case 'sms': return <MessageSquare className="h-4 w-4 text-green-600" />;
      case 'whatsapp': return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'notification': return <Activity className="h-4 w-4 text-purple-600" />;
      case 'social': return <Share className="h-4 w-4 text-pink-600" />;
      default: return <Mail className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleCreatePromotion = () => {
    // In a real app, this would make an API call
    console.log('Creating promotion:', newPromotion);
    setShowPromotionDialog(false);
    setNewPromotion({
      name: '',
      nameAr: '',
      description: '',
      descriptionAr: '',
      type: 'discount',
      discountType: 'percentage',
      discountValue: 0,
      applicableProducts: 'all',
      customerSegment: 'all',
      autoApply: false,
      priority: 1,
      status: 'draft',
    });
  };

  const PromotionCard = ({ promotion }: { promotion: Promotion }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getTypeIcon(promotion.type)}
            <div>
              <CardTitle className="text-base">
                {isArabic ? promotion.nameAr : promotion.name}
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                {isArabic ? promotion.descriptionAr : promotion.description}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(promotion.status)}
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Discount Info */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{isArabic ? 'الخصم:' : 'Discount:'}</span>
          <div className="font-semibold">
            {promotion.discountType === 'percentage' && `${promotion.discountValue}%`}
            {promotion.discountType === 'fixed' && (
              <div className="flex items-center gap-1">
                {formatCurrency(promotion.discountValue)}
                <SARSymbol className="h-3 w-3" />
              </div>
            )}
            {promotion.discountType === 'buy_x_get_y' && `Buy 2 Get ${promotion.discountValue} Free`}
          </div>
        </div>

        {/* Usage Progress */}
        {promotion.usageLimit && (
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">{isArabic ? 'الاستخدام:' : 'Usage:'}</span>
              <span>{promotion.usageCount} / {promotion.usageLimit}</span>
            </div>
            <Progress value={(promotion.usageCount / promotion.usageLimit) * 100} className="h-2" />
          </div>
        )}

        {/* Performance Stats */}
        {promotion.performance && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground block">{isArabic ? 'المشاهدات:' : 'Views:'}</span>
              <span className="font-medium">{promotion.performance.views.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">{isArabic ? 'الإيرادات:' : 'Revenue:'}</span>
              <div className="font-medium flex items-center gap-1">
                {formatCurrency(promotion.performance.revenue)}
                <SARSymbol className="h-3 w-3" />
              </div>
            </div>
            <div>
              <span className="text-muted-foreground block">{isArabic ? 'الاستخدامات:' : 'Uses:'}</span>
              <span className="font-medium">{promotion.performance.uses}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">{isArabic ? 'معدل التحويل:' : 'Conversion:'}</span>
              <span className="font-medium">{promotion.performance.conversionRate}%</span>
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}</span>
          {promotion.couponCode && (
            <Badge variant="outline" className="text-xs">
              {promotion.couponCode}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {isArabic ? 'جاري تحميل بيانات التسويق...' : 'Loading marketing data...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <SaudiHeader
        title={isArabic ? 'إدارة التسويق والعروض' : 'Marketing & Promotions Management'}
        subtitle={isArabic ? 'أنشئ وادر العروض التسويقية وحملات الترويج' : 'Create and manage marketing offers and promotional campaigns'}
        variant="gold"
      />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="promotions" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            {isArabic ? 'العروض' : 'Promotions'}
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            {isArabic ? 'الحملات' : 'Campaigns'}
          </TabsTrigger>
          <TabsTrigger value="loyalty" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            {isArabic ? 'برنامج الولاء' : 'Loyalty Program'}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {isArabic ? 'التحليلات' : 'Analytics'}
          </TabsTrigger>
        </TabsList>

        {/* Promotions Tab */}
        <TabsContent value="promotions" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold">
                {isArabic ? 'إدارة العروض الترويجية' : 'Promotion Management'}
              </h2>
              <p className="text-muted-foreground">
                {isArabic ? `${promotions.length} عرض نشط` : `${promotions.length} active promotions`}
              </p>
            </div>
            <Dialog open={showPromotionDialog} onOpenChange={setShowPromotionDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 me-2" />
                  {isArabic ? 'إضافة عرض جديد' : 'New Promotion'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {isArabic ? 'إنشاء عرض ترويجي جديد' : 'Create New Promotion'}
                  </DialogTitle>
                  <DialogDescription>
                    {isArabic ? 'أنشئ عرضاً ترويجياً جذاباً لعملائك' : 'Create an attractive promotional offer for your customers'}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="promoName">{isArabic ? 'اسم العرض' : 'Promotion Name'}</Label>
                    <Input
                      id="promoName"
                      value={newPromotion.name || ''}
                      onChange={(e) => setNewPromotion({ ...newPromotion, name: e.target.value })}
                      placeholder={isArabic ? 'مثال: تخفيضات الربيع' : 'e.g., Spring Sale'}
                    />
                  </div>
                  
                  {isArabic && (
                    <div className="grid gap-2">
                      <Label htmlFor="promoNameAr">اسم العرض بالعربية</Label>
                      <Input
                        id="promoNameAr"
                        value={newPromotion.nameAr || ''}
                        onChange={(e) => setNewPromotion({ ...newPromotion, nameAr: e.target.value })}
                        placeholder="مثال: تخفيضات الربيع 2024"
                      />
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label>{isArabic ? 'نوع العرض' : 'Promotion Type'}</Label>
                    <Select
                      value={newPromotion.type || 'discount'}
                      onValueChange={(value) => setNewPromotion({ ...newPromotion, type: value as Promotion['type'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discount">
                          {isArabic ? 'خصم' : 'Discount'}
                        </SelectItem>
                        <SelectItem value="bogo">
                          {isArabic ? 'اشتري واحصل على آخر' : 'Buy One Get One'}
                        </SelectItem>
                        <SelectItem value="free_shipping">
                          {isArabic ? 'شحن مجاني' : 'Free Shipping'}
                        </SelectItem>
                        <SelectItem value="bundle">
                          {isArabic ? 'عرض مجموعة' : 'Bundle Offer'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newPromotion.type === 'discount' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>{isArabic ? 'نوع الخصم' : 'Discount Type'}</Label>
                        <Select
                          value={newPromotion.discountType || 'percentage'}
                          onValueChange={(value) => setNewPromotion({ ...newPromotion, discountType: value as 'percentage' | 'fixed' })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">
                              {isArabic ? 'نسبة مئوية' : 'Percentage'}
                            </SelectItem>
                            <SelectItem value="fixed">
                              {isArabic ? 'مبلغ ثابت' : 'Fixed Amount'}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>{isArabic ? 'قيمة الخصم' : 'Discount Value'}</Label>
                        <Input
                          type="number"
                          value={newPromotion.discountValue || 0}
                          onChange={(e) => setNewPromotion({ ...newPromotion, discountValue: parseFloat(e.target.value) })}
                          placeholder={newPromotion.discountType === 'percentage' ? '20' : '100'}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="description">{isArabic ? 'وصف العرض' : 'Promotion Description'}</Label>
                    <Textarea
                      id="description"
                      value={newPromotion.description || ''}
                      onChange={(e) => setNewPromotion({ ...newPromotion, description: e.target.value })}
                      placeholder={isArabic ? 'اكتب وصفاً جذاباً للعرض' : 'Write an attractive description for the offer'}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowPromotionDialog(false)}>
                    {isArabic ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button onClick={handleCreatePromotion}>
                    {isArabic ? 'إنشاء العرض' : 'Create Promotion'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SaudiCard variant="gold">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    {isArabic ? 'العروض النشطة' : 'Active Promotions'}
                  </span>
                </div>
                <div className="text-2xl font-bold text-amber-900 dark:text-amber-200">
                  {promotions.filter(p => p.status === 'active').length}
                </div>
              </CardContent>
            </SaudiCard>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">
                    {isArabic ? 'إجمالي الإيرادات' : 'Total Revenue'}
                  </span>
                </div>
                <div className="text-2xl font-bold flex items-center gap-1">
                  {formatCurrency(promotions.reduce((sum, p) => sum + (p.performance?.revenue || 0), 0))}
                  <SARSymbol className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">
                    {isArabic ? 'إجمالي الاستخدامات' : 'Total Uses'}
                  </span>
                </div>
                <div className="text-2xl font-bold">
                  {promotions.reduce((sum, p) => sum + p.usageCount, 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">
                    {isArabic ? 'متوسط التحويل' : 'Avg Conversion'}
                  </span>
                </div>
                <div className="text-2xl font-bold">
                  {(promotions.reduce((sum, p) => sum + (p.performance?.conversionRate || 0), 0) / promotions.length).toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Promotions Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {promotions.map((promotion) => (
              <PromotionCard key={promotion.id} promotion={promotion} />
            ))}
          </div>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <SaudiCard variant="sky">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-blue-800 dark:text-blue-300">
                    {isArabic ? 'حملات التسويق' : 'Marketing Campaigns'}
                  </CardTitle>
                  <CardDescription>
                    {isArabic ? 'إدارة الحملات التسويقية عبر القنوات المختلفة' : 'Manage marketing campaigns across different channels'}
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 me-2" />
                  {isArabic ? 'حملة جديدة' : 'New Campaign'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20">
                    <div className="flex items-center gap-3">
                      {getCampaignIcon(campaign.type)}
                      <div>
                        <h4 className="font-medium">{isArabic ? campaign.nameAr : campaign.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {isArabic ? campaign.subjectAr : campaign.subject}
                        </p>
                        {campaign.metrics && (
                          <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                            <span>{isArabic ? 'مرسل:' : 'Sent:'} {campaign.metrics.sent}</span>
                            <span>{isArabic ? 'مفتوح:' : 'Opened:'} {campaign.metrics.opened}</span>
                            <span>{isArabic ? 'تحويلات:' : 'Converted:'} {campaign.metrics.converted}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(campaign.status)}
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </SaudiCard>
        </TabsContent>

        {/* Loyalty Program Tab */}
        <TabsContent value="loyalty" className="space-y-6">
          {loyaltyProgram && (
            <SaudiCard variant="green">
              <CardHeader>
                <CardTitle className="text-green-800 dark:text-green-300">
                  {isArabic ? loyaltyProgram.nameAr : loyaltyProgram.name}
                </CardTitle>
                <CardDescription>
                  {isArabic ? loyaltyProgram.descriptionAr : loyaltyProgram.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-green-900 dark:text-green-200">
                      {isArabic ? 'إحصائيات البرنامج' : 'Program Statistics'}
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{isArabic ? 'عدد الأعضاء:' : 'Members:'}</span>
                        <span className="font-medium">{loyaltyProgram.memberCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{isArabic ? 'النقاط الممنوحة:' : 'Points Issued:'}</span>
                        <span className="font-medium">{loyaltyProgram.totalPointsIssued.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{isArabic ? 'النقاط المستبدلة:' : 'Points Redeemed:'}</span>
                        <span className="font-medium">{loyaltyProgram.totalPointsRedeemed.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{isArabic ? 'معدل الاستبدال:' : 'Redemption Rate:'}</span>
                        <span className="font-medium">
                          {Math.round((loyaltyProgram.totalPointsRedeemed / loyaltyProgram.totalPointsIssued) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-green-900 dark:text-green-200">
                      {isArabic ? 'مستويات المكافآت' : 'Reward Tiers'}
                    </h4>
                    <div className="space-y-3">
                      {loyaltyProgram.rewardThresholds.map((threshold, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-green-50/50 dark:bg-green-950/20 rounded-lg">
                          <div>
                            <p className="font-medium">{isArabic ? threshold.rewardAr : threshold.reward}</p>
                            <p className="text-sm text-muted-foreground">
                              {threshold.points} {isArabic ? 'نقطة' : 'points'}
                            </p>
                          </div>
                          <div className="text-sm font-medium flex items-center gap-1">
                            {formatCurrency(threshold.value)}
                            <SARSymbol className="h-3 w-3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </SaudiCard>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'تحليلات التسويق' : 'Marketing Analytics'}</CardTitle>
              <CardDescription>
                {isArabic ? 'مراجعة أداء العروض والحملات التسويقية' : 'Review performance of promotions and marketing campaigns'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">
                  {isArabic ? 'تحليلات متقدمة' : 'Advanced Analytics'}
                </h3>
                <p className="text-muted-foreground">
                  {isArabic ? 'ستتوفر التحليلات المتقدمة قريباً' : 'Advanced analytics coming soon'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}