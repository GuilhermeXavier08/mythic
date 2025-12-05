'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css'; 
import LoadingSpinner from '@/components/LoadingSpinner';
import NonAdminGuard from '@/components/NonAdminGuard';

function CheckoutContent() {
  const { 
    items, 
    totalPrice, 
    totalWithDiscount, 
    coupon, // <--- Importante: Pegamos o cupão aqui
    clearCart,
    isLoading: isCartLoading 
  } = useCart();
  
  const { user, token } = useAuth();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Redireciona se carrinho estiver vazio
  useEffect(() => {
    if (!isCartLoading && items.length === 0 && !success) {
      router.replace('/cart');
    }
  }, [isCartLoading, items, router, success]);

  const handleFinishPurchase = async () => {
    if (!token) return;
    setIsProcessing(true);
    setError('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // --- MUDANÇA: ENVIAMOS O CÓDIGO DO CUPÃO ---
        body: JSON.stringify({ 
            couponCode: coupon ? coupon.code : null 
        })
        // -------------------------------------------
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao processar compra');
      }

      // Sucesso!
      setSuccess(true);
      clearCart(); 

      // Redireciona após 3 segundos
      setTimeout(() => {
        router.push('/library');
      }, 3000);

    } catch (err: any) {
      setError(err.message);
      setIsProcessing(false);
    }
  };

  if (isCartLoading) return <div className={styles.center}><LoadingSpinner /></div>;

  // Tela de Sucesso
  if (success) {
    return (
      <main className={styles.container} style={{ textAlign: 'center', marginTop: '5rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}></div>
        <h1 style={{ color: '#4ade80', fontSize: '2rem', marginBottom: '1rem' }}>Compra Realizada com Sucesso!</h1>
        <p style={{ color: '#ccc', fontSize: '1.2rem' }}>Seus jogos já estão na sua biblioteca.</p>
        <p style={{ color: '#888', marginTop: '2rem' }}>Redirecionando...</p>
      </main>
    );
  }

  return (
    <main className={styles.container} style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem', color: '#fff' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
        Finalizar Compra
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        
        {/* ESQUERDA: Revisão dos Itens */}
        <div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#ccc' }}>Itens do Pedido</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map(item => (
              <div key={item.id} style={{ 
                display: 'flex', gap: '1rem', background: '#1a1a1a', 
                padding: '10px', borderRadius: '8px', border: '1px solid #333' 
              }}>
                <Image 
                  src={item.game.imageUrl} 
                  alt={item.game.title} 
                  width={80} height={45} 
                  style={{ objectFit: 'cover', borderRadius: '4px' }} 
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1rem', margin: 0 }}>{item.game.title}</h3>
                  <span style={{ fontSize: '0.9rem', color: '#888' }}>
                     {item.game.price === 0 ? 'Grátis' : `R$ ${item.game.price.toFixed(2)}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DIREITA: Resumo Financeiro */}
        <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #333', height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Resumo</h2>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#ccc' }}>
            <span>Subtotal</span>
            <span>R$ {totalPrice.toFixed(2)}</span>
          </div>

          {coupon && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#4ade80' }}>
              <span>Desconto ({coupon.code})</span>
              <span>- R$ {(totalPrice - totalWithDiscount).toFixed(2)}</span>
            </div>
          )}

          <div style={{ height: '1px', background: '#333', margin: '1rem 0' }}></div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
            <span>Total</span>
            <span>R$ {totalWithDiscount.toFixed(2)}</span>
          </div>

          {error && <p style={{ color: '#ff4d4d', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}

          <button 
            onClick={handleFinishPurchase}
            disabled={isProcessing}
            style={{
              width: '100%', padding: '1rem', background: '#7000ff', border: 'none',
              borderRadius: '6px', color: 'white', fontWeight: 'bold', fontSize: '1rem',
              cursor: isProcessing ? 'not-allowed' : 'pointer', opacity: isProcessing ? 0.7 : 1
            }}
          >
            {isProcessing ? 'Processando...' : 'Confirmar Pagamento'}
          </button>
          
          <Link href="/cart" style={{ display: 'block', textAlign: 'center', marginTop: '1rem', color: '#888', fontSize: '0.9rem' }}>
            Voltar ao carrinho
          </Link>
        </div>

      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <NonAdminGuard>
      <CheckoutContent />
    </NonAdminGuard>
  );
}