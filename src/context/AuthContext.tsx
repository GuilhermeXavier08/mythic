// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

// 1. Adiciona 'role' à interface User
interface User {
  userId: string;
  email: string;
  username: string;
  role: 'USER' | 'ADMIN'; // <-- ADICIONADO
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean; // <-- ADICIONADO
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 2. Adiciona estado 'isAdmin'
  const [isAdmin, setIsAdmin] = useState(false); // <-- ADICIONADO

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('mythic_token');
      if (storedToken) {
        const decodedUser = jwtDecode<User>(storedToken);
        setToken(storedToken);
        setUser(decodedUser);
        setIsAdmin(decodedUser.role === 'ADMIN'); // <-- ADICIONADO
      }
    } catch (error) {
      localStorage.removeItem('mythic_token');
      console.error("Token inválido ou expirado:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string) => {
    try {
      const decodedUser = jwtDecode<User>(newToken);
      localStorage.setItem('mythic_token', newToken);
      setToken(newToken);
      setUser(decodedUser);
      setIsAdmin(decodedUser.role === 'ADMIN'); // <-- ADICIONADO
    } catch (error) {
      console.error("Erro ao decodificar token no login:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem('mythic_token');
    setToken(null);
    setUser(null);
    setIsAdmin(false); // <-- ADICIONADO
  };

  return (
    // 3. Fornece 'isAdmin'
    <AuthContext.Provider value={{ user, token, isLoading, isAdmin, login, logout }}>
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