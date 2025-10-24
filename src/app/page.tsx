// src/app/page.tsx
'use client'; 

import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

export default function Home() {
  const { user } = useAuth(); // Podemos usar isso para personalizar

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>
        Bem-vindo de volta, <span className={styles.username}>{user?.username || 'jogador'}</span>
      </h1>
      
      {/* Seção de Jogos Recentes */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Jogados Recentemente</h2>
        <div className={styles.placeholderGrid}>
          <div className={styles.placeholderCard}>Jogo Recente 1</div>
          <div className={styles.placeholderCard}>Jogo Recente 2</div>
          <div className={styles.placeholderCard}>Jogo Recente 3</div>
        </div>
      </section>

      {/* Seção de Destaques */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Jogos em Destaque</h2>
        <div className={styles.placeholderGrid}>
          <div className={styles.placeholderCard}>Destaque 1</div>
          <div className={styles.placeholderCard}>Destaque 2</div>
          <div className={styles.placeholderCard}>Destaque 3</div>
        </div>
      </section>

      {/* Seção de Amigos */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Amigos Online</h2>
        <div className={styles.placeholderList}>
          <div className={styles.placeholderFriend}>Amigo 1 (Online)</div>
          <div className={styles.placeholderFriend}>Amigo 2 (Online)</div>
        </div>
      </section>
    </main>
  );
}