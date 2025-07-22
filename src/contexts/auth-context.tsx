'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { email: string; pass: string }) => Promise<User | null>;
  logout: () => void;
  register: (userInfo: Omit<User, 'id' | 'role' | 'avatarUrl'>) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for simulation
const MOCK_USERS: User[] = [
    { id: 'admin-1', name: 'Admin', email: 'admin', role: 'admin', avatarUrl: 'https://placehold.co/100x100' },
    { id: 'user-1', name: 'Ana Silva', email: 'ana@teste.com', role: 'user', department: 'Vendas', contact: '1111', avatarUrl: 'https://placehold.co/100x100' },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Simulate checking for a logged-in user in localStorage
    try {
        const storedUser = localStorage.getItem('elotech-user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
        }
    } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('elotech-user');
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login' || pathname === '/register';
    
    if (!user && !isAuthPage) {
        router.push('/login');
    } else if (user && isAuthPage) {
        router.push('/');
    }
  }, [user, loading, pathname, router]);


  const login = async (credentials: { email: string; pass: string }): Promise<User | null> => {
    // Admin login
    if (credentials.email === 'admin' && credentials.pass === 'p@$$w0rd') {
      const adminUser = MOCK_USERS.find(u => u.role === 'admin')!;
      localStorage.setItem('elotech-user', JSON.stringify(adminUser));
      setUser(adminUser);
      return adminUser;
    }
    
    // Regular user login (mock)
    const foundUser = MOCK_USERS.find(u => u.email === credentials.email);
    if (foundUser) {
        // In a real app, you would check the password hash
        localStorage.setItem('elotech-user', JSON.stringify(foundUser));
        setUser(foundUser);
        return foundUser;
    }
    
    return null;
  };

  const register = async (userInfo: Omit<User, 'id' | 'role' | 'avatarUrl'>): Promise<User | null> => {
    const newUser: User = {
        ...userInfo,
        id: `user-${Date.now()}`,
        role: 'user',
        avatarUrl: 'https://placehold.co/100x100'
    };
    MOCK_USERS.push(newUser); // In real app, save to DB
    localStorage.setItem('elotech-user', JSON.stringify(newUser));
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('elotech-user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
