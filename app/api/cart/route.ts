import { NextRequest, NextResponse } from 'next/server';
import { CartService } from '@/lib/orders/cart-service';
import { withAuth } from '@/lib/auth/middleware';
import { createSuccessResponse, handleError } from '@/lib/api/response';
import { z } from 'zod';

const addToCartSchema = z.object({
  listingId: z.string().cuid('Invalid listing ID'),
  quantity: z.number().int().positive().max(100, 'Quantity cannot exceed 100'),
});

const updateCartItemSchema = z.object({
  cartItemId: z.string().cuid('Invalid cart item ID'),
  quantity: z.number().int().positive().max(100, 'Quantity cannot exceed 100'),
});

const removeFromCartSchema = z.object({
  cartItemId: z.string().cuid('Invalid cart item ID'),
});

// Get user's cart
export async function GET(request: NextRequest) {
  try {
    const { context, response } = await withAuth(request);
    
    if (response) {
      return response;
    }

    if (!context) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const cart = await CartService.getCart(context.user.id);
    const stats = await CartService.getCartStats(context.user.id);

    return createSuccessResponse({
      cart: {
        items: cart.items.map(item => ({
          id: item.id,
          listingId: item.listingId,
          quantity: item.quantity,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          listing: {
            id: item.listing.id,
            titleAr: item.listing.titleAr,
            titleEn: item.listing.titleEn,
            sku: item.listing.sku,
            priceSar: item.listing.priceSar,
            condition: item.listing.condition,
            quantity: item.listing.quantity,
            minQuantity: item.listing.minQuantity,
            city: item.listing.city,
            photos: item.listing.photos,
            seller: item.listing.seller,
          },
        })),
        totals: cart.totals,
        sellerGroups: cart.sellerGroups,
      },
      stats,
    });
  } catch (error) {
    return handleError(error);
  }
}

// Add item to cart
export async function POST(request: NextRequest) {
  try {
    const { context, response } = await withAuth(request);
    
    if (response) {
      return response;
    }

    if (!context) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { listingId, quantity } = addToCartSchema.parse(body);

    const cartItem = await CartService.addToCart(
      context.user.id,
      listingId,
      quantity
    );

    return createSuccessResponse({
      message: 'Item added to cart successfully',
      cartItem: {
        id: cartItem.id,
        listingId: cartItem.listingId,
        quantity: cartItem.quantity,
        createdAt: cartItem.createdAt,
      },
    }, 'Item added to cart successfully', 201);
  } catch (error) {
    return handleError(error);
  }
}

// Update cart item quantity
export async function PUT(request: NextRequest) {
  try {
    const { context, response } = await withAuth(request);
    
    if (response) {
      return response;
    }

    if (!context) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { cartItemId, quantity } = updateCartItemSchema.parse(body);

    const cartItem = await CartService.updateCartItem(
      context.user.id,
      cartItemId,
      quantity
    );

    return createSuccessResponse({
      message: 'Cart item updated successfully',
      cartItem: {
        id: cartItem.id,
        listingId: cartItem.listingId,
        quantity: cartItem.quantity,
        updatedAt: cartItem.updatedAt,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

// Remove item from cart or clear entire cart
export async function DELETE(request: NextRequest) {
  try {
    const { context, response } = await withAuth(request);
    
    if (response) {
      return response;
    }

    if (!context) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const cartItemId = searchParams.get('cartItemId');
    const clearAll = searchParams.get('clearAll') === 'true';

    if (clearAll) {
      // Clear entire cart
      await CartService.clearCart(context.user.id);
      
      return createSuccessResponse({
        message: 'Cart cleared successfully',
      });
    } else if (cartItemId) {
      // Remove specific item
      await CartService.removeFromCart(context.user.id, cartItemId);
      
      return createSuccessResponse({
        message: 'Item removed from cart successfully',
      });
    } else {
      return NextResponse.json(
        { error: 'Either cartItemId or clearAll parameter is required' },
        { status: 400 }
      );
    }
  } catch (error) {
    return handleError(error);
  }
}