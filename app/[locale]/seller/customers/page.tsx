'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SARSymbol } from '@/components/ui/currency-symbol';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Users,
  User,
  Star,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShoppingCart,
  DollarSign,
  Eye,
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical,
  Edit,
  Trash2,
  Send,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Flag,
  Heart,
  UserPlus,
  MessageCircle,
  Ban,
  Target,
  Zap,
  Crown,
  Gift
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  city: string;
  region: string;
  joinedAt: string;
  lastOrderAt: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  status: 'active' | 'inactive' | 'vip' | 'blocked';
  segment: 'new' | 'regular' | 'vip' | 'inactive';
  preferredLanguage: 'ar' | 'en';
  rating: number;
  notes?: string;
  tags: string[];
  communicationPreference: 'whatsapp' | 'sms' | 'email';
}

interface CustomerStats {
  totalCustomers: number;
  newThisMonth: number;
  vipCustomers: number;
  activeCustomers: number;
  averageLifetimeValue: number;
  retentionRate: number;
  satisfactionScore: number;
}

const customerSegments = [
  { value: 'all', labelAr: 'جميع العملاء', labelEn: 'All Customers', color: 'default' as const },
  { value: 'new', labelAr: 'عملاء جدد', labelEn: 'New Customers', color: 'secondary' as const },
  { value: 'regular', labelAr: 'عملاء منتظمون', labelEn: 'Regular Customers', color: 'default' as const },
  { value: 'vip', labelAr: 'عملاء VIP', labelEn: 'VIP Customers', color: 'secondary' as const },
  { value: 'inactive', labelAr: 'عملاء خاملون', labelEn: 'Inactive Customers', color: 'destructive' as const },
];

const statusColors = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  vip: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  blocked: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
};

