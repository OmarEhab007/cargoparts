'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SARSymbol } from '@/components/ui/currency-symbol';
import { QuickAddToCart } from '@/components/features/quick-add-to-cart';
import Link from 'next/link';
import Image from 'next/image';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';

const conditionLabels: Record<string, Record<string, string>> = {
  NEW: { ar: 'جديد', en: 'New' },
  REFURBISHED: { ar: 'مجدد', en: 'Refurbished' },
  USED: { ar: 'مستعمل', en: 'Used' },
};

const categories = {
  ar: ['المحركات', 'ناقل الحركة', 'الفرامل', 'التعليق', 'الكهرباء', 'الهيكل', 'الإطارات', 'أخرى'],
  en: ['Engines', 'Transmission', 'Brakes', 'Suspension', 'Electrical', 'Body', 'Tires', 'Other']
};

// Map categories to search keywords
const categoryKeywords: Record<string, string[]> = {
  'المحركات': ['محرك', 'engine', 'motor'],
  'Engines': ['محرك', 'engine', 'motor'],
  'ناقل الحركة': ['ناقل', 'قير', 'transmission', 'gearbox'],
  'Transmission': ['ناقل', 'قير', 'transmission', 'gearbox'],
  'الفرامل': ['فرامل', 'brake', 'مكابح'],
  'Brakes': ['فرامل', 'brake', 'مكابح'],
  'التعليق': ['تعليق', 'suspension', 'مساعد'],
  'Suspension': ['تعليق', 'suspension', 'مساعد'],
  'الكهرباء': ['كهرب', 'electrical', 'بطارية', 'battery'],
  'Electrical': ['كهرب', 'electrical', 'بطارية', 'battery'],
  'الهيكل': ['هيكل', 'body', 'باب', 'door'],
  'Body': ['هيكل', 'body', 'باب', 'door'],
  'الإطارات': ['إطار', 'tire', 'عجل', 'wheel'],
  'Tires': ['إطار', 'tire', 'عجل', 'wheel'],
  'أخرى': [],
  'Other': []
};

const carMakes = ['Toyota', 'Honda', 'Nissan', 'Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Hyundai', 'Kia', 'Mazda'];

interface Listing {
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

interface ShopClientProps {
  initialListings: Listing[];
}

export default function ShopClient({ initialListings }: ShopClientProps) {
  const locale = useLocale();
  const router = useRouter();
  const isArabic = locale === 'ar';
  
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      // If category is selected, use its keywords for search
      if (selectedCategory && categoryKeywords[selectedCategory]) {
        const keywords = categoryKeywords[selectedCategory];
        if (keywords.length > 0) {
          // Use the first keyword as the primary search term
          params.append('search', keywords[0]);
        }
      } else if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      if (selectedMake) params.append('make', selectedMake);
      if (selectedCondition) params.append('condition', selectedCondition);
      
      const response = await fetch(`/api/listings?${params.toString()}`);
      const data = await response.json();
      
      // If category is selected, filter results client-side for better accuracy
      let filteredListings = data.listings || [];
      if (selectedCategory && categoryKeywords[selectedCategory]) {
        const keywords = categoryKeywords[selectedCategory];
        if (keywords.length > 0) {
          filteredListings = filteredListings.filter((listing: Listing) => {
            const title = (listing.titleAr + ' ' + (listing.titleEn || '')).toLowerCase();
            return keywords.some(keyword => title.includes(keyword.toLowerCase()));
          });
        }
      }
      
      setListings(filteredListings);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (selectedMake || selectedCondition || searchQuery || selectedCategory) {
      fetchListings();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMake, selectedCondition, selectedCategory]);
  
  const handleSearch = () => {
    // Clear category selection when manually searching
    if (searchQuery && selectedCategory) {
      setSelectedCategory('');
    }
    fetchListings();
  };
  
