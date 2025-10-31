// src/components/Header.tsx
'use client';

import Link from 'next/link';
import styles from './Header.module.css';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user, logout, isAdmin } = useAuth(); // Obtenha 'isAdmin'
  
  // --- A LINHA QUE FALTAVA ---
  // Por enquanto, nossa regra é: se o usuário está logado, ele pode enviar jogos.
  const isDeveloper = user;
  // --- FIM DA CORREÇÃO ---

  return (
    <header className={styles.header}>
      <div className={styles.container}>
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
                Amigos
              </Link>
            </nav>
          )}
        </div>

        <div className={styles.authSection}>
          {user ? (
            <>
              {/* Agora a variável 'isDeveloper' existe e o erro vai sumir */}
              {isDeveloper && (
                 <Link href="/submit-game" className={styles.submitButton}>
                   Enviar Jogo
                 </Link>
              )}
              
              {isAdmin && (
                <Link href="/admin/dashboard" className={styles.adminButton}>
                  Admin
                </Link>
              )}

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