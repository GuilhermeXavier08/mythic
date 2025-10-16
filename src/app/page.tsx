// src/app/page.tsx
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <h1 className={styles.title}>A Lenda Começa Aqui.</h1>
        <p>Bem-vindo à Mythic.</p>
      </div>
    </main>
  );
}