import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'sonner';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check persistent session on mount
  const checkAuth = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data?.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data?.token) {
        localStorage.setItem('codesync_token', response.data.token);
      }
      setUser(response.data.user);
      toast.success('Welcome back to CodeSync!');
      return response.data.user;
    } catch (error) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      if (response.data?.token) {
        localStorage.setItem('codesync_token', response.data.token);
      }
      setUser(response.data.user);
      toast.success('Account created! Welcome to CodeSync.');
      return response.data.user;
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Logout request failed:', err);
    } finally {
      localStorage.removeItem('codesync_token');
      setUser(null);
      toast.info('Logged out successfully');
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
