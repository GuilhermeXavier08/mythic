// src/app/friends/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './page.module.css'; // Assume que seus estilos estão aqui
import AddFriend from '../../components/AddFriend';
import FriendsList from '../../components/FriendsList';
import PendingRequests from '../../components/PendingRequests';
import { FaUserCircle } from 'react-icons/fa';
import NonAdminGuard from '@/components/NonAdminGuard'; // 1. IMPORTE

// 2. RENOMEIE O COMPONENTE
function FriendsContent() {
    // Estado para controlar a aba ativa
    const [activeTab, setActiveTab] = useState<'list' | 'add' | 'requests'>('list');
    
    // Pega o usuário e o estado de carregamento do contexto de autenticação
    const { user, isLoading: authLoading } = useAuth();
    
    // Estado de carregamento local (opcional, pode usar authLoading diretamente)
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Mantém o estado de carregamento local em sincronia com o contexto
        setLoading(authLoading);
    }, [authLoading]);

    // Função para copiar o ID para a área de transferência
    const copyToClipboard = () => {
        // Usamos (user as any) pois o tipo 'user' do useAuth não está totalmente definido aqui
        const code = (user as any)?.friendCode ?? (user as any)?.userId;
        if (code) {
            navigator.clipboard.writeText(String(code));
            alert('Seu ID de amigo foi copiado!');
        }
    };

    // Exibe tela de carregamento
    if (loading) {
        return <div className={styles.loading}>Carregando...</div>;
    }
    
    // Se o usuário não estiver autenticado após o carregamento (por segurança)
    if (!user) {
        return <div className={styles.error}>Acesso negado. Faça login para continuar.</div>;
    }

    return (
        <main className={styles.page}>
            {/* -------------------- 1. SEÇÃO DE PERFIL CENTRAL -------------------- */}
            <section className={styles.profileSection}>
                
                {/* 🛑 LÓGICA DO AVATAR CENTRAL (Agora limpa e única) */}
                {(user as any)?.avatarUrl ? (
                    // Se a URL do avatar existir, exibe a imagem
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={(user as any).avatarUrl}
                        alt={`${(user as any).username}'s avatar`}
                        className={styles.profileAvatar}
                    />
                ) : (
                    // Se não houver URL, exibe o ícone padrão
                    <FaUserCircle size={100} className={styles.profileIcon} />
                )}

                <h1 className={styles.username}>{(user as any)?.username}</h1>

                <div className={styles.idBox} onClick={copyToClipboard} title="Clique para copiar">
                    <span>Seu ID:</span>
                    <strong>{(user as any)?.friendCode ?? (user as any)?.userId}</strong>
                </div>
            </section>

            {/* -------------------- 2. SEÇÃO DE ABAS -------------------- */}
            <section className={styles.tabsSection}>
                <div className={styles.tabHeaders}>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'list' ? styles.active : ''}`}
                        onClick={() => setActiveTab('list')}
                    >
                        Lista de Amigos
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'add' ? styles.active : ''}`}
                        onClick={() => setActiveTab('add')}
                    >
                        Adicionar Amigo
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 'requests' ? styles.active : ''}`}
                        onClick={() => setActiveTab('requests')}
                    >
                        Solicitações Pendentes
                    </button>
                </div>

                <div className={styles.tabContent}>
                    {activeTab === 'list' && <FriendsList />}
                    {activeTab === 'add' && <AddFriend />}
                    {activeTab === 'requests' && <PendingRequests />}
                </div>
            </section>
        </main>
    );
}

// 3. EXPORTE O COMPONENTE "EMBRULHADO"
export default function FriendsPage() {
  return (
    <NonAdminGuard>
      <FriendsContent />
    </NonAdminGuard>
  );
}