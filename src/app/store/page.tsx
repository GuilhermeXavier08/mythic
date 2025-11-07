// src/app/store/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import GameCard from '@/components/GameCard';

// O tipo de dados do Jogo (deve corresponder ao Prisma)
interface Game {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
}

export default function StorePage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Efeito para buscar os jogos da nossa API quando a página carregar
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('/api/games');
        if (!response.ok) {
          throw new Error('Falha ao carregar os jogos');
        }
        const data = await response.json();
        setGames(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []); // O array vazio [] significa que isso roda apenas uma vez

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Loja de Jogos</h1>

      {loading && <p className={styles.loading}>Carregando jogos...</p>}

      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && (
        <div className={styles.grid}>
          {games.length > 0 ? (
            games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))
          ) : (
            <p>Nenhum jogo encontrado na loja.</p>
          )}
        </div>
      )}
    </main>
  );
}