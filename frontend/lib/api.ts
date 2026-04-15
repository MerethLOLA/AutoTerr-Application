import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const AUTH_PREFIX = '/auth';

interface ApiError {
  message: string;
  status?: number;
}

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    // Charger le token depuis localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }

    // Ajouter le token aux headers
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Gérer les erreurs
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expiré - nettoyer et rediriger
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
      this.setToken(response.data.token);
      return response.data;
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

  async getMe() {
    try {
      const response = await this.client.get(`${AUTH_PREFIX}/me`);
      return response.data;
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

  // Méthodes CRUD génériques
  async get<T>(resource: string, params?: Record<string, any>): Promise<T> {
    try {
      const response = await this.client.get<T>(resource, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post<T>(resource: string, data: any): Promise<T> {
    try {
      const response = await this.client.post<T>(resource, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put<T>(resource: string, data: any): Promise<T> {
    try {
      const response = await this.client.put<T>(resource, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async patch<T>(resource: string, data: any): Promise<T> {
    try {
      const response = await this.client.patch<T>(resource, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<T>(resource: string): Promise<T> {
    try {
      const response = await this.client.delete<T>(resource);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      return {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
      };
    }
    return {
      message: 'Une erreur est survenue',
    };
  }
}

export const apiClient = new ApiClient();
