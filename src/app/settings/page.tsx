'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import styles from './Settings.module.css';

// Tipos básicos (ajuste conforme seu AuthContext)
interface User {
  id: string;
  username: string;
  email: string;
  createdAt?: string;
}

function SettingsContent() {
  const { user, token, logout } = useAuth() as {
    user: User | null;
    token: string | null;
    logout: () => void;
  };
  const router = useRouter();

  // Estados de Senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estados de Privacidade
  const [receiveNewsletter, setReceiveNewsletter] = useState(false);
  
  // Estados de Feedback
  const [message, setMessage] = useState(''); // Mensagem geral (sucesso)
  const [error, setError] = useState('');     // Mensagem geral (erro)
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // --- CORREÇÃO DO BUG DO F5 ---
  useEffect(() => {
    // Tenta ler a preferência salva no navegador ao carregar a página
    const savedPreference = localStorage.getItem('mythic_newsletter_pref');
    if (savedPreference !== null) {
      setReceiveNewsletter(JSON.parse(savedPreference));
    }
  }, []);

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('pt-BR')
    : 'N/A';

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('A nova senha e a confirmação não batem.');
      return;
    }

    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (!token) {
      setError('Você não está autenticado.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/users/me/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = (await response.json()) as {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao atualizar a senha.');
      }

      setMessage('Senha atualizada com sucesso! Você será desconectado em breve.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        logout();
        router.push('/login');
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // --- NOVA FUNÇÃO PARA SALVAR PREFERÊNCIAS ---
  const handleSavePreferences = () => {
    setError('');
    setMessage('');
    
    try {
      // 1. Salva no LocalStorage (persiste após F5)
      localStorage.setItem('mythic_newsletter_pref', JSON.stringify(receiveNewsletter));

      // 2. Aqui entraria sua chamada de API real se tivesse
      // await api.updateSettings(...)

      setMessage('Preferências de privacidade salvas com sucesso!');
      
      // Limpa a mensagem após 3 segundos
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Erro ao salvar preferências.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !token) {
      setError('Sessão expirada. Faça login novamente.');
      return;
    }

    const confirmation = prompt(
      'Tem certeza que deseja excluir sua conta? Esta ação é irreversível. Digite seu nome de usuário para confirmar:',
    );

    if (confirmation !== user.username) {
      alert('Confirmação falhou. A conta não foi excluída.');
      return;
    }

    setDeleteLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/users/me', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Falha ao excluir a conta.');
      }

      setMessage('Conta excluída com sucesso. Redirecionando...');
      setTimeout(() => {
        logout();
        router.push('/');
      }, 2000);
      
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!user) {
    return <p className={styles.loading}>Carregando perfil...</p>;
  }

  return (
    <div className={styles.container}>
      <h1>Configurações da Conta</h1>
      <p className={styles.subtitle}> Gerencie as informações e a segurança do seu perfil Mythic. </p>

      {/* --- Seção 1: Informações Básicas --- */}
      <div className={styles.section}>
        <h2>Minhas Informações</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <label>Nome de Usuário</label>
            <p className={styles.infoValue}>{user.username}</p>
          </div>
          <div className={styles.infoItem}>
            <label>Email</label>
            <p className={styles.infoValue}>{user.email}</p>
          </div>
          <div className={styles.infoItem}>
            <label>Membro Desde</label>
            <p className={styles.infoValue}>{memberSince}</p>
          </div>
        </div>
      </div>

      <div className={styles.divider} />

      {/* --- Seção 2: Alterar Senha --- */}
      <div className={styles.section}>
        <h2> Alterar Senha</h2>
        <form onSubmit={handleChangePassword} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="currentPassword">Senha Atual</label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="newPassword">Nova Senha</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar Senha'}
          </button>
        </form>
      </div>
      
      <div className={styles.divider} />

      {/* --- Seção 3: Privacidade e Notificações (DESIGN NOVO) --- */}
      <div className={styles.section}>
        <h2> Privacidade e Notificações</h2>
        
        <div className={styles.privacyContainer}>
          
          {/* Item 1: Newsletter com Toggle Switch */}
          <div className={styles.privacyItem}>
            <div className={styles.privacyText}>
              <span className={styles.privacyTitle}>Notificações</span>
              <p className={styles.privacyDesc}>
                Receba notícias, atualizações de patch e ofertas exclusivas no seu email.
              </p>
            </div>
            
            <label className={styles.switch}>
              <input 
                type="checkbox" 
                checked={receiveNewsletter}
                onChange={(e) => setReceiveNewsletter(e.target.checked)}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          {/* Item 2: Visibilidade do Perfil */}
          <div className={styles.privacyItem}>
            <div className={styles.privacyText}>
              <span className={styles.privacyTitle}>Visibilidade do Perfil</span>
              <p className={styles.privacyDesc}>
                Seu perfil está visível para outros jogadores.
              </p>
            </div>
            <div className={styles.statusBadge}>
              PÚBLICO
            </div>
          </div>
        </div>

        <div className={styles.buttonRow}>
            <button 
                className={styles.secondaryButton}
                onClick={handleSavePreferences}
            >
                Salvar Preferências
            </button>
        </div>
      </div>

      {/* FEEDBACK GLOBAL (Mensagens de Erro/Sucesso fora dos formulários) */}
      {error && <div style={{ marginTop: '1rem' }} className={styles.error}>{error}</div>}
      {message && <div style={{ marginTop: '1rem' }} className={styles.success}>{message}</div>}

      <div className={styles.divider} />

      {/* --- Seção 4: Gerenciamento da Conta --- */}
      <div className={styles.section}>
        <h2> Gerenciamento da Conta</h2>
        <p className={styles.warningText}>
          A exclusão da sua conta é **irreversível**. Todos os seus dados, progresso e histórico de compras serão permanentemente removidos.
        </p>
        <button
          onClick={handleDeleteAccount}
          className={styles.deleteButton}
          disabled={deleteLoading}
        >
          {deleteLoading ? 'Excluindo...' : 'Excluir Minha Conta Permanentemente'}
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}