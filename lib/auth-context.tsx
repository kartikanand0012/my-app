'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { API_CONFIG, ENDPOINTS } from './config';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  agent_id?: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  };

  const login = async (email: string, password: string) => {
    try {
      // Mock login for demo accounts
      if (email === 'admin@example.com' && password === 'Test123@Password') {
        const mockUser = {
          id: 1,
          username: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
        };
        localStorage.setItem('auth_token', 'mock_token_admin');
        setUser(mockUser);
        return;
      }
      
      if (email === 'teamlead@example.com' && password === 'Test123@Password') {
        const mockUser = {
          id: 2,
          username: 'Team Lead User',
          email: 'teamlead@example.com',
          role: 'team-lead',
        };
        localStorage.setItem('auth_token', 'mock_token_teamlead');
        setUser(mockUser);
        return;
      }
      
      if (email === 'agent@example.com' && password === 'Test123@Password') {
        const mockUser = {
          id: 3,
          username: 'Agent User',
          email: 'agent@example.com',
          role: 'user',
        };
        localStorage.setItem('auth_token', 'mock_token_agent');
        setUser(mockUser);
        return;
      }

      // Real API login (fallback)
      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('auth_token', data.data.token);
        setUser(data.data.user);
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  const checkAuth = async () => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.PROFILE}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    getToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}