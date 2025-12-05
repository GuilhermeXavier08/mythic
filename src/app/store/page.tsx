'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // <--- IMPORTANTE: Adicione isso
import styles from './page.module.css';
import NonAdminGuard from '@/components/NonAdminGuard';

// Lista de gêneros
const GENRES = [
  { value: 'ACAO', label: 'Ação' },
  { value: 'AVENTURA', label: 'Aventura' },
  { value: 'RPG', label: 'RPG' },
  { value: 'ESTRATEGIA', label: 'Estratégia' },
  { value: 'SIMULACAO', label: 'Simulação' },
  { value: 'ESPORTES', label: 'Esportes' },
  { value: 'CORRIDA', label: 'Corrida' },
  { value: 'PUZZLE', label: 'Puzzle' },
  { value: 'TERROR', label: 'Terror' },
  { value: 'OUTRO', label: 'Outro' },
];

interface Game {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  genre: string;
  averageRating: number;
}

function StoreContent() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- ESTADOS DOS FILTROS ---
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  // Busca inicial
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('/api/games');
        if (!response.ok) throw new Error('Falha ao carregar os jogos');
        const data = await response.json();
        setGames(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  // --- LÓGICA DE FILTRAGEM ---
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesName = game.title.toLowerCase().includes(searchTerm.toLowerCase());

      const price = game.price;
      const min = minPrice !== '' ? parseFloat(minPrice) : 0;
      const max = maxPrice !== '' ? parseFloat(maxPrice) : Infinity;
      const matchesPrice = price >= min && price <= max;

      const matchesRating = game.averageRating >= minRating;
      const matchesGenre = selectedGenres.length === 0 || selectedGenres.includes(game.genre);

      return matchesName && matchesPrice && matchesRating && matchesGenre;
    });
  }, [games, searchTerm, minPrice, maxPrice, minRating, selectedGenres]);

  const toggleGenre = (genreValue: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreValue)
        ? prev.filter((g) => g !== genreValue)
        : [...prev, genreValue]
    );
  };

  return (
    <main className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Explorar Loja</h1>
        <p className={styles.subtitle}>{filteredGames.length} jogos encontrados</p>
      </div>

      <div className={styles.storeLayout}>

        {/* SIDEBAR DE FILTROS */}
        <aside className={styles.filtersColumn}>
          <div className={styles.filtersHeader}>
            <h3>Filtros</h3>
            <button
              className={styles.clearButton}
              onClick={() => {
                setSearchTerm(''); setMinPrice(''); setMaxPrice('');
                setMinRating(0); setSelectedGenres([]);
              }}
            >
              Limpar
            </button>
          </div>

          <div className={styles.scrollableFilters}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Buscar</label>
              <input
                type="text" placeholder="Nome do jogo..." className={styles.input}
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Preço</label>
              <div className={styles.priceInputs}>
                <input
                  type="number" placeholder="Min" className={styles.input}
                  value={minPrice} onChange={(e) => setMinPrice(e.target.value)} min="0"
                />
                <span className={styles.separator}>-</span>
                <input
                  type="number" placeholder="Max" className={styles.input}
                  value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} min="0"
                />
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Avaliação</label>
              <select className={styles.select} value={minRating} onChange={(e) => setMinRating(Number(e.target.value))}>
                <option value="0">Qualquer nota</option>
                <option value="3">3 ★ ou mais</option>
                <option value="4">4 ★ ou mais</option>
                <option value="4.5">4.5 ★ ou mais</option>
                <option value="5">Apenas 5 ★</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Gêneros</label>
              <div className={styles.checkboxGroup}>
                {GENRES.map((g) => (
                  <label key={g.value} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedGenres.includes(g.value)}
                      onChange={() => toggleGenre(g.value)}
                    />
                    <span className={styles.checkmark}></span>
                    {g.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ÁREA DE JOGOS */}
        <section className={styles.gamesColumn}>
          {loading && <div className={styles.loadingContainer}><div className={styles.spinner}></div></div>}
          {error && <p className={styles.error}>{error}</p>}

          {!loading && !error && (
            <div className={styles.grid}>
              {filteredGames.length > 0 ? (
                filteredGames.map((game) => (
                  /* --- MUDANÇA AQUI: CONSTRUÇÃO MANUAL DO CARD --- */
                  /* Isso elimina o conflito de CSS e o piscar */
                  <Link
                    key={game.id}
                    href={`/game/${game.id}`}
                    className={styles.cardWrapper}
                  >
                    {/* Imagem de Fundo */}
                    <Image
                      src={game.imageUrl}
                      alt={game.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 20vw"
                      className={styles.cardImage}
                    />

                    {/* Overlay de Informação */}
                    <div className={styles.cardOverlay}>
                      <span className={styles.cardTitle}>{game.title}</span>
                      <span className={styles.cardPrice}>
                        {game.price === 0 ? 'Grátis' : `R$ ${game.price.toFixed(2)}`}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className={styles.noResults}>
                  <p>Nenhum jogo encontrado.</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
      <footer className={styles.footer}>
        <p>&copy; 2024 Mythic Store. Todos os direitos reservados.</p>
      </footer>
    </main>
  );
}

export default function StorePage() {
  return (
    <NonAdminGuard>
      <StoreContent />
    </NonAdminGuard>
  );
}