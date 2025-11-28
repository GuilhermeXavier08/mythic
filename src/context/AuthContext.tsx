// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation'; // 1. IMPORTE O ROUTER

// ... (interfaces User e AuthContextType permanecem as mesmas)
interface User {
  userId: string;
  email: string;
  username: string;
  role: 'USER' | 'ADMIN';
  bio?: string | null;
  avatarUrl?: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (token: string) => void;
  logout: () => void;
  updateUser?: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const router = useRouter(); // 2. INICIALIZE O ROUTER AQUI

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        // Load cached user immediately if present so UI can render instantly
        const storedUser = localStorage.getItem('mythic_user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser) as User;
            setUser(parsed);
            setIsAdmin(parsed.role === 'ADMIN');
          } catch (e) {
            // ignore parse errors
          }
        }

        const storedToken = localStorage.getItem('mythic_token');
        if (storedToken) {
          // decode basic info and then fetch full profile to refresh cache
          const decoded = jwtDecode<Partial<User>>(storedToken) as Partial<User>;
          setToken(storedToken);
          setIsAdmin((decoded.role as any) === 'ADMIN');
          await fetchUserProfile(storedToken, decoded);
        }
      } catch (error) {
        localStorage.removeItem('mythic_token');
        localStorage.removeItem('mythic_user');
        console.error('Token inválido ou expirado:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, []);

  // ... (função fetchUserProfile permanece a mesma)
  const fetchUserProfile = async (token: string, basicUser: Partial<User>) => {
    try {
      const response = await fetch('/api/users/me/profile', {
        method: 'GET',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        let errText: string | null = null;
        try {
          errText = await response.text();
        } catch (e) {
          errText = null;
        }
        console.error(`[fetchUserProfile] Server returned ${response.status}:`, errText);
        const fallback = basicUser as User;
        setUser(fallback);
        try {
          localStorage.setItem('mythic_user', JSON.stringify(fallback));
        } catch (e) {}
        return;
      }

      let data: any = {};
      try {
        data = await response.json();
      } catch (e) {
        console.warn('[fetchUserProfile] response.json() failed to parse JSON:', e);
        data = {};
      }

      if (data && data.user) {
        const completeUser: User = { ...basicUser, ...data.user } as User;
        setUser(completeUser);
        setIsAdmin(completeUser.role === 'ADMIN');
        try {
          localStorage.setItem('mythic_user', JSON.stringify(completeUser));
        } catch (e) {}
      } else {
        const fallback = basicUser as User;
        setUser(fallback);
        try {
          localStorage.setItem('mythic_user', JSON.stringify(fallback));
        } catch (e) {}
      }
    } catch (error) {
      console.error('Falha ao buscar dados de perfil:', error);
      const fallback = basicUser as User;
      setUser(fallback);
    }
  };

  // ... (função login permanece a mesma)
  const login = async (newToken: string) => {
    try {
      const decodedToken = jwtDecode<Partial<User>>(newToken) as Partial<User>;

      const basicUser: Partial<User> = {
        ...decodedToken,
        bio: (decodedToken as any).bio ?? null,
        avatarUrl: (decodedToken as any).avatarUrl ?? null,
      };

      localStorage.setItem('mythic_token', newToken);
      setToken(newToken);
      setIsAdmin((decodedToken.role as any) === 'ADMIN');

      await fetchUserProfile(newToken, basicUser);
    } catch (error) {
      console.error('Erro ao decodificar token no login:', error);
    }
  };

  // ... (função updateUser permanece a mesma)
  const updateUser = (newUserData: Partial<User>) => {
    console.log('AuthContext.updateUser called with:', newUserData);
    setUser((current) => {
      const updated = current ? ({ ...current, ...newUserData } as User) : (newUserData as User);
      try {
        localStorage.setItem('mythic_user', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    setTimeout(() => console.log('AuthContext.updateUser completed for:', newUserData), 50);
  };

  // 3. ATUALIZE A FUNÇÃO LOGOUT
  const logout = () => {
    localStorage.removeItem('mythic_token');
    localStorage.removeItem('mythic_user'); // Garante que o usuário cacheado saia
    setToken(null);
    setUser(null);
    setIsAdmin(false);
    router.push('/login'); // <-- ADICIONA O REDIRECIONAMENTO
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAdmin, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}