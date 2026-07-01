'use client';

import { useSession, signOut } from 'next-auth/react';
import { apiClient } from '@/lib/api';

export function useAuth() {
  const { data: session, status } = useSession();

  const isAuthenticated = status === 'authenticated';
  const loading         = status === 'loading';
  const user            = (session?.user as any) ?? null;

  const logout = async () => {
    try { await apiClient.logout(); } catch { /* ignore si déjà expiré */ }
    await signOut({ callbackUrl: '/' });
  };

  return { user, loading, isAuthenticated, error: null, logout };
}
