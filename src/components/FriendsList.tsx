// src/components/FriendsList.tsx
import styles from './FriendsList.module.css';
import { FaUserCircle } from 'react-icons/fa';

export default function FriendsList() {
  // No futuro, faremos um fetch na API /api/friends para pegar a lista
  const friends = [
    { id: '1', username: 'Amigo_Exemplo_1', status: 'Online' },
    { id: '2', username: 'Amigo_Exemplo_2', status: 'Offline' },
  ];

  return (
    <div className={styles.container}>
      {friends.length === 0 ? (
        <p className={styles.message}>Você ainda não adicionou nenhum amigo.</p>
      ) : (
        friends.map(friend => (
          <div key={friend.id} className={styles.friendItem}>
            <div className={styles.friendInfo}>
              <FaUserCircle size={40} className={styles.friendIcon} />
              <div className={styles.friendDetails}>
                <span className={styles.friendUsername}>{friend.username}</span>
                <span className={`${styles.status} ${friend.status === 'Online' ? styles.online : styles.offline}`}>
                  {friend.status}
                </span>
              </div>
            </div>
            {/* TODO: Adicionar botões (remover, ver perfil, etc) */}
          </div>
        ))
      )}
    </div>
  );
}