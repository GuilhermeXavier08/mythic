'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import styles from './Settings.module.css';

function SettingsContent() {
  const { user, token, logout } = useAuth();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

      // Logout após 2 segundos e redireciona para login
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

  return (
    <div className={styles.container}>
      <h1>Configurações da Conta</h1>
      <p className={styles.subtitle}>
        Gerencie as informações da sua conta.
      </p>

      {/* Seção 1: Informações do Usuário */}
      <div className={styles.section}>
        <h2>Minhas Informações</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <label>Nome de Usuário</label>
            <p className={styles.infoValue}>{user?.username}</p>
          </div>
          <div className={styles.infoItem}>
            <label>Email</label>
            <p className={styles.infoValue}>{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Seção 2: Mudar Senha */}
      <div className={styles.section}>
        <h2>Alterar Senha</h2>
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

          {error && <p className={styles.error}>{error}</p>}
          {message && <p className={styles.success}>{message}</p>}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
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
