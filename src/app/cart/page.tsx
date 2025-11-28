// src/app/cart/page.tsx
'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FaTrash } from 'react-icons/fa';
import NonAdminGuard from '@/components/NonAdminGuard'; // 1. IMPORTE

// 2. RENOMEIE O COMPONENTE
function CartContent() {
  const { 
    items, 
    totalPrice, 
    isLoading, 
    error: cartError,
    removeFromCart, 
    itemCount,
  } = useCart();
  
  const [removingId, setRemovingId] = useState<string | null>(null);

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
            <div className={styles.summaryRow} data-total="true">
              <span>Total</span>
              <span className={styles.totalPrice}>R$ {totalPrice.toFixed(2)}</span>
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

// 3. EXPORTE O COMPONENTE "EMBRULHADO"
export default function CartPage() {
  return (
    <NonAdminGuard>
      <CartContent />
    </NonAdminGuard>
  );
}