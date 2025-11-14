// src/app/game/[gameId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';

// Definimos o tipo de dados do jogo, incluindo o desenvolvedor
interface GameDetails {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  gameUrl: string;
  developer: {
    username: string;
  };
}

export default function GameDetailPage() {
  const params = useParams();
  const gameId = params.gameId as string;

  const [game, setGame] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGame = async () => {
      setLoading(true);
      setError(null);
      try {
        // Usamos o gameId que pegamos do params
        const response = await fetch(`/api/games/${gameId}`);
        if (!response.ok) {
          throw new Error('Jogo não encontrado ou não disponível.');
        }
        const data = await response.json();
        setGame(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // --- CORREÇÃO DE SEGURANÇA ---
    // Só executa a busca se 'gameId' for uma string válida
    if (gameId && typeof gameId === 'string') {
      fetchGame();
    }
    // --- FIM DA CORREÇÃO ---

  }, [gameId]); // O hook dispara sempre que o gameId mudar

  if (loading) {
    return <LoadingSpinner />; // Mostra um loading
  }

  if (error) {
    return <main className={styles.page}><p className={styles.error}>{error}</p></main>;
  }

  if (!game) {
    return <main className={styles.page}><p>Jogo não encontrado.</p></main>;
  }

  // Se o jogo foi encontrado, renderiza os detalhes
  return (
    <main className={styles.page}>
      <div className={styles.grid}>
        {/* Coluna da Imagem */}
        <div className={styles.imageColumn}>
          <Image
            src={game.imageUrl}
            alt={`Capa do jogo ${game.title}`}
            width={600}
            height={800} // Proporção 3:4
            className={styles.image}
            priority
          />
        </div>

        {/* Coluna de Informações */}
        <div className={styles.infoColumn}>
          <h1 className={styles.title}>{game.title}</h1>
          <p className={styles.developer}>
            Desenvolvido por: <span>{game.developer.username}</span>
          </p>
          <p className={styles.description}>{game.description}</p>
          
          <div className={styles.actionBox}>
            <p className={styles.price}>
              {game.price === 0 ? 'Gratuito' : `R$ ${game.price.toFixed(2)}`}
            </p>
            
            {/* O próximo passo será implementar a lógica de compra/biblioteca */}
            <button className={styles.button}>
              {game.price === 0 ? 'Jogar Agora' : 'Comprar'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}