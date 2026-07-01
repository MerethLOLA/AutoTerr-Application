'use client';

import { SessionProvider } from 'next-auth/react';
import { SessionSync } from '@/components/SessionSync';
import { LanguageInitializer } from '@/components/LanguageInitializer';
import { RealtimeProvider } from '@/components/RealtimeProvider';
import { NotificationToast } from '@/components/NotificationToast';
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionSync />
      <LanguageInitializer />
      <RealtimeProvider>
        {children}
        <NotificationToast />
      </RealtimeProvider>
    </SessionProvider>
  );
}
