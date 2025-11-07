// src/app/register/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, FormEvent } from 'react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Algo deu errado');
      }

      setSuccess('Usuário criado com sucesso! Redirecionando para o login...');
      setUsername('');
      setEmail('');
      setPassword('');

      setTimeout(() => {
        router.push('/login');
      }, 3000);

    // --- CORREÇÃO AQUI ---
    // Estava "} catch (error: any) ="
    // O correto é "} catch (error: any) {"
    } catch (error: any) { 
      setError(error.message);
    }
    // --- FIM DA CORREÇÃO ---
  };

  return (
    <div className={styles.page}>
      <div className={styles.contentWrapper}>

        {/* Formulário primeiro (esquerda) */}
        <div className={styles.formWrapper}>
          {success && <p className={`${styles.message} ${styles.success}`}>{success}</p>}
          
          <div className={styles.formContainer} style={{ display: success ? 'none' : 'block' }}>
            <h2 className={styles.title}>Criar Conta na Mythic</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="username" className={styles.label}>Nome de Usuário</label>
                <input
                  type="text"
                  id="username"
                  className={styles.input}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
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
              <button type="submit" className={styles.button}>Registrar</button>

              {error && <p className={`${styles.message} ${styles.error}`}>{error}</p>}
              
              <Link href="/login" className={styles.link}>
                Já tem uma conta? Faça o login
              </Link>
            </form>
          </div>
        </div>
        
        {/* Texto de boas-vindas (direita) */}
        <div className={styles.welcomeText}>
          <h1 className={styles.welcomeTitle}>A Lenda Começa Aqui.</h1>
          <p className={styles.welcomeSubtitle}>Crie sua conta e junte-se à comunidade Mythic.</p>
        </div>

      </div>
    </div>
  );
}