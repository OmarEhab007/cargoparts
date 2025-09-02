import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { LocaleProvider } from '@/components/providers/locale-provider';
import { CartProvider } from '@/lib/cart/cart-context';
import { SiteHeader } from '@/components/ui/site-header';
import { ConditionalFooter } from '@/components/ui/conditional-footer';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { locales } from '@/i18n/config';
import { Toaster } from 'sonner';
import { Cairo, Inter } from 'next/font/google';
import '../globals.css';

// Modern Arabic font with enhanced weights
const cairo = Cairo({ 
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  preload: true,
  fallback: ['Arial', 'sans-serif'],
});

// Latin font
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  await params;
  return {
    title: {
      template: `%s | كارجو`,
      default: 'كارجو',
    },
    description: 'Bilingual marketplace for finding and ordering used OEM auto parts from KSA scrapyards',
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  if (!locales.includes(locale as 'ar' | 'en')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html 
      lang={locale} 
      dir={locale === 'ar' ? 'rtl' : 'ltr'} 
      suppressHydrationWarning
      className={`${cairo.variable} ${inter.variable}`}
    >
      <body className={`${locale === 'ar' ? cairo.className : inter.className} min-h-screen flex flex-col`}>
        <NextIntlClientProvider messages={messages}>
          <LocaleProvider>
            <CartProvider>
              <SiteHeader />
              <main className="flex-1 relative">
                {children}
              </main>
              <ConditionalFooter />
              <ScrollToTop />
              <Toaster 
                position={locale === 'ar' ? 'top-left' : 'top-right'}
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
                toastOptions={{
                  className: locale === 'ar' ? cairo.className : inter.className,
                }}
              />
            </CartProvider>
          </LocaleProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}