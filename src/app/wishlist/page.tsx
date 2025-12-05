'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import NonAdminGuard from '@/components/NonAdminGuard';
import LoadingSpinner from '@/components/LoadingSpinner';
import WishlistButton from '@/components/WishlistButton'; // Reutilizamos para poder remover
import styles from './page.module.css'; // Usaremos CSS inline ou crie o arquivo se preferir, vou usar inline container similar ao carrinho

interface Game {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  description: string;
}

function WishlistContent() {
  const { token } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/users/me/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGames(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [token]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}><LoadingSpinner /></div>;

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
        Minha Lista de Desejos
      </h1>

      {games.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: '#1a1a1a', borderRadius: '12px' }}>
          <p style={{ fontSize: '1.2rem', color: '#888', marginBottom: '1rem' }}>Sua lista de desejos está vazia.</p>
          <Link href="/store" style={{ color: '#7000ff', textDecoration: 'underline' }}>
            Explorar a Loja
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
          {games.map(game => (
            <div key={game.id} style={{ background: '#1a1a1a', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333', position: 'relative' }}>
              
              {/* Botão de Remover no canto */}
              <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
                 <WishlistButton gameId={game.id} size={30} />
              </div>

              <Link href={`/game/${game.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
                    <Image 
                        src={game.imageUrl} 
                        alt={game.title} 
                        fill 
                        style={{ objectFit: 'cover' }} 
                    />
                </div>
                <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {game.title}
                    </h3>
                    <p style={{ color: '#7000ff', fontWeight: 'bold' }}>
                        {game.price === 0 ? 'Grátis' : `R$ ${game.price.toFixed(2)}`}
                    </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default function WishlistPage() {
    return (
        <NonAdminGuard>
            <WishlistContent />
        </NonAdminGuard>
    );
}