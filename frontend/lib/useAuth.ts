import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { AUTH_CHANGED_EVENT, clearStoredAuth, readStoredAuth, writeStoredAuth } from '@/lib/auth-storage';
import type { User } from '@/lib/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(readStoredAuth().token && readStoredAuth().user));
  const [error, setError] = useState<string | null>(null);

  const clearAuth = () => {
    setUser(null);
    setIsAuthenticated(false);
    clearStoredAuth();
  };

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      const { token, user: storedUser } = readStoredAuth();

      if (!token) {
        if (mounted) setLoading(false);
        return;
      }

      if (storedUser && mounted) {
        setUser(storedUser);
        setIsAuthenticated(true);
      }

      try {
        const response = await apiClient.getMe();
        const userData = response.user;

        if (mounted) {
          setUser(userData);
          setIsAuthenticated(true);
          setError(null);
          writeStoredAuth(token, userData);
        }
      } catch (err: any) {
        if (mounted) {
          clearAuth();
          setError(err?.message || 'Session invalide');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    checkAuth();

    const syncAuthState = () => {
      const { token, user } = readStoredAuth();
      setUser(user);
      setIsAuthenticated(Boolean(token && user));
    };

    window.addEventListener(AUTH_CHANGED_EVENT, syncAuthState);

    return () => {
      mounted = false;
      window.removeEventListener(AUTH_CHANGED_EVENT, syncAuthState);
    };
  }, []);

  const login = async (credentials: { email?: string; username?: string; password: string }) => {
    setLoading(true);
    try {
      const response = await apiClient.login(credentials);
      setUser(response.user);
      writeStoredAuth(response.token, response.user);
      setIsAuthenticated(true);
      setError(null);
      return response;
    } catch (err) {
      clearAuth();
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } finally {
      clearAuth();
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    error,
    login,
    logout,
  };
}
