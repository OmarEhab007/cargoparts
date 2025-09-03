'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Mic, X, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocale } from 'next-intl';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'trending' | 'suggestion';
  category?: string;
}

interface MobileSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function MobileSearch({ onSearch, placeholder, className }: MobileSearchProps) {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Sample suggestions (in real app, these would come from API)
  const sampleSuggestions: SearchSuggestion[] = useMemo(() => isArabic ? [
    { id: '1', text: 'محرك كامري', type: 'trending', category: 'محركات' },
    { id: '2', text: 'فرامل أكورد', type: 'trending', category: 'فرامل' },
    { id: '3', text: 'ناقل حركة نيسان', type: 'trending', category: 'ناقل الحركة' },
    { id: '4', text: 'مصابيح LED', type: 'recent', category: 'كهرباء' },
    { id: '5', text: 'إطارات ميشلين', type: 'recent', category: 'إطارات' },
    { id: '6', text: 'مكيف هواء', type: 'suggestion', category: 'كهرباء' },
  ] : [
    { id: '1', text: 'Camry engine', type: 'trending', category: 'Engines' },
    { id: '2', text: 'Accord brakes', type: 'trending', category: 'Brakes' },
    { id: '3', text: 'Nissan transmission', type: 'trending', category: 'Transmission' },
    { id: '4', text: 'LED headlights', type: 'recent', category: 'Electrical' },
    { id: '5', text: 'Michelin tires', type: 'recent', category: 'Tires' },
    { id: '6', text: 'Air conditioning', type: 'suggestion', category: 'Electrical' },
  ], [isArabic]);

  useEffect(() => {
    // Filter suggestions based on query
    if (query.trim()) {
      const filtered = sampleSuggestions.filter(suggestion =>
        suggestion.text.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 4));
    } else {
      // Show trending and recent when no query
      setSuggestions(sampleSuggestions.slice(0, 6));
    }
  }, [query, sampleSuggestions]);

  useEffect(() => {
    // Close search when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleSearch = (searchQuery: string) => {
    onSearch(searchQuery);
    setIsExpanded(false);
    setQuery(searchQuery);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    handleSearch(suggestion.text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      handleSearch(query);
    } else if (e.key === 'Escape') {
      setIsExpanded(false);
    }
  };

  return (
    <div ref={searchRef} className={cn("relative w-full", className)}>
      {!isExpanded ? (
        // Compact floating search bar
        <Button
          onClick={handleExpand}
          variant="outline"
          className={cn(
            "w-full justify-start gap-3 h-12 bg-white/90 backdrop-blur-md border-saudi-green/20",
            "hover:bg-white hover:shadow-lg transition-all duration-300",
            "dark:bg-card/90 dark:hover:bg-card"
          )}
        >
          <Search className="h-4 w-4 text-saudi-green" />
          <span className="text-muted-foreground font-normal">
            {placeholder || (isArabic ? 'ابحث عن قطع غيار...' : 'Search for parts...')}
          </span>
        </Button>
      ) : (
        // Expanded search with suggestions
        <div className="absolute top-0 left-0 right-0 z-50 bg-background border border-saudi-green/20 rounded-lg shadow-xl">
          {/* Search Input */}
          <div className="p-4 border-b border-border/50">
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-saudi-green" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder || (isArabic ? 'ابحث عن قطع غيار...' : 'Search for parts...')}
                  className="ps-10 pe-10 h-12 border-saudi-green/30 focus:border-saudi-green"
                />
                {query && (
                  <Button
                    onClick={() => setQuery('')}
                    variant="ghost"
                    size="icon"
                    className="absolute end-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Button
                onClick={() => setIsExpanded(false)}
                variant="ghost"
                size="icon"
                className="h-12 w-12"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="max-h-80 overflow-y-auto">
              {!query && (
                <div className="px-4 py-3 border-b border-border/30">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      {isArabic ? 'الأكثر بحثاً' : 'Trending Searches'}
                    </h3>
                    <TrendingUp className="h-4 w-4 text-saudi-green" />
                  </div>
                  <div className="space-y-1">
                    {suggestions.filter(s => s.type === 'trending').map((suggestion) => (
                      <Button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        variant="ghost"
                        className="w-full justify-start h-auto p-2 text-start hover:bg-saudi-green/10"
                      >
                        <TrendingUp className="h-3 w-3 text-saudi-green me-3 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{suggestion.text}</div>
                          <div className="text-xs text-muted-foreground">{suggestion.category}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {!query && suggestions.some(s => s.type === 'recent') && (
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      {isArabic ? 'البحثات الأخيرة' : 'Recent Searches'}
                    </h3>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    {suggestions.filter(s => s.type === 'recent').map((suggestion) => (
                      <Button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        variant="ghost"
                        className="w-full justify-start h-auto p-2 text-start hover:bg-muted"
                      >
                        <Clock className="h-3 w-3 text-muted-foreground me-3 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{suggestion.text}</div>
                          <div className="text-xs text-muted-foreground">{suggestion.category}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {query && (
                <div className="px-4 py-3">
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    {isArabic ? 'اقتراحات' : 'Suggestions'}
                  </h3>
                  <div className="space-y-1">
                    {suggestions.map((suggestion) => (
                      <Button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        variant="ghost"
                        className="w-full justify-start h-auto p-2 text-start hover:bg-saudi-green/10"
                      >
                        <Search className="h-3 w-3 text-saudi-green me-3 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">
                            <span 
                              dangerouslySetInnerHTML={{
                                __html: suggestion.text.replace(
                                  new RegExp(`(${query})`, 'gi'),
                                  '<mark class="bg-desert-gold/30 text-saudi-green-dark font-semibold">$1</mark>'
                                )
                              }}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground">{suggestion.category}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Voice Search Option */}
              <div className="px-4 py-3 border-t border-border/30">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto p-2 text-start hover:bg-riyadh-sky/10"
                >
                  <Mic className="h-4 w-4 text-riyadh-sky me-3" />
                  <span className="text-sm">
                    {isArabic ? 'البحث الصوتي' : 'Voice Search'}
                  </span>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}