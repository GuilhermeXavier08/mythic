// src/components/NonAdminGuard.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function NonAdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAuth(); // AuthGuard já deve ter garantido o login
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Se ainda está carregando a sessão, espere
    if (isLoading) {
      return;
    }

    // Se o usuário FOR admin, ele não pode estar aqui.
    // Redirecione-o para o dashboard de admin.
    if (isAdmin) {
      router.push('/admin/dashboard'); 
    } else {
      // Se NÃO for admin, é um usuário/dev, então permita
      setIsVerified(true);
    }

  }, [isAdmin, isLoading, router]);

  // Se a verificação ainda não terminou, mostre o loading
  if (!isVerified) {
    return <LoadingSpinner />;
  }

  // Se a verificação terminou (e não é admin), mostre a página
  return <>{children}</>;
}