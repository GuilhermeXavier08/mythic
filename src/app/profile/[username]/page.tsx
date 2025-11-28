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
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const { id: userId, bio } = profile;

  return (
    <div className={styles.profileContainer}>
      <ProfileHeader profileData={profile} />


      <div className={styles.footerGrid}>
        <div className={styles.gameLibraryBlock}>
          <UserGameLibrary userId={userId} />
        </div>

        <div className={styles.friendsBlock}>
          <UserFriendList userId={userId} joinDate={joinDate} />
          
          <p className={styles.memberSinceText}>Membro desde: {joinDate}</p>
        </div>
      </div>
    </div>
  );
}
