import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma'; // 1. Usamos Prisma direto
import styles from './Profile.module.css';
import ProfileHeader from '@/components/Profile/ProfileHeader';
import UserGameLibrary from '@/components/Profile/UserGameLibrary';
import UserFriendList from '@/components/Profile/UserFriendList';

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  // 2. Buscamos o usuário e incluímos as BADGES
  const profile = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      friendCode: true,
      createdAt: true,
      bio: true,
      avatarUrl: true,
      // Relacionamento de conquistas
      badges: {
        include: {
          badge: true
        }
      }
    }
  });

  if (!profile) notFound();

  // Formatação da data de entrada
  const joinDate = new Date(profile.createdAt).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  // Prepara dados para o ProfileHeader (convertendo Date para string se necessário)
  const profileForHeader = {
    ...profile,
    createdAt: profile.createdAt.toISOString()
  };

  return (
    <main className={styles.main}>
      
      {/* 1. BANNER DE FUNDO */}
      <div className={styles.banner}>
        <div className={styles.bannerOverlay}></div>
      </div>

      <div className={styles.contentContainer}>
        
        {/* 2. CABEÇALHO DO PERFIL */}
        <div className={styles.headerSection}>
           <ProfileHeader profileData={profileForHeader} />
           
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

        {/* --- NOVA SEÇÃO: CONQUISTAS (BADGES) --- */}
        <section style={{ marginBottom: '2rem', padding: '20px', background: '#1a1a1a', borderRadius: '12px', border: '1px solid #333' }}>
            <h3 style={{ color: '#fff', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '10px', fontSize: '1.2rem' }}>
                Conquistas Desbloqueadas ({profile.badges.length})
            </h3>
            
            {profile.badges.length === 0 ? (
                <p style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', padding: '10px' }}>
                    Este usuário ainda não possui conquistas. Jogue mais para desbloquear!
                </p>
            ) : (
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    {profile.badges.map(({ badge }) => (
                        <div key={badge.id} title={badge.description} style={{
                            background: '#222',
                            padding: '15px',
                            borderRadius: '8px',
                            textAlign: 'center',
                            border: '1px solid #444',
                            minWidth: '110px',
                            cursor: 'help',
                            transition: 'transform 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <div style={{ fontSize: '2.5rem' }}>
                                {badge.iconUrl}
                            </div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#fff' }}>
                                {badge.name}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
        {/* --------------------------------------- */}

        {/* 3. GRID DE CONTEÚDO (Biblioteca e Amigos) */}
        <div className={styles.dashboardGrid}>
          
          {/* Painel Esquerdo: Biblioteca */}
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Coleção de Jogos</h2>
            </div>
            <div className={styles.panelContent}>
              <UserGameLibrary userId={profile.id} />
            </div>
          </section>

          {/* Painel Direito: Amigos */}
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h2>Lista de Amigos</h2>
            </div>
            <div className={styles.panelContent}>
              <UserFriendList userId={profile.id} />
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}