// src/components/AuthGuard.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

// Rotas que usuários DESLOGADOS podem acessar
const PUBLIC_ROUTES = ['/login', '/register'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Estado para controlar se a verificação inicial foi concluída
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Se ainda está carregando a sessão, não faça nada
    if (isLoading) {
      return;
    }

    const isPublic = PUBLIC_ROUTES.includes(pathname);

    // Regra 1: Se NÃO está logado e tenta acessar uma rota privada
    if (!user && !isPublic) {
      router.push('/login');
    }
    // Regra 2: Se ESTÁ logado e tenta acessar login/register
    else if (user && isPublic) {
      router.push('/');
    }
    // Se passou em todas as verificações, libere a visualização
    else {
      setIsVerified(true);
    }

  }, [user, isLoading, pathname, router]);

  // Se a verificação ainda não terminou (loading ou redirecionando),
  // mostre o spinner EM VEZ do conteúdo da página.
  if (!isVerified) {
    return <LoadingSpinner />;
  }

  // Se a verificação terminou, mostre a página
  return <>{children}</>;
}