'use client';

import { usePathname } from 'next/navigation';
import { SiteFooter } from './site-footer';

export function ConditionalFooter() {
  const pathname = usePathname();
  
  // Hide footer on shop and seller pages
  const shouldShowFooter = !pathname.includes('/shop') && !pathname.includes('/seller');
  
  if (!shouldShowFooter) {
    return null;
  }
  
  return <SiteFooter />;
}