'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { SARSymbol } from '@/components/ui/currency-symbol';
import { 
  Search, 
  Filter, 
  Package, 
  MapPin,
  ChevronRight,
  X,
  SlidersHorizontal
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const carMakes = ['Toyota', 'Honda', 'Nissan', 'Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Hyundai', 'Kia', 'Mazda'];
const conditions = [
  { value: 'NEW', labelEn: 'New', labelAr: 'جديد' },
  { value: 'USED', labelEn: 'Used', labelAr: 'مستعمل' },
  { value: 'REFURBISHED', labelEn: 'Refurbished', labelAr: 'مجدد' },
];

interface Listing {
  id: string;
  titleAr: string;
  titleEn: string | null;
  description: string | null;
  priceSar: number;
  make: string;
  model: string;
  fromYear: number;
  toYear: number;
  condition: string;
  city: string;
  seller: {
    yardName: string;
  };
  photos: { url: string }[];
}

export default function AdvancedSearchPage() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const isArabic = locale === 'ar';
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedMake, setSelectedMake] = useState(searchParams.get('make') || '');
  const [selectedModel, setSelectedModel] = useState(searchParams.get('model') || '');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  
  useEffect(() => {
    performSearch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);
  
  const performSearch = async () => {
    setLoading(true);
    
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedMake) params.append('make', selectedMake);
    if (selectedModel) params.append('model', selectedModel);
    if (selectedConditions.length > 0) {
      selectedConditions.forEach(c => params.append('condition', c));
    }
    if (priceRange[0] > 0) params.append('minPrice', priceRange[0].toString());
    if (priceRange[1] < 50000) params.append('maxPrice', priceRange[1].toString());
    if (yearFrom) params.append('yearFrom', yearFrom);
    if (yearTo) params.append('yearTo', yearTo);
    params.append('page', page.toString());
    
    try {
      const response = await fetch(`/api/listings?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setListings(data.listings || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = () => {
    setPage(1);
    performSearch();
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedMake('');
    setSelectedModel('');
    setSelectedConditions([]);
    setPriceRange([0, 50000]);
    setYearFrom('');
    setYearTo('');
    setPage(1);
  };
  
  const toggleCondition = (condition: string) => {
    setSelectedConditions(prev =>
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };
  
  const FilterSection = (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <Label htmlFor="search">
          {isArabic ? 'البحث' : 'Search'}
        </Label>
        <div className="relative mt-2">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isArabic ? 'ابحث عن قطع غيار...' : 'Search for parts...'}
            className="ps-10"
          />
        </div>
      </div>
      
      {/* Make & Model */}
      <div className="space-y-3">
        <div>
          <Label htmlFor="make">
            {isArabic ? 'الشركة المصنعة' : 'Make'}
          </Label>
          <Select value={selectedMake || 'all'} onValueChange={(value) => setSelectedMake(value === 'all' ? '' : value)}>
            <SelectTrigger className="mt-2">
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
        
        <div>
          <Label htmlFor="model">
            {isArabic ? 'الموديل' : 'Model'}
          </Label>
          <Input
            id="model"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            placeholder={isArabic ? 'أدخل الموديل' : 'Enter model'}
            className="mt-2"
          />
        </div>
      </div>
      
      {/* Year Range */}
      <div>
        <Label>{isArabic ? 'سنة الصنع' : 'Year Range'}</Label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Input
            type="number"
            value={yearFrom}
            onChange={(e) => setYearFrom(e.target.value)}
            placeholder={isArabic ? 'من' : 'From'}
            min="1990"
            max="2025"
          />
          <Input
            type="number"
            value={yearTo}
            onChange={(e) => setYearTo(e.target.value)}
            placeholder={isArabic ? 'إلى' : 'To'}
            min="1990"
            max="2025"
          />
        </div>
      </div>
      
      {/* Condition */}
      <div>
        <Label>{isArabic ? 'الحالة' : 'Condition'}</Label>
        <div className="mt-2 space-y-2">
          {conditions.map(condition => (
            <div key={condition.value} className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id={condition.value}
                checked={selectedConditions.includes(condition.value)}
                onCheckedChange={() => toggleCondition(condition.value)}
              />
              <Label
                htmlFor={condition.value}
                className="text-sm font-normal cursor-pointer"
              >
                {isArabic ? condition.labelAr : condition.labelEn}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Price Range */}
      <div>
        <Label>{isArabic ? 'نطاق السعر' : 'Price Range'}</Label>
        <div className="mt-4 space-y-3">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            min={0}
            max={50000}
            step={100}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              {priceRange[0].toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
              <SARSymbol className="h-3 w-3" />
            </span>
            <span className="flex items-center gap-1">
              {priceRange[1].toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
              <SARSymbol className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="space-y-2">
        <Button onClick={handleSearch} className="w-full">
          <Search className="me-2 h-4 w-4" />
          {isArabic ? 'بحث' : 'Search'}
        </Button>
        <Button onClick={clearFilters} variant="outline" className="w-full">
          <X className="me-2 h-4 w-4" />
          {isArabic ? 'مسح الفلاتر' : 'Clear Filters'}
        </Button>
      </div>
    </div>
  );
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          {isArabic ? 'البحث المتقدم' : 'Advanced Search'}
        </h1>
        <p className="text-muted-foreground">
          {isArabic 
            ? 'استخدم الفلاتر للعثور على القطع المناسبة'
            : 'Use filters to find the right parts for your vehicle'}
        </p>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Desktop Filters */}
        <div className="hidden lg:block">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                {isArabic ? 'الفلاتر' : 'Filters'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {FilterSection}
            </CardContent>
          </Card>
        </div>
        
        {/* Mobile Filters */}
        <div className="lg:hidden">
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full mb-4">
                <SlidersHorizontal className="me-2 h-4 w-4" />
                {isArabic ? 'الفلاتر' : 'Filters'}
              </Button>
            </SheetTrigger>
            <SheetContent side={isArabic ? 'right' : 'left'}>
              <SheetHeader>
                <SheetTitle>{isArabic ? 'الفلاتر' : 'Filters'}</SheetTitle>
                <SheetDescription>
                  {isArabic 
                    ? 'حدد معايير البحث'
                    : 'Set your search criteria'}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                {FilterSection}
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        {/* Results */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="text-center py-16">
              {isArabic ? 'جاري البحث...' : 'Searching...'}
            </div>
          ) : listings.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Package className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                <h2 className="mb-2 text-xl font-semibold">
                  {isArabic ? 'لم يتم العثور على نتائج' : 'No results found'}
                </h2>
                <p className="text-muted-foreground">
                  {isArabic 
                    ? 'جرب تغيير معايير البحث'
                    : 'Try adjusting your search criteria'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {isArabic 
                    ? `عُثر على ${total || listings.length} قطعة`
                    : `Found ${total || listings.length} part${(total || listings.length) !== 1 ? 's' : ''}`}
                </p>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {listings.map((listing) => (
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
                    <CardHeader className="pb-3">
                      <CardTitle className="line-clamp-1 text-base">
                        {isArabic ? listing.titleAr : listing.titleEn || listing.titleAr}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{listing.make} {listing.model}</span>
                        <span>•</span>
                        <span>{listing.fromYear}-{listing.toYear}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xl font-bold flex items-center gap-1">
                          {listing.priceSar.toLocaleString(isArabic ? 'ar-SA' : 'en-US')}
                          <SARSymbol className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {listing.city}
                        </div>
                      </div>
                      <Button className="w-full" size="sm" asChild>
                        <Link href={`/${locale}/shop/listing/${listing.id}`}>
                          {isArabic ? 'عرض التفاصيل' : 'View Details'}
                          <ChevronRight className="ms-2 h-4 w-4 rotate-180 rtl:rotate-0" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Pagination */}
              {total > 20 && (
                <div className="mt-8 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    {isArabic ? 'السابق' : 'Previous'}
                  </Button>
                  <span className="flex items-center px-4">
                    {isArabic 
                      ? `صفحة ${page} من ${Math.ceil(total / 20)}`
                      : `Page ${page} of ${Math.ceil(total / 20)}`}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= Math.ceil(total / 20)}
                  >
                    {isArabic ? 'التالي' : 'Next'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}