// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header'; // <-- Veja o Import Alias! Limpo e direto.

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
        <Header />
        {children}
        {/* Adicionaremos o Footer aqui depois */}
      </body>
    </html>
  );
}