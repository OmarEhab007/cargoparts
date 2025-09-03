import { NextRequest } from 'next/server';
import { SearchParams, ListingFilters, OrderFilters, UserFilters } from './types';
import { z } from 'zod';

/**
 * Parse query parameters from request URL
 */
export function parseSearchParams(request: NextRequest): SearchParams {
  const { searchParams } = new URL(request.url);
  
  return {
    page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
    limit: Math.min(
      searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20,
      100 // Maximum limit
    ),
    search: searchParams.get('search') || undefined,
    sortBy: searchParams.get('sortBy') || undefined,
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
  };
}

/**
 * Parse listing filters from query parameters
 */
export function parseListingFilters(request: NextRequest): ListingFilters {
  const { searchParams } = new URL(request.url);
  
  return {
    category: searchParams.get('category') || undefined,
    make: searchParams.get('make') || undefined,
    model: searchParams.get('model') || undefined,
    yearFrom: searchParams.get('yearFrom') ? parseInt(searchParams.get('yearFrom')!, 10) : undefined,
    yearTo: searchParams.get('yearTo') ? parseInt(searchParams.get('yearTo')!, 10) : undefined,
    condition: searchParams.get('condition') || undefined,
    minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!, 10) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!, 10) : undefined,
    city: searchParams.get('city') || undefined,
    sellerId: searchParams.get('sellerId') || undefined,
    isActive: searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined,
    isFeatured: searchParams.get('isFeatured') === 'true' ? true : searchParams.get('isFeatured') === 'false' ? false : undefined,
  };
}

/**
 * Parse order filters from query parameters
 */
export function parseOrderFilters(request: NextRequest): OrderFilters {
  const { searchParams } = new URL(request.url);
  
  return {
    status: searchParams.get('status') || undefined,
    sellerId: searchParams.get('sellerId') || undefined,
    buyerId: searchParams.get('buyerId') || undefined,
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined,
    minTotal: searchParams.get('minTotal') ? parseInt(searchParams.get('minTotal')!, 10) : undefined,
    maxTotal: searchParams.get('maxTotal') ? parseInt(searchParams.get('maxTotal')!, 10) : undefined,
  };
}

/**
 * Parse user filters from query parameters
 */
export function parseUserFilters(request: NextRequest): UserFilters {
  const { searchParams } = new URL(request.url);
  
  return {
    role: searchParams.get('role') || undefined,
    status: searchParams.get('status') || undefined,
    verified: searchParams.get('verified') === 'true' ? true : searchParams.get('verified') === 'false' ? false : undefined,
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined,
  };
}

/**
 * Validate pagination parameters
 */
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

/**
 * Validate sort parameters
 */
export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Generate cache key for API responses
 */
export function generateCacheKey(prefix: string, params: Record<string, unknown>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key];
      return result;
    }, {} as Record<string, unknown>);

  const paramString = JSON.stringify(sortedParams);
  return `${prefix}:${Buffer.from(paramString).toString('base64')}`;
}

/**
 * Clean and normalize search query
 */
export function normalizeSearchQuery(query: string | undefined): string | undefined {
  if (!query) return undefined;
  
  return query
    .trim()
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/g, '') // Keep only word characters, spaces, and Arabic characters
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .substring(0, 100); // Limit length
}

/**
 * Convert date string to Date object with validation
 */
export function parseDate(dateString: string | null): Date | undefined {
  if (!dateString) return undefined;
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return undefined;
  }
  
  // Check if date is reasonable (not too far in past or future)
  const now = new Date();
  const minDate = new Date('2020-01-01');
  const maxDate = new Date(now.getFullYear() + 10, 11, 31);
  
  if (date < minDate || date > maxDate) {
    return undefined;
  }
  
  return date;
}

/**
 * Validate and parse price range
 */
export function parsePriceRange(minPrice?: string | null, maxPrice?: string | null): {
  minPrice?: number;
  maxPrice?: number;
} {
  const result: { minPrice?: number; maxPrice?: number } = {};
  
  if (minPrice) {
    const min = parseInt(minPrice, 10);
    if (!isNaN(min) && min >= 0 && min <= 1000000) { // Max 1M SAR
      result.minPrice = min;
    }
  }
  
  if (maxPrice) {
    const max = parseInt(maxPrice, 10);
    if (!isNaN(max) && max >= 0 && max <= 1000000) { // Max 1M SAR
      result.maxPrice = max;
    }
  }
  
  // Ensure minPrice <= maxPrice
  if (result.minPrice && result.maxPrice && result.minPrice > result.maxPrice) {
    [result.minPrice, result.maxPrice] = [result.maxPrice, result.minPrice];
  }
  
  return result;
}

/**
 * Validate and parse year range
 */
export function parseYearRange(yearFrom?: string | null, yearTo?: string | null): {
  yearFrom?: number;
  yearTo?: number;
} {
  const result: { yearFrom?: number; yearTo?: number } = {};
  const currentYear = new Date().getFullYear();
  
  if (yearFrom) {
    const from = parseInt(yearFrom, 10);
    if (!isNaN(from) && from >= 1950 && from <= currentYear + 1) {
      result.yearFrom = from;
    }
  }
  
  if (yearTo) {
    const to = parseInt(yearTo, 10);
    if (!isNaN(to) && to >= 1950 && to <= currentYear + 1) {
      result.yearTo = to;
    }
  }
  
  // Ensure yearFrom <= yearTo
  if (result.yearFrom && result.yearTo && result.yearFrom > result.yearTo) {
    [result.yearFrom, result.yearTo] = [result.yearTo, result.yearFrom];
  }
  
  return result;
}

/**
 * Sanitize string for database queries
 */
export function sanitizeString(input: string | undefined, maxLength: number = 100): string | undefined {
  if (!input) return undefined;
  
  return input
    .trim()
    .substring(0, maxLength)
    .replace(/[<>]/g, ''); // Remove potential HTML tags
}

/**
 * Generate slug from string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Format currency amount for Saudi Riyal
 */
export function formatCurrency(amount: number, locale: string = 'ar-SA'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate pagination offset
 */
export function calculateOffset(page: number, limit: number): number {
  return Math.max(0, (page - 1) * limit);
}

/**
 * Extract file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Validate file type for uploads
 */
export function isValidImageType(mimeType: string): boolean {
  const validTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ];
  
  return validTypes.includes(mimeType.toLowerCase());
}

/**
 * Generate random string for tokens, codes, etc.
 */
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  if (typeof obj === 'object') {
    const copy = {} as T;
    Object.keys(obj as object).forEach(key => {
      (copy as Record<string, unknown>)[key] = deepClone((obj as Record<string, unknown>)[key]);
    });
    return copy;
  }
  return obj;
}

/**
 * Remove undefined values from object
 */
export function removeUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  });
  
  return result;
}

/**
 * Convert Arabic numerals to English numerals
 */
export function convertArabicNumerals(text: string): string {
  const arabicNumerals = '٠١٢٣٤٥٦٧٨٩';
  const englishNumerals = '0123456789';
  
  let result = text;
  
  for (let i = 0; i < arabicNumerals.length; i++) {
    result = result.replace(new RegExp(arabicNumerals[i], 'g'), englishNumerals[i]);
  }
  
  return result;
}