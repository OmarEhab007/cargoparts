'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SARSymbol } from '@/components/ui/currency-symbol';
import { QuickAddToCart } from '@/components/features/quick-add-to-cart';
import { 
  Search, 
  Shield, 
  Truck, 
  Users,
  ChevronRight,
  Package,
  Zap,
  BadgeCheck,
  MapPin,
  ShoppingBag
} from 'lucide-react';

interface FeaturedListing {
  id: string;
  titleAr: string;
  titleEn: string | null;
  priceSar: number;
  make: string;
  model: string;
  fromYear: number;
  toYear: number;
  condition: string;
  city: string;
  seller: {
    id: string;
    yardName: string;
  };
  photos: { url: string }[];
}

export default function MarketingPage() {
  const router = useRouter();
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredListings, setFeaturedListings] = useState<FeaturedListing[]>([]);
  
  useEffect(() => {
    fetchFeaturedListings();
  }, []);
  
  const fetchFeaturedListings = async () => {
    try {
      const response = await fetch('/api/listings?limit=6');
      if (response.ok) {
        const data = await response.json();
        setFeaturedListings(data.listings);
      }
    } catch (error) {
      console.error('Error fetching featured listings:', error);
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${locale}/shop/results?search=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-4" variant="secondary">
              <Zap className="me-1 h-3 w-3" />
              {isArabic ? 'الموثوق به في المملكة' : 'Trusted in KSA'}
            </Badge>
            <h1 
              className="hero-title mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
              style={isArabic ? { lineHeight: '1.7', letterSpacing: '0.02em' } : {}}
            >
              {isArabic 
                ? 'أفضل قطع غيار السيارات المستعملة في المملكة'
                : 'Best Used Auto Parts in Saudi Arabia'}
            </h1>
            <p className="hero-subtitle mb-8 text-base text-muted-foreground sm:text-lg md:text-xl lg:text-2xl">
              {isArabic 
                ? 'ابحث عن قطع الغيار الأصلية من أفضل محلات السكراب في السعودية'
                : 'Find genuine OEM parts from the best scrapyards in Saudi Arabia'}
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mx-auto max-w-xl">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={isArabic 
                      ? 'ابحث عن قطع غيار... (مثال: مرآة كامري 2018)'
                      : 'Search for parts... (e.g., Camry 2018 mirror)'}
                    className="ps-10 h-12 text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button size="lg" type="submit" className="h-12 px-8">
                  {isArabic ? 'بحث' : 'Search'}
                </Button>
              </div>
            </form>
            
            {/* Quick Stats */}
            <div className="mt-12 flex justify-center gap-8 text-center">
              <div>
                <p className="text-3xl font-bold text-primary card-title-enhanced">500+</p>
                <p className="text-label text-muted-foreground">
                  {isArabic ? 'قطعة متاحة' : 'Parts Available'}
                </p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary card-title-enhanced">50+</p>
                <p className="text-label text-muted-foreground">
                  {isArabic ? 'بائع موثوق' : 'Trusted Sellers'}
                </p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary card-title-enhanced">24h</p>
                <p className="text-label text-muted-foreground">
                  {isArabic ? 'توصيل سريع' : 'Fast Delivery'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 card-title-enhanced">
              {isArabic ? 'لماذا كارجو؟' : 'Why Cargo Parts?'}
            </h2>
            <p className="text-muted-foreground text-lg hero-subtitle">
              {isArabic 
                ? 'نوفر لك أفضل تجربة للعثور على قطع الغيار المناسبة'
                : 'We provide the best experience for finding the right spare parts'}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-4">
            <Card className="text-center border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Search className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold card-title-enhanced">
                  {isArabic ? 'بحث ذكي' : 'Smart Search'}
                </h3>
                <p className="text-label text-muted-foreground">
                  {isArabic 
                    ? 'ابحث بواسطة رقم القطعة أو موديل السيارة أو سنة الصنع'
                    : 'Search by part number, car model, or year'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <BadgeCheck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold card-title-enhanced">
                  {isArabic ? 'قطع أصلية' : 'Genuine Parts'}
                </h3>
                <p className="text-label text-muted-foreground">
                  {isArabic 
                    ? 'جميع القطع أصلية ومضمونة من البائعين الموثوقين'
                    : 'All parts are genuine and guaranteed by trusted sellers'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold card-title-enhanced">
                  {isArabic ? 'توصيل سريع' : 'Fast Delivery'}
                </h3>
                <p className="text-label text-muted-foreground">
                  {isArabic 
                    ? 'توصيل لجميع مناطق المملكة خلال 24-48 ساعة'
                    : 'Delivery to all KSA regions within 24-48 hours'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold card-title-enhanced">
                  {isArabic ? 'دفع آمن' : 'Secure Payment'}
                </h3>
                <p className="text-label text-muted-foreground">
                  {isArabic 
                    ? 'طرق دفع آمنة ومتعددة لراحتك'
                    : 'Multiple secure payment methods for your convenience'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Featured Listings */}
      {featuredListings.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  {isArabic ? 'أحدث القطع المضافة' : 'Latest Parts Added'}
                </h2>
                <p className="text-label text-muted-foreground">
                  {isArabic ? 'تصفح أحدث قطع الغيار المتاحة' : 'Browse the latest available spare parts'}
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href={`/${locale}/shop`}>
                  {isArabic ? 'عرض الكل' : 'View All'}
                  <ChevronRight className="ms-2 h-4 w-4 rotate-180 rtl:rotate-0" />
                </Link>
              </Button>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredListings.map((listing) => (
                <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted relative">
                    {listing.photos[0] ? (
                      <Image 
                        src={listing.photos[0].url} 
                        alt={isArabic ? listing.titleAr : listing.titleEn || listing.titleAr}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <Badge className="absolute top-2 end-2">
                      {listing.condition === 'NEW' ? (isArabic ? 'جديد' : 'New') :
                       listing.condition === 'USED' ? (isArabic ? 'مستعمل' : 'Used') :
                       (isArabic ? 'مجدد' : 'Refurbished')}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">
                      {isArabic ? listing.titleAr : listing.titleEn || listing.titleAr}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{listing.make} {listing.model}</span>
                      <span>•</span>
                      <span>{listing.fromYear}-{listing.toYear}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold flex items-center gap-1">
                        {listing.priceSar.toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                        <SARSymbol className="h-5 w-5" />
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {listing.city}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Users className="h-4 w-4" />
                      <span>{listing.seller.yardName}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1" variant="outline" asChild>
                        <Link href={`/${locale}/shop/listing/${listing.id}`}>
                          {isArabic ? 'التفاصيل' : 'Details'}
                        </Link>
                      </Button>
                      <QuickAddToCart listing={listing} className="flex-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              {isArabic ? 'كيف يعمل الموقع؟' : 'How It Works'}
            </h2>
            <p className="text-muted-foreground text-lg">
              {isArabic 
                ? 'خطوات بسيطة للحصول على قطع الغيار التي تحتاجها'
                : 'Simple steps to get the spare parts you need'}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Search className="h-10 w-10 text-primary" />
                  </div>
                  <div className="absolute -top-2 -end-2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    1
                  </div>
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                {isArabic ? 'ابحث عن القطعة' : 'Search for Part'}
              </h3>
              <p className="text-muted-foreground">
                {isArabic 
                  ? 'استخدم البحث الذكي للعثور على القطعة المناسبة لسيارتك'
                  : 'Use smart search to find the right part for your car'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShoppingBag className="h-10 w-10 text-primary" />
                  </div>
                  <div className="absolute -top-2 -end-2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    2
                  </div>
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                {isArabic ? 'أضف للسلة' : 'Add to Cart'}
              </h3>
              <p className="text-muted-foreground">
                {isArabic 
                  ? 'اختر القطع المناسبة وأضفها إلى سلة التسوق'
                  : 'Choose the right parts and add them to your cart'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Truck className="h-10 w-10 text-primary" />
                  </div>
                  <div className="absolute -top-2 -end-2 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                {isArabic ? 'استلم طلبك' : 'Receive Your Order'}
              </h3>
              <p className="text-muted-foreground">
                {isArabic 
                  ? 'أكمل الطلب واستلم القطع في أسرع وقت'
                  : 'Complete your order and receive parts quickly'}
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              {isArabic ? 'هل لديك قطع غيار للبيع؟' : 'Have Spare Parts to Sell?'}
            </h2>
            <p className="mb-8 text-lg opacity-90">
              {isArabic 
                ? 'انضم إلى أكبر منصة لبيع قطع الغيار المستعملة في المملكة'
                : 'Join the largest platform for selling used spare parts in Saudi Arabia'}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" variant="secondary" asChild className="font-semibold">
                <Link href={`/${locale}/seller/dashboard`}>
                  <Users className="me-2 h-5 w-5" />
                  {isArabic ? 'سجل كبائع' : 'Register as Seller'}
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Link href={`/${locale}/shop`}>
                  <Package className="me-2 h-5 w-5" />
                  {isArabic ? 'تصفح القطع' : 'Browse Parts'}
                </Link>
              </Button>
            </div>
            
            <div className="mt-12 grid grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-3xl font-bold mb-1">100%</p>
                <p className="opacity-90">{isArabic ? 'آمن' : 'Secure'}</p>
              </div>
              <div>
                <p className="text-3xl font-bold mb-1">24/7</p>
                <p className="opacity-90">{isArabic ? 'دعم' : 'Support'}</p>
              </div>
              <div>
                <p className="text-3xl font-bold mb-1">0%</p>
                <p className="opacity-90">{isArabic ? 'عمولة' : 'Commission'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}