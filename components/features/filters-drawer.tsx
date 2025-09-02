'use client';

import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Filter, 
  X, 
  SlidersHorizontal,
  Star,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useState } from 'react';

interface FiltersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMake: string;
  selectedCondition: string;
  onMakeChange: (make: string) => void;
  onConditionChange: (condition: string) => void;
  onClearFilters: () => void;
}

const conditionLabels: Record<string, Record<string, string>> = {
  NEW: { ar: 'جديد', en: 'New' },
  REFURBISHED: { ar: 'مجدد', en: 'Refurbished' },
  USED: { ar: 'مستعمل', en: 'Used' },
};

const carMakes = ['Toyota', 'Honda', 'Nissan', 'Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Hyundai', 'Kia', 'Mazda'];

const cities = {
  ar: ['الرياض', 'جدة', 'الدمام', 'مكة', 'المدينة', 'الطائف', 'الخبر', 'تبوك', 'الأحساء', 'الجبيل'],
  en: ['Riyadh', 'Jeddah', 'Dammam', 'Makkah', 'Madinah', 'Taif', 'Khobar', 'Tabuk', 'Al-Ahsa', 'Jubail']
};

export function FiltersDrawer({
  open,
  onOpenChange,
  selectedMake,
  selectedCondition,
  onMakeChange,
  onConditionChange,
  onClearFilters
}: FiltersDrawerProps) {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  
  // Additional filter states
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [yearRange, setYearRange] = useState([2000, 2025]);
  const [selectedCity, setSelectedCity] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [warrantyOnly, setWarrantyOnly] = useState(false);
  const [verifiedSellersOnly, setVerifiedSellersOnly] = useState(false);

  const activeFiltersCount = [
    selectedMake,
    selectedCondition,
    selectedCity,
    minRating > 0,
    warrantyOnly,
    verifiedSellersOnly
  ].filter(Boolean).length;

  const handleClearAll = () => {
    onClearFilters();
    setPriceRange([0, 50000]);
    setYearRange([2000, 2025]);
    setSelectedCity('');
    setMinRating(0);
    setWarrantyOnly(false);
    setVerifiedSellersOnly(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side={isArabic ? 'right' : 'left'}
        className="w-full sm:max-w-md overflow-y-auto"
      >
        <SheetHeader className="text-start">
          <SheetTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {isArabic ? 'تصفية النتائج' : 'Filter Results'}
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            {isArabic 
              ? 'اضبط المعايير للعثور على أفضل القطع'
              : 'Adjust criteria to find the best parts'
            }
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Make Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {isArabic ? 'الشركة المصنعة' : 'Make'}
            </Label>
            <Select 
              value={selectedMake || 'all'} 
              onValueChange={(value) => onMakeChange(value === 'all' ? '' : value)}
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

          {/* Condition Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {isArabic ? 'الحالة' : 'Condition'}
            </Label>
            <Select 
              value={selectedCondition || 'all'} 
              onValueChange={(value) => onConditionChange(value === 'all' ? '' : value)}
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

          <Separator />

          {/* Price Range */}
          <div className="space-y-4">
            <Label className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {isArabic ? 'نطاق السعر (ريال)' : 'Price Range (SAR)'}
            </Label>
            <div className="space-y-3">
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={100000}
                min={0}
                step={500}
                className="w-full"
              />
              <div className="flex items-center gap-2 text-sm">
                <Input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                  className="w-full"
                  placeholder="Min"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 50000])}
                  className="w-full"
                  placeholder="Max"
                />
              </div>
              <div className="text-xs text-muted-foreground text-center">
                {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} {isArabic ? 'ريال' : 'SAR'}
              </div>
            </div>
          </div>

          {/* Year Range */}
          <div className="space-y-4">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {isArabic ? 'سنة الصنع' : 'Model Year'}
            </Label>
            <div className="space-y-3">
              <Slider
                value={yearRange}
                onValueChange={setYearRange}
                max={2025}
                min={1990}
                step={1}
                className="w-full"
              />
              <div className="flex items-center gap-2 text-sm">
                <Input
                  type="number"
                  value={yearRange[0]}
                  onChange={(e) => setYearRange([parseInt(e.target.value) || 1990, yearRange[1]])}
                  className="w-full"
                  placeholder="From"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="number"
                  value={yearRange[1]}
                  onChange={(e) => setYearRange([yearRange[0], parseInt(e.target.value) || 2025])}
                  className="w-full"
                  placeholder="To"
                />
              </div>
              <div className="text-xs text-muted-foreground text-center">
                {yearRange[0]} - {yearRange[1]}
              </div>
            </div>
          </div>

          {/* Location Filter */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {isArabic ? 'المدينة' : 'City'}
            </Label>
            <Select 
              value={selectedCity || 'all'} 
              onValueChange={(value) => setSelectedCity(value === 'all' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={isArabic ? 'اختر المدينة' : 'Select city'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {isArabic ? 'جميع المدن' : 'All Cities'}
                </SelectItem>
                {cities[locale as 'ar' | 'en'].map(city => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seller Rating */}
          <div className="space-y-4">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4" />
              {isArabic ? 'تقييم البائع (الأدنى)' : 'Seller Rating (Min)'}
            </Label>
            <div className="space-y-2">
              <Slider
                value={[minRating]}
                onValueChange={(value) => setMinRating(value[0])}
                max={5}
                min={0}
                step={0.5}
                className="w-full"
              />
              <div className="flex items-center justify-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < minRating 
                        ? "fill-desert-gold text-desert-gold" 
                        : "fill-muted text-muted-foreground"
                    )}
                  />
                ))}
                <span className="text-sm text-muted-foreground ms-2">
                  {minRating.toFixed(1)}+
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Quick Filters */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              {isArabic ? 'فلاتر سريعة' : 'Quick Filters'}
            </Label>
            
            <div className="flex flex-col gap-2">
              <Button
                variant={verifiedSellersOnly ? "default" : "outline"}
                onClick={() => setVerifiedSellersOnly(!verifiedSellersOnly)}
                className="justify-start h-auto p-3"
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-4 h-4 rounded border-2",
                    verifiedSellersOnly ? "bg-saudi-green border-saudi-green" : "border-muted-foreground"
                  )} />
                  {isArabic ? 'بائعون موثقون فقط' : 'Verified sellers only'}
                </div>
              </Button>
              
              <Button
                variant={warrantyOnly ? "default" : "outline"}
                onClick={() => setWarrantyOnly(!warrantyOnly)}
                className="justify-start h-auto p-3"
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-4 h-4 rounded border-2",
                    warrantyOnly ? "bg-saudi-green border-saudi-green" : "border-muted-foreground"
                  )} />
                  {isArabic ? 'مع ضمان فقط' : 'With warranty only'}
                </div>
              </Button>
            </div>
          </div>
        </div>

        <SheetFooter className="mt-6 flex flex-col gap-2">
          <Button 
            onClick={() => onOpenChange(false)}
            className="btn-saudi w-full"
          >
            {isArabic ? 'تطبيق الفلاتر' : 'Apply Filters'}
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ms-2 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          
          {activeFiltersCount > 0 && (
            <Button 
              onClick={handleClearAll}
              variant="outline"
              className="w-full"
            >
              <X className="h-4 w-4 me-2" />
              {isArabic ? 'مسح جميع الفلاتر' : 'Clear All Filters'}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}