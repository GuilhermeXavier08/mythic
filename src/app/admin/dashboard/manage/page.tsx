'use client';

import { useState, useEffect } from 'react';
import styles from './manage.module.css';
import { useAuth } from '@/context/AuthContext';
// Você pode criar um manage.module.css se quiser estilos específicos

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

  // 1. Buscar TODOS os jogos (aprovados)
  useEffect(() => {
    const fetchAllGames = async () => {
      setLoading(true);
      try {
        // Crie uma rota API que retorne todos os jogos para o admin, ou use a rota publica de jogos
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
    if (!confirm('Tem certeza que deseja remover este jogo da loja? Essa ação não pode ser desfeita.')) return;

    try {
      const res = await fetch(`/api/admin/games/${gameId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setGames(games.filter(g => g.id !== gameId));
        alert('Jogo removido com sucesso.');
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
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Gerenciar Loja</h1>
            <p style={{ color: '#777' }}>Remova jogos ou edite status.</p>
        </div>
        <input 
            type="text" 
            placeholder="Buscar jogo..." 
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #333', background: '#1a1a1a', color: '#fff' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {filteredGames.map(game => (
            <div key={game.id} style={{ background: '#1a1a1a', borderRadius: '8px', overflow: 'hidden', border: '1px solid #333' }}>
                <div style={{ height: '120px', background: '#000' }}>
                    <img src={game.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{game.title}</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <button 
                            onClick={() => handleDelete(game.id)}
                            style={{ flex: 1, padding: '8px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                        >
                            Remover
                        </button>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}