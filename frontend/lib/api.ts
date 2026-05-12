import axios, { AxiosError, AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const AUTH_PREFIX = '/auth';

const API_CONFIG = {
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
};

interface ApiError {
  message: string;
  status?: number;
  details?: Record<string, string[]>;
  isNetworkError?: boolean;
}

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: API_CONFIG.timeout,
      headers: {
        Accept: 'application/json',
      },
    });

    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }

    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login/employee';
        }

        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
    try {
      const response = await this.client.get('/voitures/public', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPublicVoiture(id: number) {
    try {
      const response = await this.client.get(`/voitures/${id}/public`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async get<T>(resource: string, params?: Record<string, any>): Promise<T> {
    try {
      const response = await this.client.get<T>(resource, { params });
      return response.data as T;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post<T>(resource: string, data: any): Promise<T> {
    try {
      const response = await this.client.post<T>(resource, data);
      return response.data as T;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put<T>(resource: string, data: any): Promise<T> {
    try {
      const response = await this.client.put<T>(resource, data);
      return response.data as T;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async patch<T>(resource: string, data: any): Promise<T> {
    try {
      const response = await this.client.patch<T>(resource, data);
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

  async postForm<T>(resource: string, data: FormData): Promise<T> {
    try {
      const response = await this.client.post<T>(resource, data);
      return response.data as T;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<T>(resource: string): Promise<T> {
    try {
      const response = await this.client.delete<T>(resource);
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
    const response = await apiClient.get<{ items?: NotificationItem[] }>('/notifications', { limit });
    return response.items || [];
  } catch {
    return [];
  }
}
