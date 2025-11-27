// src/components/LibraryGameItem.tsx
import Image from 'next/image';
import Link from 'next/link';
import styles from './LibraryGameItem.module.css';

interface Game {
  id: string;
  title: string;
  imageUrl: string;
}

interface LibraryItemProps {
  game: Game;
}

export default function LibraryGameItem({ game }: LibraryItemProps) {
  return (
    // O link agora aponta para a PÁGINA DE JOGAR
    <Link href={`/play/${game.id}`} className={styles.row}>
      <div className={styles.imageWrapper}>
        <Image
          src={game.imageUrl}
          alt={game.title}
          width={60}
          height={80} // Proporção 3:4
          className={styles.image}
        />
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{game.title}</h3>
      </div>
      <div className={styles.action}>
        <span>Jogar</span>
      </div>
    </Link>
  );
}