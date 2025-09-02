'use client';

import { useState, useEffect, useRef } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Image from 'next/image';
import { Search, SlidersHorizontal, Sparkles, Filter, X, ChevronDown, Grid3X3, List } from 'lucide-react';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { MobileSearch } from '@/components/features/mobile-search';
import { CategoryGrid } from '@/components/features/category-grid';
import { EnhancedProductCard } from '@/components/features/enhanced-product-card';
import { FiltersDrawer } from '@/components/features/filters-drawer';
import { ProductCardSkeleton } from '@/components/features/product-card-skeleton';
import { SearchSuggestions } from '@/components/features/search-suggestions';
import { QuickPreviewModal } from '@/components/features/quick-preview-modal';

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
  viewCount: number;
  isFeatured: boolean;
  seller: {
    id: string;
    businessName: string;
    verified: boolean;
    rating: number;
    city: string;
  };
  photos: { url: string; alt?: string }[];
  reviewCount?: number;
}

interface ShopClientProps {
  initialListings: Listing[];
}

export default function ShopClient({ initialListings }: ShopClientProps) {
  const locale = useLocale();
  const router = useRouter();
  const isArabic = locale === 'ar';
  const filterRef = useRef<HTMLDivElement>(null);
  
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [quickPreviewListing, setQuickPreviewListing] = useState<Listing | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
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
      let filteredListings = data.data || [];
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
  
  // Sticky scroll effect - track filter position
  useEffect(() => {
    let stickyOffset = 0;
    
    const updateStickyOffset = () => {
      if (filterRef.current) {
        // Get the filter's position relative to the document
        const rect = filterRef.current.getBoundingClientRect();
        stickyOffset = rect.top + window.scrollY - 50; // 50px buffer
      }
    };

    const handleScroll = () => {
      const scrolled = window.scrollY;
      setIsSticky(scrolled > stickyOffset);
    };

    // Calculate initial position
    const timer = setTimeout(updateStickyOffset, 100);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateStickyOffset, { passive: true });
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateStickyOffset);
    };
  }, []);

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

  const handleToggleFavorite = (listingId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(listingId)) {
        newFavorites.delete(listingId);
      } else {
        newFavorites.add(listingId);
      }
      return newFavorites;
    });
  };
  
  return (
    <div className="bg-background">
      {/* Enhanced Header with Mobile-First Search */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Mobile Search */}
        <div className="block md:hidden">
          <MobileSearch 
            onSearch={handleSearch}
            placeholder={isArabic ? 'ابحث عن قطع غيار...' : 'Search for parts...'}
          />
        </div>

        {/* Desktop Search & Filters */}
        <div className="hidden md:block space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-saudi-green" />
              <Input
                type="search"
                placeholder={isArabic ? 'ابحث عن قطع غيار...' : 'Search for parts...'}
                className={`ps-10 input-modern h-12 ${isArabic ? 'text-base font-medium' : ''}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              {showSuggestions && searchQuery && (
                <SearchSuggestions
                  query={searchQuery}
                  onSuggestionClick={(suggestion) => {
                    setSearchQuery(suggestion);
                    setShowSuggestions(false);
                    handleSearch();
                  }}
                />
              )}
            </div>
            <Button onClick={handleSearch} className="btn-saudi h-12 px-6">
              {isArabic ? 'بحث' : 'Search'}
            </Button>
            <Button variant="outline" onClick={handleAdvancedSearch} className="h-12 px-4">
              <SlidersHorizontal className="me-2 h-4 w-4" />
              {isArabic ? 'متقدم' : 'Advanced'}
            </Button>
          </div>
          
          {/* Sticky Filter Section */}
          <div>
            {/* Placeholder to prevent layout shift */}
            {isSticky && <div className="h-[60px]" />}
            
            <div 
              ref={filterRef}
              className={cn(
                "transition-all duration-200 ease-in-out bg-background border-b border-transparent",
                isSticky && "fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-border shadow-lg"
              )}
            >
              <div className={cn(
                "flex gap-3 flex-wrap items-end",
                isSticky ? "container mx-auto px-4 py-3" : "py-3"
              )}>
                <div className="flex-1 min-w-[180px] space-y-1">
                  {!isSticky && <Label className={`hierarchy-caption text-xs ${isArabic ? 'font-semibold' : ''}`}>{isArabic ? 'الشركة المصنعة' : 'Make'}</Label>}
                  <Select 
                    value={selectedMake || 'all'} 
                    onValueChange={(value) => setSelectedMake(value === 'all' ? '' : value)}
                  >
                    <SelectTrigger className={cn(
                      "h-9 transition-all",
                      isSticky ? "text-xs" : "text-sm",
                      isArabic && "font-medium"
                    )}>
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
                
                <div className="flex-1 min-w-[180px] space-y-1">
                  {!isSticky && <Label className={`hierarchy-caption text-xs ${isArabic ? 'font-semibold' : ''}`}>{isArabic ? 'الحالة' : 'Condition'}</Label>}
                  <Select 
                    value={selectedCondition || 'all'} 
                    onValueChange={(value) => setSelectedCondition(value === 'all' ? '' : value)}
                  >
                    <SelectTrigger className={cn(
                      "h-9 transition-all",
                      isSticky ? "text-xs" : "text-sm",
                      isArabic && "font-medium"
                    )}>
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

                {/* View Toggle */}
                <div className="flex items-center border rounded-md p-0.5 bg-muted/20">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "p-0 transition-all",
                      isSticky ? "h-7 w-7" : "h-8 w-8"
                    )}
                    title={isArabic ? 'عرض الشبكة' : 'Grid view'}
                  >
                    <Grid3X3 className={cn(isSticky ? "h-3 w-3" : "h-4 w-4")} />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "p-0 transition-all",
                      isSticky ? "h-7 w-7" : "h-8 w-8"
                    )}
                    title={isArabic ? 'عرض القائمة' : 'List view'}
                  >
                    <List className={cn(isSticky ? "h-3 w-3" : "h-4 w-4")} />
                  </Button>
                </div>

                <Button 
                  variant="ghost" 
                  onClick={() => setShowFilters(!showFilters)} 
                  className={cn(
                    "md:hidden transition-all",
                    isSticky ? "h-8 text-xs px-2" : "h-9 px-3",
                    isArabic && "font-semibold"
                  )}
                >
                  <Filter className={cn("me-2", isSticky ? "h-3 w-3" : "h-4 w-4")} />
                  {isArabic ? 'فلاتر' : 'Filters'}
                </Button>
                
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
                    className={cn(
                      "transition-all text-destructive hover:text-destructive",
                      isSticky ? "h-8 text-xs px-2" : "h-9 px-3"
                    )}
                  >
                    <X className={cn("me-1", isSticky ? "h-3 w-3" : "h-4 w-4")} />
                    {isArabic ? 'مسح' : 'Clear'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Filters */}
        <div className={cn("md:hidden space-y-4", !showFilters && "hidden")}>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label className="hierarchy-caption">{isArabic ? 'الشركة المصنعة' : 'Make'}</Label>
              <Select 
                value={selectedMake || 'all'} 
                onValueChange={(value) => setSelectedMake(value === 'all' ? '' : value)}
              >
                <SelectTrigger>
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
            
            <div className="space-y-2">
              <Label className="hierarchy-caption">{isArabic ? 'الحالة' : 'Condition'}</Label>
              <Select 
                value={selectedCondition || 'all'} 
                onValueChange={(value) => setSelectedCondition(value === 'all' ? '' : value)}
              >
                <SelectTrigger>
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
          </div>
        </div>
      </div>

      {/* Enhanced Categories Grid */}
      <section className="container mx-auto px-4 mb-8">
        <CategoryGrid 
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
      </section>
      
      {/* Enhanced Listings */}
      <section className="container mx-auto px-4 pb-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className={`hierarchy-heading ${isArabic ? 'font-extrabold' : ''}`}>
            {isArabic ? 'القطع المتاحة' : 'Available Parts'}
          </h2>
          <div className="flex items-center gap-4">
            <p className={`hierarchy-caption ${isArabic ? 'font-semibold' : ''}`}>
              {listings.length} {isArabic ? 'قطعة متاحة' : 'parts available'}
            </p>
            {favorites.size > 0 && (
              <Badge className="badge-gold">
                {favorites.size} {isArabic ? 'مفضل' : 'favorites'}
              </Badge>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className={cn(
            "grid gap-6",
            viewMode === 'grid' ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
          )}>
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} viewMode={viewMode} />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <div className="card-saudi max-w-md mx-auto">
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-saudi-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-saudi-green" />
                </div>
                <h3 className="hierarchy-subheading mb-2">
                  {isArabic ? 'لم نجد قطع متطابقة' : 'No matching parts found'}
                </h3>
                <p className="hierarchy-body text-muted-foreground mb-4">
                  {isArabic 
                    ? 'جرب تعديل معايير البحث أو تصفح الفئات المختلفة'
                    : 'Try adjusting your search criteria or browse different categories'
                  }
                </p>
                <Button
                  onClick={() => {
                    setSelectedMake('');
                    setSelectedCondition('');
                    setSearchQuery('');
                    setSelectedCategory('');
                    setListings(initialListings);
                  }}
                  className="btn-saudi"
                >
                  {isArabic ? 'مسح جميع الفلاتر' : 'Clear All Filters'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className={cn(
            "grid gap-6",
            viewMode === 'grid' ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
          )}>
            {listings.map((listing) => (
              <EnhancedProductCard
                key={listing.id}
                listing={listing}
                onToggleFavorite={handleToggleFavorite}
                isFavorited={favorites.has(listing.id)}
                onQuickView={() => setQuickPreviewListing(listing)}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </section>

      {/* Mobile Filters Drawer */}
      <FiltersDrawer
        open={showFilters}
        onOpenChange={setShowFilters}
        selectedMake={selectedMake}
        selectedCondition={selectedCondition}
        onMakeChange={setSelectedMake}
        onConditionChange={setSelectedCondition}
        onClearFilters={() => {
          setSelectedMake('');
          setSelectedCondition('');
          setSearchQuery('');
          setSelectedCategory('');
          setListings(initialListings);
        }}
      />

      {/* Quick Preview Modal */}
      <QuickPreviewModal
        listing={quickPreviewListing}
        open={!!quickPreviewListing}
        onOpenChange={(open) => !open && setQuickPreviewListing(null)}
        onToggleFavorite={handleToggleFavorite}
        isFavorited={quickPreviewListing ? favorites.has(quickPreviewListing.id) : false}
      />

      {/* Sticky Top Padding when filter is sticky */}
      {isSticky && <div className="h-20" />}
    </div>
  );
}