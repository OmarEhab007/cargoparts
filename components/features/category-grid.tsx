'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
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

  const categories = isArabic 
    ? ['المحركات', 'ناقل الحركة', 'الفرامل', 'التعليق', 'الكهرباء', 'الهيكل', 'الإطارات', 'أخرى']
    : ['Engines', 'Transmission', 'Brakes', 'Suspension', 'Electrical', 'Body', 'Tires', 'Other'];

  return (
    <div className={cn("space-y-6", className)}>
      <div className="text-center space-y-2">
        <h2 className={cn(
          "text-lg font-semibold text-muted-foreground",
          isArabic ? "font-bold" : ""
        )}>
          {isArabic ? 'تصفح بالفئة' : 'Browse by Category'}
        </h2>
      </div>

      {/* Simplified Category Pills */}
      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((category) => {
          const isSelected = selectedCategory === category;
          const icon = categoryIcons[category as keyof typeof categoryIcons];

          return (
            <Button
              key={category}
              onClick={() => onCategorySelect(isSelected ? '' : category)}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-10 px-4 gap-2 transition-all duration-300 rounded-full",
                "hover:shadow-md hover:scale-105",
                isSelected && "bg-saudi-green text-white border-saudi-green shadow-lg",
                !isSelected && "hover:bg-saudi-green/10 hover:border-saudi-green/50 bg-white dark:bg-card"
              )}
            >
              <span className="text-base">{icon}</span>
              <span className={cn(
                "text-sm font-medium",
                isArabic && "font-semibold"
              )}>
                {category}
              </span>
            </Button>
          );
        })}
      </div>

      {/* Active Filter Indicator */}
      {selectedCategory && (
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-saudi-green/10 text-saudi-green rounded-full border border-saudi-green/20">
            <div className="w-2 h-2 bg-saudi-green rounded-full animate-pulse" />
            <span className={cn(
              "text-sm",
              isArabic ? "font-semibold" : "font-medium"
            )}>
              {isArabic ? 'يتم عرض' : 'Showing'} {selectedCategory}
            </span>
            <Button
              onClick={() => onCategorySelect('')}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-saudi-green/20"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}