// src/components/PendingRequests.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './PendingRequests.module.css';
import { FaUserCircle } from 'react-icons/fa';

interface FriendRequest {
  id: string;
  sender: {
    id: string;
    username: string;
    friendCode: number;
    avatarUrl?: string | null; // <-- MUDANÇA 1: Adicionado avatarUrl
  };
  createdAt: string;
}

export default function PendingRequests() {
  const { token } = useAuth();
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true); // <-- Adicionado para garantir o estado de loading ao recarregar
    try {
      const response = await fetch('/api/friends/received-requests', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!response.ok) {
        throw new Error('Falha ao carregar solicitações');
      }
      const data = (await response.json()) as FriendRequest[];
      setRequests(data || []);
      setError(null); // <-- Limpa erros anteriores
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) { // <-- Boa prática verificar o token antes de buscar
      fetchRequests();
    }
  }, [token]);

  const handleRequest = async (requestId: string, action: 'ACCEPT' | 'REJECT') => {
    try {
      const response = await fetch('/api/friends/handle-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          requestId,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error(
          action === 'ACCEPT'
            ? 'Falha ao aceitar solicitação'
            : 'Falha ao rejeitar solicitação'
        );
      }

      // Atualiza a lista após a ação (remove o item da UI imediatamente ou busca de novo)
      fetchRequests(); // Recarrega a lista do servidor
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setError(message);
    }
  };

  if (loading) {
    return <div className={styles.message}>Carregando solicitações...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      {requests.length === 0 ? (
        <p className={styles.message}>Nenhuma solicitação pendente.</p>
      ) : (
        <>
          <h3 className={styles.title}>Solicitações Pendentes</h3>
          {requests.map((request) => (
            <div key={request.id} className={styles.requestItem}>
              <div className={styles.userInfo}>

                {/* // <-- MUDANÇA 2: Lógica do Avatar adicionada */}
                <div className={styles.userAvatarWrapper}>
                  {request.sender.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={request.sender.avatarUrl}
                      alt={`${request.sender.username}'s avatar`}
                      className={styles.userAvatarImage}
                    />
                  ) : (
                    <FaUserCircle size={40} className={styles.userIcon} />
                  )}
                </div>
                {/* // <-- FIM DA MUDANÇA 2 */}

                <div className={styles.userDetails}>
                  <span className={styles.username}>{request.sender.username}</span>
                  <span className={styles.friendCode}>
                    ID: {request.sender.friendCode}
                  </span>
                </div>
              </div>
              <div className={styles.actions}>
                <button
                  className={`${styles.actionButton} ${styles.accept}`}
                  onClick={() => handleRequest(request.id, 'ACCEPT')}
                >
                  Aceitar
                </button>
                <button
                  className={`${styles.actionButton} ${styles.reject}`}
                  onClick={() => handleRequest(request.id, 'REJECT')}
                >
                  Rejeitar
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}