'use client';

import Link from 'next/link';
import styles from './Header.module.css';
import { useAuth } from '@/context/AuthContext';
import { FaUserCircle, FaHeart } from 'react-icons/fa';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import CartIcon from './CartIcon';
import NotificationBell from './NotificationBell';

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Variável auxiliar para usuário comum
  const isUser = user && !isAdmin;

  // Destino da Logo
  const logoDestination = isAdmin ? '/admin/dashboard' : '/';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        
        {/* ESQUERDA: Logo e Navegação */}
        <div className={styles.leftSection}>
          <Link href={logoDestination} className={styles.logo}>
            Mythic
          </Link>

          {/* Menu de Navegação (Apenas Usuário Comum) */}
          {isUser && (
            <nav className={styles.nav}>
              <Link href="/store" className={styles.navLink}>Loja</Link>
              <Link href="/library" className={styles.navLink}>Biblioteca</Link>
              <Link href="/friends" className={styles.navLink}>Amigos</Link>
            </nav>
          )}
        </div>

        {/* DIREITA: Ações e Perfil */}
        <div className={styles.authSection}>
          {user ? (
            <>
              {/* --- BOTÕES ESPECÍFICOS DE ADMIN --- */}
              {isAdmin && (
                <Link href="/admin/dashboard" className={styles.adminButton}>
                  Painel Admin
                </Link>
              )}

              {/* --- BOTÕES ESPECÍFICOS DE USUÁRIO COMUM --- */}
              {isUser && (
                <>
                  <Link href="/submit-game" className={styles.submitButton}>
                    Enviar Jogo
                  </Link>
                  
                  {/* Ícone Wishlist */}
                  <Link href="/wishlist" className={styles.cartLink} title="Lista de Desejos">
                    <FaHeart size={20} />
                  </Link>

                  {/* Ícone Carrinho */}
                  <Link href="/cart" className={styles.cartLink} title="Carrinho">
                    <CartIcon />
                    {itemCount > 0 && (
                      <span className={styles.cartCount}>{itemCount}</span>
                    )}
                  </Link>
                </>
              )}

              {/* --- GERAL: NOTIFICAÇÕES --- */}
              <div style={{ margin: '0 10px' }}>
                 <NotificationBell />
              </div>

              {/* --- MENU DE PERFIL (AVATAR) --- */}
              <div className={styles.userMenu}>
                <button 
                  onClick={toggleMenu} 
                  className={styles.menuToggleButton} 
                  aria-label="Menu do Usuário"
                >
                  <div className={styles.avatarNavWrapper}>
                    {user?.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatarUrl} alt="Avatar" className={styles.avatarImage} />
                    ) : (
                      <FaUserCircle size={24} className={styles.defaultAvatarIcon} />
                    )}
                  </div>
                </button>

                {isMenuOpen && (
                  <div className={styles.dropdownMenu}>
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