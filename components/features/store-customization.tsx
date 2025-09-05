'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { SellerProfile, SellerSettings, SellerAnalytics } from '@/lib/types/seller-api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SaudiCard, SaudiHeader } from '@/components/ui/saudi-theme';
import { SARSymbol } from '@/components/ui/currency-symbol';
import {
  Store,
  Settings,
  Palette,
  Image,
  Globe,
  MapPin,
  Phone,
  Mail,
  Clock,
  CreditCard,
  Truck,
  Shield,
  FileText,
  Camera,
  Upload,
  Save,
  Edit,
  Eye,
  Copy,
  Share,
  Download,
  Plus,
  Trash2,
  Star,
  Award,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Crown,
  Target,
  Users,
  Package,
  DollarSign,
  Calendar,
  Building,
  IdCard,
  Receipt,
  Flag,
  Languages,
  Smartphone,
  Monitor,
  Printer,
  Link,
  ExternalLink
} from 'lucide-react';

// Using imported types from seller-api.ts
// BusinessProfile = SellerProfile
// StoreSettings = SellerSettings  
// StoreAnalytics = SellerAnalytics

const saudiRegions = [
  'منطقة الرياض',
  'منطقة مكة المكرمة',
  'المنطقة الشرقية',
  'منطقة المدينة المنورة',
  'منطقة القصيم',
  'منطقة عسير',
  'منطقة تبوك',
  'منطقة حائل',
  'المنطقة الشمالية',
  'منطقة جازان',
  'منطقة نجران',
  'منطقة الباحة',
  'منطقة الجوف'
];

const specializations = [
  { value: 'engines', labelAr: 'محركات', labelEn: 'Engines' },
  { value: 'transmission', labelAr: 'ناقل حركة', labelEn: 'Transmission' },
  { value: 'brakes', labelAr: 'فرامل', labelEn: 'Brakes' },
  { value: 'electrical', labelAr: 'كهرباء', labelEn: 'Electrical' },
  { value: 'body_parts', labelAr: 'قطع الهيكل', labelEn: 'Body Parts' },
  { value: 'suspension', labelAr: 'نظام التعليق', labelEn: 'Suspension' },
  { value: 'interior', labelAr: 'داخلية', labelEn: 'Interior' },
  { value: 'exterior', labelAr: 'خارجية', labelEn: 'Exterior' },
];

