'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CartBadge } from '@/components/features/cart-badge';
import { useAuth } from '@/hooks/use-auth';
import { 
  Menu,
  User,
  Globe,
  Package,
  Phone,
  Settings,
  LogOut,
  Store,
  BarChart3
} from 'lucide-react';

export function SiteHeader() {
  const locale = useLocale();
  const pathname = usePathname();
  const isArabic = locale === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const { user, seller, isLoading, isLoggedIn } = useAuth();

  const toggleLocale = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    window.location.href = newPath;
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      window.location.href = `/${locale}`;
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even if logout fails
      window.location.href = `/${locale}`;
    }
  };

  const navigation = [
    {
      name: isArabic ? 'الرئيسية' : 'Home',
      href: `/${locale}`,
    },
    {
      name: isArabic ? 'تسوّق' : 'Shop',
      href: `/${locale}/shop`,
    },
    {
      name: isArabic ? 'كيف نعمل' : 'How It Works',
      href: `/${locale}`,
    },
    {
      name: isArabic ? 'عن كارجو' : 'About',
      href: `/${locale}/about`,
    },
    {
      name: isArabic ? 'اتصل بنا' : 'Contact',
      href: `/${locale}/contact`,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            href={`/${locale}`} 
            className="flex items-center space-x-2 rtl:space-x-reverse font-bold text-xl text-saudi-green"
          >
            <div className="w-8 h-8 bg-saudi-green rounded-lg flex items-center justify-center text-white">
              <Package className="h-4 w-4" />
            </div>
            <span className="text-saudi-green font-bold">
              {isArabic ? 'كارجو' : 'CargoParts'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 rtl:space-x-reverse">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-muted-foreground hover:text-saudi-green transition-colors nav-link whitespace-nowrap ${isArabic ? 'text-sm font-semibold' : 'text-sm font-medium'}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLocale}
              className="hidden sm:flex text-muted-foreground hover:text-saudi-green"
            >
              <Globe className="h-4 w-4 me-1" />
              {isArabic ? 'EN' : 'ع'}
            </Button>

            {/* Cart */}
            <CartBadge />

            {/* Account - Authenticated vs Non-authenticated */}
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
            ) : isLoggedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="bg-saudi-green text-white">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className={`font-medium ${isArabic ? 'font-semibold' : ''}`}>
                        {user.name}
                      </p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  
                  {/* Dashboard/Profile */}
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/dashboard`}>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      <span>{isArabic ? 'لوحة التحكم' : 'Dashboard'}</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  {/* Seller specific items */}
                  {seller && (
                    <DropdownMenuItem asChild>
                      <Link href={`/${locale}/seller/dashboard`}>
                        <Store className="mr-2 h-4 w-4" />
                        <span>{isArabic ? 'إدارة المتجر' : 'Manage Store'}</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  {/* Settings */}
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/profile`}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{isArabic ? 'الإعدادات' : 'Settings'}</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Logout */}
                  <DropdownMenuItem 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{isArabic ? 'تسجيل الخروج' : 'Logout'}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className={`hidden sm:flex text-muted-foreground hover:text-saudi-green ${isArabic ? 'font-semibold' : ''}`}
                asChild
              >
                <Link href={`/${locale}/auth`}>
                  <User className="h-4 w-4 me-1" />
                  {isArabic ? 'تسجيل الدخول' : 'Login'}
                </Link>
              </Button>
            )}

            {/* CTA Button */}
            <Button className="btn-saudi hidden md:flex" asChild>
              <Link href={`/${locale}/auth?mode=register&role=seller`}>
                {isArabic ? 'ابدأ البيع' : 'Sell Parts'}
              </Link>
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side={isArabic ? 'right' : 'left'} className="w-80">
                <div className="flex flex-col space-y-6 mt-6">
                  {/* Logo */}
                  <Link 
                    href={`/${locale}`} 
                    className="flex items-center space-x-2 rtl:space-x-reverse font-bold text-xl text-saudi-green"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="w-8 h-8 bg-saudi-green rounded-lg flex items-center justify-center text-white">
                      <Package className="h-4 w-4" />
                    </div>
                    <span>{isArabic ? 'كارجو' : 'CargoParts'}</span>
                  </Link>

                  {/* Navigation */}
                  <nav className="flex flex-col space-y-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`text-foreground hover:text-saudi-green transition-colors py-2 nav-link whitespace-nowrap ${isArabic ? 'text-lg font-semibold' : 'text-lg font-medium'}`}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>

                  {/* Mobile Actions */}
                  <div className="flex flex-col space-y-3 pt-6 border-t">
                    <Button 
                      variant="outline" 
                      className={`justify-start h-12 ${isArabic ? 'font-semibold' : ''}`}
                      onClick={toggleLocale}
                    >
                      <Globe className="h-4 w-4 me-2" />
                      {isArabic ? 'English' : 'العربية'}
                    </Button>
                    
                    {isLoggedIn && user ? (
                      <>
                        {/* User Profile Info */}
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="bg-saudi-green text-white">
                              {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <p className={`font-medium ${isArabic ? 'font-semibold' : ''}`}>
                              {user.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        
                        {/* Dashboard */}
                        <Button 
                          variant="outline" 
                          className="justify-start h-12"
                          asChild
                        >
                          <Link href={`/${locale}/dashboard`} onClick={() => setIsOpen(false)}>
                            <BarChart3 className="h-4 w-4 me-2" />
                            {isArabic ? 'لوحة التحكم' : 'Dashboard'}
                          </Link>
                        </Button>

                        {/* Seller Dashboard */}
                        {seller && (
                          <Button 
                            variant="outline" 
                            className="justify-start h-12"
                            asChild
                          >
                            <Link href={`/${locale}/seller/dashboard`} onClick={() => setIsOpen(false)}>
                              <Store className="h-4 w-4 me-2" />
                              {isArabic ? 'إدارة المتجر' : 'Manage Store'}
                            </Link>
                          </Button>
                        )}

                        {/* Settings */}
                        <Button 
                          variant="outline" 
                          className="justify-start h-12"
                          asChild
                        >
                          <Link href={`/${locale}/profile`} onClick={() => setIsOpen(false)}>
                            <Settings className="h-4 w-4 me-2" />
                            {isArabic ? 'الإعدادات' : 'Settings'}
                          </Link>
                        </Button>

                        {/* Logout */}
                        <Button 
                          variant="outline" 
                          className="justify-start h-12 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                          onClick={() => {
                            setIsOpen(false);
                            handleLogout();
                          }}
                        >
                          <LogOut className="h-4 w-4 me-2" />
                          {isArabic ? 'تسجيل الخروج' : 'Logout'}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          className="justify-start h-12"
                          asChild
                        >
                          <Link href={`/${locale}/auth`} onClick={() => setIsOpen(false)}>
                            <User className="h-4 w-4 me-2" />
                            {isArabic ? 'تسجيل الدخول' : 'Login / Register'}
                          </Link>
                        </Button>

                        <Button 
                          className="btn-saudi h-12" 
                          asChild
                        >
                          <Link href={`/${locale}/auth?mode=register&role=seller`} onClick={() => setIsOpen(false)}>
                            {isArabic ? 'ابدأ البيع مجاناً' : 'Start Selling Free'}
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="pt-6 border-t text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                      <Phone className="h-4 w-4" />
                      <span>{isArabic ? 'دعم العملاء: 920000000' : 'Support: 920000000'}</span>
                    </div>
                    <p className="text-xs">
                      {isArabic 
                        ? 'متاح 24/7 لخدمتكم'
                        : 'Available 24/7 for your service'}
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}