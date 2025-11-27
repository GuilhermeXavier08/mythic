'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './FriendsList.module.css';
import { FaUserCircle } from 'react-icons/fa';

interface Friend {
  id: string;
  username: string;
  friendCode: number;
  avatarUrl?: string | null;
}

export default function FriendsList() {
  const { token } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar amigos (refatorada para ser reutilizável)
  const fetchFriends = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/friends/list', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!response.ok) {
        throw new Error('Falha ao carregar amigos');
      }
      const data = (await response.json()) as Friend[];
      setFriends(data || []);
      setError(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchFriends();
    }
  }, [token]);

  // Função para remover amigo
  const handleRemoveFriend = async (friendId: string, friendUsername: string) => {
    if (!window.confirm(`Tem certeza que deseja remover ${friendUsername} da sua lista de amigos?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/friends/${friendId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao remover amigo.');
      }

      // Atualiza a lista removendo o amigo ou refazendo a busca
      await fetchFriends();
      alert(`${friendUsername} foi removido com sucesso.`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setError(message);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.message}>Carregando amigos...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      {friends.length === 0 ? (
        <p className={styles.message}>Você ainda não adicionou nenhum amigo.</p>
      ) : (
        friends.map(friend => (
          <div key={friend.id} className={styles.friendItem}>
            <div className={styles.friendInfo}>
              <div className={styles.friendAvatarWrapper}>
                {friend.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={friend.avatarUrl}
                    alt={`${friend.username}'s avatar`}
                    className={styles.friendAvatarImage}
                  />
                ) : (
                  <FaUserCircle size={40} className={styles.friendIcon} />
                )}
              </div>
              <div className={styles.friendDetails}>
                <span className={styles.friendUsername}>{friend.username}</span>
                <span className={styles.friendCode}>ID: {friend.friendCode}</span>
              </div>
            </div>
            <button
              className={styles.removeButton}
              onClick={() => handleRemoveFriend(friend.id, friend.username)}
              disabled={loading}
            >
              Remover
            </button>
          </div>
        ))
      )}
    </div>
  );
}