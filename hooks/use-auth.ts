'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'ADMIN' | 'SELLER' | 'USER';
  avatar?: string;
  status: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  preferredLocale?: string;
  lastLoginAt?: string;
  createdAt: string;
}

interface Seller {
  id: string;
  businessName: string;
  listingsCount: number;
}

interface AuthData {
  user: User;
  seller?: Seller | null;
  stats?: any;
}

interface UseAuthReturn {
  user: User | null;
  seller: Seller | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  refresh: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setUser(data.data.user);
          setSeller(data.data.seller);
        } else {
          setUser(null);
          setSeller(null);
        }
      } else {
        setUser(null);
        setSeller(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
      setSeller(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return {
    user,
    seller,
    isLoading,
    isLoggedIn: !!user,
    refresh: fetchUser,
  };
}