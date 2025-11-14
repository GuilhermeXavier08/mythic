import styles from './SettingsLayout.module.css';
import SettingsNav from '@/components/Settings/SettingsNav';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Configurações</h1>
      <div className={styles.layout}>
        <aside className={styles.navArea}>
          <SettingsNav />
        </aside>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
