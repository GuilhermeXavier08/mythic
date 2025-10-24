// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  userId: string;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean; // <-- ADICIONADO
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // <-- ADICIONADO (começa como true)

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('mythic_token');
      if (storedToken) {
        const decodedUser = jwtDecode<User>(storedToken);
        // Opcional: Adicionar verificação de expiração do token aqui
        setToken(storedToken);
        setUser(decodedUser);
      }
    } catch (error) {
      localStorage.removeItem('mythic_token');
      console.error("Token inválido ou expirado:", error);
    } finally {
      setIsLoading(false); // <-- ADICIONADO (termina de carregar)
    }
  }, []);

  const login = (newToken: string) => {
    try {
      const decodedUser = jwtDecode<User>(newToken);
      localStorage.setItem('mythic_token', newToken);
      setToken(newToken);
      setUser(decodedUser);
    } catch (error) {
      console.error("Erro ao decodificar token no login:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem('mythic_token');
    setToken(null);
    setUser(null);
  };

  return (
    // Adicione isLoading ao valor do provedor
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
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