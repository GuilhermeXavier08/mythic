// src/app/login/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const auth = useAuth();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha no login');
      }

      auth.login(data.token);
      router.push('/'); 

    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className={styles.page}>
      {/* 1. Criamos um "wrapper" para controlar a largura máxima */}
      <div className={styles.contentWrapper}>

        {/* 2. Formulário agora vem primeiro (à esquerda) */}
        <div className={styles.formContainer}>
          <h2 className={styles.title}>Entrar na Mythic</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>Email</label>
              <input
                type="email"
                id="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>Senha</label>
              <input
                type="password"
                id="password"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className={styles.button}>Entrar</button>

            {error && <p className={`${styles.message} ${styles.error}`}>{error}</p>}

            <Link href="/register" className={styles.link}>
              Não tem uma conta? Cadastre-se
            </Link>
          </form>
        </div>
        
        {/* 3. Texto de boas-vindas agora vem depois (à direita) */}
        <div className={styles.welcomeText}>
          <h1 className={styles.welcomeTitle}>A Lenda Começa Aqui.</h1>
          <p className={styles.welcomeSubtitle}>Bem-vindo à Mythic. Faça o login para continuar sua jornada.</p>
        </div>

      </div>
    </div>
  );
}