export function StoreCustomization() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const { user, seller } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [businessProfile, setBusinessProfile] = useState<SellerProfile | null>(null);
  const [storeSettings, setStoreSettings] = useState<SellerSettings | null>(null);
  const [analytics, setAnalytics] = useState<SellerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Fetch real seller profile and settings data
  useEffect(() => {
    if (!seller?.id) return;
    
    const fetchSellerData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch seller profile data
        const [profileResponse, settingsResponse, analyticsResponse] = await Promise.all([
          fetch(`/api/sellers/${seller.id}/profile`),
          fetch(`/api/sellers/${seller.id}/settings`),
          fetch(`/api/sellers/${seller.id}/analytics`)
        ]);

        if (!profileResponse.ok) {
          throw new Error('Failed to fetch seller profile');
        }

        const profileData = await profileResponse.json();
        
        // Transform the profile data
        const transformedProfile: SellerProfile = {
          id: profileData.data.id,
          businessName: profileData.data.businessName || seller.businessName,
          businessNameAr: profileData.data.businessNameAr || seller.businessName,
          commercialRegistration: profileData.data.commercialRegistration || '',
          vatNumber: profileData.data.vatNumber || '',
          contactPerson: profileData.data.contactPerson || user?.name || '',
          email: profileData.data.email || user?.email || '',
          phone: profileData.data.phone || user?.phone || '',
          whatsapp: profileData.data.whatsapp || '',
          address: profileData.data.address || '',
          city: profileData.data.city || '',
          region: profileData.data.region || '',
          postalCode: profileData.data.postalCode || '',
          website: profileData.data.website || '',
          logo: profileData.data.logo || '',
          description: profileData.data.description || '',
          descriptionAr: profileData.data.descriptionAr || '',
          specializations: profileData.data.specializations || [],
          workingHours: profileData.data.workingHours || [
            { day: 'السبت', open: '08:00', close: '18:00', isOpen: true },
            { day: 'الأحد', open: '08:00', close: '18:00', isOpen: true },
            { day: 'الاثنين', open: '08:00', close: '18:00', isOpen: true },
            { day: 'الثلاثاء', open: '08:00', close: '18:00', isOpen: true },
            { day: 'الأربعاء', open: '08:00', close: '18:00', isOpen: true },
            { day: 'الخميس', open: '08:00', close: '18:00', isOpen: true },
            { day: 'الجمعة', open: '14:00', close: '18:00', isOpen: true },
          ],
          certifications: profileData.data.certifications || [],
          establishedYear: profileData.data.establishedYear || new Date().getFullYear(),
          employeeCount: profileData.data.employeeCount || '1-10',
          isVerified: profileData.data.isVerified || false,
          verificationDocuments: profileData.data.verificationDocuments || [],
          createdAt: profileData.data.createdAt || new Date().toISOString(),
          updatedAt: profileData.data.updatedAt || new Date().toISOString(),
        };

        setBusinessProfile(transformedProfile);

        // Handle settings response
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          const transformedSettings: SellerSettings = {
            id: settingsData.data.id || 'settings-' + seller.id,
            sellerId: seller.id,
            storeName: settingsData.data.storeName || transformedProfile.businessName,
            storeNameAr: settingsData.data.storeNameAr || transformedProfile.businessNameAr || '',
            storeSlug: settingsData.data.storeSlug || seller.id,
            currency: settingsData.data.currency || 'SAR',
            language: settingsData.data.language || locale,
            timeZone: settingsData.data.timeZone || 'Asia/Riyadh',
            theme: settingsData.data.theme || 'auto',
            primaryColor: settingsData.data.primaryColor || '#16a34a',
            secondaryColor: settingsData.data.secondaryColor || '#f59e0b',
            showPrices: settingsData.data.showPrices ?? true,
            showStock: settingsData.data.showStock ?? true,
            allowNegotiation: settingsData.data.allowNegotiation ?? true,
            autoAcceptOrders: settingsData.data.autoAcceptOrders ?? false,
            requireDeposit: settingsData.data.requireDeposit ?? false,
            depositPercentage: settingsData.data.depositPercentage || 20,
            minimumOrderValue: settingsData.data.minimumOrderValue || 100,
            deliveryRadius: settingsData.data.deliveryRadius || 50,
            freeShippingThreshold: settingsData.data.freeShippingThreshold || 500,
            returnPolicy: settingsData.data.returnPolicy || 'Returns accepted within 7 days with receipt',
            returnPolicyAr: settingsData.data.returnPolicyAr || 'يقبل الإرجاع خلال 7 أيام مع الفاتورة',
            privacyPolicy: settingsData.data.privacyPolicy || 'We protect your privacy...',
            privacyPolicyAr: settingsData.data.privacyPolicyAr || 'نحن نحمي خصوصيتك...',
            termsOfService: settingsData.data.termsOfService || 'Terms and conditions...',
            termsOfServiceAr: settingsData.data.termsOfServiceAr || 'الشروط والأحكام...',
            socialMedia: settingsData.data.socialMedia || [
              { platform: 'whatsapp', url: '', isActive: false },
              { platform: 'instagram', url: '', isActive: false },
              { platform: 'twitter', url: '', isActive: false },
            ],
            paymentMethods: settingsData.data.paymentMethods || [
              { method: 'cash_on_delivery', isEnabled: true, fees: 0 },
              { method: 'bank_transfer', isEnabled: true, fees: 0 },
              { method: 'credit_card', isEnabled: false, fees: 2.5 },
              { method: 'apple_pay', isEnabled: false, fees: 2.9 },
            ],
            shippingMethods: settingsData.data.shippingMethods || [
              { name: 'Standard Delivery', nameAr: 'التوصيل العادي', cost: 25, estimatedDays: '2-3', isActive: true },
              { name: 'Express Delivery', nameAr: 'التوصيل السريع', cost: 50, estimatedDays: '1-2', isActive: true },
              { name: 'Same Day', nameAr: 'نفس اليوم', cost: 100, estimatedDays: '0-1', isActive: false },
            ],
            createdAt: settingsData.data.createdAt || new Date().toISOString(),
            updatedAt: settingsData.data.updatedAt || new Date().toISOString(),
          };
          setStoreSettings(transformedSettings);
        }

        // Handle analytics response
        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          const transformedAnalytics: SellerAnalytics = {
            profileCompletion: analyticsData.data.profileCompletion || 50,
            trustScore: analyticsData.data.trustScore || 60,
            customerSatisfaction: analyticsData.data.customerSatisfaction || 4.0,
            responseTime: analyticsData.data.responseTime || '< 24 hours',
            totalOrders: analyticsData.data.totalOrders || 0,
            totalRevenue: analyticsData.data.totalRevenue || 0,
            monthlyGrowth: analyticsData.data.monthlyGrowth || 0,
            topCategories: analyticsData.data.topCategories || [],
            averageRating: analyticsData.data.averageRating || 4.0,
            verificationStatus: analyticsData.data.verificationStatus || (transformedProfile.isVerified ? 'verified' : 'pending'),
            sellerId: seller.id,
            period: analyticsData.data.period || '30d',
            updatedAt: analyticsData.data.updatedAt || new Date().toISOString(),
          };
          setAnalytics(transformedAnalytics);
        }

      } catch (error) {
        console.error('Error fetching seller data:', error);
        setError('Failed to load seller data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSellerData();
  }, [seller?.id, user, locale]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(isArabic ? 'ar-SA' : 'en-US');
  };

  const handleSaveProfile = async () => {
    if (!seller?.id || !businessProfile) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/sellers/${seller.id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(businessProfile),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      // Show success message
      console.log('Profile saved successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!seller?.id || !storeSettings) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/sellers/${seller.id}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storeSettings),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      // Show success message
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real app, you would upload to cloud storage
    const logoUrl = URL.createObjectURL(file);
    if (businessProfile) {
      setBusinessProfile({ ...businessProfile, logo: logoUrl });
    }
    setUploadingLogo(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            {isArabic ? 'جاري التحميل...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
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
        </div>
      </div>
    );
  }

  if (!businessProfile || !storeSettings || !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">
            {isArabic ? 'لم يتم العثور على بيانات' : 'No data found'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <SaudiHeader
        title={isArabic ? 'إعدادات المتجر والملف التجاري' : 'Store Settings & Business Profile'}
        subtitle={isArabic ? 'قم بتخصيص متجرك وإدارة ملفك التجاري' : 'Customize your store and manage your business profile'}
        variant="sky"
      />

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SaudiCard variant="green">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800 dark:text-green-300">
                {isArabic ? 'اكتمال الملف' : 'Profile Completion'}
              </span>
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-200 mb-2">
              {analytics.profileCompletion}%
            </div>
            <Progress value={analytics.profileCompletion} className="h-2" />
          </CardContent>
        </SaudiCard>

        <SaudiCard variant="sky">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                {isArabic ? 'نقاط الثقة' : 'Trust Score'}
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">
              {analytics.trustScore}/100
            </div>
            <p className="text-xs text-muted-foreforeground">
              {analytics.verificationStatus === 'verified' && (
                <Badge variant="outline" className="text-xs mt-1">
                  <CheckCircle className="h-3 w-3 me-1" />
                  {isArabic ? 'موثق' : 'Verified'}
                </Badge>
              )}
            </p>
          </CardContent>
        </SaudiCard>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">
                {isArabic ? 'رضا العملاء' : 'Customer Satisfaction'}
              </span>
            </div>
            <div className="text-2xl font-bold">
              {analytics.customerSatisfaction}/5
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.averageRating} {isArabic ? 'تقييم متوسط' : 'average rating'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">
                {isArabic ? 'وقت الاستجابة' : 'Response Time'}
              </span>
            </div>
            <div className="text-2xl font-bold">
              {analytics.responseTime}
            </div>
            <p className="text-xs text-muted-foreground">
              {isArabic ? 'متوسط الرد' : 'average response'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            {isArabic ? 'الملف التجاري' : 'Business Profile'}
          </TabsTrigger>
          <TabsTrigger value="store" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            {isArabic ? 'إعدادات المتجر' : 'Store Settings'}
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            {isArabic ? 'المدفوعات والشحن' : 'Payments & Shipping'}
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            {isArabic ? 'العلامة التجارية' : 'Branding'}
          </TabsTrigger>
        </TabsList>

        {/* Business Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <SaudiCard variant="green">
            <CardHeader>
              <CardTitle className="text-green-800 dark:text-green-300">
                {isArabic ? 'معلومات المؤسسة' : 'Business Information'}
              </CardTitle>
              <CardDescription>
                {isArabic ? 'المعلومات الأساسية لمؤسستك التجارية' : 'Essential information about your business'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div className="space-y-4">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={businessProfile.logo} />
                      <AvatarFallback className="text-lg">
                        {businessProfile.businessName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {uploadingLogo && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">{isArabic ? 'شعار الشركة' : 'Company Logo'}</h4>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'حدد صورة للشعار (PNG, JPG - الحد الأقصى 2MB)' : 'Upload logo image (PNG, JPG - max 2MB)'}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" disabled={uploadingLogo} asChild>
                        <label htmlFor="logo-upload">
                          <Upload className="h-4 w-4 me-2" />
                          {isArabic ? 'رفع شعار' : 'Upload Logo'}
                        </label>
                      </Button>
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                      {businessProfile.logo && (
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 me-2" />
                          {isArabic ? 'معاينة' : 'Preview'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{isArabic ? 'اسم المؤسسة (إنجليزي)' : 'Business Name (English)'}</Label>
                  <Input
                    value={businessProfile.businessName}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, businessName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? 'اسم المؤسسة (عربي)' : 'Business Name (Arabic)'}</Label>
                  <Input
                    value={businessProfile.businessNameAr}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, businessNameAr: e.target.value })}
                    className="text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Legal Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{isArabic ? 'رقم السجل التجاري' : 'Commercial Registration'}</Label>
                  <Input
                    value={businessProfile.commercialRegistration}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, commercialRegistration: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? 'الرقم الضريبي' : 'VAT Number'}</Label>
                  <Input
                    value={businessProfile.vatNumber}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, vatNumber: e.target.value })}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-green-800 dark:text-green-300">
                  {isArabic ? 'معلومات الاتصال' : 'Contact Information'}
                </h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{isArabic ? 'الشخص المسؤول' : 'Contact Person'}</Label>
                    <Input
                      value={businessProfile.contactPerson}
                      onChange={(e) => setBusinessProfile({ ...businessProfile, contactPerson: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isArabic ? 'البريد الإلكتروني' : 'Email Address'}</Label>
                    <Input
                      type="email"
                      value={businessProfile.email}
                      onChange={(e) => setBusinessProfile({ ...businessProfile, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isArabic ? 'رقم الهاتف' : 'Phone Number'}</Label>
                    <Input
                      value={businessProfile.phone}
                      onChange={(e) => setBusinessProfile({ ...businessProfile, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isArabic ? 'واتساب' : 'WhatsApp'}</Label>
                    <Input
                      value={businessProfile.whatsapp || ''}
                      onChange={(e) => setBusinessProfile({ ...businessProfile, whatsapp: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <h4 className="font-semibold text-green-800 dark:text-green-300">
                  {isArabic ? 'العنوان' : 'Address'}
                </h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2 md:col-span-2">
                    <Label>{isArabic ? 'العنوان الكامل' : 'Full Address'}</Label>
                    <Input
                      value={businessProfile.address}
                      onChange={(e) => setBusinessProfile({ ...businessProfile, address: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isArabic ? 'المدينة' : 'City'}</Label>
                    <Input
                      value={businessProfile.city}
                      onChange={(e) => setBusinessProfile({ ...businessProfile, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isArabic ? 'المنطقة' : 'Region'}</Label>
                    <Select
                      value={businessProfile.region}
                      onValueChange={(value) => setBusinessProfile({ ...businessProfile, region: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {saudiRegions.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{isArabic ? 'الرمز البريدي' : 'Postal Code'}</Label>
                    <Input
                      value={businessProfile.postalCode}
                      onChange={(e) => setBusinessProfile({ ...businessProfile, postalCode: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{isArabic ? 'وصف المؤسسة (إنجليزي)' : 'Business Description (English)'}</Label>
                  <Textarea
                    value={businessProfile.description}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? 'وصف المؤسسة (عربي)' : 'Business Description (Arabic)'}</Label>
                  <Textarea
                    value={businessProfile.descriptionAr}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, descriptionAr: e.target.value })}
                    rows={3}
                    className="text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent me-2" />
                      {isArabic ? 'جاري الحفظ...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 me-2" />
                      {isArabic ? 'حفظ التغييرات' : 'Save Changes'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </SaudiCard>

          {/* Working Hours */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'ساعات العمل' : 'Working Hours'}</CardTitle>
              <CardDescription>
                {isArabic ? 'حدد ساعات عمل مؤسستك' : 'Set your business operating hours'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {businessProfile.workingHours.map((schedule, index) => (
                  <div key={schedule.day} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={schedule.isOpen}
                        onCheckedChange={(checked) => {
                          const newHours = [...businessProfile.workingHours];
                          newHours[index].isOpen = checked;
                          setBusinessProfile({ ...businessProfile, workingHours: newHours });
                        }}
                      />
                      <span className="font-medium w-20">{schedule.day}</span>
                    </div>
                    {schedule.isOpen && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={schedule.open}
                          onChange={(e) => {
                            const newHours = [...businessProfile.workingHours];
                            newHours[index].open = e.target.value;
                            setBusinessProfile({ ...businessProfile, workingHours: newHours });
                          }}
                          className="w-32"
                        />
                        <span className="text-muted-foreground">{isArabic ? 'إلى' : 'to'}</span>
                        <Input
                          type="time"
                          value={schedule.close}
                          onChange={(e) => {
                            const newHours = [...businessProfile.workingHours];
                            newHours[index].close = e.target.value;
                            setBusinessProfile({ ...businessProfile, workingHours: newHours });
                          }}
                          className="w-32"
                        />
                      </div>
                    )}
                    {!schedule.isOpen && (
                      <Badge variant="secondary">{isArabic ? 'مغلق' : 'Closed'}</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Specializations */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'التخصصات' : 'Specializations'}</CardTitle>
              <CardDescription>
                {isArabic ? 'حدد مجالات تخصص مؤسستك' : 'Select your business specializations'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {specializations.map((spec) => (
                  <div key={spec.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`spec-${spec.value}`}
                      checked={businessProfile.specializations.includes(spec.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setBusinessProfile({
                            ...businessProfile,
                            specializations: [...businessProfile.specializations, spec.value]
                          });
                        } else {
                          setBusinessProfile({
                            ...businessProfile,
                            specializations: businessProfile.specializations.filter(s => s !== spec.value)
                          });
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={`spec-${spec.value}`} className="text-sm font-normal cursor-pointer">
                      {isArabic ? spec.labelAr : spec.labelEn}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Store Settings Tab */}
        <TabsContent value="store" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'إعدادات المتجر الأساسية' : 'Basic Store Settings'}</CardTitle>
              <CardDescription>
                {isArabic ? 'الإعدادات العامة لمتجرك الإلكتروني' : 'General settings for your online store'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Store Name */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{isArabic ? 'اسم المتجر (إنجليزي)' : 'Store Name (English)'}</Label>
                  <Input
                    value={storeSettings.storeName}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? 'اسم المتجر (عربي)' : 'Store Name (Arabic)'}</Label>
                  <Input
                    value={storeSettings.storeNameAr}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storeNameAr: e.target.value })}
                    className="text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Store URL */}
              <div className="space-y-2">
                <Label>{isArabic ? 'رابط المتجر' : 'Store URL'}</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-sm bg-muted border border-r-0 rounded-l-md">
                    cargoparts.sa/store/
                  </span>
                  <Input
                    value={storeSettings.storeSlug}
                    onChange={(e) => setStoreSettings({ ...storeSettings, storeSlug: e.target.value })}
                    className="rounded-l-none"
                  />
                </div>
              </div>

              {/* Basic Settings */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{isArabic ? 'العملة' : 'Currency'}</Label>
                  <Select
                    value={storeSettings.currency}
                    onValueChange={(value) => setStoreSettings({ ...storeSettings, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                      <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                      <SelectItem value="EUR">يورو (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? 'اللغة الافتراضية' : 'Default Language'}</Label>
                  <Select
                    value={storeSettings.language}
                    onValueChange={(value) => setStoreSettings({ ...storeSettings, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isArabic ? 'المنطقة الزمنية' : 'Time Zone'}</Label>
                  <Select
                    value={storeSettings.timeZone}
                    onValueChange={(value) => setStoreSettings({ ...storeSettings, timeZone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Riyadh">الرياض (GMT+3)</SelectItem>
                      <SelectItem value="Asia/Dubai">دبي (GMT+4)</SelectItem>
                      <SelectItem value="Asia/Kuwait">الكويت (GMT+3)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Display Options */}
              <div className="space-y-4">
                <h4 className="font-semibold">{isArabic ? 'خيارات العرض' : 'Display Options'}</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showPrices">{isArabic ? 'عرض الأسعار' : 'Show Prices'}</Label>
                    <Switch
                      id="showPrices"
                      checked={storeSettings.showPrices}
                      onCheckedChange={(checked) => setStoreSettings({ ...storeSettings, showPrices: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showStock">{isArabic ? 'عرض المخزون' : 'Show Stock Levels'}</Label>
                    <Switch
                      id="showStock"
                      checked={storeSettings.showStock}
                      onCheckedChange={(checked) => setStoreSettings({ ...storeSettings, showStock: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="allowNegotiation">{isArabic ? 'السماح بالتفاوض' : 'Allow Price Negotiation'}</Label>
                    <Switch
                      id="allowNegotiation"
                      checked={storeSettings.allowNegotiation}
                      onCheckedChange={(checked) => setStoreSettings({ ...storeSettings, allowNegotiation: checked })}
                    />
                  </div>
                </div>
              </div>

              {/* Order Settings */}
              <div className="space-y-4">
                <h4 className="font-semibold">{isArabic ? 'إعدادات الطلبات' : 'Order Settings'}</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoAccept">{isArabic ? 'قبول الطلبات تلقائياً' : 'Auto-accept Orders'}</Label>
                    <Switch
                      id="autoAccept"
                      checked={storeSettings.autoAcceptOrders}
                      onCheckedChange={(checked) => setStoreSettings({ ...storeSettings, autoAcceptOrders: checked })}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{isArabic ? 'الحد الأدنى للطلب' : 'Minimum Order Value'}</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={storeSettings.minimumOrderValue}
                          onChange={(e) => setStoreSettings({ ...storeSettings, minimumOrderValue: parseFloat(e.target.value) })}
                        />
                        <SARSymbol className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{isArabic ? 'الشحن المجاني عند' : 'Free Shipping Threshold'}</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={storeSettings.freeShippingThreshold}
                          onChange={(e) => setStoreSettings({ ...storeSettings, freeShippingThreshold: parseFloat(e.target.value) })}
                        />
                        <SARSymbol className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent me-2" />
                      {isArabic ? 'جاري الحفظ...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 me-2" />
                      {isArabic ? 'حفظ التغييرات' : 'Save Changes'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments & Shipping Tab */}
        <TabsContent value="payments" className="space-y-6">
          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'طرق الدفع' : 'Payment Methods'}</CardTitle>
              <CardDescription>
                {isArabic ? 'إدارة طرق الدفع المتاحة في متجرك' : 'Manage available payment methods in your store'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {storeSettings.paymentMethods.map((method, index) => (
                  <div key={method.method} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={method.isEnabled}
                        onCheckedChange={(checked) => {
                          const newMethods = [...storeSettings.paymentMethods];
                          newMethods[index].isEnabled = checked;
                          setStoreSettings({ ...storeSettings, paymentMethods: newMethods });
                        }}
                      />
                      <div>
                        <p className="font-medium">
                          {method.method === 'cash_on_delivery' && (isArabic ? 'الدفع عند الاستلام' : 'Cash on Delivery')}
                          {method.method === 'bank_transfer' && (isArabic ? 'التحويل البنكي' : 'Bank Transfer')}
                          {method.method === 'credit_card' && (isArabic ? 'بطاقة ائتمان' : 'Credit Card')}
                          {method.method === 'apple_pay' && (isArabic ? 'أبل باي' : 'Apple Pay')}
                        </p>
                        {method.fees > 0 && (
                          <p className="text-sm text-muted-foreground">
                            {isArabic ? 'رسوم:' : 'Fees:'} {method.fees}%
                          </p>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Methods */}
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'طرق الشحن' : 'Shipping Methods'}</CardTitle>
              <CardDescription>
                {isArabic ? 'إدارة طرق الشحن والتوصيل' : 'Manage shipping and delivery methods'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {storeSettings.shippingMethods.map((method, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={method.isActive}
                        onCheckedChange={(checked) => {
                          const newMethods = [...storeSettings.shippingMethods];
                          newMethods[index].isActive = checked;
                          setStoreSettings({ ...storeSettings, shippingMethods: newMethods });
                        }}
                      />
                      <div>
                        <p className="font-medium">
                          {isArabic ? method.nameAr : method.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {method.estimatedDays} {isArabic ? 'أيام' : 'days'} • {formatCurrency(method.cost)} {isArabic ? 'ريال' : 'SAR'}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'العلامة التجارية والمظهر' : 'Branding & Appearance'}</CardTitle>
              <CardDescription>
                {isArabic ? 'تخصيص مظهر متجرك وعلامتك التجارية' : 'Customize your store appearance and branding'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Selection */}
              <div className="space-y-4">
                <h4 className="font-semibold">{isArabic ? 'المظهر' : 'Theme'}</h4>
                <div className="grid gap-3 md:grid-cols-3">
                  {['light', 'dark', 'auto'].map((theme) => (
                    <div
                      key={theme}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        storeSettings.theme === theme ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                      }`}
                      onClick={() => setStoreSettings({ ...storeSettings, theme: theme as 'light' | 'dark' | 'auto' })}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-4 h-4 rounded-full ${theme === 'light' ? 'bg-white border-2' : theme === 'dark' ? 'bg-black' : 'bg-gradient-to-r from-white to-black'}`} />
                        <p className="font-medium">
                          {theme === 'light' && (isArabic ? 'فاتح' : 'Light')}
                          {theme === 'dark' && (isArabic ? 'داكن' : 'Dark')}
                          {theme === 'auto' && (isArabic ? 'تلقائي' : 'Auto')}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {theme === 'light' && (isArabic ? 'مظهر فاتح دائماً' : 'Always light theme')}
                        {theme === 'dark' && (isArabic ? 'مظهر داكن دائماً' : 'Always dark theme')}
                        {theme === 'auto' && (isArabic ? 'يتبع إعداد الجهاز' : 'Follows system setting')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Color Customization */}
              <div className="space-y-4">
                <h4 className="font-semibold">{isArabic ? 'الألوان' : 'Colors'}</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{isArabic ? 'اللون الأساسي' : 'Primary Color'}</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={storeSettings.primaryColor}
                        onChange={(e) => setStoreSettings({ ...storeSettings, primaryColor: e.target.value })}
                        className="w-16 h-10 p-1 rounded"
                      />
                      <Input
                        value={storeSettings.primaryColor}
                        onChange={(e) => setStoreSettings({ ...storeSettings, primaryColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{isArabic ? 'اللون الثانوي' : 'Secondary Color'}</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={storeSettings.secondaryColor}
                        onChange={(e) => setStoreSettings({ ...storeSettings, secondaryColor: e.target.value })}
                        className="w-16 h-10 p-1 rounded"
                      />
                      <Input
                        value={storeSettings.secondaryColor}
                        onChange={(e) => setStoreSettings({ ...storeSettings, secondaryColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="space-y-4">
                <h4 className="font-semibold">{isArabic ? 'وسائل التواصل الاجتماعي' : 'Social Media Links'}</h4>
                <div className="space-y-3">
                  {storeSettings.socialMedia.map((social, index) => (
                    <div key={social.platform} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Switch
                        checked={social.isActive}
                        onCheckedChange={(checked) => {
                          const newSocial = [...storeSettings.socialMedia];
                          newSocial[index].isActive = checked;
                          setStoreSettings({ ...storeSettings, socialMedia: newSocial });
                        }}
                      />
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                        {social.platform === 'whatsapp' && <Smartphone className="h-4 w-4" />}
                        {social.platform === 'instagram' && <Camera className="h-4 w-4" />}
                        {social.platform === 'twitter' && <Share className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium capitalize">{social.platform}</p>
                        <Input
                          value={social.url}
                          onChange={(e) => {
                            const newSocial = [...storeSettings.socialMedia];
                            newSocial[index].url = e.target.value;
                            setStoreSettings({ ...storeSettings, socialMedia: newSocial });
                          }}
                          placeholder={`https://${social.platform}.com/...`}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleSaveSettings} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent me-2" />
                      {isArabic ? 'جاري الحفظ...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 me-2" />
                      {isArabic ? 'حفظ التغييرات' : 'Save Changes'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}