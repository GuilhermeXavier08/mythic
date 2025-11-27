// src/app/library/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';
// --- MUDANÇA NO IMPORT ---
import LibraryGameItem from '@/components/LibraryGameItem';

interface Game {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
}

interface PurchaseWithGame {
  id: string;
  game: Game;
}

export default function LibraryPage() {
  const [purchasedGames, setPurchasedGames] = useState<PurchaseWithGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth(); 

  // ... (o useEffect e a lógica de fetch são os MESMOS) ...
  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError('Você precisa estar logado para ver sua biblioteca.');
      return;
    }

    const fetchLibrary = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/library', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Não foi possível carregar a biblioteca');
        const data = await response.json();
        setPurchasedGames(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, [token]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Minha Biblioteca</h1>
      
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && purchasedGames.length === 0 && (
        <p className={styles.empty}>
          Sua biblioteca está vazia. Jogos que você comprar na loja aparecerão aqui!
        </p>
      )}

      {/* --- MUDANÇA NA LISTAGEM --- */}
      <div className={styles.list}>
        {purchasedGames.map((purchase) => (
          <LibraryGameItem key={purchase.id} game={purchase.game} />
        ))}
      </div>
      {/* --- FIM DA MUDANÇA --- */}

    </main>
  );
}