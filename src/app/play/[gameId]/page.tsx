// src/app/play/[gameId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';

interface GamePlayData {
  title: string;
  gameUrl: string;
}

export default function PlayGamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;
  const { token } = useAuth();

  const [gameData, setGameData] = useState<GamePlayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !gameId) {
      setLoading(false);
      // Se não houver token, nem tente
      if (!token) setError('Você precisa estar logado para jogar.');
      return;
    }

    const fetchGameData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/play/${gameId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Não foi possível carregar o jogo.');
        }
        setGameData(data);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [gameId, token]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <main className={styles.errorPage}>
        <h1 className={styles.errorTitle}>Erro</h1>
        <p className={styles.errorMessage}>{error}</p>
        <button onClick={() => router.push('/library')} className={styles.button}>
          Voltar para a Biblioteca
        </button>
      </main>
    );
  }

  if (!gameData) {
    return <LoadingSpinner />; // Ainda carregando ou falhou silenciosamente
  }

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <button onClick={() => router.push('/library')} className={styles.button}>
          &larr; Voltar para a Biblioteca
        </button>
        <h1 className={styles.title}>{gameData.title}</h1>
        {/* Adiciona um link para abrir em tela cheia (para o iframe) */}
        <a href={gameData.gameUrl} target="_blank" rel="noopener noreferrer" className={styles.button}>
          Tela Cheia 
        </a>
      </div>

      <div className={styles.iframeContainer}>
        <iframe
          src={gameData.gameUrl}
          className={styles.iframe}
          title={gameData.title}
          sandbox="allow-scripts allow-same-origin" // Segurança básica do iframe
        />
      </div>
    </main>
  );
}