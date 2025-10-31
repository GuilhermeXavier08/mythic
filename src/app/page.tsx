// src/app/page.tsx
'use client'; 

import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';
import { useState, useEffect } from 'react';
import GameCard from '@/components/GameCard'; // <-- IMPORTADO

// Tipo de dados do Jogo (deve corresponder ao GameCard)
interface Game {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
}

export default function Home() {
  const { user } = useAuth();
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  // Busca os jogos da loja para exibir na home
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('/api/games'); // API que só retorna jogos 'APPROVED'
        if (!response.ok) throw new Error('Falha ao carregar jogos');
        const data = await response.json();
        setFeaturedGames(data); // Por enquanto, todos os da loja são destaque
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>
        Bem-vindo de volta, <span className={styles.username}>{user?.username || 'jogador'}</span>
      </h1>
      
      {/* Seção de Destaques (Atualizada) */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Jogos em Destaque</h2>
        {loading ? (
          <p className={styles.loading}>Carregando destaques...</p>
        ) : (
          <div className={styles.grid}>
            {featuredGames.length > 0 ? (
              featuredGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))
            ) : (
              <p className={styles.loading}>Nenhum jogo em destaque no momento.</p>
            )}
          </div>
        )}
      </section>

      {/* Seção de Jogos Recentes (Placeholder) */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Jogados Recentemente</h2>
        <div className={styles.grid}>
          <div className={styles.placeholderCard}>Em breve</div>
        </div>
      </section>

      {/* Seção de Amigos (Placeholder) */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Amigos Online</h2>
        <div className={styles.placeholderList}>
          <div className={styles.placeholderFriend}>Em breve</div>
        </div>
      </section>
    </main>
  );
}