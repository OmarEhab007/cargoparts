import { z } from 'zod';

// VAT rate in Saudi Arabia is 15%
export const VAT_RATE = 0.15;

// Shipping rates by city (in SAR)
export const SHIPPING_RATES = {
  // Major cities - free shipping
  'الرياض': 0,
  'جدة': 0,
  'الدمام': 0,
  'مكة المكرمة': 0,
  'المدينة المنورة': 0,
  
  // Other cities - flat rate shipping
  default: 25,
} as const;

// Minimum order value for free shipping
export const FREE_SHIPPING_THRESHOLD = 500;

export interface OrderPricingInput {
  subtotal: number;
  shippingCity: string;
  items: Array<{
    listingId: string;
    quantity: number;
    unitPrice: number;
    sellerId: string;
    city: string;
  }>;
}

export interface OrderPricing {
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  total: number;
  breakdown: {
    subtotalBeforeVat: number;
    vatAmount: number;
    shippingCost: number;
    finalTotal: number;
  };
  freeShipping: boolean;
  shippingDetails: {
    eligibleForFreeShipping: boolean;
    amountNeededForFreeShipping?: number;
    shippingCity: string;
    baseCost: number;
  };
}

export class PricingService {
  /**
   * Calculate comprehensive order pricing including tax and shipping
   */
  static calculateOrderPricing(input: OrderPricingInput): OrderPricing {
    const { subtotal, shippingCity, items } = input;

    // Calculate VAT (15% on subtotal)
    const taxAmount = Math.round(subtotal * VAT_RATE * 100) / 100;

    // Calculate shipping cost
    const shippingAmount = this.calculateShipping(subtotal, shippingCity, items);

    // Calculate total
    const total = subtotal + taxAmount + shippingAmount;

    // Determine if eligible for free shipping
    const eligibleForFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
    const amountNeededForFreeShipping = eligibleForFreeShipping 
      ? undefined 
      : FREE_SHIPPING_THRESHOLD - subtotal;

    // Get base shipping cost for the city
    const baseCost = this.getBaseCityShippingCost(shippingCity);

    return {
      subtotal,
      taxAmount,
      shippingAmount,
      total,
      breakdown: {
        subtotalBeforeVat: subtotal,
        vatAmount: taxAmount,
        shippingCost: shippingAmount,
        finalTotal: total,
      },
      freeShipping: shippingAmount === 0 && (eligibleForFreeShipping || baseCost === 0),
      shippingDetails: {
        eligibleForFreeShipping,
        amountNeededForFreeShipping,
        shippingCity,
        baseCost,
      },
    };
  }

  /**
   * Calculate shipping cost based on order value, destination city, and sellers
   */
  private static calculateShipping(
    subtotal: number, 
    shippingCity: string, 
    items: Array<{ sellerId: string; city: string }>
  ): number {
    // Free shipping for orders above threshold
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      return 0;
    }

    // Get base shipping cost for the destination city
    const baseCost = this.getBaseCityShippingCost(shippingCity);

    // If shipping to major cities is free, return 0
    if (baseCost === 0) {
      return 0;
    }

    // Count unique sellers and cities to calculate combined shipping
    const uniqueSellers = new Set(items.map(item => item.sellerId));
    const uniqueSellerCities = new Set(items.map(item => `${item.sellerId}-${item.city}`));

    // Base shipping cost
    let shippingCost = baseCost;

    // Add extra cost for multiple sellers (consolidated shipping discount)
    if (uniqueSellers.size > 1) {
      // 50% discount for additional sellers (consolidated shipping)
      const additionalSellers = uniqueSellers.size - 1;
      shippingCost += additionalSellers * (baseCost * 0.5);
    }

    // Cap maximum shipping cost
    const maxShipping = 100;
    return Math.min(shippingCost, maxShipping);
  }

  /**
   * Get base shipping cost for a specific city
   */
  private static getBaseCityShippingCost(city: string): number {
    // Normalize city name (trim and handle variations)
    const normalizedCity = city.trim();
    
    // Check for exact match first
    if (normalizedCity in SHIPPING_RATES) {
      return SHIPPING_RATES[normalizedCity as keyof typeof SHIPPING_RATES];
    }

    // Check for partial matches for major cities
    const majorCities = Object.keys(SHIPPING_RATES).filter(c => c !== 'default');
    for (const majorCity of majorCities) {
      if (normalizedCity.includes(majorCity) || majorCity.includes(normalizedCity)) {
        return SHIPPING_RATES[majorCity as keyof typeof SHIPPING_RATES];
      }
    }

    // Default shipping rate for other cities
    return SHIPPING_RATES.default;
  }

  /**
   * Calculate tax amount for a given subtotal
   */
  static calculateVAT(subtotal: number): number {
    return Math.round(subtotal * VAT_RATE * 100) / 100;
  }

  /**
   * Calculate shipping estimate before order creation
   */
  static estimateShipping(subtotal: number, shippingCity: string): {
    cost: number;
    freeShippingEligible: boolean;
    amountNeededForFreeShipping?: number;
  } {
    const freeShippingEligible = subtotal >= FREE_SHIPPING_THRESHOLD;
    const baseCost = this.getBaseCityShippingCost(shippingCity);
    
    let cost = 0;
    
    if (!freeShippingEligible && baseCost > 0) {
      cost = baseCost;
    }

    return {
      cost,
      freeShippingEligible,
      amountNeededForFreeShipping: freeShippingEligible 
        ? undefined 
        : FREE_SHIPPING_THRESHOLD - subtotal,
    };
  }

  /**
   * Format currency amount in SAR
   */
  static formatCurrency(amount: number, locale: 'ar' | 'en' = 'ar'): string {
    if (locale === 'ar') {
      return `${amount.toFixed(2)} ر.س`;
    } else {
      return `${amount.toFixed(2)} SAR`;
    }
  }

  /**
   * Get all supported shipping cities with their rates
   */
  static getSupportedCities(): Array<{
    city: string;
    rate: number;
    isFree: boolean;
  }> {
    return Object.entries(SHIPPING_RATES)
      .filter(([city]) => city !== 'default')
      .map(([city, rate]) => ({
        city,
        rate,
        isFree: rate === 0,
      }));
  }

  /**
   * Validate pricing data for consistency
   */
  static validatePricing(pricing: OrderPricing): boolean {
    const calculatedTotal = pricing.subtotal + pricing.taxAmount + pricing.shippingAmount;
    const tolerance = 0.01; // Allow for rounding differences
    
    return Math.abs(calculatedTotal - pricing.total) <= tolerance;
  }
}

// Zod schema for pricing validation
export const orderPricingSchema = z.object({
  subtotal: z.number().positive(),
  taxAmount: z.number().min(0),
  shippingAmount: z.number().min(0),
  total: z.number().positive(),
  breakdown: z.object({
    subtotalBeforeVat: z.number().positive(),
    vatAmount: z.number().min(0),
    shippingCost: z.number().min(0),
    finalTotal: z.number().positive(),
  }),
  freeShipping: z.boolean(),
  shippingDetails: z.object({
    eligibleForFreeShipping: z.boolean(),
    amountNeededForFreeShipping: z.number().positive().optional(),
    shippingCity: z.string(),
    baseCost: z.number().min(0),
  }),
});

export type OrderPricingSchema = z.infer<typeof orderPricingSchema>;