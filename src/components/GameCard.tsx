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
      
      {/* --- CORREÇÃO IMPORTANTE AQUI --- */}
      {/* Você precisa de 'height' (altura) e 'className' (para o CSS) */}
      <Image
        src={game.imageUrl}
        alt={`Capa do jogo ${game.title}`}
        width={300}
        height={400} // Obrigatório para imagens externas
        className={styles.image} // Obrigatório para o CSS
        priority
      />
      {/* --- FIM DA CORREÇÃO --- */}

      <div className={styles.content}>
        <h3 className={styles.title}>{game.title}</h3>
        <p className={styles.price}>
          {game.price === 0 ? 'Gratuito' : `R$ ${game.price.toFixed(2)}`}
        </p>
      </div>
    </Link>
  );
}