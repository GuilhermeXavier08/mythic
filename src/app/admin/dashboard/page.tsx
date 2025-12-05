'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css'; // O arquivo CSS deve ter este nome
import AdminGuard from '@/components/AdminGuard';

function DashboardContent() {
  const { user, token } = useAuth();
  
  const [stats, setStats] = useState({
    totalGames: 0,
    pendingGames: 0,
    activeUsers: 0,
    revenue: 0,
    totalSales: 0 
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      
      try {
        // Tenta buscar da API real
        const response = await fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` } 
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats({
            totalGames: data.totalGames || 0,
            pendingGames: data.pendingGames || 0,
            activeUsers: data.activeUsers || 0,
            revenue: data.revenue || 0,
            totalSales: data.totalSales || 0
          });
        } else {
          // Fallback silencioso ou tratamento de erro se a API de stats não existir ainda
          console.warn('API de stats não retornou 200, usando dados parciais.');
          
          // Exemplo: Buscar apenas jogos pendentes para preencher pelo menos isso
          const resPending = await fetch('/api/admin/games', { headers: { Authorization: `Bearer ${token}` } });
          const pendingData = resPending.ok ? await resPending.json() : [];
          setStats(prev => ({ ...prev, pendingGames: pendingData.length }));
        }

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
          <p className={styles.subtitle}>Bem-vindo de volta, <span className={styles.highlight}>{user?.username || 'Admin'}</span>.</p>
        </div>
        <div className={styles.dateBadge}>
          {new Date().toLocaleDateString('pt-BR', { dateStyle: 'full' })}
        </div>
      </header>

      {/* GRID DE ESTATÍSTICAS (KPIs) */}
      <section className={styles.kpiGrid}>
        
        {/* Card 1: Receita */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
             <span className={styles.icon}>💰</span>
             <span className={styles.kpiLabel}>Receita Total</span>
          </div>
          <div className={styles.kpiValue}>
             {loading ? '...' : `R$ ${stats.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          </div>
          <span className={`${styles.trend} ${styles.up}`}>Vendas totais</span>
        </div>

        {/* Card 2: Total Vendido */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
             <span className={styles.icon}>🛒</span>
             <span className={styles.kpiLabel}>Jogos Vendidos</span>
          </div>
          <div className={styles.kpiValue}>
             {loading ? '...' : stats.totalSales}
          </div>
          <span className={styles.trend}>Cópias comercializadas</span>
        </div>

        {/* Card 3: Jogos na Loja */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
             <span className={styles.icon}>🎮</span>
             <span className={styles.kpiLabel}>Catálogo</span>
          </div>
          <div className={styles.kpiValue}>
             {loading ? '...' : stats.totalGames}
          </div>
          <span className={styles.trend}>Jogos ativos</span>
        </div>

        {/* Card 4: Pendentes */}
        <div className={`${styles.kpiCard} ${stats.pendingGames > 0 ? styles.alertCard : ''}`}>
          <div className={styles.kpiHeader}>
             <span className={styles.icon}>⏳</span>
             <span className={styles.kpiLabel}>Pendentes</span>
          </div>
          <div className={styles.kpiValue}>
             {loading ? '...' : stats.pendingGames}
          </div>
          {stats.pendingGames > 0 ? (
             <Link href="/admin/dashboard/approvals" className={styles.actionLink}>
               Revisar →
             </Link>
          ) : (
            <span className={styles.trend}>Em dia!</span>
          )}
        </div>

      </section>

      {/* Ações Rápidas */}
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