export default function CustomerManagementPage() {
  const locale = useLocale();
  const router = useRouter();
  const isArabic = locale === 'ar';
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');
  
  const [stats] = useState<CustomerStats>({
    totalCustomers: 1247,
    newThisMonth: 86,
    vipCustomers: 124,
    activeCustomers: 892,
    averageLifetimeValue: 2850,
    retentionRate: 68.5,
    satisfactionScore: 4.6,
  });
  
  // Mock customer data with Saudi context
  useEffect(() => {
    const mockCustomers: Customer[] = [
      {
        id: '1',
        name: 'أحمد محمد العتيبي',
        email: 'ahmed.alotaibi@gmail.com',
        phone: '+966501234567',
        city: 'الرياض',
        region: 'منطقة الرياض',
        joinedAt: '2023-08-15T10:30:00Z',
        lastOrderAt: '2024-12-10T15:20:00Z',
        totalOrders: 15,
        totalSpent: 42500,
        averageOrderValue: 2833,
        status: 'vip',
        segment: 'vip',
        preferredLanguage: 'ar',
        rating: 4.8,
        notes: 'عميل ممتاز، يفضل الدفع نقداً عند الاستلام',
        tags: ['عميل VIP', 'مالك ورشة', 'الرياض'],
        communicationPreference: 'whatsapp',
      },
      {
        id: '2',
        name: 'فاطمة عبدالله السلمي',
        email: 'fatima.alsalmi@hotmail.com',
        phone: '+966502345678',
        city: 'جدة',
        region: 'منطقة مكة المكرمة',
        joinedAt: '2024-01-20T09:15:00Z',
        lastOrderAt: '2024-12-08T11:30:00Z',
        totalOrders: 8,
        totalSpent: 18750,
        averageOrderValue: 2343,
        status: 'active',
        segment: 'regular',
        preferredLanguage: 'ar',
        rating: 4.5,
        notes: 'تحتاج قطع غيار لسيارة كامري 2018',
        tags: ['عميلة منتظمة', 'جدة', 'كامري'],
        communicationPreference: 'whatsapp',
      },
      {
        id: '3',
        name: 'عمر حسن الشمري',
        email: 'omar.alshammari@outlook.com',
        phone: '+966503456789',
        city: 'الدمام',
        region: 'المنطقة الشرقية',
        joinedAt: '2024-11-05T14:22:00Z',
        lastOrderAt: '2024-12-15T16:45:00Z',
        totalOrders: 3,
        totalSpent: 6850,
        averageOrderValue: 2283,
        status: 'active',
        segment: 'new',
        preferredLanguage: 'ar',
        rating: 4.2,
        notes: 'عميل جديد، يحتاج متابعة',
        tags: ['عميل جديد', 'الدمام', 'نيسان'],
        communicationPreference: 'whatsapp',
      },
      {
        id: '4',
        name: 'سارة محمد القحطاني',
        email: 'sarah.alqahtani@gmail.com',
        phone: '+966504567890',
        city: 'المدينة المنورة',
        region: 'منطقة المدينة المنورة',
        joinedAt: '2023-06-12T08:00:00Z',
        lastOrderAt: '2024-10-20T12:30:00Z',
        totalOrders: 12,
        totalSpent: 28400,
        averageOrderValue: 2366,
        status: 'inactive',
        segment: 'inactive',
        preferredLanguage: 'ar',
        rating: 4.3,
        notes: 'لم تشترِ منذ شهرين، تحتاج متابعة',
        tags: ['عميلة سابقة', 'المدينة', 'هوندا'],
        communicationPreference: 'sms',
      },
    ];
    
    setCustomers(mockCustomers);
    setLoading(false);
  }, []);
  
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = searchQuery === '' || 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery) ||
      customer.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSegment = selectedSegment === 'all' || customer.segment === selectedSegment;
    
    return matchesSearch && matchesSegment;
  });
  
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
  
  const getSegmentBadge = (segment: string) => {
    const segmentConfig = customerSegments.find(s => s.value === segment);
    return (
      <Badge variant={segmentConfig?.color || 'default'} className="badge-text">
        {isArabic ? segmentConfig?.labelAr : segmentConfig?.labelEn}
      </Badge>
    );
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'vip': return <Crown className="h-4 w-4" />;
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'inactive': return <Clock className="h-4 w-4" />;
      case 'blocked': return <Ban className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };
  
  const sendMessage = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowMessageDialog(true);
  };
  
  const handleSendMessage = () => {
    if (selectedCustomer && messageContent.trim()) {
      console.log(`Sending message to ${selectedCustomer.name}: ${messageContent}`);
      setShowMessageDialog(false);
      setMessageContent('');
      setSelectedCustomer(null);
    }
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
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold card-title-enhanced mb-2">
            {isArabic ? 'إدارة العملاء' : 'Customer Management'}
          </h1>
          <p className="text-muted-foreground text-label">
            {isArabic 
              ? `${stats.totalCustomers} عميل • معدل الرضا ${stats.satisfactionScore}/5`
              : `${stats.totalCustomers} customers • ${stats.satisfactionScore}/5 satisfaction`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="me-2 h-4 w-4" />
            {isArabic ? 'تصدير' : 'Export'}
          </Button>
          <Button>
            <UserPlus className="me-2 h-4 w-4" />
            {isArabic ? 'إضافة عميل' : 'Add Customer'}
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="customer-card-gradient">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-label font-semibold text-muted-foreground">
                {isArabic ? 'إجمالي العملاء' : 'Total Customers'}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-price">{stats.totalCustomers}</div>
            <div className="flex items-center gap-1 text-detail mt-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-green-600">+{stats.newThisMonth}</span>
              <span className="text-detail text-muted-foreground">
                {isArabic ? 'هذا الشهر' : 'this month'}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="customer-card-gradient">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-label font-semibold text-muted-foreground">
                {isArabic ? 'عملاء VIP' : 'VIP Customers'}
              </CardTitle>
              <Crown className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-price text-purple-600">{stats.vipCustomers}</div>
            <p className="text-detail text-muted-foreground mt-1">
              {Math.round((stats.vipCustomers / stats.totalCustomers) * 100)}% {isArabic ? 'من الإجمالي' : 'of total'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="customer-card-gradient">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-label font-semibold text-muted-foreground">
                {isArabic ? 'قيمة العميل' : 'Avg Customer Value'}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-price flex items-center gap-1">
              {formatCurrency(stats.averageLifetimeValue)}
              <SARSymbol className="h-5 w-5" />
            </div>
            <p className="text-detail text-muted-foreground mt-1">
              {isArabic ? 'القيمة مدى الحياة' : 'Lifetime value'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="customer-card-gradient">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-label font-semibold text-muted-foreground">
                {isArabic ? 'معدل الاحتفاظ' : 'Retention Rate'}
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-price">{stats.retentionRate}%</div>
            <div className="flex items-center gap-1 text-detail mt-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-green-600">+2.3%</span>
              <span className="text-detail text-muted-foreground">
                {isArabic ? 'تحسن' : 'improved'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{isArabic ? 'نظرة عامة' : 'Overview'}</TabsTrigger>
          <TabsTrigger value="segments">{isArabic ? 'التجزئة' : 'Segments'}</TabsTrigger>
          <TabsTrigger value="communication">{isArabic ? 'التواصل' : 'Communication'}</TabsTrigger>
          <TabsTrigger value="insights">{isArabic ? 'الرؤى' : 'Insights'}</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={isArabic ? 'البحث بالاسم، الإيميل، الهاتف...' : 'Search by name, email, phone...'}
                className="ps-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedSegment} onValueChange={setSelectedSegment}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={isArabic ? 'فئة العملاء' : 'Customer Segment'} />
              </SelectTrigger>
              <SelectContent>
                {customerSegments.map(segment => (
                  <SelectItem key={segment.value} value={segment.value}>
                    {isArabic ? segment.labelAr : segment.labelEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="me-2 h-4 w-4" />
              {isArabic ? 'فلاتر متقدمة' : 'Advanced Filters'}
            </Button>
          </div>
          
          {/* Customers Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isArabic ? 'العميل' : 'Customer'}</TableHead>
                      <TableHead>{isArabic ? 'الموقع' : 'Location'}</TableHead>
                      <TableHead>{isArabic ? 'الطلبات' : 'Orders'}</TableHead>
                      <TableHead>{isArabic ? 'المبلغ المنفق' : 'Total Spent'}</TableHead>
                      <TableHead>{isArabic ? 'آخر طلب' : 'Last Order'}</TableHead>
                      <TableHead>{isArabic ? 'الحالة' : 'Status'}</TableHead>
                      <TableHead className="text-right">{isArabic ? 'الإجراءات' : 'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={customer.avatar} />
                              <AvatarFallback>
                                {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-label font-semibold card-title-enhanced">
                                  {customer.name}
                                </p>
                                {customer.status === 'vip' && (
                                  <Crown className="h-4 w-4 text-purple-500" />
                                )}
                                {customer.rating >= 4.5 && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{isArabic ? `التقييم: ${customer.rating}/5` : `Rating: ${customer.rating}/5`}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-detail text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <span>{customer.email}</span>
                              </div>
                              {customer.phone && (
                                <div className="flex items-center gap-2 text-detail text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  <span dir="ltr">{customer.phone}</span>
                                </div>
                              )}
                              {customer.tags.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                  {customer.tags.slice(0, 2).map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs badge-text">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-label font-medium">{customer.city}</p>
                              <p className="text-detail text-muted-foreground">{customer.region}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-label font-semibold">{customer.totalOrders}</p>
                            <p className="text-detail text-muted-foreground">
                              {isArabic ? 'طلب' : 'orders'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-label font-semibold flex items-center gap-1">
                              {formatCurrency(customer.totalSpent)}
                              <SARSymbol className="h-4 w-4" />
                            </p>
                            <p className="text-detail text-muted-foreground">
                              {isArabic ? 'متوسط:' : 'Avg:'} {formatCurrency(customer.averageOrderValue)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-detail">{formatDate(customer.lastOrderAt)}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className={statusColors[customer.status]}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(customer.status)}
                                {customer.status === 'vip' && (isArabic ? 'VIP' : 'VIP')}
                                {customer.status === 'active' && (isArabic ? 'نشط' : 'Active')}
                                {customer.status === 'inactive' && (isArabic ? 'خامل' : 'Inactive')}
                                {customer.status === 'blocked' && (isArabic ? 'محظور' : 'Blocked')}
                              </span>
                            </Badge>
                            {getSegmentBadge(customer.segment)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => sendMessage(customer)}
                                  >
                                    <MessageSquare className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{isArabic ? 'إرسال رسالة' : 'Send Message'}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedCustomer(customer);
                                    setShowCustomerDialog(true);
                                  }}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  {isArabic ? 'عرض التفاصيل' : 'View Details'}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  {isArabic ? 'تعديل' : 'Edit'}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <ShoppingCart className="mr-2 h-4 w-4" />
                                  {isArabic ? 'عرض الطلبات' : 'View Orders'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Gift className="mr-2 h-4 w-4" />
                                  {isArabic ? 'إرسال عرض' : 'Send Offer'}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Flag className="mr-2 h-4 w-4" />
                                  {isArabic ? 'وضع علامة' : 'Flag Customer'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <Ban className="mr-2 h-4 w-4" />
                                  {isArabic ? 'حظر العميل' : 'Block Customer'}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Other tabs would be implemented similarly */}
        <TabsContent value="segments">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'تجزئة العملاء' : 'Customer Segments'}</CardTitle>
              <CardDescription>
                {isArabic ? 'تصنيف العملاء حسب السلوك والقيمة' : 'Customer classification by behavior and value'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Zap className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">
                  {isArabic ? 'قريباً' : 'Coming Soon'}
                </h3>
                <p className="text-muted-foreground">
                  {isArabic ? 'ستتوفر أدوات تجزئة العملاء المتقدمة قريباً' : 'Advanced customer segmentation tools coming soon'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="communication">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'أدوات التواصل' : 'Communication Tools'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageCircle className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">
                  {isArabic ? 'قريباً' : 'Coming Soon'}
                </h3>
                <p className="text-muted-foreground">
                  {isArabic ? 'ستتوفر أدوات التواصل المتقدمة قريباً' : 'Advanced communication tools coming soon'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'رؤى العملاء' : 'Customer Insights'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">
                  {isArabic ? 'قريباً' : 'Coming Soon'}
                </h3>
                <p className="text-muted-foreground">
                  {isArabic ? 'ستتوفر رؤى العملاء المتقدمة قريباً' : 'Advanced customer insights coming soon'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Customer Details Dialog */}
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedCustomer && (
                <>
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {selectedCustomer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span>{selectedCustomer.name}</span>
                      {selectedCustomer.status === 'vip' && (
                        <Crown className="h-5 w-5 text-purple-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{selectedCustomer.rating}/5</span>
                    </div>
                  </div>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Summary */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingCart className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">
                        {isArabic ? 'إجمالي الطلبات' : 'Total Orders'}
                      </span>
                    </div>
                    <div className="text-2xl font-bold">{selectedCustomer.totalOrders}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">
                        {isArabic ? 'إجمالي المبلغ' : 'Total Spent'}
                      </span>
                    </div>
                    <div className="text-2xl font-bold flex items-center gap-1">
                      {formatCurrency(selectedCustomer.totalSpent)}
                      <SARSymbol className="h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">
                        {isArabic ? 'عميل منذ' : 'Customer Since'}
                      </span>
                    </div>
                    <div className="text-lg font-semibold">{formatDate(selectedCustomer.joinedAt)}</div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {isArabic ? 'معلومات الاتصال' : 'Contact Information'}
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {isArabic ? 'الإيميل' : 'Email'}
                      </p>
                      <p className="font-medium">{selectedCustomer.email}</p>
                    </div>
                  </div>
                  {selectedCustomer.phone && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Phone className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {isArabic ? 'الهاتف' : 'Phone'}
                        </p>
                        <p className="font-medium" dir="ltr">{selectedCustomer.phone}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <MapPin className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {isArabic ? 'الموقع' : 'Location'}
                      </p>
                      <p className="font-medium">{selectedCustomer.city}, {selectedCustomer.region}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Notes */}
              {selectedCustomer.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    {isArabic ? 'الملاحظات' : 'Notes'}
                  </h3>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p>{selectedCustomer.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isArabic ? 'إرسال رسالة إلى' : 'Send Message to'} {selectedCustomer?.name}
            </DialogTitle>
            <DialogDescription>
              {isArabic 
                ? 'اكتب رسالتك أدناه وسيتم إرسالها عبر الطريقة المفضلة للعميل'
                : 'Write your message below and it will be sent via the customer\'s preferred method'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">{isArabic ? 'الرسالة' : 'Message'}</Label>
              <Textarea
                id="message"
                placeholder={isArabic ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>
            {selectedCustomer && (
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <span className="text-sm">
                  {isArabic ? 'سيتم الإرسال عبر:' : 'Will be sent via:'} {' '}
                  <span className="font-medium capitalize">
                    {selectedCustomer.communicationPreference}
                  </span>
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleSendMessage} disabled={!messageContent.trim()}>
              <Send className="me-2 h-4 w-4" />
              {isArabic ? 'إرسال' : 'Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}