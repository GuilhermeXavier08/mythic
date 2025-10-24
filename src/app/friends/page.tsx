// src/app/friends/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';
import AddFriend from '@/components/AddFriend';
import FriendsList from '@/components/FriendsList';
import { FaUserCircle } from 'react-icons/fa'; // Ícone de perfil

// Precisamos instalar a biblioteca de ícones: npm install react-icons
// Rode 'npm install react-icons' no seu terminal!

interface CurrentUser {
  id: string;
  username: string;
  email: string;
  friendCode: number;
}

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('list');
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
      {/* Seção do Perfil (como no protótipo) */}
      <section className={styles.profileSection}>
        <FaUserCircle size={100} className={styles.profileIcon} />
        <h1 className={styles.username}>{currentUser?.username}</h1>
        <div className={styles.idBox} onClick={copyToClipboard} title="Clique para copiar">
          <span>Seu ID:</span>
          <strong>{currentUser?.friendCode}</strong>
        </div>
      </section>

      {/* Seção de Abas */}
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
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'list' && <FriendsList />}
          {activeTab === 'add' && <AddFriend />}
        </div>
      </section>
    </main>
  );
}