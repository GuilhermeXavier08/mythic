// src/components/AddFriend.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './AddFriend.module.css';
import { FaUserCircle } from 'react-icons/fa';

interface SearchResult {
  id: string;
  username: string;
  friendCode: number;
}

export default function AddFriend() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [message, setMessage] = useState('');
  const { user, token } = useAuth(); // Para não buscar a si mesmo

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

      // Filtra o próprio usuário dos resultados
      const resultsArray = Array.isArray(data) ? data as SearchResult[] : [];
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
      // Envia o friendCode como identificador (número)
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
      // Clear results after successful request
      setResults([]);
      setQuery('');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setMessage(message);
    }
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
        <button type="submit" className={styles.searchButton}>Buscar</button>
      </form>
      
      <div className={styles.resultsContainer}>
        {message && <p className={styles.message}>{message}</p>}
        {results.map((u) => (
          <div key={u.id} className={styles.resultItem}>
            <FaUserCircle size={40} className={styles.resultIcon} />
            <div className={styles.resultInfo}>
              <span className={styles.resultUsername}>{u.username}</span>
              <span className={styles.resultFriendCode}>ID: {u.friendCode}</span>
            </div>
            <button 
              className={styles.addButton}
              onClick={() => handleAddFriend(u.id, u.friendCode)}
            >
              Adicionar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}