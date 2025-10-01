import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { googleAuth, GoogleUser } from '../services/googleAuth';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, password: string, role?: string) => Promise<void>;
  emailVerify: (email: string, otp: number) => Promise<void>;
  logout: () => void;
  updateProgress: (module: keyof User['progress'], progress: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          apiClient.setToken(token);
          const userData = JSON.parse(savedUser);
          setUser(userData);
        } catch (error) {
          console.error('Failed to restore session:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
    googleAuth.initialize().catch(console.error);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login({
        email,
        password,
      });
      
      apiClient.setToken(response.token);
      const userData: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        avatar: response.user.avatar || '',
        role: response.user.role,
        status: 'pending',
        createdAt: new Date().toISOString(),
        progress: {
          listening: 0,
          speaking: 0,
          reading: 0,
          writing: 0,
        },
      };
      
      setUser(userData);
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const googleUser: GoogleUser = await googleAuth.signIn();
      
      const response = await apiClient.googleLogin({
        email: googleUser.email,
        name: googleUser.name,
        token: googleUser.idToken,
      });
      
      apiClient.setToken(response.token);
      
      // Transform the API response to match your User type
      const userData: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        avatar: googleUser.picture,
        role: response.user.role,
        status: 'pending',
        createdAt: new Date().toISOString(),
        progress: {
          listening: 0,
          speaking: 0,
          reading: 0,
          writing: 0,
        },
      };
      
      setUser(userData);
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, role: string = 'student') => {
    try {
      const response = await apiClient.register({
        name,
        email,
        password,
        role
      });
      
      apiClient.setToken(response.token);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    apiClient.clearToken();
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    googleAuth.signOut().catch(console.error);
  };

  const updateProgress = (module: keyof User['progress'], progress: number) => {
    if (user) {
      const updatedUser = {
        ...user,
        progress: {
          ...user.progress,
          [module]: progress,
        },
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const emailVerify = async (email: string, otp: number) => {
    try {
     const response= await apiClient.emailVerify({ email, otp });
      if (user) {
        const updatedUser = { ...user };
        setUser(updatedUser);
        localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Email verification failed:', error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    login,
    loginWithGoogle,
    register,
    emailVerify,
    logout,
    updateProgress,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}