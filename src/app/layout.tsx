// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import { AuthProvider } from '@/context/AuthContext';
import AuthGuard from '@/components/AuthGuard';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mythic',
  description: 'Sua nova plataforma de jogos',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        <AuthProvider>
          <Header /> {/* 1. Header fica sempre visível */}
          <AuthGuard> {/* 2. AuthGuard protege apenas o {children} */}
            {children}
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}