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

  const token = localStorage.getItem('token');
  const rawUser = localStorage.getItem('user');

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
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('userId', String(user.id));
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
}

export function clearStoredAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userId');
  window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
}
