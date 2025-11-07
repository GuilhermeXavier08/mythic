// src/app/friends/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './page.module.css';
import AddFriend from '../../components/AddFriend';
import FriendsList from '../../components/FriendsList';
import PendingRequests from '../../components/PendingRequests';
import { FaUserCircle } from 'react-icons/fa';

interface CurrentUser {
  id: string;
  username: string;
  email: string;
  friendCode: number;
}

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'requests'>('list');
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      const fetchUser = async () => {
        try {
          const response = await fetch('/api/users/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) throw new Error('Falha ao buscar dados do usuário');
          const data = await response.json();
          setCurrentUser(data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [token]);

  const copyToClipboard = () => {
    if (currentUser) {
      navigator.clipboard.writeText(currentUser.friendCode.toString());
      alert('Seu ID de amigo foi copiado!');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Carregando...</div>;
  }

  return (
    <main className={styles.page}>
      {/* Profile Section */}
      <section className={styles.profileSection}>
        <FaUserCircle size={100} className={styles.profileIcon} />
        <h1 className={styles.username}>{currentUser?.username}</h1>
        <div className={styles.idBox} onClick={copyToClipboard} title="Clique para copiar">
          <span>Seu ID:</span>
          <strong>{currentUser?.friendCode}</strong>
        </div>
      </section>

      {/* Tabs Section */}
      <section className={styles.tabsSection}>
        <div className={styles.tabHeaders}>
          <button
            className={`${styles.tabButton} ${activeTab === 'list' ? styles.active : ''}`}
            onClick={() => setActiveTab('list')}
          >
            Lista de Amigos
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'add' ? styles.active : ''}`}
            onClick={() => setActiveTab('add')}
          >
            Adicionar Amigo
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'requests' ? styles.active : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Solicitações Pendentes
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'list' && <FriendsList />}
          {activeTab === 'add' && <AddFriend />}
          {activeTab === 'requests' && <PendingRequests />}
        </div>
      </section>
    </main>
  );
}