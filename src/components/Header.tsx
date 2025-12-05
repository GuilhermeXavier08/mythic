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

  // Variável para identificar usuário comum (NÃO Admin)
  const isUser = user && !isAdmin;

  // Destino da Logo: Admin vai pro Dashboard, User vai pra Home
  const logoDestination = isAdmin ? '/admin/dashboard' : '/';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        
        {/* ESQUERDA: Logo e Navegação Principal */}
        <div className={styles.leftSection}>
          <Link href={logoDestination} className={styles.logo}>
            Mythic
          </Link>

          {/* Menu de Navegação (SÓ APARECE SE FOR USUÁRIO COMUM) */}
          {isUser && (
            <nav className={styles.nav}>
              <Link href="/store" className={styles.navLink}>Loja</Link>
              <Link href="/library" className={styles.navLink}>Biblioteca</Link>
              <Link href="/friends" className={styles.navLink}>Amigos</Link>
            </nav>
          )}
        </div>

        {/* DIREITA: Ações de Usuário */}
        <div className={styles.authSection}>
          {user ? (
            <>
              {/* Botões Específicos de Usuário Comum */}
              {isUser && (
                <>
                  <Link href="/submit-game" className={styles.submitButton}>
                    Enviar Jogo
                  </Link>
                  
                  <Link href="/cart" className={styles.cartLink}>
                    <CartIcon />
                    {itemCount > 0 && (
                      <span className={styles.cartCount}>{itemCount}</span>
                    )}
                  </Link>
                </>
              )}

              {/* Menu de Perfil (Avatar) - Aparece para AMBOS (User e Admin) */}
              <div className={styles.userMenu}>
                <button 
                  onClick={toggleMenu} 
                  className={styles.menuToggleButton} 
                  aria-label="Abrir menu de usuário"
                >
                  <div className={styles.avatarNavWrapper}>
                    {user?.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={user.avatarUrl} 
                        alt={`${user.username}'s avatar`} 
                        className={styles.avatarImage} 
                      />
                    ) : (
                      <FaUserCircle size={24} className={styles.defaultAvatarIcon} />
                    )}
                  </div>
                </button>

                {/* Dropdown */}
                {isMenuOpen && (
                  <div className={styles.dropdownMenu}>
                    {/* Admin não precisa ver link pro seu perfil público de gamer necessariamente, mas pode manter se quiser. 
                        Vou esconder para Admin para ficar bem "Dashboard". */}
                    {isUser && (
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
            /* USUÁRIO DESLOGADO */
            <Link href="/login" className={styles.loginButton}>
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}