'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { getEcho, destroyEcho } from '@/lib/echo';

export interface RealtimeNotif {
  id:      string;
  type:    string;
  niveau:  'info' | 'warning' | 'danger';
  titre:   string;
  message: string;
  url?:    string | null;
  ts:      string;
}

interface RealtimeCtx {
  toasts:      RealtimeNotif[];
  dismissToast: (id: string) => void;
}

const Ctx = createContext<RealtimeCtx>({ toasts: [], dismissToast: () => {} });

export function useRealtime() {
  return useContext(Ctx);
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<RealtimeNotif[]>([]);
  const channelRef = useRef<any>(null);

  const addToast = useCallback((data: Omit<RealtimeNotif, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev.slice(-4), { ...data, id }]);

    // Émettre un événement DOM pour que le badge se mette à jour
    window.dispatchEvent(new CustomEvent('autoterr:new-notification'));

    // Auto-dismiss après 7 secondes
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 7000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    let mounted = true;

    getEcho().then((echo) => {
      if (!echo || !mounted) return;

      channelRef.current = echo
        .channel('autoterr-notifications')
        .listen('.NouvelleNotification', (data: any) => {
          if (!mounted) return;
          addToast({
            type:    data.type    || 'info',
            niveau:  data.niveau  || 'info',
            titre:   data.titre   || 'Notification',
            message: data.message || '',
            url:     data.url     || null,
            ts:      data.ts      || new Date().toISOString(),
          });
        });
    });

    return () => {
      mounted = false;
      channelRef.current?.stopListening?.('.NouvelleNotification');
      destroyEcho();
    };
  }, [addToast]);

  return (
    <Ctx.Provider value={{ toasts, dismissToast }}>
      {children}
    </Ctx.Provider>
  );
}
