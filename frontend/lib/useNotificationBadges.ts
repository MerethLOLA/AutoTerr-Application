import { useEffect, useState } from 'react';
import { apiClient } from './api';

interface NotificationCounts {
  tickets_ouverts?: number;
  ordres_ouverts?: number;
  factures_impayees?: number;
  reservations?: number;
  alertes_stock?: number;
  demandes_en_attente?: number;
}

/**
 * Hook pour récupérer les compteurs de notifications
 */
export function useNotificationBadges(refreshInterval = 60000) {
  const [counts, setCounts] = useState<NotificationCounts>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchCounts() {
      try {
        const response = await apiClient.get<any>('/notifications/counts');
        if (mounted) {
          setCounts(response?.data ?? response);
        }
      } catch {
        // Silencieux en cas d'erreur
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchCounts();

    // Rafraîchir périodiquement
    const interval = setInterval(fetchCounts, refreshInterval);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [refreshInterval]);

  return { counts, loading };
}

/**
 * Récupère le badge pour un module spécifique
 */
export function getModuleBadge(moduleKey: string, counts: NotificationCounts): number | undefined {
  const badgeMap: Record<string, keyof NotificationCounts> = {
    sav: 'tickets_ouverts',
    atelier: 'ordres_ouverts',
    facturations: 'factures_impayees',
    locations: 'reservations',
    stock: 'alertes_stock',
  };

  const countKey = badgeMap[moduleKey];
  return countKey ? counts[countKey] : undefined;
}