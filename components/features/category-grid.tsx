'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

// Category icons mapping
const categoryIcons = {
  'المحركات': '🔧',
  'Engines': '🔧',
  'ناقل الحركة': '⚙️',
  'Transmission': '⚙️',
  'الفرامل': '🛑',
  'Brakes': '🛑',
  'التعليق': '🏗️',
  'Suspension': '🏗️',
  'الكهرباء': '⚡',
  'Electrical': '⚡',
  'الهيكل': '🚗',
  'Body': '🚗',
  'الإطارات': '🛞',
  'Tires': '🛞',
  'أخرى': '📦',
  'Other': '📦'
};

interface CategoryGridProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  className?: string;
}

export function CategoryGrid({ selectedCategory, onCategorySelect, className }: CategoryGridProps) {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [isExpanded, setIsExpanded] = useState(false);

  const categories = isArabic 
    ? ['المحركات', 'ناقل الحركة', 'الفرامل', 'التعليق', 'الكهرباء', 'الهيكل', 'الإطارات', 'أخرى']
    : ['Engines', 'Transmission', 'Brakes', 'Suspension', 'Electrical', 'Body', 'Tires', 'Other'];

  // On mobile, show first 4 categories, then expand to show all
  const visibleCategories = isExpanded ? categories : categories.slice(0, 4);
  const hasMoreCategories = categories.length > 4;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gradient-saudi">
          {isArabic ? 'الفئات' : 'Categories'}
        </h2>
        {selectedCategory && (
          <Badge className="badge-saudi text-xs">
            {isArabic ? 'محدد' : 'Selected'}
          </Badge>
        )}
      </div>

      {/* Mobile-First Grid Layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {visibleCategories.map((category) => {
          const isSelected = selectedCategory === category;
          const icon = categoryIcons[category as keyof typeof categoryIcons];

          return (
            <Button
              key={category}
              onClick={() => onCategorySelect(isSelected ? '' : category)}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "h-auto p-4 flex-col gap-2 transition-all duration-300 relative overflow-hidden",
                "hover:shadow-md hover:-translate-y-0.5",
                isSelected && "bg-gradient-saudi text-white ring-2 ring-desert-gold ring-offset-2",
                !isSelected && "hover:bg-saudi-green/10 hover:border-saudi-green/50"
              )}
            >
              {/* Background Pattern */}
              {isSelected && (
                <div className="absolute inset-0 pattern-saudi opacity-10" />
              )}
              
              {/* Icon */}
              <div className={cn(
                "text-2xl transition-transform duration-300",
                isSelected && "scale-110"
              )}>
                {icon}
              </div>
              
              {/* Category Name */}
              <span className={cn(
                "text-xs font-semibold text-center leading-tight",
                isSelected ? "text-white" : "text-foreground"
              )}>
                {category}
              </span>

              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute -top-1 -end-1">
                  <div className="w-3 h-3 bg-desert-gold rounded-full animate-pulse" />
                </div>
              )}
            </Button>
          );
        })}

        {/* Expand/Collapse Button on Mobile */}
        {hasMoreCategories && (
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="ghost"
            className={cn(
              "h-auto p-4 flex-col gap-2 border-2 border-dashed border-muted-foreground/30",
              "hover:border-saudi-green/50 hover:bg-saudi-green/5 transition-all duration-300",
              "md:hidden" // Hide on desktop since all categories are visible
            )}
          >
            <div className="text-xl text-muted-foreground">
              {isExpanded ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
            </div>
            <span className="text-xs font-medium text-muted-foreground text-center">
              {isExpanded 
                ? (isArabic ? 'أقل' : 'Less')
                : (isArabic ? `+${categories.length - 4} أكثر` : `+${categories.length - 4} More`)
              }
            </span>
          </Button>
        )}
      </div>

      {/* Quick Stats */}
      {selectedCategory && (
        <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-saudi-green rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">
              {isArabic ? 'يتم البحث في فئة:' : 'Searching in category:'}
            </span>
            <Badge className="badge-saudi text-xs">{selectedCategory}</Badge>
          </div>
        </div>
      )}
    </div>
  );
}