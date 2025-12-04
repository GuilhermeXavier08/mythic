'use client';

import AdminGuard from "@/components/AdminGuard";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import styles from './AdminLayout.module.css'; // Novo CSS global do Admin

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { label: 'Visão Geral', href: '/admin/dashboard', icon: '📊' },
    { label: 'Aprovar Jogos', href: '/admin/dashboard/approvals', icon: '✅' }, // Vamos separar approvals
    { label: 'Gerenciar Loja', href: '/admin/dashboard/manage', icon: '🗑️' }, // Nova tela de deletar
  ];

  return (
    <AdminGuard>
      <div className={styles.adminContainer}>
        
        {/* SIDEBAR */}
        <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : styles.closed}`}>
          <div className={styles.sidebarHeader}>
            <h2 className={styles.brand}>Mythic Admin</h2>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={styles.toggleBtn}>
              {isSidebarOpen ? '«' : '»'}
            </button>
          </div>

          <nav className={styles.nav}>
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                >
                  <span className={styles.icon}>{item.icon}</span>
                  {isSidebarOpen && <span className={styles.label}>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
          
          <div className={styles.sidebarFooter}>
            <Link href="/" className={styles.backLink}>← Voltar à Loja</Link>
          </div>
        </aside>

        {/* CONTEÚDO PRINCIPAL */}
        <main className={styles.contentArea}>
          {children}
        </main>

      </div>
    </AdminGuard>
  );
}