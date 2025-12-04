'use client';

import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';
import { useState, useEffect } from 'react';
import Link from 'next/link'; 
import Image from 'next/image'; // <--- IMPORTANTE: Importar Image

interface Game {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
}

export default function Home() {
  const { user, isAdmin, isLoading: isAuthLoading } = useAuth();
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [isGamesLoading, setIsGamesLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && !isAdmin) {
      const fetchGames = async () => {
        try {
          const response = await fetch('/api/games');
          if (!response.ok) throw new Error('Falha ao carregar jogos');
          const data = await response.json();
          // Pega apenas os 8 primeiros para a home
          setFeaturedGames(data.slice(0, 8));
        } catch (error) {
          console.error(error);
        } finally {
          setIsGamesLoading(false);
        }
      };
      fetchGames();
    } else {
      setIsGamesLoading(false);
    }
  }, [isAdmin, isAuthLoading]);

  // Loading Screen
  if (isAuthLoading) {
    return (
      <main className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Carregando Mythic...</p>
      </main>
    );
  }

  // Admin View
  if (isAdmin) {
    return (
      <main className={styles.main}>
        <div className={styles.adminHeader}>
          <h1 className={styles.title}>Painel Admin</h1>
          <p>Bem-vindo, {user?.username || 'Admin'}.</p>
        </div>
        <div className={styles.adminContent}>
           <Link href="/admin/dashboard" className={styles.ctaButton}>Ir para Dashboard</Link>
        </div>
      </main>
    );
  }

  // User View
  return (
    <main className={styles.main}>
      
      {/* HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroTag}>Destaque da Semana</span>
          <h1 className={styles.heroTitle}>Explore Novos Mundos</h1>
          <p className={styles.heroSubtitle}>Descubra as melhores ofertas e lançamentos exclusivos da Mythic.</p>
          <button className={styles.ctaButton}>Ver Ofertas</button>
        </div>
        <div className={styles.heroOverlay}></div>
      </section>

      {/* GRID DE JOGOS */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Jogos em Destaque</h2>
          <Link href="/store" className={styles.viewAll}>Ver todos</Link>
        </div>

        {isGamesLoading ? (
          <div className={styles.gridLoading}>
            {[1,2,3,4].map(i => <div key={i} className={styles.skeletonCard} />)}
          </div>
        ) : (
          <div className={styles.grid}>
            {featuredGames.length > 0 ? (
              featuredGames.map((game) => (
                <Link 
                  key={game.id} 
                  href={`/game/${game.id}`} 
                  className={styles.cardWrapper}
                >
                  {/* 1. A IMAGEM DE FUNDO */}
                  <Image 
                    src={game.imageUrl} 
                    alt={game.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    className={styles.cardImage}
                  />

                  {/* 2. O OVERLAY COM NOME E PREÇO (IGUAL À LOJA) */}
                  <div className={styles.cardOverlay}>
                    <span className={styles.cardTitle}>{game.title}</span>
                    <span className={styles.cardPrice}>
                      {game.price === 0 ? 'Grátis' : `R$ ${game.price.toFixed(2)}`}
                    </span>
                  </div>

                </Link>
              ))
            ) : (
              <p className={styles.emptyState}>Nenhum jogo encontrado.</p>
            )}
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <p>&copy; 2024 Mythic Store. Todos os direitos reservados.</p>
      </footer>
    </main>
  );
}