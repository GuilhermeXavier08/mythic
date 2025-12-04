// src/components/AddFriend.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation'; // <-- Importe o router
import styles from './AddFriend.module.css';
import { FaUserCircle, FaUser } from 'react-icons/fa'; // <-- Importe FaUser

interface SearchResult {
  id: string;
  username: string;
  friendCode: number;
  isFriend: boolean;
  requestStatus: 'PENDING' | 'NONE';
  avatarUrl?: string | null;
}

export default function AddFriend() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [message, setMessage] = useState('');
  const { user, token } = useAuth();
  const router = useRouter(); // <-- Inicialize o router

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (query.trim() === '') return;

    setMessage('Buscando...');
    setResults([]);

    try {
      const response = await fetch(`/api/friends/search?query=${query}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = (await response.json()) as SearchResult | SearchResult[] | { error?: string };

      if (!response.ok) {
        const err = (data && typeof data === 'object' && data !== null) ? (data as Record<string, unknown>)['error'] : undefined;
        const errMsg = typeof err === 'string' ? err : 'Falha na busca';
        throw new Error(errMsg);
      }

      const resultsArray = Array.isArray(data) ? (data as SearchResult[]) : [];
      const filteredResults = resultsArray.filter((u) => u.username !== user?.username);

      setResults(filteredResults);
      setMessage(filteredResults.length > 0 ? '' : 'Nenhum usuário encontrado.');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setMessage(message);
    }
  };

  const handleAddFriend = async (friendId: string, friendCode: number) => {
    setMessage('Enviando solicitação...');
    try {
      const response = await fetch('/api/friends/send-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ targetIdentifier: friendCode.toString() }),
      });

      if (!response.ok) {
        const data: unknown = await response.json().catch(() => ({}));
        let errMsg = 'Falha ao enviar solicitação';
        if (data && typeof data === 'object' && 'error' in data) {
          const maybeError = (data as Record<string, unknown>)['error'];
          if (typeof maybeError === 'string') errMsg = maybeError;
        }
        throw new Error(errMsg);
      }

      setMessage('Solicitação enviada com sucesso!');
      setResults(results.map(r =>
        r.id === friendId ? { ...r, requestStatus: 'PENDING' as const } : r
      ));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setMessage(message);
    }
  };

  const handleRemoveFriend = async (friendId: string, friendUsername: string) => {
    if (!token) return;

    if (!window.confirm(`Tem certeza que deseja remover ${friendUsername}?`)) {
      return;
    }

    setMessage('Removendo amigo...');
    try {
      const response = await fetch(`/api/friends/${friendId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao remover amigo.');
      }

      setMessage(`${friendUsername} removido com sucesso.`);
      setResults(results.map(r =>
        r.id === friendId ? { ...r, isFriend: false, requestStatus: 'NONE' as const } : r
      ));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setMessage(message);
    }
  };

  // Função para ir ao perfil
  const goToProfile = (username: string) => {
    router.push(`/profile/${username}`);
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.searchInput}
          placeholder="Buscar por Nome de Usuário ou ID..."
        />
        <button type="submit" className={styles.searchButton}>
          Buscar
        </button>
      </form>

      <div className={styles.resultsContainer}>
        {message && <p className={styles.message}>{message}</p>}
        {results.map((u) => (
          <div key={u.id} className={styles.resultItem}>

            <div className={styles.resultAvatarWrapper}>
              {u.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={u.avatarUrl}
                  alt={`${u.username}'s avatar`}
                  className={styles.resultAvatarImage}
                />
              ) : (
                <FaUserCircle size={40} className={styles.resultIcon} />
              )}
            </div>

            <div className={styles.resultInfo}>
              <span className={styles.resultUsername}>{u.username}</span>
              <span className={styles.resultFriendCode}>ID: {u.friendCode}</span>
            </div>

            {/* --- BOTÃO DE PERFIL --- */}
            <button 
                className={styles.profileButton} // Você precisará adicionar estilo para isso (redondo)
                onClick={() => goToProfile(u.username)}
                title="Ver Perfil"
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: '#444', // Cor de fundo do botão
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    marginRight: '10px'
                }}
            >
                <FaUser size={18} />
            </button>
            {/* ----------------------- */}

            {u.isFriend ? (
              <button
                className={styles.removeButton}
                onClick={() => handleRemoveFriend(u.id, u.username)}
              >
                Remover
              </button>
            ) : u.requestStatus === 'PENDING' ? (
              <button className={styles.pendingButton} disabled>
                Solicitação Enviada
              </button>
            ) : (
              <button
                className={styles.addButton}
                onClick={() => handleAddFriend(u.id, u.friendCode)}
              >
                Adicionar
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}