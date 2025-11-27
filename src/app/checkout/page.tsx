// src/app/checkout/page.tsx
'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css'; // Vamos criar este CSS
import LoadingSpinner from '@/components/LoadingSpinner';

export default function CheckoutPage() {
  const { totalPrice, itemCount, clearCart, isLoading: isCartLoading } = useCart();
  const { token } = useAuth();
  const router = useRouter();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // A função que estava no carrinho, agora está aqui
  const handleCheckout = async () => {
    if (!token) {
      setCheckoutError('Você precisa estar logado para finalizar a compra.');
      return;
    }
    
    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Não foi possível finalizar a compra.');
      }

      // --- SUCESSO! ---
      clearCart(); // 1. Limpa o carrinho no frontend (Context)
      router.push('/library'); // 2. Redireciona para a biblioteca

    } catch (err: any) {
      setCheckoutError(err.message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (isCartLoading) {
    return <LoadingSpinner />;
  }

  if (itemCount === 0 && !isCheckingOut) {
    // Se o carrinho ficou vazio por algum motivo, não deixa finalizar
    return (
      <main className={styles.page}>
        <div className={styles.empty}>
          <p>Seu carrinho está vazio.</p>
          <Link href="/store" className={styles.button}>
            Voltar para a Loja
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Finalizar Compra</h1>

        {/* Aqui você pode adicionar formulários de pagamento (Stripe, etc) */}
        <p className={styles.info}>
          Revise seu pedido. Esta loja é um projeto de demonstração e nenhum
          pagamento real será processado.
        </p>

        {/* Resumo do Pedido */}
        <div className={styles.summary}>
          <h2 className={styles.summaryTitle}>Resumo do Pedido</h2>
          <div className={styles.summaryRow}>
            <span>Subtotal ({itemCount} {itemCount > 1 ? 'itens' : 'item'})</span>
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
          <button 
            className={styles.checkoutButton}
            onClick={handleCheckout}
            disabled={isCheckingOut || itemCount === 0}
          >
            {isCheckingOut ? 'Processando...' : 'Confirmar e Comprar'}
          </button>
          {checkoutError && (
            <p className={styles.error}>{checkoutError}</p>
          )}
        </div>
        
        <Link href="/cart" className={styles.backLink}>
          &larr; Voltar ao Carrinho
        </Link>
      </div>
    </main>
  );
}