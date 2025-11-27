// src/app/game/[gameId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext'; // <-- USA O CARRINHO

// Definimos o tipo de dados do jogo
interface GameDetails {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  gameUrl: string;
  developer: {
    username: string;
  };
}

// Definimos o tipo da biblioteca
interface PurchaseWithGame {
  id: string;
  game: GameDetails;
}

export default function GameDetailPage() {
  const params = useParams();
  const gameId = params.gameId as string;
  const { user, token } = useAuth();
  
  // --- USA O CONTEXTO DO CARRINHO ---
  const { addToCart, isGameInCart } = useCart(); 

  const [game, setGame] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ownsGame, setOwnsGame] = useState(false);
  const [isLibraryLoading, setIsLibraryLoading] = useState(true);
  
  // Novo estado para o botão
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  // --- O useEffect É 100% NECESSÁRIO ---
  // (Este era o código que estava faltando no seu "depois")
  useEffect(() => {
    // Função para buscar os detalhes do jogo
    const fetchGame = async () => {
      try {
        const response = await fetch(`/api/games/${gameId}`); // API (plural)
        if (!response.ok) throw new Error('Jogo não encontrado.');
        const data = await response.json();
        setGame(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    // Função para buscar a biblioteca do usuário
    const fetchLibrary = async () => {
      if (!token) {
        setIsLibraryLoading(false);
        return; 
      }
      try {
        const response = await fetch('/api/library', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Não foi possível carregar a biblioteca');
        const libraryData: PurchaseWithGame[] = await response.json();
        
        if (libraryData.some(purchase => purchase.game.id === gameId)) {
          setOwnsGame(true);
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        setIsLibraryLoading(false);
      }
    };

    if (gameId && typeof gameId === 'string') {
      setLoading(true);
      Promise.all([fetchGame(), fetchLibrary()]).finally(() => {
        setLoading(false);
      });
    }
  }, [gameId, token]);
  // --- FIM DO useEffect ---


  // --- FUNÇÃO ATUALIZADA: handleAddToCart ---
  const handleAddToCart = async () => {
    if (!token || !gameId) {
      setError('Você precisa estar logado para adicionar ao carrinho.');
      return;
    }
    
    setIsAddingToCart(true);
    setError(null);

    try {
      await addToCart(gameId); // Chama a função do Context
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // --- CHECAGENS DE LOADING/ERRO (Estavam faltando) ---
  if (loading || isLibraryLoading) {
    return <LoadingSpinner />;
  }

  if (error && !isAddingToCart) { // Não mostra erro de fetch se for erro de adicionar
    return <main className={styles.page}><p className={styles.error}>{error}</p></main>;
  }

  if (!game) {
    return <main className={styles.page}><p>Jogo não encontrado.</p></main>;
  }
  // --- FIM DAS CHECAGENS ---
  
  // --- LÓGICA DO BOTÃO TOTALMENTE ATUALIZADA ---
  const renderBuyButton = () => {
    if (!user) {
      return (
        <button className={styles.button} disabled>
          Logue para Comprar
        </button>
      );
    }
    
    if (ownsGame) {
      return (
        <Link href={`/play/${game.id}`} className={`${styles.button} ${styles.inLibrary}`}>
          Jogar
        </Link>
      );
    }

    if (isGameInCart(gameId)) {
      return (
        <Link href="/cart" className={`${styles.button} ${styles.inCart}`}>
          No Carrinho
        </Link>
      );
    }
    
    if (isAddingToCart) {
      return (
        <button className={styles.button} disabled>
          Adicionando...
        </button>
      );
    }

    // O botão agora é "Adicionar ao Carrinho" para TODOS (pagos ou grátis)
    return (
      <button className={styles.button} onClick={handleAddToCart}>
        Adicionar ao Carrinho
      </button>
    );
  };

  // --- O JSX DA PÁGINA (Estava faltando) ---
  return (
    <main className={styles.page}>
      <div className={styles.grid}>
        {/* Coluna da Imagem */}
        <div className={styles.imageColumn}>
          <Image
            src={game.imageUrl}
            alt={`Capa do jogo ${game.title}`}
            width={600}
            height={800}
            className={styles.image}
            priority
          />
        </div>

        {/* Coluna de Informações */}
        <div className={styles.infoColumn}>
          <h1 className={styles.title}>{game.title}</h1>
          <p className={styles.developer}>
            Desenvolvido por: <span>{game.developer.username}</span>
          </p>
          <p className={styles.description}>{game.description}</p>
          
          <div className={styles.actionBox}>
            <p className={styles.price}>
              {game.price === 0 ? 'Gratuito' : `R$ ${game.price.toFixed(2)}`}
            </p>
            {/* Mostra erros ao adicionar */}
            {error && <p className={styles.errorSmall}>{error}</p>}
            
            {renderBuyButton()}
          </div>
        </div>
      </div>
    </main>
  );
}