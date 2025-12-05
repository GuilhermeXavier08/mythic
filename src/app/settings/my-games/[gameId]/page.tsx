'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
// Reutilizando estilos do submit-game para consistência, ou crie um module.css novo
import styles from '@/app/submit-game/page.module.css'; 

const GENRES = [
  { value: 'ACAO', label: 'Ação' },
  { value: 'AVENTURA', label: 'Aventura' },
  { value: 'RPG', label: 'RPG' },
  { value: 'ESTRATEGIA', label: 'Estratégia' },
  { value: 'SIMULACAO', label: 'Simulação' },
  { value: 'ESPORTES', label: 'Esportes' },
  { value: 'CORRIDA', label: 'Corrida' },
  { value: 'PUZZLE', label: 'Puzzle' },
  { value: 'TERROR', label: 'Terror' },
  { value: 'OUTRO', label: 'Outro' },
];

export default function EditGamePage() {
  const params = useParams();
  const gameId = params.gameId as string;
  const { token } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '', description: '', price: '', imageUrl: '', gameUrl: '', genre: 'OUTRO'
  });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // 1. Carregar dados do jogo
  useEffect(() => {
    if(token && gameId) {
      fetch(`/api/games/${gameId}`)
        .then(res => res.json())
        .then(data => {
            if(data.error) throw new Error(data.error);
            setFormData({
                title: data.title,
                description: data.description,
                price: data.price.toString(),
                imageUrl: data.imageUrl,
                gameUrl: data.gameUrl,
                genre: data.genre
            });
        })
        .catch(err => setMsg({ type: 'error', text: 'Erro ao carregar jogo' }))
        .finally(() => setLoading(false));
    }
  }, [gameId, token]);

  // 2. Enviar Atualização
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (parseFloat(formData.price) > 5) {
        setMsg({ type: 'error', text: 'O preço máximo é R$ 5,00' });
        return;
    }

    try {
      const res = await fetch(`/api/games/${gameId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if(!res.ok) throw new Error(data.error);

      setMsg({ type: 'success', text: 'Jogo atualizado! Ele voltou para análise.' });
      setTimeout(() => router.push('/settings/my-games'), 2000);

    } catch (err: any) {
        setMsg({ type: 'error', text: err.message });
    }
  };

  if(loading) return <p style={{color:'white'}}>Carregando...</p>;

  return (
    <div style={{ maxWidth: '600px', color: '#fff' }}>
        <h2 style={{ marginBottom: '20px' }}>Editar Jogo</h2>
        
        {msg.text && (
            <div style={{ 
                padding: '10px', 
                marginBottom: '15px', 
                borderRadius: '4px',
                background: msg.type === 'error' ? '#500' : '#050',
                color: 'white'
            }}>
                {msg.text}
            </div>
        )}

        <form onSubmit={handleSubmit} className={styles.formContainer} style={{ background: 'transparent', padding: 0 }}>
            <div className={styles.formGroup}>
                <label className={styles.label}>Título</label>
                <input className={styles.input} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Gênero</label>
                <select className={styles.input} value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})}>
                    {GENRES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Preço (Máx R$ 5,00)</label>
                <input type="number" step="0.01" className={styles.input} value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Descrição</label>
                <textarea className={styles.textarea} rows={5} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Capa (URL)</label>
                <input className={styles.input} value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} required />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Link do Jogo (URL)</label>
                <input className={styles.input} value={formData.gameUrl} onChange={e => setFormData({...formData, gameUrl: e.target.value})} required />
            </div>

            <button type="submit" className={styles.button}>Salvar Alterações</button>
            <button type="button" onClick={() => router.back()} style={{ marginTop: '10px', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', display: 'block' }}>Cancelar</button>
        </form>
    </div>
  );
}   