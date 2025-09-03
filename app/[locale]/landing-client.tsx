'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SARSymbol } from '@/components/ui/currency-symbol';
import { QuickAddToCart } from '@/components/features/quick-add-to-cart';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Shield, 
  Truck, 
  Users,
  MapPin,
  Star,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Sparkles,
  Zap
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

interface LandingClientProps {
  initialListings: FeaturedListing[];
}

export default function LandingClient({ initialListings }: LandingClientProps) {
  const router = useRouter();
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const featuredListings = initialListings;
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${locale}/shop/results?search=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-saudi-green/10 via-saudi-green/5 to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(22,93,49,0.1),transparent_50%)]" />
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-desert-gold/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="mx-auto max-w-5xl text-center">
            {/* Enhanced Trust Badges with More Social Proof */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <Badge className="badge-saudi animate-pulse">
                <CheckCircle2 className="me-1 h-3 w-3" />
                {isArabic ? 'موثوق من 15,000+ عميل' : 'Trusted by 15,000+ customers'}
              </Badge>
              <Badge className="badge-gold">
                <Star className="me-1 h-3 w-3" />
                {isArabic ? 'تقييم 4.9 من 5' : '4.9/5 stars (2,341 reviews)'}
              </Badge>
              <Badge className="bg-riyadh-sky/10 text-riyadh-sky border-riyadh-sky/20">
                <Sparkles className="me-1 h-3 w-3" />
                {isArabic ? 'رقم 1 في السعودية' : '#1 in Saudi Arabia'}
              </Badge>
              <Badge className="bg-saudi-green/10 text-saudi-green border-saudi-green/20">
                <Shield className="me-1 h-3 w-3" />
                {isArabic ? 'مرخص من وزارة التجارة' : 'MOC Licensed'}
              </Badge>
            </div>
            
            <h1 className={`hierarchy-title mb-6 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-saudi-green ${isArabic ? 'hero-title' : 'leading-tight'}`}>
              {isArabic 
                ? 'قطع غيار أصلية بأفضل الأسعار في المملكة'
                : 'Genuine Auto Parts at Best Prices in Saudi Arabia'}
            </h1>
            
            <p className={`hierarchy-large mb-8 text-lg text-muted-foreground sm:text-xl md:text-2xl max-w-4xl mx-auto ${isArabic ? 'hero-subtitle' : ''}`}>
              {isArabic 
                ? 'اكتشف أكبر مجموعة من قطع الغيار الأصلية المضمونة من أفضل محلات السكراب المعتمدة في السعودية - وفر حتى 70% مقارنة بالوكلاء'
                : 'Discover the largest collection of guaranteed genuine parts from certified scrapyards in Saudi Arabia - save up to 70% compared to dealerships'}
            </p>
            
            {/* Value Propositions */}
            <div className="flex flex-wrap justify-center gap-4 mb-8 text-sm">
              <div className={`flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-saudi-green/20 ${isArabic ? 'gap-3 px-5' : ''}`}>
                <Shield className="h-4 w-4 text-saudi-green" />
                <span className={`font-medium ${isArabic ? 'text-sm font-semibold' : ''}`}>{isArabic ? 'ضمان 6 أشهر' : '6-Month Warranty'}</span>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-desert-gold/20 ${isArabic ? 'gap-3 px-5' : ''}`}>
                <TrendingUp className="h-4 w-4 text-desert-gold" />
                <span className={`font-medium ${isArabic ? 'text-sm font-semibold' : ''}`}>{isArabic ? 'توفير 70%' : 'Save 70%'}</span>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-riyadh-sky/20 ${isArabic ? 'gap-3 px-5' : ''}`}>
                <Truck className="h-4 w-4 text-riyadh-sky" />
                <span className={`font-medium ${isArabic ? 'text-sm font-semibold' : ''}`}>{isArabic ? 'شحن مجاني' : 'Free Shipping'}</span>
              </div>
            </div>
            
            {/* Enhanced Search Bar */}
            <form onSubmit={handleSearch} className="mx-auto max-w-2xl">
              <div className="relative">
                <div className="flex gap-2 p-2 bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-transparent focus-within:border-saudi-green/50 shadow-lg">
                  <div className="relative flex-1">
                    <Search className="absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-saudi-green" />
                    <Input
                      type="search"
                      placeholder={isArabic 
                        ? 'ابحث عن أي قطعة... كامري، محرك، فرامل، مرآة'
                        : 'Search any part... Camry, engine, brakes, mirror'}
                      className={`ps-12 h-14 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70 ${isArabic ? 'text-lg font-medium' : 'text-lg'}`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button size="lg" type="submit" className="btn-saudi h-12 px-8 rounded-xl">
                    <Search className="me-2 h-4 w-4" />
                    {isArabic ? 'بحث' : 'Search'}
                  </Button>
                </div>
                <div className="flex flex-col items-center gap-2 mt-4">
                  <p className={`text-muted-foreground ${isArabic ? 'text-base font-medium' : 'text-sm'}`}>
                    {isArabic 
                      ? '🔥 أكثر من 50,000 قطعة متاحة الآن'
                      : '🔥 Over 50,000 parts available now'}
                  </p>
                  <div className={`flex items-center gap-4 text-desert-gold font-medium ${isArabic ? 'text-sm gap-3' : 'text-xs'}`}>
                    <span className={`flex items-center ${isArabic ? 'gap-2' : 'gap-1'}`}>
                      <div className="w-2 h-2 bg-desert-gold rounded-full animate-pulse"></div>
                      {isArabic ? '243 مشتري يتصفحون الآن' : '243 buyers browsing now'}
                    </span>
                    <span>•</span>
                    <span>{isArabic ? '18 طلب تم في آخر ساعة' : '18 orders in last hour'}</span>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Listings Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-saudi-green mb-4">
              {isArabic ? 'قطع غيار مميزة' : 'Featured Parts'}
            </h2>
            <p className="text-lg text-muted-foreground">
              {isArabic ? 'أحدث القطع المضافة من البائعين الموثوقين' : 'Latest parts from trusted sellers'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.slice(0, 6).map((listing, index) => (
              <Card key={listing.id} className={cn(
                // Enhanced featured listing card styling
                "group cursor-pointer",
                // Premium gradient background for featured items
                "bg-gradient-to-br from-card via-card to-saudi-green/3",
                // Enhanced shadows with Saudi green tint
                "shadow-lg hover:shadow-xl hover:shadow-saudi-green/20",
                // Better hover effects with lift and scale
                "hover:-translate-y-2 hover:scale-[1.02]",
                // Enhanced border with gradient
                "border-2 border-transparent hover:border-saudi-green/20",
                "bg-clip-padding",
                // Staggered animation delay for visual appeal
                "transition-all duration-500 ease-out",
                // Add subtle backdrop blur
                "backdrop-blur-sm",
                // Special styling for first featured item
                index === 0 && "ring-2 ring-desert-gold/20 bg-gradient-to-br from-card via-desert-gold/5 to-saudi-green/3"
              )}>
                {/* Add decorative accent for featured items */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-saudi-green/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <CardHeader className="relative z-10">
                  <CardTitle className={cn(
                    "text-lg leading-tight line-clamp-2",
                    // Enhanced title styling
                    "group-hover:text-saudi-green transition-colors duration-300",
                    "font-semibold tracking-tight"
                  )}>
                    {isArabic ? listing.titleAr : (listing.titleEn || listing.titleAr)}
                  </CardTitle>
                  {/* Add featured badge for first item */}
                  {index === 0 && (
                    <div className={cn(
                      "absolute -top-3 z-20",
                      isArabic ? "-left-3" : "-right-3"
                    )}>
                      <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-amber-900 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg border border-amber-300">
                        <Star className="inline h-3 w-3 me-1 fill-current" />
                        {isArabic ? 'مميز' : 'Featured'}
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="relative z-10 space-y-0">
                  <div className="space-y-4">
                    {/* Enhanced price display */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-saudi-green group-hover:scale-105 transition-transform duration-200">
                          <SARSymbol className="inline h-6 w-6 me-1" /> 
                          {listing.priceSar.toLocaleString()}
                        </span>
                        {/* Add savings badge if it's a good deal */}
                        {listing.priceSar < 5000 && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            {isArabic ? 'سعر ممتاز' : 'Great Price'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Enhanced vehicle info */}
                    <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">
                          {listing.make} {listing.model}
                        </span>
                        <span className="text-sm bg-saudi-green/10 text-saudi-green px-2 py-1 rounded-full font-medium">
                          {listing.fromYear}-{listing.toYear}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 text-saudi-green" />
                        <span>{listing.city}</span>
                        {/* Add seller info */}
                        <span className="ms-auto flex items-center gap-1">
                          <Shield className="h-3 w-3 text-desert-gold" />
                          <span className="text-xs">{listing.seller.yardName}</span>
                        </span>
                      </div>
                    </div>
                    
                    {/* Enhanced CTA */}
                    <div className="pt-2">
                      <QuickAddToCart 
                        listing={listing} 
                        className="w-full group-hover:bg-saudi-green-dark group-hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 lg:py-24 bg-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-saudi-green mb-4">
              {isArabic ? 'لماذا كارجو بارتس؟' : 'Why Cargo Parts?'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Quality Guarantee Card */}
            <Card className={cn(
              "text-center group cursor-default",
              "bg-gradient-to-br from-card via-card to-saudi-green/8",
              "border-2 border-saudi-green/10 hover:border-saudi-green/25",
              "shadow-lg hover:shadow-xl hover:shadow-saudi-green/20",
              "hover:-translate-y-3 hover:scale-105",
              "transition-all duration-500 ease-out",
              "backdrop-blur-sm p-8"
            )}>
              <div className="relative">
                <div className={cn(
                  "w-20 h-20 bg-gradient-to-br from-saudi-green/20 to-saudi-green/10",
                  "rounded-2xl flex items-center justify-center mx-auto mb-6",
                  "group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300",
                  "shadow-lg group-hover:shadow-saudi-green/30"
                )}>
                  <Shield className="h-10 w-10 text-saudi-green group-hover:scale-110 transition-transform duration-200" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-saudi-green rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-saudi-green group-hover:text-saudi-green-dark transition-colors duration-200">
                {isArabic ? 'ضمان الجودة' : 'Quality Guarantee'}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {isArabic ? 'جميع القطع مفحوصة ومضمونة لمدة 6 أشهر من خبراء معتمدين' : 'All parts inspected by certified experts with 6-month warranty'}
              </p>
              <div className="mt-4 text-sm font-medium text-saudi-green">
                {isArabic ? '✓ فحص شامل ✓ ضمان موثق' : '✓ Thorough inspection ✓ Documented warranty'}
              </div>
            </Card>

            {/* Best Prices Card */}
            <Card className={cn(
              "text-center group cursor-default",
              "bg-gradient-to-br from-card via-card to-desert-gold/8",
              "border-2 border-desert-gold/15 hover:border-desert-gold/30",
              "shadow-lg hover:shadow-xl hover:shadow-desert-gold/20",
              "hover:-translate-y-3 hover:scale-105",
              "transition-all duration-500 ease-out",
              "backdrop-blur-sm p-8"
            )}>
              <div className="relative">
                <div className={cn(
                  "w-20 h-20 bg-gradient-to-br from-desert-gold/20 to-desert-gold/10",
                  "rounded-2xl flex items-center justify-center mx-auto mb-6",
                  "group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300",
                  "shadow-lg group-hover:shadow-desert-gold/30"
                )}>
                  <DollarSign className="h-10 w-10 text-desert-gold group-hover:scale-110 transition-transform duration-200" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-desert-gold rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-saudi-green-dark" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-desert-gold group-hover:text-desert-gold-dark transition-colors duration-200">
                {isArabic ? 'أفضل الأسعار' : 'Best Prices'}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {isArabic ? 'وفر حتى 70% مقارنة بأسعار الوكلاء مع نفس الجودة المضمونة' : 'Save up to 70% compared to dealership prices with guaranteed quality'}
              </p>
              <div className="mt-4 text-sm font-medium text-desert-gold">
                {isArabic ? '✓ أسعار منافسة ✓ شفافية كاملة' : '✓ Competitive pricing ✓ Full transparency'}
              </div>
            </Card>

            {/* Fast Shipping Card */}
            <Card className={cn(
              "text-center group cursor-default",
              "bg-gradient-to-br from-card via-card to-riyadh-sky/8",
              "border-2 border-riyadh-sky/15 hover:border-riyadh-sky/30",
              "shadow-lg hover:shadow-xl hover:shadow-riyadh-sky/20",
              "hover:-translate-y-3 hover:scale-105",
              "transition-all duration-500 ease-out",
              "backdrop-blur-sm p-8"
            )}>
              <div className="relative">
                <div className={cn(
                  "w-20 h-20 bg-gradient-to-br from-riyadh-sky/20 to-riyadh-sky/10",
                  "rounded-2xl flex items-center justify-center mx-auto mb-6",
                  "group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300",
                  "shadow-lg group-hover:shadow-riyadh-sky/30"
                )}>
                  <Truck className="h-10 w-10 text-riyadh-sky group-hover:scale-110 transition-transform duration-200" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-riyadh-sky rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-riyadh-sky group-hover:text-riyadh-sky-dark transition-colors duration-200">
                {isArabic ? 'شحن سريع' : 'Fast Shipping'}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {isArabic ? 'توصيل سريع لجميع مناطق المملكة خلال 2-3 أيام مع تتبع مباشر' : 'Fast delivery across Saudi Arabia in 2-3 days with live tracking'}
              </p>
              <div className="mt-4 text-sm font-medium text-riyadh-sky">
                {isArabic ? '✓ شحن مجاني ✓ تتبع فوري' : '✓ Free shipping ✓ Live tracking'}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div 
            className="rounded-2xl p-8 lg:p-12 text-center shadow-xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #165d31 0%, rgba(22, 93, 49, 0.95) 100%)'
            }}
          >
            {/* Background pattern overlay */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30z' fill='white' fill-opacity='0.1'/%3E%3C/svg%3E")`
            }} />
            
            <div className="relative z-10">
              <h2 
                className={`text-3xl lg:text-4xl font-bold mb-4 ${isArabic ? 'font-black' : 'font-extrabold'}`}
                style={{ color: '#ffffff' }}
              >
                {isArabic ? 'ابدأ البحث عن قطع الغيار الآن' : 'Start Finding Parts Now'}
              </h2>
              <p 
                className={`text-lg mb-8 ${isArabic ? 'font-medium' : 'font-normal'}`}
                style={{ color: 'rgba(255, 255, 255, 0.95)' }}
              >
                {isArabic 
                  ? 'انضم لأكثر من 15,000 عميل يثقون بنا في توفير قطع الغيار' 
                  : 'Join over 15,000 customers who trust us for their auto parts needs'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  type="button"
                  className={`
                    inline-flex items-center justify-center gap-2 
                    px-6 py-3 lg:px-8 lg:py-4
                    text-lg font-semibold
                    rounded-lg shadow-lg
                    transition-all duration-200 ease-in-out
                    transform hover:scale-105 active:scale-95
                    ${isArabic ? 'font-bold' : 'font-semibold'}
                  `}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#165d31',
                    border: 'none'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  }}
                  onClick={() => {
                    // Navigate to search or trigger search
                    const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
                    if (searchInput) {
                      searchInput.focus();
                      searchInput.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <Search className="h-5 w-5" />
                  {isArabic ? 'ابحث عن قطع الغيار' : 'Search Parts'}
                </button>
                
                <button
                  type="button"
                  className={`
                    inline-flex items-center justify-center gap-2 
                    px-6 py-3 lg:px-8 lg:py-4
                    text-lg font-semibold
                    rounded-lg
                    transition-all duration-200 ease-in-out
                    transform hover:scale-105 active:scale-95
                    ${isArabic ? 'font-bold' : 'font-semibold'}
                  `}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#ffffff',
                    border: '2px solid #ffffff'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.color = '#165d31';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onClick={() => {
                    // Navigate to seller registration
                    router.push(`/${locale}/seller/register`);
                  }}
                >
                  <Users className="h-5 w-5" />
                  {isArabic ? 'سجل كبائع' : 'Register as Seller'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}