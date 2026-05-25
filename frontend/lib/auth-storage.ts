import type { User } from '@/lib/types';

export const AUTH_CHANGED_EVENT = 'sunupark-auth-changed';

export interface StoredAuthState {
  token: string | null;
  user: User | null;
}

export function readStoredAuth(): StoredAuthState {
  if (typeof window === 'undefined') {
    return { token: null, user: null };
  }

  const token = sessionStorage.getItem('token');
  const rawUser = sessionStorage.getItem('user');

  if (!token || !rawUser) {
    return { token: null, user: null };
  }

  try {
    return {
      token,
      user: JSON.parse(rawUser) as User,
    };
  } catch {
    return { token: null, user: null };
  }
}

export function writeStoredAuth(token: string, user: User) {
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('user', JSON.stringify(user));
  sessionStorage.setItem('userId', String(user.id));
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
}

export function clearStoredAuth() {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('userId');
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
}

