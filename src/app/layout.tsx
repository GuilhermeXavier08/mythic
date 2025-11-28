// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import AuthGuard from '@/components/AuthGuard'; // 1. IMPORTE

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = { /* ... */ };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            
            {/* 2. ENVOLVA O CONTEÚDO COM O AUTHGUARD */}
            <AuthGuard>
              <Header />
              <main className="main-content">
                {children}
              </main>
            </AuthGuard>
            
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}