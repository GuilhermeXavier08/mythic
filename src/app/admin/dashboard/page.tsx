'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';
import AdminGuard from '@/components/AdminGuard';

function DashboardContent() {
  const { user, token } = useAuth();
  
  // Estados para números (KPIs)
  const [stats, setStats] = useState({
    totalGames: 0,
    pendingGames: 0,
    activeUsers: 0, // Mockado ou vindo da API
    revenue: 0      // Mockado ou vindo da API
  });

  const [loading, setLoading] = useState(true);

  // Simulação de busca de dados (ou conecte com sua API real)
  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      
      try {
        // Aqui você faria um fetch para uma rota tipo '/api/admin/stats'
        // Como exemplo, vou buscar os jogos pendentes para preencher o número real
        const resPending = await fetch('/api/admin/games', {
          headers: { Authorization: `Bearer ${token}` } 
        });
        
        // Buscando total de jogos (apenas exemplo, ajuste conforme sua API)
        const resAll = await fetch('/api/games');

        const pendingData = resPending.ok ? await resPending.json() : [];
        const allData = resAll.ok ? await resAll.json() : [];

        setStats({
          totalGames: allData.length,
          pendingGames: pendingData.length,
          activeUsers: 145, // Exemplo estático (Fictício)
          revenue: 12500.50 // Exemplo estático (Fictício)
        });
      } catch (error) {
        console.error("Erro ao carregar estatísticas", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Visão Geral</h1>
          <p className={styles.subtitle}>Bem-vindo de volta, <span className={styles.highlight}>{user?.username}</span>.</p>
        </div>
        <div className={styles.dateBadge}>
          {new Date().toLocaleDateString('pt-BR', { dateStyle: 'full' })}
        </div>
      </header>

      {/* 1. GRID DE ESTATÍSTICAS (KPIs) */}
      <section className={styles.kpiGrid}>
        
        {/* Card 1: Vendas */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
             <span className={styles.icon}>💰</span>
             <span className={styles.kpiLabel}>Receita Total</span>
          </div>
          <div className={styles.kpiValue}>
             {loading ? '...' : `R$ ${stats.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          </div>
          <span className={`${styles.trend} ${styles.up}`}>+12% este mês</span>
        </div>

        {/* Card 2: Jogos Ativos */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
             <span className={styles.icon}>🎮</span>
             <span className={styles.kpiLabel}>Jogos na Loja</span>
          </div>
          <div className={styles.kpiValue}>
             {loading ? '...' : stats.totalGames}
          </div>
          <span className={styles.trend}>Biblioteca crescendo</span>
        </div>

        {/* Card 3: Usuários */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
             <span className={styles.icon}>👥</span>
             <span className={styles.kpiLabel}>Usuários Ativos</span>
          </div>
          <div className={styles.kpiValue}>
             {loading ? '...' : stats.activeUsers}
          </div>
          <span className={`${styles.trend} ${styles.up}`}>+5 novos hoje</span>
        </div>

        {/* Card 4: Pendentes (Importante) */}
        <div className={`${styles.kpiCard} ${stats.pendingGames > 0 ? styles.alertCard : ''}`}>
          <div className={styles.kpiHeader}>
             <span className={styles.icon}>⏳</span>
             <span className={styles.kpiLabel}>Aprovações Pendentes</span>
          </div>
          <div className={styles.kpiValue}>
             {loading ? '...' : stats.pendingGames}
          </div>
          {stats.pendingGames > 0 ? (
             <Link href="/admin/dashboard/approvals" className={styles.actionLink}>
               Revisar agora →
             </Link>
          ) : (
            <span className={styles.trend}>Tudo em dia!</span>
          )}
        </div>
      </section>

      {/* 2. ATALHOS RÁPIDOS */}
      <section className={styles.actionsSection}>
        <h2 className={styles.sectionTitle}>Ações Rápidas</h2>
        <div className={styles.actionsGrid}>
           <Link href="/admin/dashboard/approvals" className={styles.actionCard}>
              <div className={styles.actionIcon}>✅</div>
              <div className={styles.actionInfo}>
                <h3>Aprovar Jogos</h3>
                <p>Verifique envios de desenvolvedores.</p>
              </div>
           </Link>

           <Link href="/admin/dashboard/manage" className={styles.actionCard}>
              <div className={styles.actionIcon}>🗑️</div>
              <div className={styles.actionInfo}>
                <h3>Gerenciar Loja</h3>
                <p>Remova jogos ou edite detalhes.</p>
              </div>
           </Link>
        </div>
      </section>

    </main>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <DashboardContent />
    </AdminGuard>
  );
}