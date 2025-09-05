'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Shield, 
  Truck, 
  Users,
  MapPin,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Sparkles,
  Zap,
  Star
} from 'lucide-react';

interface LandingClientProps {}

export default function LandingClient({}: LandingClientProps) {
  const router = useRouter();
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  
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
            <form onSubmit={handleSearch} className="mx-auto max-w-4xl">
              <div className="relative">
                {/* Main search container with premium styling */}
                <div className="relative bg-white/95 backdrop-blur-lg p-6 rounded-3xl border-2 border-saudi-green/20 focus-within:border-saudi-green/40 shadow-2xl hover:shadow-3xl transition-all duration-500">
                  {/* Gradient overlay for premium look */}
                  <div className="absolute inset-0 bg-gradient-to-r from-saudi-green/5 via-transparent to-desert-gold/5 rounded-3xl pointer-events-none"></div>
                  
                  <div className="relative flex gap-4 items-center">
                    <div className="relative flex-1">
                      <div className="absolute start-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                        <div className="w-10 h-10 bg-saudi-green/10 rounded-full flex items-center justify-center">
                          <Search className="h-5 w-5 text-saudi-green" />
                        </div>
                        <div className="h-8 w-px bg-saudi-green/20"></div>
                      </div>
                      <Input
                        type="search"
                        placeholder={isArabic 
                          ? 'ابحث عن أي قطعة غيار... كامري، محرك، فرامل، مرآة جانبية'
                          : 'Search for any part... Camry, engine, brakes, side mirror'}
                        className={cn(
                          "ps-20 pe-6 h-18 text-xl bg-white/90 border-2 border-saudi-green/15 rounded-2xl",
                          "focus-visible:ring-4 focus-visible:ring-saudi-green/20 focus-visible:ring-offset-0",
                          "focus-visible:border-saudi-green/40 focus-visible:bg-white",
                          "placeholder:text-muted-foreground/70",
                          "font-semibold shadow-inner transition-all duration-300",
                          "hover:border-saudi-green/25 hover:bg-white",
                          isArabic && "text-xl font-bold"
                        )}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      {/* Enhanced search indicator */}
                      {searchQuery && (
                        <div className="absolute end-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          <div className="w-3 h-3 bg-saudi-green rounded-full animate-pulse"></div>
                          <span className="text-xs font-medium text-saudi-green animate-pulse">
                            {isArabic ? 'جاري البحث...' : 'Searching...'}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button 
                      size="lg" 
                      type="submit" 
                      className={cn(
                        "h-18 px-10 rounded-2xl font-bold text-xl shadow-xl",
                        "bg-saudi-green hover:bg-saudi-green-dark",
                        "text-white border-2 border-saudi-green-dark",
                        "hover:shadow-2xl hover:scale-105 hover:-translate-y-1",
                        "hover:border-saudi-green hover:bg-saudi-green-light",
                        "focus:ring-4 focus:ring-saudi-green/30 focus:ring-offset-2",
                        "transition-all duration-300",
                        "active:scale-95 active:translate-y-0",
                        "font-black tracking-wide"
                      )}
                    >
                      <Search className="me-3 h-6 w-6" />
                      {isArabic ? 'ابحث الآن' : 'Search Now'}
                    </Button>
                  </div>
                </div>
                
                {/* Enhanced stats and social proof */}
                <div className="mt-6 text-center space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 bg-saudi-green rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-white text-xs font-bold">5</span>
                      </div>
                      <div className="w-8 h-8 bg-desert-gold rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-saudi-green text-xs font-bold">★</span>
                      </div>
                      <div className="w-8 h-8 bg-riyadh-sky rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    </div>
                    <p className={cn(
                      "text-muted-foreground font-medium",
                      isArabic ? "text-base" : "text-sm"
                    )}>
                      {isArabic 
                        ? '🔥 أكثر من 50,000 قطعة أصلية متاحة الآن'
                        : '🔥 Over 50,000 genuine parts available now'}
                    </p>
                  </div>
                  
                  <div className={cn(
                    "flex items-center justify-center gap-6 text-desert-gold font-semibold",
                    isArabic ? "text-sm gap-4" : "text-xs gap-6"
                  )}>
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-saudi-green rounded-full animate-pulse"></div>
                      {isArabic ? '243 مشتري نشط الآن' : '243 active buyers now'}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-desert-gold rounded-full animate-bounce"></div>
                      {isArabic ? '18 طلب في آخر ساعة' : '18 orders last hour'}
                    </span>
                  </div>
                  
                  {/* Popular searches */}
                  <div className="mt-4">
                    <p className={cn(
                      "text-muted-foreground mb-2",
                      isArabic ? "text-sm" : "text-xs"
                    )}>
                      {isArabic ? 'البحث الشائع:' : 'Popular searches:'}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {(isArabic 
                        ? ['كامري', 'محرك', 'فرامل', 'مرآة', 'إطارات']
                        : ['Camry', 'Engine', 'Brakes', 'Mirror', 'Tires']
                      ).map((term, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSearchQuery(term)}
                          className={cn(
                            "px-3 py-1.5 bg-saudi-green/10 hover:bg-saudi-green/20",
                            "text-saudi-green hover:text-saudi-green-dark",
                            "rounded-full text-xs font-medium",
                            "transition-colors duration-200 cursor-pointer"
                          )}
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>


      {/* How It Works Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-muted/30 via-background to-saudi-green/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-saudi-green mb-4">
              {isArabic ? 'كيف تعمل المنصة؟' : 'How It Works?'}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isArabic 
                ? 'في ثلاث خطوات بسيطة، ابحث عن قطع الغيار التي تحتاجها واشتريها بأمان من بائعين موثوقين'
                : 'In three simple steps, find the spare parts you need and buy them safely from trusted sellers'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1: Search */}
            <div className="text-center group flex flex-col">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-saudi-green text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-xl group-hover:scale-110 transition-transform duration-300">
                  1
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 left-full w-8 h-0.5 bg-saudi-green/30 hidden md:block">
                  <div className="absolute top-1/2 -translate-y-1/2 right-0 w-0 h-0 border-l-4 border-l-saudi-green/30 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                </div>
              </div>
              <div className="bg-background/80 backdrop-blur-sm p-6 rounded-lg border border-saudi-green/10 shadow-lg group-hover:shadow-xl transition-all duration-300 flex-1 flex flex-col">
                <div className="w-16 h-16 bg-saudi-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-saudi-green" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-saudi-green">
                  {isArabic ? 'ابحث عن قطعتك' : 'Search Your Part'}
                </h3>
                <p className="text-muted-foreground leading-relaxed flex-1">
                  {isArabic 
                    ? 'ادخل تفاصيل سيارتك أو رقم القطعة للعثور على ما تحتاجه'
                    : 'Enter your car details or part number to find what you need from thousands of available parts'
                  }
                </p>
              </div>
            </div>

            {/* Step 2: Compare */}
            <div className="text-center group flex flex-col">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-desert-gold text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-xl group-hover:scale-110 transition-transform duration-300">
                  2
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 left-full w-8 h-0.5 bg-desert-gold/30 hidden md:block">
                  <div className="absolute top-1/2 -translate-y-1/2 right-0 w-0 h-0 border-l-4 border-l-desert-gold/30 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                </div>
              </div>
              <div className="bg-background/80 backdrop-blur-sm p-6 rounded-lg border border-desert-gold/10 shadow-lg group-hover:shadow-xl transition-all duration-300 flex-1 flex flex-col">
                <div className="w-16 h-16 bg-desert-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-desert-gold" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-desert-gold">
                  {isArabic ? 'قارن واختر' : 'Compare & Choose'}
                </h3>
                <p className="text-muted-foreground leading-relaxed flex-1">
                  {isArabic 
                    ? 'قارن الأسعار والجودة والتقييمات من عدة بائعين واختر الأفضل'
                    : 'Compare prices, quality, and ratings from multiple sellers and choose the best for you'
                  }
                </p>
              </div>
            </div>

            {/* Step 3: Purchase */}
            <div className="text-center group flex flex-col">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-riyadh-sky text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-xl group-hover:scale-110 transition-transform duration-300">
                  3
                </div>
              </div>
              <div className="bg-background/80 backdrop-blur-sm p-6 rounded-lg border border-riyadh-sky/10 shadow-lg group-hover:shadow-xl transition-all duration-300 flex-1 flex flex-col">
                <div className="w-16 h-16 bg-riyadh-sky/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-riyadh-sky" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-riyadh-sky">
                  {isArabic ? 'اشتري بأمان' : 'Buy Securely'}
                </h3>
                <p className="text-muted-foreground leading-relaxed flex-1">
                  {isArabic 
                    ? 'ادفع بأمان واستلم قطعتك مع ضمان الجودة وحماية المشتري'
                    : 'Pay securely and receive your part with quality guarantee and complete buyer protection'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <Button
              size="lg"
              className="btn-saudi-enhanced px-8 py-4 text-lg font-semibold"
              onClick={() => router.push(`/${locale}/shop`)}
            >
              <Search className="me-2 h-5 w-5" />
              {isArabic ? 'ابدأ البحث الآن' : 'Start Searching Now'}
            </Button>
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
                <Button
                  size="lg"
                  className={cn(
                    "inline-flex items-center justify-center gap-3",
                    "px-8 py-4 lg:px-10 lg:py-5",
                    "text-lg font-bold h-auto",
                    "rounded-xl shadow-xl",
                    "bg-white text-saudi-green border-2 border-white/20",
                    "hover:bg-white/95 hover:text-saudi-green-dark",
                    "hover:shadow-2xl hover:scale-105 hover:-translate-y-1",
                    "active:scale-95 active:translate-y-0",
                    "transition-all duration-300",
                    "backdrop-blur-sm",
                    isArabic ? 'font-black text-xl' : 'font-bold'
                  )}
                  onClick={() => {
                    // Navigate to search or trigger search
                    const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
                    if (searchInput) {
                      searchInput.focus();
                      searchInput.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <Search className="h-6 w-6" />
                  {isArabic ? 'ابحث عن قطع الغيار' : 'Search Parts'}
                </Button>
                
                <Button
                  size="lg"
                  className={cn(
                    "inline-flex items-center justify-center gap-3",
                    "px-8 py-4 lg:px-10 lg:py-5",
                    "text-lg font-bold h-auto",
                    "rounded-xl shadow-xl",
                    "bg-transparent text-white border-2 border-white",
                    "hover:shadow-2xl hover:scale-105 hover:-translate-y-1",
                    "active:scale-95 active:translate-y-0",
                    "transition-all duration-300",
                    "backdrop-blur-sm",
                    isArabic ? 'font-black text-xl' : 'font-bold'
                  )}
                  onClick={() => {
                    // Navigate to seller registration via auth page
                    router.push(`/${locale}/auth?mode=register&role=seller`);
                  }}
                >
                  <Users className="h-6 w-6" />
                  {isArabic ? 'سجل كبائع' : 'Register as Seller'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}