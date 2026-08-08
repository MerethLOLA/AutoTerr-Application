import axios, { AxiosError, AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const AUTH_PREFIX = '/auth';

const API_CONFIG = {
  timeout: 30000,
  retryAttempts: 2,
  retryDelay: 800,
};

// ── Cache GET (stale-while-revalidate) ────────────────────────────────────────
// Chaque navigation vers une page déjà visitée renvoie les données INSTANTANÉMENT
// depuis ce cache (sans spinner), et un rafraîchissement se fait en arrière-plan.

const CACHE_STORE = new Map<string, { data: unknown; at: number }>();
const CACHE_MAX   = 200; // entrées max
const DEFAULT_TTL = 20_000; // 20 s pour les listes

const SHORT_TTL_PREFIXES: [string, number][] = [
  ['/notifications', 6_000], // notifications : TTL court (quasi temps-réel)
];

function cacheTTL(resource: string): number {
  for (const [prefix, ttl] of SHORT_TTL_PREFIXES) {
    if (resource.startsWith(prefix)) return ttl;
  }
  return DEFAULT_TTL;
}

function cacheKey(resource: string, params?: Record<string, any>): string {
  return resource + (params ? JSON.stringify(params) : '');
}

function cacheGet<T>(key: string, ttl: number): T | null {
  const entry = CACHE_STORE.get(key);
  if (!entry) return null;
  if (Date.now() - entry.at > ttl) { CACHE_STORE.delete(key); return null; }
  return entry.data as T;
}

function cacheSet(key: string, data: unknown): void {
  if (CACHE_STORE.size >= CACHE_MAX) {
    // Éjecte la plus ancienne entrée
    const oldest = CACHE_STORE.keys().next().value;
    if (oldest) CACHE_STORE.delete(oldest);
  }
  CACHE_STORE.set(key, { data, at: Date.now() });
}

// Invalide toutes les entrées dont la clé commence par le 1er segment de la ressource.
// Ex : POST /voitures/5/images → invalide tout ce qui commence par /voitures
function cacheInvalidate(resource: string): void {
  const segment = resource.split('/').filter(Boolean)[0];
  if (!segment) return;
  const prefix = `/${segment}`;
  for (const key of CACHE_STORE.keys()) {
    if (key.startsWith(prefix)) CACHE_STORE.delete(key);
  }
}

function cacheClear(): void {
  CACHE_STORE.clear();
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface ApiError {
  message: string;
  status?: number;
  details?: Record<string, string[]>;
  isNetworkError?: boolean;
}

// ── Client ────────────────────────────────────────────────────────────────────

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;
  // Charge la session NextAuth une seule fois au démarrage si token non encore dispo
  private sessionInitPromise: Promise<void> | null = null;

  private async initSessionOnce(): Promise<void> {
    if (this.token) return;
    if (this.sessionInitPromise) return this.sessionInitPromise;
    this.sessionInitPromise = (async () => {
      try {
        const { getSession } = await import('next-auth/react');
        const session = await getSession();
        if (session && (session as any).token) {
          this.token = (session as any).token;
        }
      } catch { /* ignore */ }
    })();
    return this.sessionInitPromise;
  }

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: API_CONFIG.timeout,
      headers: {
        Accept: 'application/json',
      },
    });

    this.client.interceptors.request.use(async (config) => {
      if (!this.token) await this.initSessionOnce();
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          cacheClear();
          // Ne déconnecter que si on avait un token actif (session expirée).
          // Si token est null, c'est une race condition au démarrage — ignorer.
          if (this.token) {
            this.token = null;
            const { signOut } = await import('next-auth/react');
            const isClientRoute = typeof window !== 'undefined' &&
              (window.location.pathname.startsWith('/espace-client') ||
               window.location.pathname.startsWith('/catalogue') ||
               window.location.pathname.startsWith('/inscription'));
            signOut({ callbackUrl: isClientRoute ? '/login/client' : '/login/employee' });
          }
          return Promise.reject(error);
        }

        const config = error.config as any;

        // Retry automatique sur timeout ou erreur réseau (pas sur les 4xx)
        const isRetryable = !error.response || error.code === 'ECONNABORTED';
        if (isRetryable && (config._retryCount ?? 0) < API_CONFIG.retryAttempts) {
          config._retryCount = (config._retryCount ?? 0) + 1;
          await new Promise((r) => setTimeout(r, API_CONFIG.retryDelay * config._retryCount));
          return this.client(config);
        }

        return Promise.reject(error);
      }
    );
  }

  private cookieFlags(): string {
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    return `path=/; SameSite=Strict${secure}`;
  }

  setToken(token: string) {
    this.token = token;
    document.cookie = `sp_auth=1; ${this.cookieFlags()}`;
  }

  clearToken() {
    this.token = null;
    this.sessionInitPromise = null;
    document.cookie = `sp_auth=; max-age=0; ${this.cookieFlags()}`;
    cacheClear();
  }

  async register(data: { name: string; email: string; username: string; password: string; password_confirmation: string }) {
    try {
      const response = await this.client.post(`${AUTH_PREFIX}/register`, data);
      const payload = response.data?.data ?? response.data;
      this.setToken(payload.token);
      return payload;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async login(credentials: { email?: string; username?: string; password: string }) {
    try {
      const response = await this.client.post(`${AUTH_PREFIX}/login`, credentials);
      const payload = response.data?.data ?? response.data;
      this.setToken(payload.token);
      return payload;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout() {
    try {
      await this.client.post(`${AUTH_PREFIX}/logout`);
      this.clearToken();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMe(): Promise<{ user: any }> {
    try {
      const response = await this.client.get(`${AUTH_PREFIX}/me`);
      const payload = response.data?.data ?? response.data;
      return payload as { user: any };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPublicVoitures(params?: Record<string, any>) {
    const key = cacheKey('/voitures/public', params);
    const ttl  = cacheTTL('/voitures/public');
    const hit  = cacheGet<any>(key, ttl);
    if (hit !== null) return hit;
    try {
      const response = await this.client.get('/voitures/public', { params });
      cacheSet(key, response.data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPublicVoiture(id: number) {
    const key = cacheKey(`/voitures/${id}/public`);
    const hit  = cacheGet<any>(key, DEFAULT_TTL);
    if (hit !== null) return hit;
    try {
      const response = await this.client.get(`/voitures/${id}/public`);
      cacheSet(key, response.data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  getCached<T>(resource: string, params?: Record<string, any>): T | null {
    const key = cacheKey(resource, params);
    const ttl  = cacheTTL(resource);
    return cacheGet<T>(key, ttl);
  }

  async get<T>(resource: string, params?: Record<string, any>): Promise<T> {
    const key = cacheKey(resource, params);
    const ttl  = cacheTTL(resource);
    const hit  = cacheGet<T>(key, ttl);
    if (hit !== null) return hit;
    try {
      const response = await this.client.get<T>(resource, { params });
      cacheSet(key, response.data);
      return response.data as T;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post<T>(resource: string, data: any): Promise<T> {
    try {
      const response = await this.client.post<T>(resource, data);
      cacheInvalidate(resource);
      return response.data as T;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put<T>(resource: string, data: any): Promise<T> {
    try {
      const response = await this.client.put<T>(resource, data);
      cacheInvalidate(resource);
      return response.data as T;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async patch<T>(resource: string, data: any): Promise<T> {
    try {
      const response = await this.client.patch<T>(resource, data);
      cacheInvalidate(resource);
      return response.data as T;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async download(resource: string, filename: string): Promise<void> {
    try {
      const response = await this.client.get(resource, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] }));
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /** Ouvre un PDF dans un nouvel onglet (visionneuse native du navigateur, avec bouton imprimer) au lieu de forcer un téléchargement silencieux. */
  async openPdf(resource: string): Promise<void> {
    try {
      const response = await this.client.get(resource, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const win = window.open(url, '_blank');
      if (!win) {
        // Popup bloquée par le navigateur : on retombe sur le téléchargement classique.
        const a = document.createElement('a');
        a.href = url;
        a.click();
      }
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async postForm<T>(resource: string, data: FormData): Promise<T> {
    try {
      const response = await this.client.post<T>(resource, data);
      cacheInvalidate(resource);
      return response.data as T;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<T>(resource: string): Promise<T> {
    try {
      const response = await this.client.delete<T>(resource);
      cacheInvalidate(resource);
      return response.data as T;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data as any;
      const validationErrors = responseData?.errors as Record<string, string[]> | undefined;
      const firstValidationMessage = validationErrors
        ? Object.values(validationErrors).flat().find(Boolean)
        : undefined;

      return {
        message: firstValidationMessage || responseData?.message || error.message || 'Erreur API',
        status: error.response?.status,
        details: validationErrors,
        isNetworkError: !error.response,
      };
    }

    return {
      message: 'Une erreur est survenue',
    };
  }
}

export const apiClient = new ApiClient();

export async function getNotificationCounts(): Promise<Record<string, number>> {
  try {
    return await apiClient.get<Record<string, number>>('/notifications/counts');
  } catch {
    return {};
  }
}

export interface NotificationItem {
  id: number;
  type: string;
  level: string;
  title: string;
  message: string;
  url?: string | null;
  triggered_at?: string | null;
  read_at?: string | null;
}

export async function getNotifications(limit = 8): Promise<NotificationItem[]> {
  try {
    const response = await apiClient.get<any>('/notifications', { limit });
    return response?.data?.items ?? response?.items ?? [];
  } catch {
    return [];
  }
}
