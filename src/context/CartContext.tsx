'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';

// Tipos
interface Game {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
}

export interface CartItemType {
  id: string;
  game: Game;
}

export interface Coupon {
  code: string;
  discount: number;
  type: 'PERCENTAGE' | 'FIXED';
}

interface CartContextType {
  items: CartItemType[];
  itemCount: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
  addToCart: (gameId: string) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  isGameInCart: (gameId: string) => boolean;
  clearCart: () => void;
  // Cupons
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  coupon: Coupon | null;
  totalWithDiscount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItemType[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null); // Estado do cupom
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { token, user } = useAuth();

  // Busca carrinho
  const fetchCart = useCallback(async () => {
    if (!token) {
      setItems([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Falha ao buscar carrinho');
      const data = await response.json();
      setItems(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCart();
  }, [user, fetchCart]);
  
  const addToCart = async (gameId: string) => {
    if (!token) throw new Error('Você precisa estar logado');
    setError(null);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ gameId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao adicionar');
      
      setItems((prevItems) => [...prevItems, data]);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!token) throw new Error('Você precisa estar logado');
    setError(null);
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Erro ao remover');
      
      setItems((prevItems) => prevItems.filter(item => item.id !== itemId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };
  
  const clearCart = () => {
    setItems([]);
    setCoupon(null);
  };
  
  const isGameInCart = (gameId: string) => {
    return items.some(item => item.game.id === gameId);
  };

  // --- LÓGICA DE CUPONS ---
  const applyCoupon = (newCoupon: Coupon) => {
    setCoupon(newCoupon);
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  // --- CÁLCULOS DE PREÇO ---
  const totalPrice = items.reduce((total, item) => total + item.game.price, 0);

  let totalWithDiscount = totalPrice;
  if (coupon) {
    if (coupon.type === 'PERCENTAGE') {
      totalWithDiscount = totalPrice - (totalPrice * (coupon.discount / 100));
    } else {
      totalWithDiscount = totalPrice - coupon.discount;
    }
  }
  if (totalWithDiscount < 0) totalWithDiscount = 0;

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount: items.length,
        totalPrice,
        isLoading,
        error,
        addToCart,
        removeFromCart,
        isGameInCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        coupon,
        totalWithDiscount
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
}