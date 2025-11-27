'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './ProfileSettings.module.css';
import { FaUserCircle, FaCamera } from 'react-icons/fa';

export default function ProfileSettingsPage() {
  const { user, token, updateUser } = useAuth() as any; // updateUser pode ser opcional
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState((user && (user as any).bio) || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const avatarUrl = (user && (user as any).avatarUrl) || null;
  const previewUrl = avatarFile ? URL.createObjectURL(avatarFile) : avatarUrl;

  // Debug: observe when the user context changes and sync local state
  useEffect(() => {
    console.log('ProfileSettingsPage: user context changed:', user);
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
      setBio((user as any).bio || '');
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    if (!username || !email) {
      setError('Nome de usuário e email são obrigatórios.');
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('bio', bio);
      if (avatarFile) formData.append('avatar', avatarFile);

      const response = await fetch('/api/users/me/profile', {
        method: 'PUT',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao atualizar o perfil.');
      }

      if (updateUser) {
        // Atualiza o contexto global do usuário — não silenciamos erros aqui
        updateUser(data.user);
      }

      // Também atualiza os estados locais para refletir imediatamente as mudanças
      setUsername(data.user?.username || username);
      setEmail(data.user?.email || email);
      setBio(data.user?.bio || bio);
      setAvatarFile(null);
      setMessage('Perfil atualizado com sucesso!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.contentSection}>
      <h2>Editar Perfil Público</h2>
      <p>Gerencie sua identidade, avatar e informações de contato.</p>

      <form onSubmit={handleUpdate} className={styles.form}>
        <div className={styles.avatarSection}>
          <div className={styles.avatarContainer} onClick={() => fileInputRef.current?.click()}>
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Avatar" className={styles.avatarImage} />
            ) : (
              <FaUserCircle size={80} className={styles.defaultAvatar} />
            )}
            <div className={styles.cameraOverlay}>
              <FaCamera size={18} />
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </div>

        <div className={styles.infoSection}>
          <div className={styles.formGroup}>
            <label htmlFor="username">Nome de Usuário</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="bio">Bio (Opcional)</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={250}
              placeholder="Fale um pouco sobre você (máx. 250 caracteres)"
            />
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.message}>{message}</p>}

        <button type="submit" className={styles.submitButton} disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar Perfil'}
        </button>
      </form>
    </div>
  );
}
