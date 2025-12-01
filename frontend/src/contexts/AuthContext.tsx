import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService, AdminUser } from '../lib/api';

interface AuthContextType {
  user: AdminUser | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('admin_token');
    if (token) {
      checkAuthStatus().catch((error) => {
        console.error('Failed to check auth status on startup:', error);
        // Don't block app loading if auth check fails
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await apiService.getProfile();
      if (response.success) {
        setUser(response.data);
        setIsAdmin(response.data.role === 'admin' || response.data.role === 'super_admin');
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('admin_token');
        setUser(null);
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('admin_token');
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiService.login({ email, password });

      if (response.success && response.data) {
        // Store token in localStorage
        localStorage.setItem('admin_token', response.data.token);

        // Update state
        setUser(response.data.user);
        setIsAdmin(response.data.user.role === 'admin' || response.data.user.role === 'super_admin');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await apiService.logout();

      // Clear local storage and state
      localStorage.removeItem('admin_token');
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local state
      localStorage.removeItem('admin_token');
      setUser(null);
      setIsAdmin(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signIn, signOut }}>
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
