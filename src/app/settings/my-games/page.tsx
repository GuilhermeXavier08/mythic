'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css'; // Vamos reutilizar ou criar CSS básico

interface Game {
  id: string;
  title: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  price: number;
}

export default function MyGamesPage() {
  const { token } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetch('/api/users/me/games', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setGames(data);
      })
      .finally(() => setLoading(false));
    }
  }, [token]);

  // Função para estilizar o status
  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'APPROVED': return <span style={{color: '#4ade80'}}>Aprovado</span>;
      case 'PENDING': return <span style={{color: '#fbbf24'}}>Em Análise</span>;
      case 'REJECTED': return <span style={{color: '#f87171'}}>Rejeitado</span>;
      default: return status;
    }
  };

  if (loading) return <p style={{color: '#ccc'}}>Carregando seus jogos...</p>;

  return (
    <div style={{ width: '100%', color: '#fff' }}>
      <h2 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>Gerenciar Criações</h2>
      
      {games.length === 0 ? (
        <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '8px' }}>
          <p>Você ainda não enviou nenhum jogo.</p>
          <Link href="/submit-game" style={{ color: '#7000ff', marginTop: '10px', display: 'inline-block' }}>
            Enviar meu primeiro jogo →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {games.map(game => (
            <div key={game.id} style={{ 
              background: '#1a1a1a', 
              padding: '15px', 
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: '1px solid #333'
            }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{game.title}</h3>
                <p style={{ fontSize: '0.9rem', color: '#888' }}>
                  Status: {getStatusLabel(game.status)} • {game.price === 0 ? 'Grátis' : `R$ ${game.price}`}
                </p>
              </div>
              <Link 
                href={`/settings/my-games/${game.id}`}
                style={{
                  background: '#333',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '0.9rem'
                }}
              >
                Editar
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}