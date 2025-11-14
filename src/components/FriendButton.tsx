'use client';

import { useAuth } from '@/context/AuthContext';
import styles from './FriendButton.module.css';
import { useState, useEffect } from 'react';

interface TargetUser {
  id: string;
  username: string;
  friendCode: number;
}

interface FriendButtonProps {
  targetUser: TargetUser;
}

export default function FriendButton({ targetUser }: FriendButtonProps) {
  const { user, token } = useAuth();
  const [isFriend, setIsFriend] = useState(false);
  const [requestStatus, setRequestStatus] = useState<'PENDING' | 'NONE'>('NONE');
  const [loading, setLoading] = useState(false);

  // Se o usuário não está logado ou é o próprio perfil, não mostra nada
  if (!user || user.userId === targetUser.id) {
    return null;
  }

  useEffect(() => {
    // Buscar status de amizade
    const fetchFriendStatus = async () => {
      try {
        const response = await fetch(
          `/api/friends/search?query=${targetUser.username}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          }
        );

        if (response.ok) {
          const results = await response.json();
          const found = results.find((r: any) => r.id === targetUser.id);
          if (found) {
            setIsFriend(found.isFriend);
            setRequestStatus(found.requestStatus);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar status de amizade:', error);
      }
    };

    if (token) {
      fetchFriendStatus();
    }
  }, [targetUser.id, targetUser.username, token]);

  const handleAddFriend = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/friends/send-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ targetIdentifier: targetUser.friendCode.toString() }),
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar solicitação');
      }

      setRequestStatus('PENDING');
    } catch (error) {
      console.error('Erro ao adicionar amigo:', error);
      alert('Erro ao enviar solicitação de amizade');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!window.confirm(`Tem certeza que deseja remover ${targetUser.username}?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/friends/${targetUser.id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao remover amigo');
      }

      setIsFriend(false);
      setRequestStatus('NONE');
    } catch (error) {
      console.error('Erro ao remover amigo:', error);
      alert('Erro ao remover amigo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {isFriend ? (
        <button
          className={styles.removeButton}
          onClick={handleRemoveFriend}
          disabled={loading}
        >
          Remover Amigo
        </button>
      ) : requestStatus === 'PENDING' ? (
        <button className={styles.pendingButton} disabled>
          Solicitação Enviada
        </button>
      ) : (
        <button
          className={styles.addButton}
          onClick={handleAddFriend}
          disabled={loading}
        >
          Adicionar Amigo
        </button>
      )}
    </div>
  );
}
