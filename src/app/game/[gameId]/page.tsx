'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

// --- COMPONENTE DE ESTRELAS ---
interface StarRatingProps {
  rating: number;
  setRating?: (r: number) => void;
  readOnly?: boolean;
  size?: number;
}

function StarRating({ rating, setRating, readOnly = false, size = 24 }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className={styles.starsContainer} onMouseLeave={() => setHoverRating(0)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = readOnly ? (star <= rating) : (star <= (hoverRating || rating));
        return (
          <button
            key={star}
            type="button"
            className={styles.starButton}
            style={{ 
              fontSize: size, 
              color: fill ? '#FFD700' : '#444',
              cursor: readOnly ? 'default' : 'pointer'
            }}
            onClick={() => !readOnly && setRating && setRating(star)}
            onMouseEnter={() => !readOnly && setHoverRating(star)}
            disabled={readOnly}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

// --- INTERFACES ---
interface GameDetails {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  gameUrl: string;
  genre: string;
  createdAt: string;
  averageRating: number;
  totalReviews: number;
  currentUserRating?: number;
  developer: {
    username: string;
  };
}

interface PurchaseWithGame {
  id: string;
  game: GameDetails;
}

export default function GameDetailPage() {
  const params = useParams();
  const gameId = params.gameId as string;
  const { user, token } = useAuth();
  const { addToCart, isGameInCart } = useCart(); 

  const [game, setGame] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [ownsGame, setOwnsGame] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLibraryLoading, setIsLibraryLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // --- BUSCAR DADOS ---
  const loadGameData = useCallback(async () => {
    try {
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`/api/games/${gameId}`, { headers });

      if (!response.ok) throw new Error('Jogo não encontrado.');
      const data: GameDetails = await response.json();
      
      setGame(data);
      if (data.currentUserRating) setUserRating(data.currentUserRating);

    } catch (err: any) {
      setError(err.message);
    }
  }, [gameId, token]);

  // --- VERIFICAR BIBLIOTECA ---
  useEffect(() => {
    const fetchLibrary = async () => {
      if (!token) {
        setIsLibraryLoading(false);
        return; 
      }
      try {
        const response = await fetch('/api/library', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
           const libraryData: PurchaseWithGame[] = await response.json();
           if (libraryData.some(p => p.game.id === gameId)) {
             setOwnsGame(true);
           }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLibraryLoading(false);
      }
    };

    if (gameId) {
      setLoading(true);
      Promise.all([loadGameData(), fetchLibrary()]).finally(() => setLoading(false));
    }
  }, [gameId, token, loadGameData]);

  // --- AÇÕES ---
  const handleRateGame = async (rating: number) => {
    if (!token) return;
    setUserRating(rating);
    setIsSubmittingReview(true);

    try {
      const res = await fetch(`/api/games/${gameId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating })
      });

      if (!res.ok) throw new Error('Erro ao avaliar');
      await loadGameData(); 
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar sua avaliação.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleAddToCart = async () => {
    if (!token || !gameId) {
        alert('Você precisa estar logado para adicionar ao carrinho.');
        return;
      }
      setIsAddingToCart(true);
      try {
        await addToCart(gameId);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsAddingToCart(false);
      }
  };

  // --- RENDERIZAÇÃO CONDICIONAL ---
  if (loading || isLibraryLoading) return <div className={styles.centerContainer}><LoadingSpinner /></div>;
  if (error && !isAddingToCart) return <div className={styles.centerContainer}><p className={styles.error}>{error}</p></div>;
  if (!game) return <div className={styles.centerContainer}><p>Jogo não encontrado.</p></div>;

  const renderBuyButton = () => {
      if (!user) return <button className={styles.btnDisabled} disabled>Logue para Comprar</button>;
      if (ownsGame) return <Link href={`/play/${game.id}`} className={styles.btnPlay}>Jogar Agora</Link>;
      if (isGameInCart(gameId)) return <Link href="/cart" className={styles.btnSecondary}>Ver Carrinho</Link>;
      if (isAddingToCart) return <button className={styles.btnPrimary} disabled>Adicionando...</button>;
      return <button className={styles.btnPrimary} onClick={handleAddToCart}>Comprar Agora</button>;
  };

  return (
    <main className={styles.page}>
      {/* Background Borrado */}
      <div className={styles.backdrop}>
        <Image 
          src={game.imageUrl} 
          alt="" 
          fill 
          style={{ objectFit: 'cover', opacity: 0.15 }} 
          quality={50}
        />
        <div className={styles.gradientOverlay}></div>
      </div>

      <div className={styles.container}>
        <div className={styles.contentGrid}>
          
          {/* COLUNA ESQUERDA: CAPA (POSTER) */}
          <div className={styles.leftColumn}>
            <div className={styles.posterWrapper}>
              <Image 
                src={game.imageUrl} 
                alt={game.title} 
                fill 
                className={styles.posterImage}
                priority 
              />
            </div>
            
            {/* Infos curtas abaixo da capa */}
            <div className={styles.metaData}>
              <div className={styles.metaItem}>
                <span>Gênero</span>
                <strong>{game.genre}</strong>
              </div>
              <div className={styles.metaItem}>
                <span>Desenvolvedor</span>
                <strong>{game.developer.username}</strong>
              </div>
              <div className={styles.metaItem}>
                <span>Lançamento</span>
                <strong>{new Date(game.createdAt).toLocaleDateString('pt-BR')}</strong>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: DETALHES */}
          <div className={styles.rightColumn}>
            <h1 className={styles.title}>{game.title}</h1>
            
            <div className={styles.ratingHeader}>
              <div className={styles.starsBox}>
                <StarRating rating={game.averageRating || 0} readOnly size={20} />
                <span className={styles.ratingValue}>
                    {game.averageRating ? Number(game.averageRating).toFixed(1) : '0.0'}
                </span>
              </div>
              <span className={styles.totalReviews}>{game.totalReviews} avaliações</span>
            </div>

            {/* CARTÃO DE PREÇO/AÇÃO */}
            <div className={styles.actionCard}>
              <div className={styles.priceTag}>
                {ownsGame ? (
                   <span className={styles.ownedLabel}>Adquirido</span>
                ) : (
                   <span className={styles.price}>
                     {game.price === 0 ? 'Gratuito' : `R$ ${game.price.toFixed(2)}`}
                   </span>
                )}
              </div>
              <div className={styles.actionButtons}>
                {renderBuyButton()}
              </div>
            </div>

            <div className={styles.divider}></div>

            <h3 className={styles.sectionTitle}>Sobre este jogo</h3>
            <p className={styles.description}>{game.description}</p>

            {/* ÁREA DE AVALIAÇÃO DO USUÁRIO */}
            {ownsGame && (
              <div className={styles.userReviewSection}>
                <h3>Sua Análise</h3>
                <p>O que você achou deste jogo?</p>
                <div className={styles.userRatingWrapper}>
                    <StarRating 
                        rating={userRating} 
                        setRating={handleRateGame} 
                        size={32} 
                    />
                    {isSubmittingReview && <span className={styles.savingText}>Salvando...</span>}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}