// src/app/submit-game/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import styles from './page.module.css';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function SubmitGamePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [imageUrl, setImageUrl] = useState('');
  const [gameUrl, setGameUrl] = useState('');
  
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

    try {
      const response = await fetch('/api/games/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, price, imageUrl, gameUrl }),
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
        <p className={styles.subtitle}>
          Preencha os detalhes do seu jogo. Ele será revisado antes de aparecer na loja.
        </p>

        {success && <p className={`${styles.message} ${styles.success}`}>{success}</p>}
        {error && <p className={`${styles.message} ${styles.error}`}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: success ? 'none' : 'block' }}>
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
          <div className={styles.formGroup}>
            <label htmlFor="price" className={styles.label}>Preço (R$)</label>
            <input
              type="number"
              id="price"
              className={styles.input}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              step="0.01"
              required
            />
          </div>
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