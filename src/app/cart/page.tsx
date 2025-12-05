'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FaTrash } from 'react-icons/fa';
import NonAdminGuard from '@/components/NonAdminGuard';

function CartContent() {
  const { 
    items, 
    totalPrice, 
    isLoading, 
    error: cartError,
    removeFromCart, 
    itemCount,
    // Novos hooks de cupom
    coupon,
    applyCoupon,
    removeCoupon,
    totalWithDiscount
  } = useCart();
  
  const [removingId, setRemovingId] = useState<string | null>(null);
  
  // Estados para o input de cupom
  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleRemove = async (itemId: string) => {
    setRemovingId(itemId);
    try {
      await removeFromCart(itemId);
    } catch (err) {
      console.error(err);
    } finally {
      setRemovingId(null);
    }
  };

  // Handler para aplicar cupom
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponMsg('');

    try {
      const res = await fetch('/api/cart/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode })
      });
      const data = await res.json();
      
      if (res.ok) {
        applyCoupon(data.coupon);
        setCouponMsg('Cupom aplicado com sucesso!');
        setCouponCode(''); // Limpa o input
      } else {
        setCouponMsg(data.error || 'Erro ao aplicar cupom');
      }
    } catch (err) {
      setCouponMsg('Erro ao conectar com o servidor.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (cartError) {
    return <main className={styles.page}><p className={styles.error}>{cartError}</p></main>;
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Meu Carrinho ({itemCount})</h1>

      {itemCount === 0 ? (
        <div className={styles.empty}>
          <p>Seu carrinho está vazio.</p>
          <Link href="/store" className={styles.button}>
            Voltar para a Loja
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {/* Coluna da Esquerda: Itens */}
          <div className={styles.itemsList}>
            {items.map((item) => (
              <div key={item.id} className={styles.itemRow}>
                <Image
                  src={item.game.imageUrl}
                  alt={item.game.title}
                  width={80}
                  height={100}
                  className={styles.itemImage}
                />
                <div className={styles.itemInfo}>
                  <Link href={`/game/${item.game.id}`} className={styles.itemTitle}>
                    {item.game.title}
                  </Link>
                </div>
                <div className={styles.itemPrice}>
                  {item.game.price === 0 ? 'Gratuito' : `R$ ${item.game.price.toFixed(2)}`}
                </div>
                <button 
                  className={styles.removeButton}
                  onClick={() => handleRemove(item.id)}
                  disabled={removingId === item.id}
                >
                  {removingId === item.id ? <LoadingSpinner size={16} /> : <FaTrash />}
                </button>
              </div>
            ))}
          </div>

          {/* Coluna da Direita: Resumo */}
          <div className={styles.summary}>
            <h2 className={styles.summaryTitle}>Resumo do Pedido</h2>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span className={styles.totalPrice}>R$ {totalPrice.toFixed(2)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Impostos</span>
              <span>R$ 0,00</span>
            </div>
            
            <hr className={styles.divider} />

            {/* --- SEÇÃO DE CUPOM --- */}
            <div className={styles.couponSection} style={{ padding: '15px 0', borderBottom: '1px solid #333', marginBottom: '15px' }}>
                {coupon ? (
                    <div style={{ background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.3)', padding: '10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <span style={{ color: '#4ade80', fontWeight: 'bold', display: 'block', fontSize: '0.9rem' }}>Cupom: {coupon.code}</span>
                            <span style={{ color: '#ccc', fontSize: '0.8rem' }}>
                                {coupon.type === 'PERCENTAGE' ? `-${coupon.discount}% de desconto` : `- R$ ${coupon.discount} off`}
                            </span>
                        </div>
                        <button 
                            onClick={() => { removeCoupon(); setCouponMsg(''); }}
                            style={{ background: 'transparent', border: 'none', color: '#ff4444', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            Remover
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                            type="text" 
                            placeholder="Tem um cupom?" 
                            value={couponCode} 
                            onChange={e => setCouponCode(e.target.value)} 
                            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: 'white', fontSize: '0.9rem' }}
                        />
                        <button 
                            onClick={handleApplyCoupon}
                            disabled={isApplyingCoupon}
                            style={{ padding: '8px 12px', background: '#444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            {isApplyingCoupon ? '...' : 'Aplicar'}
                        </button>
                    </div>
                )}
                
                {couponMsg && (
                    <p style={{ marginTop: '8px', fontSize: '0.8rem', color: couponMsg.toLowerCase().includes('sucesso') ? '#4ade80' : '#ff4444' }}>
                        {couponMsg}
                    </p>
                )}
            </div>
            {/* ---------------------- */}

            <div className={styles.summaryRow} data-total="true">
              <span>Total</span>
              <div style={{ textAlign: 'right' }}>
                {coupon && (
                     <span style={{ display: 'block', fontSize: '0.85rem', color: '#888', textDecoration: 'line-through' }}>
                        R$ {totalPrice.toFixed(2)}
                     </span>
                )}
                <span className={styles.totalPrice}>R$ {totalWithDiscount.toFixed(2)}</span>
              </div>
            </div>
            
            <Link 
              href="/checkout" 
              className={styles.checkoutButton}
            >
              Ir para o Pagamento
            </Link>
            
          </div>
        </div>
      )}
    </main>
  );
}

export default function CartPage() {
  return (
    <NonAdminGuard>
      <CartContent />
    </NonAdminGuard>
  );
}