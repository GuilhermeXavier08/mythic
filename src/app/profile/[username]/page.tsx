import { notFound } from 'next/navigation';
import styles from './Profile.module.css';
import ProfileHeader from '@/components/Profile/ProfileHeader';
import UserGameLibrary from '@/components/Profile/UserGameLibrary';
import UserFriendList from '@/components/Profile/UserFriendList';

interface ProfileData {
  id: string;
  username: string;
  friendCode: number;
  createdAt: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

async function getProfileData(username: string): Promise<ProfileData | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/profile/${username}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return null;
  }
}

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const { username } = params;
  const profile = await getProfileData(username);
  if (!profile) notFound();

  const joinDate = new Date(profile.createdAt).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  const { id: userId } = profile;

  return (
    <main className={styles.main}>
      
      {/* 1. BANNER DE FUNDO (Estilo Capa) */}
      <div className={styles.banner}>
        <div className={styles.bannerOverlay}></div>
      </div>

      <div className={styles.contentContainer}>
        
        {/* 2. CABEÇALHO DO PERFIL (Com Avatar Sobreposto) */}
        <div className={styles.headerSection}>
           <ProfileHeader profileData={profile} />
           
           {/* Pequena barra de estatísticas/info abaixo do header */}
           <div className={styles.statsBar}>
              <div className={styles.statItem}>
                <span>Membro desde</span>
                <strong>{joinDate}</strong>
              </div>
              <div className={styles.statItem}>
                <span>ID Mythic</span>
                <strong>#{profile.friendCode}</strong>
              </div>
           </div>
        </div>

        {/* 3. GRID DE CONTEÚDO (Biblioteca e Amigos) */}
        <div className={styles.dashboardGrid}>
          
          {/* Painel Esquerdo: Biblioteca */}
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Coleção de Jogos</h2>
            </div>
            <div className={styles.panelContent}>
              <UserGameLibrary userId={userId} />
            </div>
          </section>

          {/* Painel Direito: Amigos */}
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Lista de Amigos</h2>
            </div>
            <div className={styles.panelContent}>
              <UserFriendList userId={userId} />
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}