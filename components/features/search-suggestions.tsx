'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { Search, Clock, TrendingUp, Car, Wrench } from 'lucide-react';

interface SearchSuggestionsProps {
  query: string;
  onSuggestionClick: (suggestion: string) => void;
  className?: string;
}

// Popular search terms in both languages
const popularSearches = {
  ar: [
    'محرك تويوتا',
    'فرامل هوندا', 
    'ناقل حركة نيسان',
    'مصابيح LED',
    'إطارات ميشلان',
    'بطارية السيارة',
    'فلتر هواء',
    'مرايا جانبية'
  ],
  en: [
    'Toyota engine',
    'Honda brakes',
    'Nissan transmission', 
    'LED headlights',
    'Michelin tires',
    'Car battery',
    'Air filter',
    'Side mirrors'
  ]
};

// Car models for quick suggestions
const carModels = [
  'Camry', 'Corolla', 'Accord', 'Civic', 'Altima', 'Sentra', 
  'X-Trail', 'RAV4', 'CR-V', 'Hilux', 'Prado', 'Tahoe'
];

// Auto parts categories
const partCategories = {
  ar: [
    'محركات',
    'فرامل', 
    'تعليق',
    'كهربائيات',
    'تكييف',
    'عادم',
    'وقود',
    'تبريد'
  ],
  en: [
    'Engines',
    'Brakes',
    'Suspension', 
    'Electrical',
    'AC',
    'Exhaust',
    'Fuel',
    'Cooling'
  ]
};

export function SearchSuggestions({ 
  query, 
  onSuggestionClick, 
  className 
}: SearchSuggestionsProps) {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!query || query.length < 2) {
      // Show popular searches when no query
      setSuggestions(popularSearches[locale as 'ar' | 'en'].slice(0, 6));
      return;
    }

    // Filter suggestions based on query
    const allSuggestions = [
      ...popularSearches[locale as 'ar' | 'en'],
      ...carModels,
      ...partCategories[locale as 'ar' | 'en']
    ];

    const filtered = allSuggestions
      .filter(item => 
        item.toLowerCase().includes(query.toLowerCase()) ||
        query.toLowerCase().includes(item.toLowerCase())
      )
      .slice(0, 8);

    // Add query-based suggestions
    const smartSuggestions = [];
    
    // If query looks like a car model, suggest parts for it
    const matchingModel = carModels.find(model => 
      model.toLowerCase().includes(query.toLowerCase())
    );
    if (matchingModel) {
      smartSuggestions.push(
        isArabic ? `محرك ${matchingModel}` : `${matchingModel} engine`,
        isArabic ? `فرامل ${matchingModel}` : `${matchingModel} brakes`,
        isArabic ? `قطع ${matchingModel}` : `${matchingModel} parts`
      );
    }

    // Combine filtered and smart suggestions
    setSuggestions([...new Set([...smartSuggestions, ...filtered])].slice(0, 8));
  }, [query, locale, isArabic]);

  if (suggestions.length === 0) return null;

  return (
    <div className={cn(
      "absolute top-full start-0 end-0 z-50 mt-1",
      "bg-white dark:bg-card border border-border/50 rounded-lg shadow-lg",
      "max-h-80 overflow-y-auto",
      className
    )}>
      <div className="p-2">
        {!query || query.length < 2 ? (
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground flex items-center gap-2 border-b border-border/30 mb-2">
            <TrendingUp className="h-3 w-3" />
            {isArabic ? 'الأكثر بحثاً' : 'Popular searches'}
          </div>
        ) : (
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground flex items-center gap-2 border-b border-border/30 mb-2">
            <Search className="h-3 w-3" />
            {isArabic ? 'اقتراحات البحث' : 'Search suggestions'}
          </div>
        )}
        
        {suggestions.map((suggestion, index) => {
          const isCarModel = carModels.some(model => 
            suggestion.toLowerCase().includes(model.toLowerCase())
          );
          const isPartCategory = partCategories[locale as 'ar' | 'en'].includes(suggestion);
          
          return (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className={cn(
                "w-full text-start px-3 py-2 rounded-md transition-colors",
                "hover:bg-muted/50 flex items-center gap-3 text-sm",
                "focus:outline-none focus:bg-muted/50"
              )}
            >
              <div className="flex-shrink-0">
                {!query || query.length < 2 ? (
                  <Clock className="h-4 w-4 text-muted-foreground" />
                ) : isCarModel ? (
                  <Car className="h-4 w-4 text-saudi-green" />
                ) : isPartCategory ? (
                  <Wrench className="h-4 w-4 text-riyadh-sky" />
                ) : (
                  <Search className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <span className="flex-1">
                {suggestion}
              </span>
              {isCarModel && (
                <span className="text-xs text-muted-foreground">
                  {isArabic ? 'طراز' : 'Model'}
                </span>
              )}
              {isPartCategory && (
                <span className="text-xs text-muted-foreground">
                  {isArabic ? 'فئة' : 'Category'}
                </span>
              )}
            </button>
          );
        })}
        
        {query && query.length >= 2 && (
          <div className="border-t border-border/30 mt-2 pt-2">
            <button
              onClick={() => onSuggestionClick(query)}
              className={cn(
                "w-full text-start px-3 py-2 rounded-md transition-colors",
                "hover:bg-saudi-green/10 flex items-center gap-3 text-sm font-medium",
                "focus:outline-none focus:bg-saudi-green/10 text-saudi-green"
              )}
            >
              <Search className="h-4 w-4" />
              <span>
                {isArabic ? `البحث عن "${query}"` : `Search for "${query}"`}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}