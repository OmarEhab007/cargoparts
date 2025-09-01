'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  id: string;
  listingId: string;
  titleAr: string;
  titleEn?: string;
  price: number;
  quantity: number;
  make: string;
  model: string;
  condition: string;
  city: string;
  sellerId: string;
  sellerName: string;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (listingId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  
  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cargoparts-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cargoparts-cart', JSON.stringify(items));
  }, [items]);
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const addItem = (newItem: Omit<CartItem, 'id'>) => {
    setItems(currentItems => {
      // Check if item already exists
      const existingItem = currentItems.find(item => item.listingId === newItem.listingId);
      
      if (existingItem) {
        // Update quantity if item exists
        return currentItems.map(item =>
          item.listingId === newItem.listingId
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      
      // Add new item with generated ID
      return [...currentItems, { ...newItem, id: `cart-${Date.now()}-${Math.random()}` }];
    });
  };
  
  const removeItem = (id: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id));
  };
  
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };
  
  const clearCart = () => {
    setItems([]);
  };
  
  const isInCart = (listingId: string) => {
    return items.some(item => item.listingId === listingId);
  };
  
  return (
    <CartContext.Provider value={{
      items,
      totalItems,
      totalPrice,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isInCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}