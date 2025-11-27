'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './ProfileHeader.module.css';
import { FaUserCircle } from 'react-icons/fa';
import Link from 'next/link';

interface ProfileData {
  id: string;
  username: string;
  friendCode: number;
  bio?: string | null;
  avatarUrl?: string | null;
}

type FriendshipStatus = 'SELF' | 'FRIENDS' | 'PENDING' | 'NOT_FRIENDS';

export default function ProfileHeader({ profileData }: { profileData: ProfileData }) {
  const { user, token } = useAuth();
  const [status, setStatus] = useState<FriendshipStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!profileData) return;
    if (!user) {
      setStatus('NOT_FRIENDS');
      return;
    }

    if (user.userId === profileData.id) {
      setStatus('SELF');
      return;
    }

    const controller = new AbortController();
    const fetchStatus = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/friends/status/${profileData.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          signal: controller.signal,
        });
        if (!res.ok) {
          setStatus('NOT_FRIENDS');
          return;
        }
        const data = await res.json();
        setStatus(data.status as FriendshipStatus);
      } catch (err) {
        if ((err as any)?.name === 'AbortError') return;
        console.error('Erro ao buscar status:', err);
        setStatus('NOT_FRIENDS');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
    return () => controller.abort();
  }, [profileData, user, token]);

  const handleAddFriend = async () => {
    if (!token) return alert('Você precisa estar logado para adicionar amigos.');
    try {
      setIsLoading(true);
      const res = await fetch('/api/friends/send-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetIdentifier: profileData.friendCode.toString() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Falha ao enviar solicitação');
        return;
      }
      setStatus('PENDING');
    } catch (error) {
      console.error(error);
      alert('Erro ao enviar solicitação');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    if (!token) return alert('Você precisa estar logado.');
    if (!confirm(`Remover ${profileData.username} dos seus amigos?`)) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/friends/${profileData.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Falha ao remover amigo');
        return;
      }
      setStatus('NOT_FRIENDS');
    } catch (error) {
      console.error(error);
      alert('Erro ao remover amigo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.profileHeader}>
      <div className={styles.avatarWrap}>
        {profileData.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profileData.avatarUrl} alt={`${profileData.username} avatar`} className={styles.avatarImage} />
        ) : (
          <FaUserCircle className={styles.avatar} />
        )}
      </div>
      <h1 className={styles.username}>{profileData.username}</h1>
      {profileData.bio ? <p className={styles.bio}>{profileData.bio}</p> : null}
      <div className={styles.meta}>
        <span className={styles.friendCode}>ID: {profileData.friendCode}</span>
      </div>

      <div className={styles.actions}>
        {status === null || isLoading ? (
          <button className={styles.actionButton} disabled>Carregando...</button>
        ) : status === 'SELF' ? (
          <Link href="/settings/profile" className={styles.actionButton}>Editar Perfil</Link>
        ) : status === 'FRIENDS' ? (
          <button onClick={handleRemoveFriend} className={styles.removeButton} disabled={isLoading}>Remover Amigo</button>
        ) : status === 'PENDING' ? (
          <button className={styles.pendingButton} disabled>Solicitação Enviada</button>
        ) : (
          <button onClick={handleAddFriend} className={styles.actionButton} disabled={isLoading}>Adicionar Amigo</button>
        )}
      </div>
    </div>
  );
}
