// src/components/Header.tsx
'use client';

import Link from 'next/link';
import styles from './Header.module.css';
import { useAuth } from '@/context/AuthContext';
import { FaUserCircle } from 'react-icons/fa';
import { useState } from 'react';

// --- ADICIONADO DE VOLTA ---
import { useCart } from '@/context/CartContext';
import CartIcon from './CartIcon';
// --- FIM DA ADIÇÃO ---

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart(); // <-- ADICIONADO DE VOLTA
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isDeveloper = user && !isAdmin;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.leftSection}>{/* ... (Logo e Nav Links) ... */}
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

              {/* --- ÍCONE DO CARRINHO ADICIONADO AQUI --- */}
              <Link href="/cart" className={styles.cartLink}>
                <CartIcon />
                {itemCount > 0 && (
                  <span className={styles.cartCount}>{itemCount}</span>
                )}
              </Link>
              {/* --- FIM DA ADIÇÃO --- */}

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
                    <Link
                      href={`/profile/${user.username}`}
                      onClick={toggleMenu}
                      className={styles.menuItem}
                    >
                      Perfil
                    </Link>
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
              
              {/* --- ÍCONE DO CARRINHO ADICIONADO AQUI --- */}
              <Link href="/cart" className={styles.cartLink}>
                <CartIcon />
              </Link>
              {/* --- FIM DA ADIÇÃO --- */}
            </>
          )}
        </div>
      </div>
    </header>
  );
}