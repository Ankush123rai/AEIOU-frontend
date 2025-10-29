import React, { createContext, useContext, useState, useLayoutEffect } from 'react';
import { apiClient } from '../services/api';
import { googleAuth, GoogleUser } from '../services/googleAuth';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  emailVerify: (email: string, otp: number) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useLayoutEffect(() => {
    const restore = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const saved = localStorage.getItem('user');

        if (token && saved) {
          apiClient.setToken(token);
          setUser(JSON.parse(saved));
        }
      } catch (err) {
        console.error('Session restore failed:', err);
        localStorage.clear();
      } finally {
        setIsLoading(false);
      }
    };
    restore();
    googleAuth.initialize().catch(console.error);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await apiClient.login({ email, password });

    const role = res.user?.role ? res.user.role.toLowerCase() : 'student';
    const userData: User = {
      id: res.user.id,
      name: res.user.name,
      email: res.user.email,
      avatar: res.user.avatar || '',
      role,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    apiClient.setToken(res.token);
    localStorage.setItem('auth_token', res.token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
    apiClient.clearToken();
  };

  const register = async (name: string, email: string, password: string, role = 'student') =>
    apiClient.register({ name, email, password, role });

  const emailVerify = async (email: string, otp: number) => {
    const res = await apiClient.emailVerify({ email, otp });
    
    if (res.token && res.user) {
      const userData: User = {
        id: res.user.id,
        name: res.user.name,
        email: res.user.email,
        avatar: res.user.avatar || '',
        role: res.user.role?.toLowerCase() ?? 'student',
        status: 'pending', 
        createdAt: new Date().toISOString(),
      };
  
      apiClient.setToken(res.token);
      localStorage.setItem('auth_token', res.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      localStorage.removeItem('pendingVerificationEmail'); 
      
      return res;
    }
    throw new Error('Verification failed');
  };

  const loginWithGoogle = async () => {
    const gUser: GoogleUser = await googleAuth.signIn();
    const res = await apiClient.googleLogin({
      email: gUser.email,
      name: gUser.name,
      token: gUser.idToken,
    });
    const userData: User = {
      id: res.user.id,
      name: res.user.name,
      email: res.user.email,
      avatar: gUser.picture,
      role: res.user.role?.toLowerCase() ?? 'student',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    apiClient.setToken(res.token);
    localStorage.setItem('auth_token', res.token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register, emailVerify, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}




