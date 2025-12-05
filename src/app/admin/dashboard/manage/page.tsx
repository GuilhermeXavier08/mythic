'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './manage.module.css';
import { useAuth } from '@/context/AuthContext';

interface Game {
  id: string;
  title: string;
  status: string;
  imageUrl: string;
}

export default function ManageGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  // 1. Buscar TODOS os jogos
  useEffect(() => {
    const fetchAllGames = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/games'); 
        if (res.ok) {
          const data = await res.json();
          setGames(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllGames();
  }, []);

  // 2. Função de Deletar
  const handleDelete = async (gameId: string) => {
    const confirmed = window.confirm('⚠️ ATENÇÃO:\n\nTem certeza que deseja remover este jogo da loja?\nIsso removerá o jogo da biblioteca de quem comprou.\n\nEssa ação não pode ser desfeita.');
    
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/games/${gameId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setGames(games.filter(g => g.id !== gameId));
        // Opcional: Mostrar um toast/notificação de sucesso
      } else {
        alert('Erro ao remover jogo.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão.');
    }
  };

  const filteredGames = games.filter(g => g.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      {/* Cabeçalho */}
      <div className={styles.header}>
        <div className={styles.titleBlock}>
            <h1>Gerenciar Loja</h1>
            <p>Remova jogos ativos ou verifique o catálogo.</p>
        </div>
        
        <div className={styles.searchWrapper}>
          <input 
              type="text" 
              placeholder="Buscar por nome..." 
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Estados de Loading/Vazio */}
      {loading && <p className={styles.loadingText}>Carregando catálogo...</p>}
      
      {!loading && filteredGames.length === 0 && (
        <div className={styles.emptyState}>
          Nenhum jogo encontrado com esse nome.
        </div>
      )}

      {/* Grid de Cards */}
      <div className={styles.grid}>
        {filteredGames.map(game => (
            <div key={game.id} className={styles.card}>
                
                {/* Imagem */}
                <div className={styles.imageContainer}>
                    <Image 
                      src={game.imageUrl} 
                      alt={game.title} 
                      fill 
                      className={styles.cardImage}
                      sizes="(max-width: 768px) 100vw, 300px"
                    />
                </div>
                
                {/* Conteúdo */}
                <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle} title={game.title}>{game.title}</h3>
                    <span className={styles.cardId}>ID: {game.id.slice(0, 8)}...</span>
                    
                    <div className={styles.actions}>
                        <button 
                            onClick={() => handleDelete(game.id)}
                            className={styles.btnDelete}
                            title="Remover jogo permanentemente"
                        >
                            Remover Jogo
                        </button>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}