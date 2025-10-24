// src/components/AddFriend.tsx
'use client';

import { useState, FormEvent } from 'react';
import styles from './AddFriend.module.css';
import { FaUserCircle } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';

interface SearchResult {
  id: string;
  username: string;
  friendCode: number;
}

export default function AddFriend() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [message, setMessage] = useState('');
  const { user } = useAuth(); // Para não buscar a si mesmo

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (query.trim() === '') return;
    
    setMessage('Buscando...');
    setResults([]);

    try {
      const response = await fetch(`/api/friends/search?query=${query}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Falha na busca');
      
      // Filtra o próprio usuário dos resultados
      const filteredResults = data.filter((u: SearchResult) => u.username !== user?.username);
      
      setResults(filteredResults);
      setMessage(filteredResults.length > 0 ? '' : 'Nenhum usuário encontrado.');
      
    } catch (error: any) {
      setMessage(error.message);
    }
  };
  
  const handleAddFriend = (friendId: string) => {
    // TODO: Implementar API de envio de pedido de amizade
    alert(`TODO: Enviar pedido de amizade para o usuário ${friendId}`);
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
              onClick={() => handleAddFriend(u.id)}
            >
              Adicionar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}