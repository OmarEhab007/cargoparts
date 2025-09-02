import { prisma } from '@/lib/db/prisma';
import type { CartItem, Listing } from '@prisma/client';

export interface CartItemWithDetails extends CartItem {
  listing: Listing & {
    seller: {
      id: string;
      businessName: string;
      city: string;
      verified: boolean;
    };
    photos: Array<{
      id: string;
      url: string;
      alt: string | null;
    }>;
  };
}

export interface CartSummary {
  items: CartItemWithDetails[];
  totals: {
    subtotal: number;
    itemCount: number;
    uniqueItems: number;
  };
  sellerGroups: Array<{
    sellerId: string;
    sellerName: string;
    items: CartItemWithDetails[];
    subtotal: number;
  }>;
}

export class CartService {
  /**
   * Add item to cart
   */
  static async addToCart(userId: string, listingId: string, quantity: number = 1): Promise<CartItem> {
    // Verify listing exists and is available
    const listing = await prisma.listing.findUnique({
      where: { 
        id: listingId,
        isActive: true,
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        quantity: true,
        minQuantity: true,
        sellerId: true,
      },
    });

    if (!listing) {
      throw new Error('Listing not found or unavailable');
    }

    // Check if user is not trying to buy their own item
    const seller = await prisma.seller.findUnique({
      where: { id: listing.sellerId },
      select: { userId: true },
    });

    if (seller?.userId === userId) {
      throw new Error('Cannot add your own listing to cart');
    }

    // Check quantity availability
    if (quantity > listing.quantity) {
      throw new Error(`Only ${listing.quantity} items available`);
    }

    if (quantity < listing.minQuantity) {
      throw new Error(`Minimum quantity is ${listing.minQuantity}`);
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_listingId: {
          userId,
          listingId,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      
      if (newQuantity > listing.quantity) {
        throw new Error(`Cannot add more items. Maximum available: ${listing.quantity}`);
      }

      return prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Create new cart item
      return prisma.cartItem.create({
        data: {
          userId,
          listingId,
          quantity,
        },
      });
    }
  }

  /**
   * Update cart item quantity
   */
  static async updateCartItem(userId: string, cartItemId: string, quantity: number): Promise<CartItem> {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    // Find cart item and verify ownership
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        listing: {
          select: {
            id: true,
            quantity: true,
            minQuantity: true,
            isActive: true,
            status: true,
          },
        },
      },
    });

    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    if (cartItem.userId !== userId) {
      throw new Error('Unauthorized to update this cart item');
    }

    if (!cartItem.listing.isActive || cartItem.listing.status !== 'PUBLISHED') {
      throw new Error('Listing is no longer available');
    }

    // Validate quantity
    if (quantity > cartItem.listing.quantity) {
      throw new Error(`Only ${cartItem.listing.quantity} items available`);
    }

    if (quantity < cartItem.listing.minQuantity) {
      throw new Error(`Minimum quantity is ${cartItem.listing.minQuantity}`);
    }

    return prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });
  }

  /**
   * Remove item from cart
   */
  static async removeFromCart(userId: string, cartItemId: string): Promise<void> {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      select: { userId: true },
    });

    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    if (cartItem.userId !== userId) {
      throw new Error('Unauthorized to remove this cart item');
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });
  }

  /**
   * Clear entire cart for user
   */
  static async clearCart(userId: string): Promise<void> {
    await prisma.cartItem.deleteMany({
      where: { userId },
    });
  }

  /**
   * Get user's cart with full details
   */
  static async getCart(userId: string): Promise<CartSummary> {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        listing: {
          include: {
            seller: {
              select: {
                id: true,
                businessName: true,
                city: true,
                verified: true,
              },
            },
            photos: {
              take: 1,
              orderBy: { sortOrder: 'asc' },
              select: {
                id: true,
                url: true,
                alt: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter out items with inactive listings
    const activeItems = cartItems.filter(item => 
      item.listing.isActive && item.listing.status === 'PUBLISHED'
    ) as CartItemWithDetails[];

    // Remove inactive items from database
    const inactiveItemIds = cartItems
      .filter(item => !item.listing.isActive || item.listing.status !== 'PUBLISHED')
      .map(item => item.id);

    if (inactiveItemIds.length > 0) {
      await prisma.cartItem.deleteMany({
        where: { id: { in: inactiveItemIds } },
      });
    }

    // Calculate totals
    const subtotal = activeItems.reduce((sum, item) => 
      sum + (item.listing.priceSar * item.quantity), 0
    );

    const itemCount = activeItems.reduce((sum, item) => sum + item.quantity, 0);

    // Group items by seller
    const sellerGroups = activeItems.reduce((groups, item) => {
      const sellerId = item.listing.sellerId;
      const existingGroup = groups.find(g => g.sellerId === sellerId);

      if (existingGroup) {
        existingGroup.items.push(item);
        existingGroup.subtotal += item.listing.priceSar * item.quantity;
      } else {
        groups.push({
          sellerId,
          sellerName: item.listing.seller.businessName,
          items: [item],
          subtotal: item.listing.priceSar * item.quantity,
        });
      }

      return groups;
    }, [] as CartSummary['sellerGroups']);

    return {
      items: activeItems,
      totals: {
        subtotal,
        itemCount,
        uniqueItems: activeItems.length,
      },
      sellerGroups,
    };
  }

  /**
   * Get cart item count for user
   */
  static async getCartItemCount(userId: string): Promise<number> {
    const result = await prisma.cartItem.aggregate({
      where: { 
        userId,
        listing: {
          isActive: true,
          status: 'PUBLISHED',
        },
      },
      _sum: { quantity: true },
    });

    return result._sum.quantity || 0;
  }

  /**
   * Validate cart before checkout
   */
  static async validateCart(userId: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const cart = await this.getCart(userId);
    const errors: string[] = [];
    const warnings: string[] = [];

    if (cart.items.length === 0) {
      errors.push('Cart is empty');
      return { isValid: false, errors, warnings };
    }

    // Check each item availability and pricing
    for (const item of cart.items) {
      // Refresh listing data to ensure accuracy
      const currentListing = await prisma.listing.findUnique({
        where: { id: item.listingId },
        select: {
          id: true,
          priceSar: true,
          quantity: true,
          isActive: true,
          status: true,
        },
      });

      if (!currentListing || !currentListing.isActive || currentListing.status !== 'PUBLISHED') {
        errors.push(`Item "${item.listing.titleAr}" is no longer available`);
        continue;
      }

      if (item.quantity > currentListing.quantity) {
        if (currentListing.quantity > 0) {
          warnings.push(`Only ${currentListing.quantity} units available for "${item.listing.titleAr}"`);
        } else {
          errors.push(`Item "${item.listing.titleAr}" is out of stock`);
        }
      }

      if (currentListing.priceSar !== item.listing.priceSar) {
        warnings.push(`Price has changed for "${item.listing.titleAr}"`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get cart statistics for user dashboard
   */
  static async getCartStats(userId: string): Promise<{
    totalItems: number;
    totalValue: number;
    oldestItem: Date | null;
    sellerCount: number;
  }> {
    const cartItems = await prisma.cartItem.findMany({
      where: { 
        userId,
        listing: {
          isActive: true,
          status: 'PUBLISHED',
        },
      },
      include: {
        listing: {
          select: {
            priceSar: true,
            sellerId: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = cartItems.reduce((sum, item) => 
      sum + (item.listing.priceSar * item.quantity), 0
    );
    const oldestItem = cartItems.length > 0 ? cartItems[0].createdAt : null;
    const sellerCount = new Set(cartItems.map(item => item.listing.sellerId)).size;

    return {
      totalItems,
      totalValue,
      oldestItem,
      sellerCount,
    };
  }

  /**
   * Merge guest cart with user cart (for when guest logs in)
   */
  static async mergeGuestCart(userId: string, guestCartItems: Array<{
    listingId: string;
    quantity: number;
  }>): Promise<void> {
    for (const guestItem of guestCartItems) {
      try {
        await this.addToCart(userId, guestItem.listingId, guestItem.quantity);
      } catch (error) {
        // Ignore errors for individual items during merge
        console.warn('Failed to merge cart item:', guestItem, error);
      }
    }
  }

  /**
   * Clean up old cart items (run periodically)
   */
  static async cleanupOldCartItems(olderThanDays: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await prisma.cartItem.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  }
}