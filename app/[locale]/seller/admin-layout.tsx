'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
  X,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  Sun,
  Moon,
  LogOut,
  User,
  Store,
  TrendingUp,
  Users,
  FileText,
  Truck,
  AlertCircle,
  CheckCircle,
  Clock,
  Archive,
  Star,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Activity,
} from 'lucide-react';

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

const navigationItems: NavItem[] = [
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
    badge: '15',
    subItems: [
      { labelAr: 'جميع القطع', labelEn: 'All Parts', href: '/seller/inventory' },
      { labelAr: 'إضافة قطعة', labelEn: 'Add Part', href: '/seller/inventory/new' },
      { labelAr: 'المنخفض', labelEn: 'Low Stock', href: '/seller/inventory/low-stock', badge: '3' },
      { labelAr: 'الأرشيف', labelEn: 'Archived', href: '/seller/inventory/archived' },
    ],
  },
  {
    id: 'orders',
    labelAr: 'الطلبات',
    labelEn: 'Orders',
    icon: ShoppingCart,
    href: '/seller/orders',
    badge: '5',
    badgeType: 'destructive',
    subItems: [
      { labelAr: 'جميع الطلبات', labelEn: 'All Orders', href: '/seller/orders' },
      { labelAr: 'قيد الانتظار', labelEn: 'Pending', href: '/seller/orders/pending', badge: '5' },
      { labelAr: 'قيد المعالجة', labelEn: 'Processing', href: '/seller/orders/processing' },
      { labelAr: 'تم الشحن', labelEn: 'Shipped', href: '/seller/orders/shipped' },
      { labelAr: 'المرتجعات', labelEn: 'Returns', href: '/seller/orders/returns' },
    ],
  },
  {
    id: 'analytics',
    labelAr: 'التحليلات',
    labelEn: 'Analytics',
    icon: BarChart3,
    href: '/seller/analytics',
    subItems: [
      { labelAr: 'نظرة عامة', labelEn: 'Overview', href: '/seller/analytics' },
      { labelAr: 'المبيعات', labelEn: 'Sales', href: '/seller/analytics/sales' },
      { labelAr: 'المنتجات', labelEn: 'Products', href: '/seller/analytics/products' },
      { labelAr: 'العملاء', labelEn: 'Customers', href: '/seller/analytics/customers' },
      { labelAr: 'التقارير', labelEn: 'Reports', href: '/seller/analytics/reports' },
    ],
  },
  {
    id: 'messages',
    labelAr: 'الرسائل',
    labelEn: 'Messages',
    icon: MessageSquare,
    href: '/seller/messages',
    badge: '2',
    badgeType: 'secondary',
  },
  {
    id: 'finance',
    labelAr: 'المالية',
    labelEn: 'Finance',
    icon: DollarSign,
    href: '/seller/finance',
    subItems: [
      { labelAr: 'نظرة عامة', labelEn: 'Overview', href: '/seller/finance' },
      { labelAr: 'المعاملات', labelEn: 'Transactions', href: '/seller/finance/transactions' },
      { labelAr: 'الفواتير', labelEn: 'Invoices', href: '/seller/finance/invoices' },
      { labelAr: 'الضرائب', labelEn: 'Tax', href: '/seller/finance/tax' },
    ],
  },
  {
    id: 'settings',
    labelAr: 'الإعدادات',
    labelEn: 'Settings',
    icon: Settings,
    href: '/seller/settings',
  },
];

interface SellerInfo {
  name: string;
  email: string;
  storeName: string;
  avatar?: string;
  verified: boolean;
  rating: number;
}

interface QuickStats {
  todayRevenue: number;
  todayOrders: number;
  pendingOrders: number;
  lowStockItems: number;
}

export default function SellerAdminLayout({
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
  
  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
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
  
  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={sellerInfo.avatar} />
                <AvatarFallback>{getInitials(sellerInfo.name)}</AvatarFallback>
              </Avatar>
              {sellerInfo.verified && (
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
            <div className="p-2 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">{isArabic ? 'اليوم' : 'Today'}</p>
              <p className="text-sm font-bold">{quickStats.todayRevenue.toLocaleString()} SAR</p>
            </div>
            <div className="p-2 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">{isArabic ? 'الطلبات' : 'Orders'}</p>
              <p className="text-sm font-bold">{quickStats.todayOrders}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigationItems.map((item) => {
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
                              <Badge variant={item.badgeType as any || 'default'} className="ml-auto">
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
                          <Badge variant={item.badgeType as any || 'default'} className="ml-2">
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
          onClick={() => {
            // Handle logout
            router.push(`/${locale}/`);
          }}
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
        <SheetContent side={isArabic ? 'right' : 'left'} className="w-64 p-0">
          <SidebarContent />
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
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder={isArabic ? 'بحث...' : 'Search...'}
                className="pl-10 pr-4 py-2 bg-muted/50 border rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Quick Actions */}
            <Button variant="ghost" size="icon" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
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
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>{isArabic ? 'الإشعارات' : 'Notifications'}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <div className="flex gap-3">
                    <ShoppingCart className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{isArabic ? 'طلب جديد' : 'New Order'}</p>
                      <p className="text-xs text-muted-foreground">
                        {isArabic ? 'طلب #ORD001 من أحمد محمد' : 'Order #ORD001 from Ahmed Mohammed'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isArabic ? 'منذ 5 دقائق' : '5 minutes ago'}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex gap-3">
                    <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{isArabic ? 'مخزون منخفض' : 'Low Stock Alert'}</p>
                      <p className="text-xs text-muted-foreground">
                        {isArabic ? '3 منتجات تحتاج إعادة تخزين' : '3 products need restocking'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isArabic ? 'منذ ساعة' : '1 hour ago'}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <div className="flex gap-3">
                    <MessageSquare className="h-4 w-4 text-green-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{isArabic ? 'رسالة جديدة' : 'New Message'}</p>
                      <p className="text-xs text-muted-foreground">
                        {isArabic ? 'سؤال عن محرك تويوتا' : 'Question about Toyota engine'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isArabic ? 'منذ ساعتين' : '2 hours ago'}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center">
                  <span className="w-full text-sm text-primary">
                    {isArabic ? 'عرض جميع الإشعارات' : 'View all notifications'}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={sellerInfo.avatar} />
                    <AvatarFallback>{getInitials(sellerInfo.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{sellerInfo.name}</p>
                    <p className="text-xs text-muted-foreground">{sellerInfo.email}</p>
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
                <DropdownMenuItem className="text-destructive">
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
            {children}
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}