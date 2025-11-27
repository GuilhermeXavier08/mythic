"use client";

import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';
import { FaUserCircle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function UserProfilePage() {
  const { user, isLoading } = useAuth() as any;
  const router = useRouter();

  if (isLoading) return <div className={styles.loading}>Carregando perfil...</div>;

  if (!user) return <div className={styles.error}>Acesso negado. Por favor, faça login.</div>;

  const { username, userId, bio, avatarUrl } = user;

  return (
    <div className={styles.profileContainer}>
      <div className={styles.headerSection}>
        <div className={styles.avatarWrapper} onClick={() => router.push('/settings/profile')}>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={`${username}'s avatar`} className={styles.profileAvatar} />
          ) : (
            <FaUserCircle className={styles.defaultProfileIcon} />
          )}
        </div>

        <h1 className={styles.username}>{username}</h1>
        <p className={styles.idCode}>ID: {userId}</p>

        <button className={styles.editButton} onClick={() => router.push('/settings/profile')}>
          Editar Perfil
        </button>
      </div>

      <div className={styles.bioSection}>
        <h2>Bio</h2>
        <p className={styles.bioText}>{bio || 'Este usuário ainda não definiu uma biografia.'}</p>
      </div>

      <div className={styles.footerGrid}>
        <div className={styles.gameLibraryBlock}>
          <h2>Jogos</h2>
          <p>Nenhum jogo na biblioteca pública.</p>
        </div>

        <div className={styles.friendsBlock}>
          <h2>Amigos</h2>
          <p className={styles.memberSinceText}>Membro desde: ---</p>
        </div>
      </div>
    </div>
  );
}
