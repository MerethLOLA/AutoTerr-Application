'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { apiClient } from '@/lib/api';

export function SessionSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && (session as any)?.token) {
      apiClient.setToken((session as any).token);
    } else if (status === 'unauthenticated') {
      apiClient.clearToken();
    }
  }, [session, status]);

  return null;
}
