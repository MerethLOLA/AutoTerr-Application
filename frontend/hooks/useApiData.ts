'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

/**
 * Lit le cache synchronement au premier rendu → aucun skeleton si la page
 * a déjà été visitée dans les 20 dernières secondes.
 * Lance quand même un fetch en arrière-plan pour rafraîchir les données.
 */
export function useApiData<T>(resource: string, params?: Record<string, any>) {
  const paramsKey = params ? JSON.stringify(params) : '';

  const [data, setData] = useState<T | null>(
    () => apiClient.getCached<T>(resource, params)
  );
  const [loading, setLoading] = useState<boolean>(
    () => apiClient.getCached<T>(resource, params) === null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get<T>(resource, params)
      .then((fresh) => {
        if (!cancelled) { setData(fresh); setLoading(false); }
      })
      .catch((err: any) => {
        if (!cancelled) { setError(err?.message ?? 'Erreur'); setLoading(false); }
      });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource, paramsKey]);

  return { data, loading, error, setData };
}
