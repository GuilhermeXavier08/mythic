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
    coupon, 
    clearCart,
    isLoading: isCartLoading 
  } = useCart();
  
  const { user, token } = useAuth();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // --- NOVOS STATES PARA O CARTÃO ---
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  // ----------------------------------

  useEffect(() => {
    if (!isCartLoading && items.length === 0 && !success) {
      router.replace('/cart');
    }
  }, [isCartLoading, items, router, success]);

  // Função auxiliar para formatar cartão (apenas visual)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    setCardNumber(value);
  };

  const handleFinishPurchase = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita reload do form
    if (!token) return;
    
    // Validação Simples Frontend
    if (cardNumber.length < 16 || cvv.length < 3 || !cardName || !expiry) {
        setError('Por favor, preencha os dados do cartão (fictícios) corretamente.');
        return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
            couponCode: coupon ? coupon.code : null,
            // Enviamos os dados para serem criptografados no backend
            paymentData: {
                cardName,
                cardNumber,
                expiry,
                cvv
            }
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao processar compra');
      }

      setSuccess(true);
      clearCart(); 

      setTimeout(() => {
        router.push('/library');
      }, 3000);

    } catch (err: any) {
      setError(err.message);
      setIsProcessing(false);
    }
  };

  if (isCartLoading) return <div className={styles.center}><LoadingSpinner /></div>;

  if (success) {
    return (
      <main className={styles.container} style={{ textAlign: 'center', marginTop: '5rem' }}>
        <h1 style={{ color: '#4ade80', fontSize: '2rem', marginBottom: '1rem' }}>Compra Realizada com Sucesso!</h1>
        <p style={{ color: '#ccc', fontSize: '1.2rem' }}>Pagamento processado e dados criptografados.</p>
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
        
        {/* ESQUERDA: Formulário de Pagamento e Itens */}
        <div>
           {/* SEÇÃO DE PAGAMENTO (NOVA) */}
           <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px', border: '1px solid #333', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#7000ff' }}>Dados de Pagamento (Simulação)</h2>
              <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem' }}>
                  Não use dados reais. Utilize números aleatórios. Tudo será criptografado.
              </p>
              
              <form id="checkout-form" onSubmit={handleFinishPurchase} style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Nome no Cartão</label>
                      <input 
                        type="text" 
                        placeholder="Ex: JOAO DA SILVA"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        style={{ width: '100%', padding: '10px', background: '#252525', border: '1px solid #444', color: 'white', borderRadius: '4px' }}
                        required
                      />
                  </div>
                  <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Número do Cartão (16 dígitos)</label>
                      <input 
                        type="text" 
                        placeholder="0000 0000 0000 0000"
                        maxLength={16}
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        style={{ width: '100%', padding: '10px', background: '#252525', border: '1px solid #444', color: 'white', borderRadius: '4px' }}
                        required
                      />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                          <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Validade</label>
                          <input 
                            type="text" 
                            placeholder="MM/AA"
                            maxLength={5}
                            value={expiry}
                            onChange={(e) => setExpiry(e.target.value)}
                            style={{ width: '100%', padding: '10px', background: '#252525', border: '1px solid #444', color: 'white', borderRadius: '4px' }}
                            required
                          />
                      </div>
                      <div>
                          <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>CVV</label>
                          <input 
                            type="text" 
                            placeholder="123"
                            maxLength={4}
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                            style={{ width: '100%', padding: '10px', background: '#252525', border: '1px solid #444', color: 'white', borderRadius: '4px' }}
                            required
                          />
                      </div>
                  </div>
              </form>
           </div>

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
            type="submit"
            form="checkout-form" // Vincula este botão ao form lá de cima
            disabled={isProcessing}
            style={{
              width: '100%', padding: '1rem', background: '#7000ff', border: 'none',
              borderRadius: '6px', color: 'white', fontWeight: 'bold', fontSize: '1rem',
              cursor: isProcessing ? 'not-allowed' : 'pointer', opacity: isProcessing ? 0.7 : 1
            }}
          >
            {isProcessing ? 'Criptografando e Processando...' : 'Confirmar Pagamento'}
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