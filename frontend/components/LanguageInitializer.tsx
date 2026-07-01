'use client';

import { useEffect } from 'react';
import { setLocale } from '@/lib/i18n';

export function LanguageInitializer() {
  useEffect(() => {
    try {
      const user = sessionStorage.getItem('user');
      const locale = user ? JSON.parse(user).locale : null;
      setLocale(locale || localStorage.getItem('autoterr_locale') || 'fr');
    } catch {
      setLocale('fr');
    }
  }, []);
  return null;
}
