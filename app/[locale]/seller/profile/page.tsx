'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { 
  Store,
  User,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Shield,
  Star,
  CheckCircle,
  AlertCircle,
  Camera,
  Upload,
  Edit,
  Save,
  X,
  Calendar,
  Award,
  TrendingUp,
  Users,
  Package,
  Truck,
  CreditCard,
  Bell,
  Settings,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Verified,
  Building,
  FileText,
  Plus,
  Image as ImageIcon,
  Languages,
  Palette,
  Smartphone,
  Monitor,
  Sun,
  Moon,
  Volume2,
  VolumeX
} from 'lucide-react';

interface BusinessProfile {
  id: string;
  name: string;
  businessName: string;
  description: string;
  logo?: string;
  coverImage?: string;
  email: string;
  phone: string;
  whatsapp?: string;
  website?: string;
  address: {
    street: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  businessHours: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  categories: string[];
  specialties: string[];
  certifications: string[];
  establishedYear: number;
  employeeCount: string;
  languages: string[];
  socialMedia: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  settings: {
    publicProfile: boolean;
    showContact: boolean;
    showBusinessHours: boolean;
    allowDirectMessages: boolean;
    theme: 'light' | 'dark' | 'auto';
    language: 'ar' | 'en';
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
  };
  verification: {
    identityVerified: boolean;
    businessVerified: boolean;
    phoneVerified: boolean;
    emailVerified: boolean;
    documentsVerified: boolean;
  };
  stats: {
    profileViews: number;
    rating: number;
    totalReviews: number;
    responseRate: number;
    joinDate: string;
  };
}

const saudiRegions = [
  'منطقة الرياض',
  'منطقة مكة المكرمة',
  'المنطقة الشرقية',
  'منطقة عسير',
  'منطقة المدينة المنورة',
  'منطقة القصيم',
  'منطقة حائل',
  'منطقة تبوك',
  'منطقة الحدود الشمالية',
  'منطقة جازان',
  'منطقة نجران',
  'منطقة الباحة',
  'منطقة الجوف',
];

const businessCategories = [
  { value: 'engine_parts', labelAr: 'قطع المحرك', labelEn: 'Engine Parts' },
  { value: 'body_parts', labelAr: 'قطع الهيكل', labelEn: 'Body Parts' },
  { value: 'electrical', labelAr: 'القطع الكهربائية', labelEn: 'Electrical Parts' },
  { value: 'suspension', labelAr: 'نظام التعليق', labelEn: 'Suspension' },
  { value: 'brakes', labelAr: 'الفرامل', labelEn: 'Brakes' },
  { value: 'transmission', labelAr: 'ناقل الحركة', labelEn: 'Transmission' },
  { value: 'cooling', labelAr: 'نظام التبريد', labelEn: 'Cooling System' },
  { value: 'exhaust', labelAr: 'نظام العادم', labelEn: 'Exhaust System' },
];

export default function BusinessProfilePage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  
  const [profile, setProfile] = useState<BusinessProfile>({
    id: '1',
    name: 'أحمد محمد العتيبي',
    businessName: 'متجر قطع الغيار المميز',
    description: 'متخصصون في قطع غيار السيارات اليابانية والأمريكية. خبرة أكثر من 15 سنة في المجال. نوفر قطع غيار أصلية ومضمونة بأفضل الأسعار.',
    email: 'ahmed@carparts.sa',
    phone: '+966501234567',
    whatsapp: '+966501234567',
    website: 'www.carparts-ksa.com',
    address: {
      street: 'شارع الملك فهد، حي العليا',
      city: 'الرياض',
      region: 'منطقة الرياض',
      postalCode: '12345',
      country: 'المملكة العربية السعودية',
    },
    businessHours: {
      sunday: { open: '08:00', close: '18:00', closed: false },
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '14:00', close: '18:00', closed: false },
      saturday: { open: '08:00', close: '18:00', closed: false },
    },
    categories: ['engine_parts', 'electrical', 'suspension'],
    specialties: ['تويوتا', 'هوندا', 'نيسان', 'فورد'],
    certifications: ['ISO 9001', 'شهادة التجارة الإلكترونية'],
    establishedYear: 2008,
    employeeCount: '5-10',
    languages: ['ar', 'en'],
    socialMedia: {
      twitter: '@carparts_ksa',
      instagram: '@carparts_ksa',
    },
    settings: {
      publicProfile: true,
      showContact: true,
      showBusinessHours: true,
      allowDirectMessages: true,
      theme: 'auto',
      language: 'ar',
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
    },
    verification: {
      identityVerified: true,
      businessVerified: true,
      phoneVerified: true,
      emailVerified: true,
      documentsVerified: false,
    },
    stats: {
      profileViews: 2456,
      rating: 4.8,
      totalReviews: 127,
      responseRate: 95,
      joinDate: '2023-01-15',
    },
  });
  
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setEditMode(false);
    }, 1500);
  };
  
  const getVerificationStatus = () => {
    const verifications = Object.values(profile.verification);
    const completedCount = verifications.filter(Boolean).length;
    const totalCount = verifications.length;
    const percentage = (completedCount / totalCount) * 100;
    
    return {
      percentage,
      completedCount,
      totalCount,
      isComplete: percentage === 100,
    };
  };
  
  const verificationStatus = getVerificationStatus();
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold card-title-enhanced mb-2">
            {isArabic ? 'الملف التجاري' : 'Business Profile'}
          </h1>
          <p className="text-muted-foreground text-label">
            {isArabic 
              ? 'إدارة معلومات متجرك وإعداداته'
              : 'Manage your store information and settings'}
          </p>
        </div>
        <div className="flex gap-2">
          {!editMode ? (
            <Button onClick={() => setEditMode(true)}>
              <Edit className="me-2 h-4 w-4" />
              {isArabic ? 'تعديل' : 'Edit'}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditMode(false)}>
                <X className="me-2 h-4 w-4" />
                {isArabic ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="me-2 h-4 w-4" />
                {saving ? (isArabic ? 'جاري الحفظ...' : 'Saving...') : (isArabic ? 'حفظ' : 'Save')}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Profile Header Card */}
      <Card className="profile-header-gradient">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center md:items-start">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-background">
                  <AvatarImage src={profile.logo} />
                  <AvatarFallback className="text-lg">
                    {profile.businessName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {editMode && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
                {profile.verification.businessVerified && (
                  <div className="absolute -top-1 -right-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <CheckCircle className="h-6 w-6 text-green-500 bg-background rounded-full" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isArabic ? 'متجر موثق' : 'Verified Store'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>
              <div className="mt-4 text-center md:text-start">
                <h2 className="text-xl font-bold card-title-enhanced">{profile.businessName}</h2>
                <p className="text-muted-foreground">{profile.name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{profile.stats.rating}</span>
                  </div>
                  <span className="text-muted-foreground">
                    ({profile.stats.totalReviews} {isArabic ? 'تقييم' : 'reviews'})
                  </span>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{profile.stats.profileViews}</div>
                <div className="text-sm text-muted-foreground">
                  {isArabic ? 'مشاهدة' : 'Views'}
                </div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{profile.stats.responseRate}%</div>
                <div className="text-sm text-muted-foreground">
                  {isArabic ? 'معدل الرد' : 'Response Rate'}
                </div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{profile.categories.length}</div>
                <div className="text-sm text-muted-foreground">
                  {isArabic ? 'فئات' : 'Categories'}
                </div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {new Date().getFullYear() - profile.establishedYear}
                </div>
                <div className="text-sm text-muted-foreground">
                  {isArabic ? 'سنة خبرة' : 'Years Exp.'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Verification Status */}
          {!verificationStatus.isComplete && (
            <Alert className="mt-6">
              <Shield className="h-4 w-4" />
              <AlertTitle>
                {isArabic ? 'إكمال التحقق' : 'Complete Verification'}
              </AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>
                  {isArabic 
                    ? `مكتمل ${verificationStatus.completedCount} من ${verificationStatus.totalCount} عمليات التحقق`
                    : `${verificationStatus.completedCount} of ${verificationStatus.totalCount} verifications completed`}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowVerificationDialog(true)}
                >
                  {isArabic ? 'إكمال التحقق' : 'Complete Verification'}
                </Button>
              </AlertDescription>
              <Progress value={verificationStatus.percentage} className="mt-2" />
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">{isArabic ? 'عام' : 'General'}</TabsTrigger>
          <TabsTrigger value="business">{isArabic ? 'الأعمال' : 'Business'}</TabsTrigger>
          <TabsTrigger value="contact">{isArabic ? 'الاتصال' : 'Contact'}</TabsTrigger>
          <TabsTrigger value="settings">{isArabic ? 'الإعدادات' : 'Settings'}</TabsTrigger>
          <TabsTrigger value="security">{isArabic ? 'الأمان' : 'Security'}</TabsTrigger>
        </TabsList>
        
        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'المعلومات الأساسية' : 'Basic Information'}</CardTitle>
              <CardDescription>
                {isArabic ? 'معلومات أساسية عن متجرك' : 'Basic information about your store'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="business-name">{isArabic ? 'اسم المتجر' : 'Store Name'}</Label>
                  <Input
                    id="business-name"
                    value={profile.businessName}
                    onChange={(e) => setProfile(prev => ({ ...prev, businessName: e.target.value }))}
                    disabled={!editMode}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="owner-name">{isArabic ? 'اسم المالك' : 'Owner Name'}</Label>
                  <Input
                    id="owner-name"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!editMode}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">{isArabic ? 'وصف المتجر' : 'Store Description'}</Label>
                <Textarea
                  id="description"
                  value={profile.description}
                  onChange={(e) => setProfile(prev => ({ ...prev, description: e.target.value }))}
                  disabled={!editMode}
                  rows={4}
                  className="mt-1"
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="established-year">{isArabic ? 'سنة التأسيس' : 'Established Year'}</Label>
                  <Input
                    id="established-year"
                    type="number"
                    value={profile.establishedYear}
                    onChange={(e) => setProfile(prev => ({ ...prev, establishedYear: parseInt(e.target.value) }))}
                    disabled={!editMode}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="employee-count">{isArabic ? 'عدد الموظفين' : 'Employee Count'}</Label>
                  <Select
                    value={profile.employeeCount}
                    onValueChange={(value) => setProfile(prev => ({ ...prev, employeeCount: value }))}
                    disabled={!editMode}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2-5">2-5</SelectItem>
                      <SelectItem value="5-10">5-10</SelectItem>
                      <SelectItem value="10-20">10-20</SelectItem>
                      <SelectItem value="20+">20+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'التخصصات والفئات' : 'Specialties & Categories'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{isArabic ? 'فئات المنتجات' : 'Product Categories'}</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {businessCategories.map((category) => (
                    <Badge
                      key={category.value}
                      variant={profile.categories.includes(category.value) ? 'default' : 'outline'}
                      className={`cursor-pointer ${!editMode && 'pointer-events-none'}`}
                      onClick={() => {
                        if (editMode) {
                          const newCategories = profile.categories.includes(category.value)
                            ? profile.categories.filter(c => c !== category.value)
                            : [...profile.categories, category.value];
                          setProfile(prev => ({ ...prev, categories: newCategories }));
                        }
                      }}
                    >
                      {isArabic ? category.labelAr : category.labelEn}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>{isArabic ? 'التخصصات (ماركات السيارات)' : 'Specialties (Car Brands)'}</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary">
                      {specialty}
                      {editMode && (
                        <X 
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => {
                            const newSpecialties = profile.specialties.filter((_, i) => i !== index);
                            setProfile(prev => ({ ...prev, specialties: newSpecialties }));
                          }}
                        />
                      )}
                    </Badge>
                  ))}
                  {editMode && (
                    <Button variant="outline" size="sm">
                      <Plus className="h-3 w-3 me-1" />
                      {isArabic ? 'إضافة' : 'Add'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Business Tab */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'العنوان ومعلومات الموقع' : 'Address & Location'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="street">{isArabic ? 'العنوان' : 'Street Address'}</Label>
                <Input
                  id="street"
                  value={profile.address.street}
                  onChange={(e) => setProfile(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, street: e.target.value }
                  }))}
                  disabled={!editMode}
                  className="mt-1"
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="city">{isArabic ? 'المدينة' : 'City'}</Label>
                  <Input
                    id="city"
                    value={profile.address.city}
                    onChange={(e) => setProfile(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, city: e.target.value }
                    }))}
                    disabled={!editMode}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="region">{isArabic ? 'المنطقة' : 'Region'}</Label>
                  <Select
                    value={profile.address.region}
                    onValueChange={(value) => setProfile(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, region: value }
                    }))}
                    disabled={!editMode}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {saudiRegions.map((region) => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="postal-code">{isArabic ? 'الرمز البريدي' : 'Postal Code'}</Label>
                  <Input
                    id="postal-code"
                    value={profile.address.postalCode}
                    onChange={(e) => setProfile(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, postalCode: e.target.value }
                    }))}
                    disabled={!editMode}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'أوقات العمل' : 'Business Hours'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(profile.businessHours).map(([day, hours]) => {
                  const dayLabels: Record<string, { ar: string; en: string }> = {
                    sunday: { ar: 'الأحد', en: 'Sunday' },
                    monday: { ar: 'الإثنين', en: 'Monday' },
                    tuesday: { ar: 'الثلاثاء', en: 'Tuesday' },
                    wednesday: { ar: 'الأربعاء', en: 'Wednesday' },
                    thursday: { ar: 'الخميس', en: 'Thursday' },
                    friday: { ar: 'الجمعة', en: 'Friday' },
                    saturday: { ar: 'السبت', en: 'Saturday' },
                  };
                  
                  return (
                    <div key={day} className="flex items-center gap-4">
                      <div className="w-20 text-sm font-medium">
                        {dayLabels[day]?.[locale as 'ar' | 'en'] || day}
                      </div>
                      <Switch
                        checked={!hours.closed}
                        onCheckedChange={(checked) => {
                          if (editMode) {
                            setProfile(prev => ({
                              ...prev,
                              businessHours: {
                                ...prev.businessHours,
                                [day]: { ...hours, closed: !checked }
                              }
                            }));
                          }
                        }}
                        disabled={!editMode}
                      />
                      {!hours.closed ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={hours.open}
                            onChange={(e) => {
                              if (editMode) {
                                setProfile(prev => ({
                                  ...prev,
                                  businessHours: {
                                    ...prev.businessHours,
                                    [day]: { ...hours, open: e.target.value }
                                  }
                                }));
                              }
                            }}
                            disabled={!editMode}
                            className="w-32"
                          />
                          <span className="text-muted-foreground">-</span>
                          <Input
                            type="time"
                            value={hours.close}
                            onChange={(e) => {
                              if (editMode) {
                                setProfile(prev => ({
                                  ...prev,
                                  businessHours: {
                                    ...prev.businessHours,
                                    [day]: { ...hours, close: e.target.value }
                                  }
                                }));
                              }
                            }}
                            disabled={!editMode}
                            className="w-32"
                          />
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          {isArabic ? 'مغلق' : 'Closed'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'معلومات الاتصال' : 'Contact Information'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="email">{isArabic ? 'البريد الإلكتروني' : 'Email'}</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!editMode}
                      className="flex-1"
                    />
                    {profile.verification.emailVerified && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">{isArabic ? 'رقم الهاتف' : 'Phone Number'}</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!editMode}
                      className="flex-1"
                      dir="ltr"
                    />
                    {profile.verification.phoneVerified && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="whatsapp">{isArabic ? 'واتساب' : 'WhatsApp'}</Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    value={profile.whatsapp}
                    onChange={(e) => setProfile(prev => ({ ...prev, whatsapp: e.target.value }))}
                    disabled={!editMode}
                    className="mt-1"
                    dir="ltr"
                  />
                </div>
                <div>
                  <Label htmlFor="website">{isArabic ? 'الموقع الإلكتروني' : 'Website'}</Label>
                  <Input
                    id="website"
                    type="url"
                    value={profile.website}
                    onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                    disabled={!editMode}
                    className="mt-1"
                    dir="ltr"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'وسائل التواصل الاجتماعي' : 'Social Media'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="twitter">{isArabic ? 'تويتر' : 'Twitter'}</Label>
                  <Input
                    id="twitter"
                    value={profile.socialMedia.twitter || ''}
                    onChange={(e) => setProfile(prev => ({ 
                      ...prev, 
                      socialMedia: { ...prev.socialMedia, twitter: e.target.value }
                    }))}
                    disabled={!editMode}
                    placeholder="@username"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">{isArabic ? 'إنستغرام' : 'Instagram'}</Label>
                  <Input
                    id="instagram"
                    value={profile.socialMedia.instagram || ''}
                    onChange={(e) => setProfile(prev => ({ 
                      ...prev, 
                      socialMedia: { ...prev.socialMedia, instagram: e.target.value }
                    }))}
                    disabled={!editMode}
                    placeholder="@username"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'إعدادات الملف الشخصي' : 'Profile Settings'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">{isArabic ? 'ملف عام' : 'Public Profile'}</Label>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'السماح للعملاء برؤية ملفك التجاري' : 'Allow customers to view your business profile'}
                  </p>
                </div>
                <Switch
                  checked={profile.settings.publicProfile}
                  onCheckedChange={(checked) => setProfile(prev => ({
                    ...prev,
                    settings: { ...prev.settings, publicProfile: checked }
                  }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">{isArabic ? 'إظهار معلومات الاتصال' : 'Show Contact Info'}</Label>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'عرض رقم الهاتف والإيميل في الملف العام' : 'Display phone and email in public profile'}
                  </p>
                </div>
                <Switch
                  checked={profile.settings.showContact}
                  onCheckedChange={(checked) => setProfile(prev => ({
                    ...prev,
                    settings: { ...prev.settings, showContact: checked }
                  }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">{isArabic ? 'السماح بالرسائل المباشرة' : 'Allow Direct Messages'}</Label>
                  <p className="text-sm text-muted-foreground">
                    {isArabic ? 'السماح للعملاء بإرسال رسائل مباشرة' : 'Let customers send direct messages'}
                  </p>
                </div>
                <Switch
                  checked={profile.settings.allowDirectMessages}
                  onCheckedChange={(checked) => setProfile(prev => ({
                    ...prev,
                    settings: { ...prev.settings, allowDirectMessages: checked }
                  }))}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'الإشعارات' : 'Notifications'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <div>
                    <Label className="text-base">{isArabic ? 'إشعارات الإيميل' : 'Email Notifications'}</Label>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'استقبال إشعارات عبر الإيميل' : 'Receive notifications via email'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={profile.settings.emailNotifications}
                  onCheckedChange={(checked) => setProfile(prev => ({
                    ...prev,
                    settings: { ...prev.settings, emailNotifications: checked }
                  }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <div>
                    <Label className="text-base">{isArabic ? 'رسائل SMS' : 'SMS Messages'}</Label>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'استقبال رسائل نصية قصيرة' : 'Receive SMS notifications'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={profile.settings.smsNotifications}
                  onCheckedChange={(checked) => setProfile(prev => ({
                    ...prev,
                    settings: { ...prev.settings, smsNotifications: checked }
                  }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <div>
                    <Label className="text-base">{isArabic ? 'إشعارات الدفع' : 'Push Notifications'}</Label>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'إشعارات فورية على الجهاز' : 'Instant notifications on your device'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={profile.settings.pushNotifications}
                  onCheckedChange={(checked) => setProfile(prev => ({
                    ...prev,
                    settings: { ...prev.settings, pushNotifications: checked }
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'حالة التحقق' : 'Verification Status'}</CardTitle>
              <CardDescription>
                {isArabic ? 'تحقق من هويتك لزيادة الثقة مع العملاء' : 'Verify your identity to build trust with customers'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      profile.verification.identityVerified ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'
                    }`}>
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{isArabic ? 'التحقق من الهوية' : 'Identity Verification'}</p>
                      <p className="text-sm text-muted-foreground">
                        {isArabic ? 'تحقق من هويتك الشخصية' : 'Verify your personal identity'}
                      </p>
                    </div>
                  </div>
                  {profile.verification.identityVerified ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Button variant="outline" size="sm">
                      {isArabic ? 'تحقق الآن' : 'Verify Now'}
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      profile.verification.businessVerified ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Building className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{isArabic ? 'التحقق من الأعمال' : 'Business Verification'}</p>
                      <p className="text-sm text-muted-foreground">
                        {isArabic ? 'تحقق من السجل التجاري' : 'Verify your business registration'}
                      </p>
                    </div>
                  </div>
                  {profile.verification.businessVerified ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Button variant="outline" size="sm">
                      {isArabic ? 'تحقق الآن' : 'Verify Now'}
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      profile.verification.documentsVerified ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'
                    }`}>
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{isArabic ? 'رفع المستندات' : 'Document Upload'}</p>
                      <p className="text-sm text-muted-foreground">
                        {isArabic ? 'رفع المستندات المطلوبة' : 'Upload required documents'}
                      </p>
                    </div>
                  </div>
                  {profile.verification.documentsVerified ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Button variant="outline" size="sm">
                      <Upload className="me-2 h-4 w-4" />
                      {isArabic ? 'رفع' : 'Upload'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Verification Dialog */}
      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isArabic ? 'إكمال التحقق' : 'Complete Verification'}</DialogTitle>
            <DialogDescription>
              {isArabic 
                ? 'أكمل عملية التحقق لزيادة الثقة مع عملائك'
                : 'Complete verification to build trust with your customers'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Progress value={verificationStatus.percentage} />
            <p className="text-sm text-muted-foreground text-center">
              {verificationStatus.completedCount} {isArabic ? 'من' : 'of'} {verificationStatus.totalCount} {isArabic ? 'مكتمل' : 'completed'}
            </p>
            <div className="space-y-2">
              {!profile.verification.identityVerified && (
                <Button className="w-full justify-start" variant="outline">
                  <User className="mr-2 h-4 w-4" />
                  {isArabic ? 'التحقق من الهوية' : 'Verify Identity'}
                </Button>
              )}
              {!profile.verification.documentsVerified && (
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  {isArabic ? 'رفع المستندات' : 'Upload Documents'}
                </Button>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVerificationDialog(false)}>
              {isArabic ? 'إغلاق' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}