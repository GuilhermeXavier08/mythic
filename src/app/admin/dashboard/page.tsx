// src/app/admin/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
/* eslint-disable @typescript-eslint/no-explicit-any */
import styles from './page.module.css';
import AdminGuard from '@/components/AdminGuard'; // 1. IMPORTE O GUARD

interface GameDeveloper {
  username: string;
  email: string;
}

interface PendingGame {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  gameUrl: string;
  developer: GameDeveloper;
}

// 2. RENOMEIE O COMPONENTE PRINCIPAL PARA "DashboardContent"
function DashboardContent() {
  const [games, setGames] = useState<PendingGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  // ... (todo o resto da lógica: fetchPendingGames, useEffect, handleReview)
  // Função para buscar os jogos pendentes
  const fetchPendingGames = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/games', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Falha ao buscar jogos pendentes');
      const data = await response.json();
      setGames(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Busca os jogos quando o componente carrega
  useEffect(() => {
    if (token) {
      fetchPendingGames();
    }
  }, [token]);

  // Função para aprovar ou rejeitar
  const handleReview = async (gameId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch(`/api/admin/games/${gameId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Falha ao atualizar o status');
      setGames(games.filter(game => game.id !== gameId));

    } catch (err: any) {
      setError(err.message);
    }
  };


  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Painel de Administração</h1>
      <h2 className={styles.subtitle}>Jogos Pendentes de Revisão</h2>

      {loading && <p>Carregando...</p>}
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.gameList}>
        {games.length === 0 && !loading && <p>Nenhum jogo pendente!</p>}
        
        {games.map((game) => (
          <div key={game.id} className={styles.gameCard}>
            <img src={game.imageUrl} alt={game.title} className={styles.gameImage} />
            <div className={styles.gameInfo}>
              <h3 className={styles.gameTitle}>{game.title}</h3>
              <p className={styles.gameDev}>por: {game.developer.username} ({game.developer.email})</p>
              <p className={styles.gameDesc}>{game.description}</p>
              <p className={styles.gamePrice}>R$ {game.price.toFixed(2)}</p>
              
              <div className={styles.gameLinks}>
                <a href={game.gameUrl} target="_blank" rel="noopener noreferrer">Testar Jogo</a>
                <a href={game.imageUrl} target="_blank" rel="noopener noreferrer">Ver Capa</a>
              </div>
            </div>
            <div className={styles.actions}>
              <button 
                className={`${styles.button} ${styles.approve}`}
                onClick={() => handleReview(game.id, 'APPROVED')}
              >
                Aprovar
              </button>
              <button 
                className={`${styles.button} ${styles.reject}`}
                onClick={() => handleReview(game.id, 'REJECTED')}
              >
                Rejeitar
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

// 3. CRIE A EXPORTAÇÃO DEFAULT QUE ENVOLVE O CONTEÚDO COM O GUARD
export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <DashboardContent />
    </AdminGuard>
  );
}