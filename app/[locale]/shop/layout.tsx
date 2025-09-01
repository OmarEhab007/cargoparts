import { ReactNode } from 'react';
import Link from 'next/link';
import { User, Search, Store, LayoutDashboard, Package, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CartBadge } from '@/components/features/cart-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getLocale } from 'next-intl/server';

export default async function ShopLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getLocale();
  const isArabic = locale === 'ar';
  
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b glass-effect">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center gap-2 group">
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Store className="h-5 w-5 text-primary" />
              </div>
              <span className="text-2xl font-bold text-gradient">
                {isArabic ? 'كارجو' : 'Cargo'}
              </span>
            </Link>
            
            {/* Search Bar */}
            <form action={`/${locale}/shop/results`} className="mx-4 flex-1 max-w-xl">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                <Input
                  type="search"
                  name="q"
                  placeholder={isArabic ? "ابحث عن قطع غيار..." : "Search for parts..."}
                  className="ps-10 w-full input-modern relative bg-background/80 backdrop-blur-sm"
                />
              </div>
            </form>
            
            {/* Actions */}
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative icon-container"
                  >
                    <User className="h-5 w-5" />
                    <span className="absolute -top-1 -end-1 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    {isArabic ? 'حسابي' : 'My Account'}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/profile`} className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {isArabic ? 'الملف الشخصي' : 'Profile'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/seller/dashboard`} className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      {isArabic ? 'لوحة تحكم البائع' : 'Seller Dashboard'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/seller/listings`} className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      {isArabic ? 'إدارة القطع' : 'Manage Listings'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/seller/listings/new`} className="flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      {isArabic ? 'بيع قطعة' : 'Sell a Part'}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex items-center gap-2 text-muted-foreground">
                    <LogIn className="h-4 w-4" />
                    {isArabic ? 'تسجيل الخروج' : 'Sign Out'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <CartBadge />
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1">{children}</main>
      
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="text-sm text-muted-foreground">
              © 2024 Cargo Parts
            </div>
            <nav className="flex gap-4">
              <Link href={`/${locale}/terms`} className="text-sm text-muted-foreground hover:text-foreground">
                {isArabic ? 'الشروط والأحكام' : 'Terms & Conditions'}
              </Link>
              <Link href={`/${locale}/privacy`} className="text-sm text-muted-foreground hover:text-foreground">
                {isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}
              </Link>
              <Link href={`/${locale}/help`} className="text-sm text-muted-foreground hover:text-foreground">
                {isArabic ? 'المساعدة' : 'Help'}
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}