// src/components/GameCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import styles from './GameCard.module.css';

// Definimos o tipo de dados que o Card espera receber
interface GameCardProps {
  game: {
    id: string;
    title: string;
    price: number;
    imageUrl: string;
  };
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <Link href={`/game/${game.id}`} className={styles.card}>
      <Image
        src={game.imageUrl}
        alt={`Capa do jogo ${game.title}`}
        width={300}
        height={400} // A proporção é importante, mas o CSS vai controlar
        className={styles.image}
        priority // Opcional, para carregar imagens principais mais rápido
      />
      <div className={styles.content}>
        <h3 className={styles.title}>{game.title}</h3>
        <p className={styles.price}>
          {game.price === 0 ? 'Gratuito' : `R$ ${game.price.toFixed(2)}`}
        </p>
      </div>
    </Link>
  );
}