'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';
import NonAdminGuard from '@/components/NonAdminGuard';

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

function LibraryContent() {
  const [purchasedGames, setPurchasedGames] = useState<PurchaseWithGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth(); 

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError('Você precisa estar logado para ver sua biblioteca.');
      return;
    }

    const fetchLibrary = async () => {
      setLoading(true);
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

  if (loading) return <div className={styles.loadingContainer}><LoadingSpinner /></div>;

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Minha Biblioteca</h1>
        <p className={styles.subtitle}>{purchasedGames.length} jogos adquiridos</p>
      </div>
      
      {error && <div className={styles.errorContainer}><p>{error}</p></div>}

      {!loading && !error && purchasedGames.length === 0 && (
        <div className={styles.emptyState}>
          <p>Sua biblioteca está vazia.</p>
          <Link href="/store" className={styles.browseButton}>
            Explorar Loja
          </Link>
        </div>
      )}

      {/* GRID DE JOGOS DA BIBLIOTECA */}
      <div className={styles.grid}>
        {purchasedGames.map((purchase) => (
          <Link 
            key={purchase.id} 
            href={`/game/${purchase.game.id}`}
            className={styles.cardWrapper}
          >
            {/* Imagem do Jogo */}
            <Image 
              src={purchase.game.imageUrl} 
              alt={purchase.game.title}
              fill
              className={styles.cardImage}
              sizes="(max-width: 768px) 50vw, 20vw"
            />
            
            {/* Overlay com Título e Status */}
            <div className={styles.cardOverlay}>
              <span className={styles.cardTitle}>{purchase.game.title}</span>
              <span className={styles.statusBadge}>Jogar</span>
            </div>
          </Link>
        ))}
      </div>

      {/* --- FOOTER ADICIONADO AQUI --- */}
      <footer className={styles.footer}>
        <p>&copy; 2024 Mythic Store. Todos os direitos reservados.</p>
      </footer>
    </main>
  );
}

export default function LibraryPage() {
  return (
    <NonAdminGuard>
      <LibraryContent />
    </NonAdminGuard>
  );
}