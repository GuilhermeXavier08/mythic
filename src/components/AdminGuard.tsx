// src/components/AdminGuard.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Se ainda está carregando a sessão, espere
    if (isLoading) {
      return;
    }

    // Se terminou de carregar e NÃO é admin, expulse
    if (!isAdmin) {
      router.push('/');
    } else {
      // Se é admin, libere a visualização
      setIsVerified(true);
    }

  }, [isAdmin, isLoading, router]);

  // Se a verificação ainda não terminou, mostre o loading
  if (!isVerified) {
    return <LoadingSpinner />;
  }

  // Se a verificação terminou, mostre a página
  return <>{children}</>;
}