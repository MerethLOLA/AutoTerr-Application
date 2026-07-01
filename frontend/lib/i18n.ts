'use client';

import { useState, useEffect } from 'react';
import fr from '@/locales/fr';
import en from '@/locales/en';
import es from '@/locales/es';

export type Locale = 'fr' | 'en' | 'es';

const SUPPORTED: Locale[] = ['fr', 'en', 'es'];
const messages = { fr, en, es };
const listeners = new Set<() => void>();
let _locale: Locale = 'fr';

function resolve(locale: string): Locale {
  return SUPPORTED.includes(locale as Locale) ? (locale as Locale) : 'fr';
}

function lookup(key: string, locale: Locale): string {
  const parts = key.split('.');
  let val: any = messages[locale];
  for (const p of parts) val = val?.[p];
  if (typeof val === 'string') return val;
  // fallback to French
  let fb: any = messages.fr;
  for (const p of parts) fb = fb?.[p];
  return typeof fb === 'string' ? fb : key;
}

export function setLocale(locale: string) {
  _locale = resolve(locale);
  try { if (typeof window !== 'undefined') localStorage.setItem('autoterr_locale', _locale); } catch {}
  listeners.forEach(fn => fn());
}

export function getLocale(): Locale { return _locale; }

export function t(key: string): string { return lookup(key, _locale); }

export function useTranslation() {
  const [, bump] = useState(0);

  useEffect(() => {
    const fn = () => bump(n => n + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);

  return { t: (key: string) => lookup(key, _locale), locale: _locale, setLocale };
}
