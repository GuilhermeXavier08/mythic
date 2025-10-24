// src/components/LoadingSpinner.tsx
import styles from './LoadingSpinner.module.css';

export default function LoadingSpinner() {
  return (
    <div className={styles.overlay}>
      <div className={styles.spinner}></div>
      <p>Carregando...</p>
    </div>
  );
}