  const handleAdvancedSearch = () => {
    router.push(`/${locale}/shop/search`);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search and Filters Bar */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={isArabic ? 'ابحث عن قطع غيار...' : 'Search for parts...'}
              className="ps-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch}>
            {isArabic ? 'بحث' : 'Search'}
          </Button>
          <Button variant="outline" onClick={handleAdvancedSearch}>
            <SlidersHorizontal className="me-2 h-4 w-4" />
            {isArabic ? 'بحث متقدم' : 'Advanced Search'}
          </Button>
        </div>
        
        <div className="flex gap-4 flex-wrap items-end">
          <div className="flex-1 min-w-[200px]">
            <Label>{isArabic ? 'الشركة المصنعة' : 'Make'}</Label>
            <Select 
              value={selectedMake || 'all'} 
              onValueChange={(value) => setSelectedMake(value === 'all' ? '' : value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={isArabic ? 'اختر الشركة' : 'Select make'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {isArabic ? 'جميع الشركات' : 'All Makes'}
                </SelectItem>
                {carMakes.map(make => (
                  <SelectItem key={make} value={make}>
                    {make}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <Label>{isArabic ? 'الحالة' : 'Condition'}</Label>
            <Select 
              value={selectedCondition || 'all'} 
              onValueChange={(value) => setSelectedCondition(value === 'all' ? '' : value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={isArabic ? 'اختر الحالة' : 'Select condition'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {isArabic ? 'جميع الحالات' : 'All Conditions'}
                </SelectItem>
                <SelectItem value="NEW">{conditionLabels.NEW[locale as 'ar' | 'en']}</SelectItem>
                <SelectItem value="REFURBISHED">{conditionLabels.REFURBISHED[locale as 'ar' | 'en']}</SelectItem>
                <SelectItem value="USED">{conditionLabels.USED[locale as 'ar' | 'en']}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {(selectedMake || selectedCondition || searchQuery || selectedCategory) && (
            <Button 
              variant="ghost" 
              onClick={() => {
                setSelectedMake('');
                setSelectedCondition('');
                setSearchQuery('');
                setSelectedCategory('');
                setListings(initialListings);
              }}
            >
              {isArabic ? 'مسح الفلاتر' : 'Clear Filters'}
            </Button>
          )}
        </div>
      </div>
      
      {/* Categories */}
      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">
          {isArabic ? 'الفئات' : 'Categories'}
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories[locale as 'ar' | 'en'].map((category, index) => (
            <Button 
              key={index}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(selectedCategory === category ? '' : category)}
              className={cn(
                "whitespace-nowrap transition-all",
                selectedCategory === category && "ring-2 ring-primary ring-offset-2"
              )}
            >
              {category}
              {selectedCategory === category && (
                <span className="ms-2 inline-flex h-2 w-2 rounded-full bg-white animate-pulse" />
              )}
            </Button>
          ))}
        </div>
      </section>
      
      {/* Listings */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {isArabic ? 'القطع المتاحة' : 'Available Parts'}
          </h2>
          <p className="text-muted-foreground">
            {listings.length} {isArabic ? 'قطعة' : 'items'}
          </p>
        </div>
        
        {loading ? (
          <div className="text-center py-16">
            {isArabic ? 'جاري التحميل...' : 'Loading...'}
          </div>
        ) : listings.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground">
                {isArabic ? 'لا توجد قطع متاحة' : 'No parts available'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden card-hover group">
                <CardHeader className="p-0">
                  <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
                    {listing.photos && listing.photos.length > 0 ? (
                      <Image 
                        src={listing.photos[0].url} 
                        alt={isArabic ? listing.titleAr : listing.titleEn || listing.titleAr}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <ImagePlaceholder 
                        className="w-full h-full"
                        type={
                          listing.titleAr.includes('محرك') || listing.titleEn?.includes('Engine') ? 'engine' :
                          listing.titleAr.includes('فرامل') || listing.titleEn?.includes('Brake') ? 'brake' :
                          listing.titleAr.includes('ناقل') || listing.titleEn?.includes('Transmission') ? 'transmission' :
                          listing.titleAr.includes('كهرب') || listing.titleEn?.includes('Electric') ? 'electrical' :
                          'part'
                        }
                        size="lg"
                      />
                    )}
                    {listing.condition === 'NEW' && (
                      <div className="absolute top-2 start-2 px-2 py-1 bg-green-500/90 text-white text-xs font-semibold rounded-full flex items-center gap-1 backdrop-blur-sm">
                        <Sparkles className="h-3 w-3" />
                        {isArabic ? 'جديد' : 'New'}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <h3 className="card-title-enhanced line-clamp-2 group-hover:text-primary transition-colors">
                    {isArabic ? listing.titleAr : listing.titleEn || listing.titleAr}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={listing.condition === 'NEW' ? 'default' : 'secondary'}
                      className={cn(
                        "badge-modern badge-text",
                        listing.condition === 'NEW' && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                        listing.condition === 'USED' && "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                        listing.condition === 'REFURBISHED' && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                      )}
                    >
                      {conditionLabels[listing.condition]?.[locale as 'ar' | 'en'] || listing.condition}
                    </Badge>
                    <span className="text-label text-muted-foreground font-medium">
                      {listing.make} {listing.model}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-detail inline-block px-2.5 py-1 bg-muted/50 rounded-full font-medium">
                      {listing.fromYear} - {listing.toYear}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1">
                      <span className="text-price text-primary">
                        {listing.priceSar.toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                      </span>
                      <SARSymbol className="h-5 w-5 text-primary/80" />
                    </div>
                    <div className="text-detail text-muted-foreground flex items-center gap-1.5 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                      {listing.city}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex gap-2">
                  <Button 
                    className="flex-1 btn-hover" 
                    variant="outline" 
                    asChild
                  >
                    <Link href={`/${locale}/shop/listing/${listing.id}`}>
                      {isArabic ? 'عرض التفاصيل' : 'View Details'}
                    </Link>
                  </Button>
                  <div className="btn-hover">
                    <QuickAddToCart listing={listing} size="default" />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}