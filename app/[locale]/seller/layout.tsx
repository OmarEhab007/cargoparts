'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  MessageSquare,
  DollarSign,
  Settings,
  HelpCircle,
  Menu,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  Sun,
  Moon,
  LogOut,
  User,
  Store,
  CheckCircle,
  Star,
  Clock,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { ErrorBoundary, SellerErrorFallback } from '@/components/ui/error-boundary';

interface NavItem {
  id: string;
  labelAr: string;
  labelEn: string;
  icon: React.ElementType;
  href: string;
  badge?: string | number;
  badgeType?: 'default' | 'secondary' | 'destructive' | 'outline';
  subItems?: {
    labelAr: string;
    labelEn: string;
    href: string;
    badge?: string | number;
  }[];
}

interface SellerInfo {
  name: string;
  email: string;
  storeName: string;
  avatar?: string;
  verified: boolean;
  rating: number;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  status: string;
  emailVerified: boolean;
  phoneVerified: boolean;
}

interface QuickStats {
  todayRevenue: number;
  todayOrders: number;
  pendingOrders: number;
  lowStockItems: number;
}

interface CountsData {
  orders: {
    pending: number;
    processing: number;
    ready: number;
    shipped: number;
    completed: number;
    returns: number;
    total: number;
  };
  inventory: {
    total: number;
    draft: number;
    lowStock: number;
    outOfStock: number;
    archived: number;
  };
  messages: {
    unread: number;
  };
  summary: {
    activeOrders: number;
    urgentActions: number;
    totalProducts: number;
  };
}

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const isArabic = locale === 'ar';
  
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [isMobile, setIsMobile] = useState(false);
  const [countsData, setCountsData] = useState<CountsData | null>(null);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [sellerInfo] = useState<SellerInfo>({
    name: 'أحمد محمد',
    email: 'seller@example.com',
    storeName: 'متجر قطع الغيار المميز',
    verified: true,
    rating: 4.8,
  });
  
  const [quickStats] = useState<QuickStats>({
    todayRevenue: 12500,
    todayOrders: 8,
    pendingOrders: 5,
    lowStockItems: 3,
  });

  // Check authentication and seller role
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userResponse = await fetch('/api/auth/me');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          const user = userData.data.user;
          
          if (user.role === 'SELLER') {
            setIsAuthenticated(true);
            setUserInfo({
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              role: user.role,
              avatar: user.avatar,
              status: user.status,
              emailVerified: user.emailVerified,
              phoneVerified: user.phoneVerified,
            });
            
            // Get seller profile
            const sellerResponse = await fetch('/api/sellers/me');
            if (sellerResponse.ok) {
              const sellerData = await sellerResponse.json();
              setSellerId(sellerData.data.id);
            }
          } else {
            // Redirect to main page if not a seller
            router.push(`/${locale}/`);
          }
        } else {
          // Redirect to login if not authenticated
          router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(pathname)}`);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(pathname)}`);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [locale, pathname, router]);

  // Fetch counts data when seller ID is available
  useEffect(() => {
    if (!sellerId) return;
    
    const fetchCounts = async () => {
      try {
        const response = await fetch(`/api/sellers/${sellerId}/counts`);
        if (response.ok) {
          const counts = await response.json();
          setCountsData(counts.data);
        }
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    fetchCounts();
    // Refresh counts every 30 seconds
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [sellerId]);

  // Generate navigation items with dynamic badges
  const getNavigationItems = (): NavItem[] => [
    {
      id: 'dashboard',
      labelAr: 'لوحة التحكم',
      labelEn: 'Dashboard',
      icon: LayoutDashboard,
      href: '/seller/dashboard',
    },
    {
      id: 'inventory',
      labelAr: 'المخزون',
      labelEn: 'Inventory',
      icon: Package,
      href: '/seller/inventory',
      badge: countsData?.inventory.total || 0,
      subItems: [
        { labelAr: 'جميع المنتجات', labelEn: 'All Products', href: '/seller/inventory' },
        { labelAr: 'إضافة منتج', labelEn: 'Add Product', href: '/seller/inventory/new' },
        { 
          labelAr: 'مخزون منخفض', 
          labelEn: 'Low Stock', 
          href: '/seller/inventory/low-stock', 
          badge: countsData?.inventory.lowStock || 0
        },
        { 
          labelAr: 'غير متوفر', 
          labelEn: 'Out of Stock', 
          href: '/seller/inventory/out-of-stock', 
          badge: countsData?.inventory.outOfStock || 0
        },
        { labelAr: 'الأرشيف', labelEn: 'Archived', href: '/seller/inventory/archived' },
      ],
    },
    {
      id: 'orders',
      labelAr: 'الطلبات',
      labelEn: 'Orders',
      icon: ShoppingCart,
      href: '/seller/orders',
      badge: countsData?.summary.activeOrders || 0,
      badgeType: (countsData?.summary.activeOrders || 0) > 0 ? 'destructive' : 'outline',
      subItems: [
        { labelAr: 'جميع الطلبات', labelEn: 'All Orders', href: '/seller/orders' },
        { 
          labelAr: 'جديد', 
          labelEn: 'New', 
          href: '/seller/orders/new', 
          badge: countsData?.orders.pending || 0
        },
        { 
          labelAr: 'قيد التحضير', 
          labelEn: 'Processing', 
          href: '/seller/orders/processing', 
          badge: countsData?.orders.processing || 0
        },
        { 
          labelAr: 'جاهز للشحن', 
          labelEn: 'Ready to Ship', 
          href: '/seller/orders/ready', 
          badge: countsData?.orders.ready || 0
        },
        { labelAr: 'تم الشحن', labelEn: 'Shipped', href: '/seller/orders/shipped' },
        { labelAr: 'مكتمل', labelEn: 'Completed', href: '/seller/orders/completed' },
        { 
          labelAr: 'المرتجعات', 
          labelEn: 'Returns', 
          href: '/seller/orders/returns', 
          badge: countsData?.orders.returns || 0
        },
      ],
    },
    {
      id: 'messages',
      labelAr: 'الرسائل',
      labelEn: 'Messages',
      icon: MessageSquare,
      href: '/seller/messages',
      badge: countsData?.messages.unread || 0,
      badgeType: (countsData?.messages.unread || 0) > 0 ? 'destructive' : 'outline',
    },
    {
      id: 'analytics',
      labelAr: 'التحليلات',
      labelEn: 'Analytics',
      icon: BarChart3,
      href: '/seller/analytics',
    },
    {
      id: 'settings',
      labelAr: 'الإعدادات',
      labelEn: 'Settings',
      icon: Settings,
      href: '/seller/settings',
    },
  ];
  
  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    
    // Mobile detection
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };
  
  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };
  
  const isActive = (href: string) => {
    return pathname.includes(href);
  };
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push(`/${locale}/`);
    } catch (error) {
      console.error('Error logging out:', error);
      router.push(`/${locale}/`);
    }
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-saudi-green"></div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }
  
  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={userInfo?.avatar} />
                <AvatarFallback>{userInfo ? getInitials(userInfo.name) : 'U'}</AvatarFallback>
              </Avatar>
              {userInfo?.emailVerified && (
                <CheckCircle className="absolute -bottom-1 -right-1 h-4 w-4 text-green-500 bg-background rounded-full" />
              )}
            </div>
            {!collapsed && (
              <div className="flex-1">
                <p className="text-sm font-semibold line-clamp-1">{sellerInfo.storeName}</p>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-muted-foreground">{sellerInfo.rating}</span>
                </div>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Quick Stats */}
        {!collapsed && (
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 rounded-lg border border-green-200/50 dark:border-green-800/30">
              <p className="text-xs text-green-700 dark:text-green-300 font-medium">
                {isArabic ? 'إيرادات اليوم' : 'Today\'s Revenue'}
              </p>
              <p className="text-sm font-bold text-green-800 dark:text-green-200">
                {quickStats.todayRevenue.toLocaleString()} SAR
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
              <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                {isArabic ? 'الطلبات' : 'Orders'}
              </p>
              <p className="text-sm font-bold text-blue-800 dark:text-blue-200">
                {quickStats.todayOrders}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {getNavigationItems().map((item) => {
            const Icon = item.icon;
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isExpanded = expandedItems.has(item.id);
            const isItemActive = isActive(item.href);
            
            return (
              <div key={item.id}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isItemActive ? 'secondary' : 'ghost'}
                        className={cn(
                          'w-full justify-start gap-3 mb-1',
                          collapsed && 'justify-center px-2'
                        )}
                        onClick={() => {
                          if (hasSubItems) {
                            toggleExpanded(item.id);
                          } else {
                            router.push(`/${locale}${item.href}`);
                            setMobileOpen(false);
                          }
                        }}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-start">
                              {isArabic ? item.labelAr : item.labelEn}
                            </span>
                            {item.badge && (
                              <Badge variant={(item.badgeType as 'default' | 'secondary' | 'destructive' | 'outline') || 'default'} className="ml-auto">
                                {item.badge}
                              </Badge>
                            )}
                            {hasSubItems && (
                              <ChevronRight 
                                className={cn(
                                  'h-4 w-4 transition-transform',
                                  isExpanded && 'rotate-90'
                                )}
                              />
                            )}
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right">
                        <p>{isArabic ? item.labelAr : item.labelEn}</p>
                        {item.badge && (
                          <Badge variant={(item.badgeType as 'default' | 'secondary' | 'destructive' | 'outline') || 'default'} className="ml-2">
                            {item.badge}
                          </Badge>
                        )}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
                
                {/* Sub Items */}
                {!collapsed && hasSubItems && isExpanded && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.subItems!.map((subItem) => (
                      <Button
                        key={subItem.href}
                        variant={isActive(subItem.href) ? 'secondary' : 'ghost'}
                        size="sm"
                        className="w-full justify-start gap-2 text-sm"
                        onClick={() => {
                          router.push(`/${locale}${subItem.href}`);
                          setMobileOpen(false);
                        }}
                      >
                        <span className="flex-1 text-start">
                          {isArabic ? subItem.labelAr : subItem.labelEn}
                        </span>
                        {subItem.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {subItem.badge}
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>
      
      {/* Footer */}
      <div className="p-3 border-t">
        {!collapsed && (
          <Button
            variant="outline"
            className="w-full justify-start gap-2 mb-2"
            onClick={() => router.push(`/${locale}/seller/help`)}
          >
            <HelpCircle className="h-4 w-4" />
            {isArabic ? 'المساعدة والدعم' : 'Help & Support'}
          </Button>
        )}
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-2 text-destructive',
            collapsed && 'justify-center px-2'
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && (isArabic ? 'تسجيل الخروج' : 'Logout')}
        </Button>
      </div>
    </>
  );
  
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col border-r bg-card transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <SidebarContent />
      </aside>
      
      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent 
          side={isArabic ? 'right' : 'left'} 
          className="w-80 sm:w-64 p-0 overflow-hidden"
        >
          <div className="flex flex-col h-full">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="text-start">
                {isArabic ? 'قائمة التنقل' : 'Navigation Menu'}
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-auto">
              <SidebarContent />
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 border-b bg-card px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Search */}
            <div className="relative flex-1 sm:flex-none max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder={isArabic ? 'بحث في المنتجات والطلبات...' : 'Search products, orders...'}
                className="pl-10 pr-4 py-2 bg-muted/50 border rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-colors"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Refresh */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => window.location.reload()}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isArabic ? 'تحديث' : 'Refresh'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Theme Toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={toggleTheme}>
                    {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isArabic ? 'تبديل المظهر' : 'Toggle Theme'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-96 sm:w-80 max-h-96 overflow-y-auto">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>{isArabic ? 'الإشعارات' : 'Notifications'}</span>
                  <Badge variant="secondary" className="ml-2">{notifications}</Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Sample notifications */}
                <DropdownMenuItem className="p-3 cursor-pointer">
                  <div className="flex gap-3 w-full">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                      <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">
                        {isArabic ? 'طلب جديد' : 'New Order'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isArabic ? 'طلب #ORD2024-001' : 'Order #ORD2024-001'}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {isArabic ? 'منذ 5 دقائق' : '5 min ago'}
                        </span>
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center p-3">
                  <Button variant="ghost" className="w-full text-sm">
                    {isArabic ? 'عرض جميع الإشعارات' : 'View All Notifications'}
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userInfo?.avatar} />
                    <AvatarFallback>{userInfo ? getInitials(userInfo.name) : 'U'}</AvatarFallback>
                  </Avatar>
                  {userInfo?.emailVerified && (
                    <CheckCircle className="absolute -top-1 -right-1 h-3 w-3 text-green-500 bg-background rounded-full" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <div className="space-y-1">
                    <p className="font-medium">{userInfo?.name || sellerInfo.name}</p>
                    <p className="text-xs text-muted-foreground">{userInfo?.email || sellerInfo.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {isArabic ? 'بائع' : 'Seller'}
                      </Badge>
                      {userInfo?.emailVerified && (
                        <Badge variant="outline" className="text-xs text-green-600">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          {isArabic ? 'موثق' : 'Verified'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/${locale}/seller/profile`)}>
                  <User className="mr-2 h-4 w-4" />
                  {isArabic ? 'الملف الشخصي' : 'Profile'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/${locale}/seller/settings`)}>
                  <Settings className="mr-2 h-4 w-4" />
                  {isArabic ? 'الإعدادات' : 'Settings'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/${locale}/seller/help`)}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  {isArabic ? 'المساعدة' : 'Help'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {isArabic ? 'تسجيل الخروج' : 'Logout'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <ScrollArea className="h-full">
            <ErrorBoundary fallback={SellerErrorFallback}>
              {children}
            </ErrorBoundary>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}