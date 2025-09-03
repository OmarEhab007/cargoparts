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
import { CartBadge } from '@/components/features/cart-badge';
import { 
  Menu,
  User,
  Globe,
  Package,
  Phone
} from 'lucide-react';

export function SiteHeader() {
  const locale = useLocale();
  const pathname = usePathname();
  const isArabic = locale === 'ar';
  const [isOpen, setIsOpen] = useState(false);

  const toggleLocale = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    window.location.href = newPath;
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
      href: `/${locale}#how-it-works`,
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
          <nav className="hidden lg:flex items-center space-x-8 rtl:space-x-reverse">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-muted-foreground hover:text-saudi-green transition-colors nav-link ${isArabic ? 'text-sm font-semibold' : 'text-sm font-medium'}`}
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

            {/* Account */}
            <Button
              variant="ghost"
              size="sm"
              className={`hidden sm:flex text-muted-foreground hover:text-saudi-green ${isArabic ? 'font-semibold' : ''}`}
            >
              <User className="h-4 w-4 me-1" />
              {isArabic ? 'حسابي' : 'Account'}
            </Button>

            {/* CTA Button */}
            <Button className="btn-saudi hidden md:flex" asChild>
              <Link href={`/${locale}/seller/dashboard`}>
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
                        className={`text-foreground hover:text-saudi-green transition-colors py-2 nav-link ${isArabic ? 'text-lg font-semibold' : 'text-lg font-medium'}`}
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
                    
                    <Button 
                      variant="outline" 
                      className="justify-start h-12"
                      asChild
                    >
                      <Link href={`/${locale}/account`} onClick={() => setIsOpen(false)}>
                        <User className="h-4 w-4 me-2" />
                        {isArabic ? 'حسابي' : 'My Account'}
                      </Link>
                    </Button>

                    <Button 
                      className="btn-saudi h-12" 
                      asChild
                    >
                      <Link href={`/${locale}/seller/dashboard`} onClick={() => setIsOpen(false)}>
                        {isArabic ? 'ابدأ البيع مجاناً' : 'Start Selling Free'}
                      </Link>
                    </Button>
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