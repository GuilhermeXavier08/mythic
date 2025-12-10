/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, FormEvent } from 'react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Novos estados para o LGPD
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    
    // Dupla verificação de segurança
    if (!acceptedTerms) {
      setError("Você precisa aceitar os termos para continuar.");
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Algo deu errado');
      }

      setSuccess('Usuário criado com sucesso! Redirecionando para o login...');
      setUsername('');
      setEmail('');
      setPassword('');

      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (error: any) { 
      setError(error.message);
    }
  };

  return (
    <div className={styles.page}>
      
      {/* MODAL LGPD */}
      {showTermsModal && (
        <div className={styles.modalOverlay} onClick={() => setShowTermsModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Termos de Uso e Privacidade (LGPD)</h3>
            <div className={styles.modalBody}>
              <p>Bem-vindo à Mythic Store. Valorizamos sua privacidade e estamos comprometidos em proteger seus dados pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).</p>
              <br/>
              <h4>1. Coleta de Dados</h4>
              <p>Coletamos apenas os dados necessários para o funcionamento da plataforma: Nome de usuário, E-mail e Senha (criptografada).</p>
              <br/>
              <h4>2. Finalidade</h4>
              <p>Seus dados são utilizados exclusivamente para autenticação, segurança da conta e personalização da sua experiência na loja.</p>
              <br/>
              <h4>3. Seus Direitos</h4>
              <p>Você tem direito a acessar, corrigir ou solicitar a exclusão de seus dados a qualquer momento através das configurações da conta.</p>
              <br/>
              <p>Ao clicar em "Aceitar", você concorda com o processamento de seus dados conforme descrito.</p>
            </div>
            <button 
              className={styles.modalCloseButton} 
              onClick={() => {
                setAcceptedTerms(true);
                setShowTermsModal(false);
              }}
            >
              Li e Aceito
            </button>
            <button 
              className={styles.modalCancelButton} 
              onClick={() => setShowTermsModal(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      <div className={styles.contentWrapper}>

        {/* Formulário primeiro (esquerda) */}
        <div className={styles.formWrapper}>
          {success && <p className={`${styles.message} ${styles.success}`}>{success}</p>}
          
          <div className={styles.formContainer} style={{ display: success ? 'none' : 'block' }}>
            <h2 className={styles.title}>Criar Conta na Mythic</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="username" className={styles.label}>Nome de Usuário</label>
                <input
                  type="text"
                  id="username"
                  className={styles.input}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>Email</label>
                <input
                  type="email"
                  id="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.label}>Senha</label>
                <input
                  type="password"
                  id="password"
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* --- CHECKBOX LGPD --- */}
              <div className={styles.checkboxGroup}>
                <input 
                  type="checkbox" 
                  id="lgpd-check" 
                  className={styles.checkbox}
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                />
                <label htmlFor="lgpd-check" className={styles.checkboxLabel}>
                  Li e concordo com os{' '}
                  <button 
                    type="button" 
                    className={styles.termLink}
                    onClick={(e) => {
                      e.preventDefault();
                      setShowTermsModal(true);
                    }}
                  >
                    Termos de Uso e Privacidade (LGPD)
                  </button>
                </label>
              </div>

              <button 
                type="submit" 
                className={styles.button} 
                disabled={!acceptedTerms} // Desabilita se não aceitou
                title={!acceptedTerms ? "Aceite os termos para continuar" : ""}
              >
                Registrar
              </button>

              {error && <p className={`${styles.message} ${styles.error}`}>{error}</p>}
              
              <Link href="/login" className={styles.link}>
                Já tem uma conta? Faça o login
              </Link>
            </form>
          </div>
        </div>
        
        {/* Texto de boas-vindas (direita) */}
        <div className={styles.welcomeText}>
          <h1 className={styles.welcomeTitle}>A Lenda Começa Aqui.</h1>
          <p className={styles.welcomeSubtitle}>Crie sua conta e junte-se à comunidade Mythic.</p>
        </div>

      </div>
    </div>
  );
}