// src/components/Header.tsx
'use client';

import Link from 'next/link';
import styles from './Header.module.css';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        
        {/* 1. Agrupamos o Logo e a Navegação */}
        <div className={styles.leftSection}>
          <Link href="/" className={styles.logo}>
            Mythic
          </Link>

          {user && (
            <nav className={styles.nav}>
              <Link href="/store" className={styles.navLink}>
                Loja
              </Link>
              <Link href="/library" className={styles.navLink}>
                Biblioteca
              </Link>
              <Link href="/friends" className={styles.navLink}>
                Amigos {/* <-- ADICIONADO */}
              </Link>
            </nav>
          )}
        </div>

        {/* A seção de autenticação permanece a mesma */}
        <div className={styles.authSection}>
          {user ? (
            <>
              <span className={styles.username}>Bem-vindo, {user.username}</span>
              <button onClick={logout} className={styles.logoutButton}>
                Sair
              </button>
            </>
          ) : (
            <Link href="/login" className={styles.loginButton}>
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}