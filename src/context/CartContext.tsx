// src/context/CartContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';

// Tipo do Jogo (simplificado)
interface Game {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
}

// Tipo do Item do Carrinho (como vem da API)
export interface CartItemType {
  id: string; // Este é o ID do CartItem
  game: Game;
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
  clearCart: () => void; // Vamos precisar disso no checkout
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, user } = useAuth();

  const itemData = {
    itemCount: items.length,
    totalPrice: items.reduce((total, item) => total + item.game.price, 0),
  };

  // Função para buscar o carrinho da API
  const fetchCart = useCallback(async () => {
    if (!token) {
      setItems([]); // Se não há token, limpa o carrinho
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

  // Busca o carrinho quando o usuário loga
  useEffect(() => {
    fetchCart();
  }, [user, fetchCart]);
  
  // Adiciona ao carrinho
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
      
      // Adiciona o novo item ao estado local
      setItems((prevItems) => [...prevItems, data]);
    } catch (err: any) {
      setError(err.message);
      throw err; // Lança o erro para a página (ex: GameDetailPage)
    }
  };

  // Remove do carrinho
  const removeFromCart = async (itemId: string) => {
    if (!token) throw new Error('Você precisa estar logado');
    setError(null);
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Erro ao remover');
      
      // Remove o item do estado local
      setItems((prevItems) => prevItems.filter(item => item.id !== itemId));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };
  
  // Limpa o carrinho (usado após a compra)
  const clearCart = () => setItems([]);
  
  // Verifica se um JOGO (por gameId) está no carrinho
  const isGameInCart = (gameId: string) => {
    return items.some(item => item.game.id === gameId);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        ...itemData,
        isLoading,
        error,
        addToCart,
        removeFromCart,
        isGameInCart,
        clearCart,
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