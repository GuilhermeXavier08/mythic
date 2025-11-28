// src/components/Header.tsx
'use client';

import Link from 'next/link';
import styles from './Header.module.css';
import { useAuth } from '@/context/AuthContext';
import { FaUserCircle } from 'react-icons/fa';
import { useState } from 'react';

import { useCart } from '@/context/CartContext';
import CartIcon from './CartIcon';

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Esta variável agora controla todos os links de "não-admin"
  const isDeveloper = user && !isAdmin;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <Link href="/" className={styles.logo}>
            Mythic
          </Link>

          {isDeveloper && (
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

              {isDeveloper && (
                <Link href="/cart" className={styles.cartLink}>
                  <CartIcon />
                  {itemCount > 0 && (
                    <span className={styles.cartCount}>{itemCount}</span>
                  )}
                </Link>
              )}

              {/* Menu Hamburger/Perfil */}
              <div className={styles.userMenu}>
                <button onClick={toggleMenu} className={styles.menuToggleButton} aria-label="Abrir menu de usuário">
                  <div className={styles.avatarNavWrapper}>
                    {user?.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatarUrl} alt={`${user.username}'s avatar`} className={styles.avatarImage} />
                    ) : (
                      <FaUserCircle size={24} className={styles.defaultAvatarIcon} />
                    )}
                  </div>
                </button>

                {isMenuOpen && (
                  <div className={styles.dropdownMenu}>
                    {isDeveloper && (
                      <Link
                        href={`/profile/${user.username}`}
                        onClick={toggleMenu}
                        className={styles.menuItem}
                      >
                        Perfil
                      </Link>
                    )}
                    <Link
                      href="/settings"
                      onClick={toggleMenu}
                      className={styles.menuItem}
                    >
                      Configurações
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        toggleMenu();
                      }}
                      className={`${styles.menuItem} ${styles.logoutButton}`}
                    >
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <> {/* --- SEÇÃO DESLOGADO --- */}
              <Link href="/login" className={styles.loginButton}>
                Login
              </Link>
              
              {/* 1. ALTERADO: O link do carrinho que estava aqui 
                foi removido. 
              */}
            </>
          )}
        </div>
      </div>
    </header>
  );
} 