'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './approvals.module.css'; // CSS Específico desta página

interface PendingGame {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  gameUrl: string;
  developer: { username: string; email: string };
}

export default function ApprovalsPage() {
  const [games, setGames] = useState<PendingGame[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchPendingGames = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/games', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setGames(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPendingGames();
  }, [token]);

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
      if (response.ok) {
        setGames(games.filter(game => game.id !== gameId));
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Aprovação de Jogos</h1>
        <p style={{ color: '#777' }}>Revise os jogos enviados pela comunidade.</p>
      </div>

      {loading && <p>Carregando...</p>}
      {!loading && games.length === 0 && <div className={styles.emptyState}>Nenhum jogo pendente.</div>}

      <div className={styles.grid}>
        {games.map((game) => (
          <div key={game.id} className={styles.card}>
            <div className={styles.imageWrapper}>
               {/* Use <img /> ou Next <Image /> */}
               <img src={game.imageUrl} alt={game.title} className={styles.img} />
            </div>
            <div className={styles.content}>
               <h3>{game.title}</h3>
               <span className={styles.dev}>Dev: {game.developer.username}</span>
               <p className={styles.desc}>{game.description}</p>
               <div className={styles.meta}>
                  <strong>R$ {game.price.toFixed(2)}</strong>
                  <a href={game.gameUrl} target="_blank" className={styles.link}>Testar Build</a>
               </div>
            </div>
            <div className={styles.actions}>
               <button onClick={() => handleReview(game.id, 'APPROVED')} className={styles.btnApprove}>Aprovar</button>
               <button onClick={() => handleReview(game.id, 'REJECTED')} className={styles.btnReject}>Rejeitar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}