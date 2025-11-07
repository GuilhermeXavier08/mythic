'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './FriendsList.module.css';
import { FaUserCircle } from 'react-icons/fa';

interface Friend {
  id: string;
  username: string;
  friendCode: number;
}

export default function FriendsList() {
  const { token } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch('/api/friends/list', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!response.ok) {
          throw new Error('Falha ao carregar amigos');
        }
        const data = (await response.json()) as Friend[];
        setFriends(data || []);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [token]);

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
              <FaUserCircle size={40} className={styles.friendIcon} />
              <div className={styles.friendDetails}>
                <span className={styles.friendUsername}>{friend.username}</span>
                <span className={styles.friendCode}>ID: {friend.friendCode}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}