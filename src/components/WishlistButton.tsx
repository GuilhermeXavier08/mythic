'use client';

import { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';

interface WishlistButtonProps {
    gameId: string;
    size?: number; // Tamanho opcional em pixels
}

export default function WishlistButton({ gameId, size = 35 }: WishlistButtonProps) {
  const { token } = useAuth();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  // Verifica status inicial
  useEffect(() => {
    if (token) {
      fetch('/api/users/me/wishlist', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then((games: any[]) => {
          // A API retorna objetos de jogo, verificamos se o ID está lá
          if (Array.isArray(games) && games.some(g => g.id === gameId)) {
            setIsInWishlist(true);
          }
        })
        .catch(err => console.error(err));
    }
  }, [token, gameId]);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    if (!token) {
      alert('Faça login para salvar jogos!');
      return;
    }
    
    setLoading(true);
    // Mudança visual otimista (muda antes de responder)
    const previousState = isInWishlist;
    setIsInWishlist(!previousState);

    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ gameId })
      });
      
      if (!res.ok) {
        // Se der erro, reverte
        setIsInWishlist(previousState);
      } else {
        const data = await res.json();
        // Confirma o estado final com o servidor
        setIsInWishlist(data.added);
      }
    } catch (err) {
      console.error(err);
      setIsInWishlist(previousState);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={toggleWishlist} 
      disabled={loading}
      style={{
        background: 'rgba(0,0,0,0.6)',
        border: 'none',
        borderRadius: '50%',
        width: `${size}px`,
        height: `${size}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        // Se está na wishlist: Vermelho. Se não: Branco
        color: isInWishlist ? '#ef4444' : 'white', 
        transition: 'transform 0.2s, color 0.2s',
        fontSize: `${size * 0.5}px` // Ícone escala proporcionalmente
      }}
      title={isInWishlist ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      {isInWishlist ? <FaHeart /> : <FaRegHeart />}
    </button>
  );
}