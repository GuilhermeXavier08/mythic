// src/components/Header.tsx
import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Mythic
        </Link>
        <nav className={styles.nav}>
          <Link href="/store" className={styles.navLink}>
            Loja
          </Link>
          <Link href="/library" className={styles.navLink}>
            Biblioteca
          </Link>
        </nav>
        <button className={styles.loginButton}>Login</button>
      </div>
    </header>
  );
}