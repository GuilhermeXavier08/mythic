/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, FormEvent } from 'react';
import styles from './page.module.css';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import NonAdminGuard from '@/components/NonAdminGuard';

// Lista de gêneros disponíveis (deve bater com o Enum do Prisma/Banco de dados)
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

function SubmitGameContent() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [imageUrl, setImageUrl] = useState('');
  const [gameUrl, setGameUrl] = useState('');
  const [genre, setGenre] = useState('OUTRO'); // Novo estado para o gênero
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { token } = useAuth();
  const router = useRouter();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError('Você precisa estar logado para enviar um jogo.');
      return;
    }

    // Validação do Preço no Frontend
    if (parseFloat(price) > 5) {
      setError('O preço máximo permitido para jogos é R$ 5,00.');
      return;
    }

    try {
      const response = await fetch('/api/games/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        // Adicionei 'genre' no envio
        body: JSON.stringify({ title, description, price, imageUrl, gameUrl, genre }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao enviar o jogo');
      }

      setSuccess('Jogo enviado com sucesso! Ele será revisado por um administrador.');
      
      // Limpa o formulário
      setTitle('');
      setDescription('');
      setPrice('0');
      setImageUrl('');
      setGameUrl('');
      setGenre('OUTRO');
      
      // Redireciona para a home após 3s
      setTimeout(() => router.push('/'), 3000);

    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.formContainer}>
        <h1 className={styles.title}>Enviar seu Jogo</h1>
        <br />
        <p className={styles.subtitle}>
          Preencha os detalhes do seu jogo. O preço máximo permitido é R$ 5,00.
        </p>

        {success && <p className={`${styles.message} ${styles.success}`}>{success}</p>}
        {error && <p className={`${styles.message} ${styles.error}`}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: success ? 'none' : 'block' }}>
          
          {/* Título */}
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>Título do Jogo</label>
            <input
              type="text"
              id="title"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Gênero (NOVO CAMPO) */}
          <div className={styles.formGroup}>
            <label htmlFor="genre" className={styles.label}>Gênero</label>
            <select
              id="genre"
              className={styles.input} // Reutilizando estilo do input
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              required
            >
              {GENRES.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          {/* Descrição */}
          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>Descrição</label>
            <textarea
              id="description"
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Preço */}
          <div className={styles.formGroup}>
            <label htmlFor="price" className={styles.label}>Preço (Máx R$ 5,00)</label>
            <input
              type="number"
              id="price"
              className={styles.input}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              max="5" // Limite HTML
              step="0.01"
              required
            />
          </div>

          {/* Imagem */}
          <div className={styles.formGroup}>
            <label htmlFor="imageUrl" className={styles.label}>URL da Imagem da Capa (3:4)</label>
            <input
              type="url"
              id="imageUrl"
              className={styles.input}
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://meusite.com/capa.png"
              required
            />
          </div>

          {/* URL do Jogo */}
          <div className={styles.formGroup}>
            <label htmlFor="gameUrl" className={styles.label}>URL do Jogo (HTML5)</label>
            <input
              type="url"
              id="gameUrl"
              className={styles.input}
              value={gameUrl}
              onChange={(e) => setGameUrl(e.target.value)}
              placeholder="https://meusite.com/jogo/index.html"
              required
            />
          </div>

          <button type="submit" className={styles.button}>Enviar para Revisão</button>
        </form>
      </div>
    </main>
  );
}

export default function SubmitGamePage() {
  return (
    <NonAdminGuard>
      <SubmitGameContent />
    </NonAdminGuard>
  );
}