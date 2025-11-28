// src/app/page.tsx
'use client'; 

import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';
import { useState, useEffect } from 'react';
import GameCard from '@/components/GameCard';
import Link from 'next/link'; // <-- IMPORTADO

// Tipo de dados do Jogo (deve corresponder ao GameCard)
interface Game {
 id: string;
 title: string;
 price: number;
 imageUrl: string;
}

export default function Home() {
 // 1. Obter 'isAdmin' e 'isLoading' (renomeado) do hook
 const { user, isAdmin, isLoading: isAuthLoading } = useAuth();
 
 const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
 // Renomeado 'loading' para 'isGamesLoading' para evitar conflito
 const [isGamesLoading, setIsGamesLoading] = useState(true);

 // 2. Atualizar useEffect para SÓ buscar jogos se NÃO for admin
 useEffect(() => {
    // Apenas busca os jogos se a autenticação terminou E o usuário NÃO é admin
  if (!isAuthLoading && !isAdmin) {
   const fetchGames = async () => {
    try {
     const response = await fetch('/api/games');
     if (!response.ok) throw new Error('Falha ao carregar jogos');
     const data = await response.json();
     setFeaturedGames(data);
    } catch (error) {
     console.error(error);
    } finally {
     setIsGamesLoading(false);
    }
   };
   fetchGames();
  } else {
      // Se for admin ou se a autenticação ainda estiver carregando, paramos o loading de jogos
      setIsGamesLoading(false);
    }
 }, [isAdmin, isAuthLoading]); // <-- Adiciona dependências

  // 3. Mostrar um loading geral enquanto o AuthContext verifica o usuário
  if (isAuthLoading) {
    return (
      <main className={styles.main}>
        <p className={styles.loading}>Carregando...</p>
      </main>
    );
  }

  // 4. Se for Admin, renderiza a "Home de Admin" (sem os elementos da loja)
  if (isAdmin) {
    return (
      <main className={styles.main}>
        <h1 className={styles.title}>
          Painel de Administração
        </h1>
        <p className={styles.loading}>
          Bem-vindo, <span className={styles.username}>{user?.username || 'Admin'}</span>.
        </p>
        <p className={styles.loading}>
          Acesse o <Link href="/admin/dashboard" className={styles.adminLink}>Dashboard</Link> para gerenciar a loja.
        </p>
        {/* O retorno para aqui. Nenhum dos outros <section> será renderizado */}
      </main>
    );
  }

 // 5. Se NÃO for Admin (usuário comum ou deslogado), renderiza a home padrão
 return (
  <main className={styles.main}>
   <h1 className={styles.title}>
    Bem-vindo de volta, <span className={styles.username}>{user?.username || 'jogador'}</span>
   </h1>
   
   {/* Seção de Destaques (Atualizada) */}
   <section className={styles.section}>
    <h2 className={styles.sectionTitle}>Jogos em Destaque</h2>
    {isGamesLoading ? (
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