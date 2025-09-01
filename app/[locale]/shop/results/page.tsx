'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { SARSymbol } from '@/components/ui/currency-symbol';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { Filter, Search, SlidersHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Listing {
  id: string;
  titleAr: string;
  titleEn?: string;
  priceSar: number;
  make: string;
  model: string;
  fromYear: number;
  toYear: number;
  condition: string;
  city: string;
  photos: Array<{ url: string }>;
}

const conditionLabels: Record<string, Record<string, string>> = {
  NEW: { ar: 'جديد', en: 'New' },
  REFURBISHED: { ar: 'مجدد', en: 'Refurbished' },
  USED: { ar: 'مستعمل', en: 'Used' },
};

export default function SearchResultsPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    make: searchParams.get('make') || '',
    model: searchParams.get('model') || '',
    condition: searchParams.get('condition') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    yearFrom: searchParams.get('yearFrom') || '',
    yearTo: searchParams.get('yearTo') || '',
  });
  
  const [priceRange, setPriceRange] = useState([0, 50000]);
  
  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.make) params.append('make', filters.make);
      if (filters.model) params.append('model', filters.model);
      if (filters.condition) params.append('condition', filters.condition);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.yearFrom) params.append('yearFrom', filters.yearFrom);
      if (filters.yearTo) params.append('yearTo', filters.yearTo);
      
      const response = await fetch(`/api/listings?${params.toString()}`);
      const data = await response.json();
      setListings(data.listings || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchListings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleSearch = () => {
    fetchListings();
  };
  
  const clearFilters = () => {
    setFilters({
      search: '',
      make: '',
      model: '',
      condition: '',
      minPrice: '',
      maxPrice: '',
      yearFrom: '',
      yearTo: '',
    });
    setPriceRange([0, 50000]);
  };
  
  const FilterSection = (
    <div className="space-y-6">
      <div>
        <Label htmlFor="search">{isArabic ? 'البحث' : 'Search'}</Label>
        <div className="mt-2 flex gap-2">
          <Input
            id="search"
            placeholder={isArabic ? 'ابحث عن قطع غيار...' : 'Search for parts...'}
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <Button onClick={handleSearch} size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <Label htmlFor="make">{isArabic ? 'الشركة المصنعة' : 'Make'}</Label>
        <Input
          id="make"
          className="mt-2"
          placeholder={isArabic ? 'مثال: Toyota' : 'e.g., Toyota'}
          value={filters.make}
          onChange={(e) => setFilters({ ...filters, make: e.target.value })}
        />
      </div>
      
      <div>
        <Label htmlFor="model">{isArabic ? 'الموديل' : 'Model'}</Label>
        <Input
          id="model"
          className="mt-2"
          placeholder={isArabic ? 'مثال: Camry' : 'e.g., Camry'}
          value={filters.model}
          onChange={(e) => setFilters({ ...filters, model: e.target.value })}
        />
      </div>
      
      <div>
        <Label htmlFor="condition">{isArabic ? 'الحالة' : 'Condition'}</Label>
        <Select
          value={filters.condition || 'all'}
          onValueChange={(value) => setFilters({ ...filters, condition: value === 'all' ? '' : value })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder={isArabic ? 'اختر الحالة' : 'Select condition'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isArabic ? 'الكل' : 'All'}</SelectItem>
            <SelectItem value="NEW">{conditionLabels.NEW[locale as 'ar' | 'en']}</SelectItem>
            <SelectItem value="REFURBISHED">{conditionLabels.REFURBISHED[locale as 'ar' | 'en']}</SelectItem>
            <SelectItem value="USED">{conditionLabels.USED[locale as 'ar' | 'en']}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>{isArabic ? 'نطاق السعر' : 'Price Range'}</Label>
        <div className="mt-2 space-y-3">
          <Slider
            value={priceRange}
            onValueChange={(value) => {
              setPriceRange(value);
              setFilters({
                ...filters,
                minPrice: value[0].toString(),
                maxPrice: value[1].toString(),
              });
            }}
            max={50000}
            step={500}
            className="mt-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              {priceRange[0].toLocaleString()}
              <SARSymbol className="h-3 w-3" />
            </span>
            <span className="flex items-center gap-1">
              {priceRange[1].toLocaleString()}
              <SARSymbol className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="yearFrom">{isArabic ? 'من سنة' : 'From Year'}</Label>
          <Input
            id="yearFrom"
            type="number"
            className="mt-2"
            placeholder="2015"
            value={filters.yearFrom}
            onChange={(e) => setFilters({ ...filters, yearFrom: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="yearTo">{isArabic ? 'إلى سنة' : 'To Year'}</Label>
          <Input
            id="yearTo"
            type="number"
            className="mt-2"
            placeholder="2023"
            value={filters.yearTo}
            onChange={(e) => setFilters({ ...filters, yearTo: e.target.value })}
          />
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button onClick={handleSearch} className="flex-1">
          {isArabic ? 'تطبيق الفلاتر' : 'Apply Filters'}
        </Button>
        <Button onClick={clearFilters} variant="outline">
          {isArabic ? 'مسح' : 'Clear'}
        </Button>
      </div>
    </div>
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isArabic ? 'نتائج البحث' : 'Search Results'}
          </h1>
          <Button 
            variant="link" 
            className="p-0 h-auto mt-1"
            onClick={() => router.push(`/${locale}/shop/search`)}
          >
            <SlidersHorizontal className="me-2 h-4 w-4" />
            {isArabic ? 'بحث متقدم' : 'Advanced Search'}
          </Button>
        </div>
        
        {/* Mobile Filter Button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden">
              <Filter className="me-2 h-4 w-4" />
              {isArabic ? 'الفلاتر' : 'Filters'}
            </Button>
          </SheetTrigger>
          <SheetContent side={isArabic ? 'right' : 'left'}>
            <SheetHeader>
              <SheetTitle>{isArabic ? 'الفلاتر' : 'Filters'}</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              {FilterSection}
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Desktop Filters */}
        <aside className="hidden lg:block">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'الفلاتر' : 'Filters'}</CardTitle>
            </CardHeader>
            <CardContent>
              {FilterSection}
            </CardContent>
          </Card>
        </aside>
        
        {/* Results Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="p-0">
                    <Skeleton className="aspect-square" />
                  </CardHeader>
                  <CardContent className="p-4">
                    <Skeleton className="mb-2 h-6 w-3/4" />
                    <Skeleton className="mb-2 h-4 w-1/2" />
                    <Skeleton className="h-8 w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {isArabic ? 'لا توجد نتائج' : 'No results found'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="p-0">
                    <div className="aspect-square bg-muted flex items-center justify-center relative">
                      {listing.photos && listing.photos.length > 0 ? (
                        <Image 
                          src={listing.photos[0].url} 
                          alt={isArabic ? listing.titleAr : listing.titleEn || listing.titleAr}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-4xl text-muted-foreground">📦</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="mb-2 line-clamp-2">
                      {isArabic ? listing.titleAr : listing.titleEn || listing.titleAr}
                    </CardTitle>
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="secondary">
                        {conditionLabels[listing.condition]?.[locale as 'ar' | 'en'] || listing.condition}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {listing.make} {listing.model}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {listing.fromYear} - {listing.toYear}
                    </div>
                    <div className="text-2xl font-bold flex items-center gap-1">
                      {listing.priceSar.toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                      <SARSymbol className="h-5 w-5" />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {listing.city}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button className="w-full" asChild>
                      <Link href={`/${locale}/shop/listing/${listing.id}`}>
                        {isArabic ? 'عرض التفاصيل' : 'View Details'}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}