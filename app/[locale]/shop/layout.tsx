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
    <>{children}</>
  );
}