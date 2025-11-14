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
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className={styles.container}>
      {/* Profile header (client component) */}
      <ProfileHeader profileData={profile} />

      <div style={{ marginTop: 20 }} className={styles.profileContent}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          <div>
            <UserGameLibrary userId={profile.id} />
          </div>
          <aside>
            <UserFriendList userId={profile.id} />
            <div style={{ marginTop: 20, color: '#a7a7a7', fontSize: 14 }}>Membro desde {joinDate}</div>
          </aside>
        </div>
      </div>
    </div>
  );
}
